'use strict';
const {chart,technicals,validSymbol,round}=require('../lib/market');
const requestCache=new Map(),hits=new Map();
const maxAgeMs=7*60*1000;
function limited(ip){
 const now=Date.now(),h=(hits.get(ip)||[]).filter(t=>now-t<60*60*1000);
 if(h.length>=5){hits.set(ip,h);return true;} h.push(now);hits.set(ip,h);
 if(hits.size>1000)hits.clear();return false;
}
function outputText(data){
 if(data.choices?.[0]?.message?.content)return data.choices[0].message.content;
 return (data.output||[]).flatMap(x=>x.content||[]).map(x=>x.text||'').join('');
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'POST only'});
 const sym=String(req.body?.symbol||'SPY').toUpperCase();
 const horizon=['swing','position'].includes(req.body?.horizon)?req.body.horizon:'swing';
 const risk=['conservative','balanced','aggressive'].includes(req.body?.risk)?req.body.risk:'balanced';
 if(!validSymbol(sym))return res.status(400).json({error:'Invalid ticker'});
 const key=process.env.OPENAI_API_KEY||process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
 if(!key)return res.status(503).json({error:'AI_NOT_CONFIGURED',message:'AI model credentials are not available. Market data and technical signals remain active.'});
 const id=sym+'|'+horizon+'|'+risk;
 const old=requestCache.get(id);
 if(old&&Date.now()-old.time<maxAgeMs)return res.status(200).json({...old.value,cached:true});
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim().slice(0,90);
 if(limited(ip))return res.status(429).json({error:'AI_RATE_LIMIT',message:'Hourly limit reached; please try again later.'});
 try{
  const data=await chart(sym,'3mo','1d');
  const signals=technicals(data.candles);
  const q=data.quote;
  const now=Date.now();
  if(!q.stamp||(now-q.stamp*1000)>4*24*60*60*1000)return res.status(503).json({error:'STALE_MARKET_DATA',message:'Price observation too old for actionable analysis.'});
  const snapshot={symbol:sym,referencePrice:round(q.price),previousClose:round(q.previousClose),quoteTimeUTC:new Date(q.stamp*1000).toISOString(),
   quoteDelayMinutes:q.delayMinutes,source:data.source,retrievedAt:data.retrievedAt,technical:signals,
   last10DailyCloses:data.candles.slice(-10).map(x=>({date:new Date(x.t*1000).toISOString().slice(0,10),close:round(x.c)})),
   horizon,risk};
  const instructions=[
   '你是一名严谨的量化研究分析师。用简体中文，保留 Swing、RSI、VWAP、Risk/Reward 等术语。',
   '你只可使用提供的经过时间标注的行情及技术指标。不要声称有最新新闻、财报、实时期权链、持仓、机构订单流或已验证概率。',
   '你的工作是提供透明且条件式的研究结论，不承诺收益。BUY 仅用于有清晰可量化触发位及>=1.8风险收益比的条件式计划；否则 WAIT。',
   '精确陈述风险，判断当前信息不足时写 WAIT，并提出监控条件。',
   '只返回JSON对象，不要markdown，字段严格为: verdict (WAIT或CONDITIONAL BUY或RISK REDUCE), title, summary, positive (字符串数组最多3项), risks (字符串数组最多3项), entry (文字描述，注明未触发/待确认), invalidation (文字描述), targets (文字描述), riskReward (文字描述或未建立), whatChanges (文字描述), dataLimits (文字描述)。',
   '如需计算入场价/止损/目标价，必须明确是依据观测到的SMA20,SMA50,20日高低点或ATR14推导的假设，不要称作历史验证支撑位。数据不能支持则不要给数字。'
  ].join(' ');
  const gateway=!process.env.OPENAI_API_KEY;
  const endpoint=gateway?'https://ai-gateway.vercel.sh/v1/chat/completions':'https://api.openai.com/v1/chat/completions';
  const model=process.env.ORBIT_AI_MODEL||(gateway?'openai/gpt-5-mini':'gpt-5-mini');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),23000);
  let answer;
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
    body:JSON.stringify({model,messages:[{role:'system',content:instructions},{role:'user',content:JSON.stringify(snapshot)}],
      max_completion_tokens:1500,reasoning_effort:'minimal',response_format:{type:'json_object'}}),signal:controller.signal});
   const payload=await response.json().catch(()=>({}));
   if(!response.ok){
    const msg=String(payload?.error?.message||'Model unavailable');
    const code=payload?.error?.code||'AI_PROVIDER_ERROR';
    return res.status(response.status===429?429:503).json({error:code,message:msg.slice(0,240)});
   }
   const txt=outputText(payload);
   answer=JSON.parse(txt);
  }finally{clearTimeout(timeout)}
  const fields=['verdict','title','summary','entry','invalidation','targets','riskReward','whatChanges','dataLimits'];
  if(!fields.every(k=>typeof answer[k]==='string')||!Array.isArray(answer.positive)||!Array.isArray(answer.risks))throw Error('Model output failed validation');
  if(!['WAIT','CONDITIONAL BUY','RISK REDUCE'].includes(answer.verdict))answer.verdict='WAIT';
  const result={symbol:sym,analysis:answer,reference:snapshot,model,generatedAt:new Date().toISOString(),mode:'AI-generated conditional research (not trade execution)'};
  if(requestCache.size>100)requestCache.clear();
  requestCache.set(id,{time:Date.now(),value:result});
  return res.status(200).json(result);
 }catch(e){return res.status(503).json({error:e.name==='AbortError'?'TIMEOUT':'AI_UNAVAILABLE',message:e.message||'AI analysis unavailable'});}
};