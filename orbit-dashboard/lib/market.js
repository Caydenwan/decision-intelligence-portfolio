'use strict';
const SYMBOL=/^[A-Z0-9^=._-]{1,16}$/;
const PERIODS={ '1d':'5m', '5d':'15m', '1mo':'1d', '3mo':'1d', '6mo':'1d' };
function validSymbol(s){return typeof s==='string'&&SYMBOL.test(s)&&s.length<=16}
const round=(x,d=2)=>Number.isFinite(x)?Number(x.toFixed(d)):null;
async function chart(symbol,range='3mo',interval='1d'){
  if(!validSymbol(symbol))throw Object.assign(new Error('Invalid ticker'),{status:400});
  if(!Object.hasOwn(PERIODS,range)||PERIODS[range]!==interval)throw Object.assign(new Error('Invalid range/interval'),{status:400});
  let error='Provider unavailable';
  for(const host of ['query1.finance.yahoo.com','query2.finance.yahoo.com']){
   try{
    const endpoint='https://'+host+'/v8/finance/chart/'+encodeURIComponent(symbol)+'?range='+range+'&interval='+interval+'&includePrePost=false';
    const r=await fetch(endpoint,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 (ORBIT market research)'},signal:AbortSignal.timeout(8500)});
    if(!r.ok){error='Yahoo HTTP '+r.status;continue}
    const result=(await r.json())?.chart?.result?.[0];
    if(!result?.timestamp?.length||!result.meta)throw Error('No historical candles');
    const q=result.indicators?.quote?.[0]||{};
    const candles=[];
    result.timestamp.forEach((t,i)=>{
      const close=q.close?.[i],low=q.low?.[i],high=q.high?.[i];
      if(!Number.isFinite(close))return;
      candles.push({t,o:Number.isFinite(q.open?.[i])?q.open[i]:null,h:Number.isFinite(high)?high:close,
       l:Number.isFinite(low)?low:close,c:close,v:Number.isFinite(q.volume?.[i])?q.volume[i]:null});
    });
    if(candles.length<2)throw Error('Not enough candles');
    const m=result.meta;
    const prev=m.chartPreviousClose??m.previousClose;
    return {symbol,range,interval,source:'Yahoo Finance chart (unofficial)',retrievedAt:new Date().toISOString(),
     quote:{price:Number.isFinite(m.regularMarketPrice)?m.regularMarketPrice:candles[candles.length-1].c,
      previousClose:Number.isFinite(prev)?prev:null,stamp:Number.isFinite(m.regularMarketTime)?m.regularMarketTime:null,
      delayMinutes:Number.isFinite(m.exchangeDataDelayedBy)?m.exchangeDataDelayedBy:null,currency:m.currency||'USD'},
     candles};
   }catch(e){error=e.message||String(e);}
  }
  throw Object.assign(new Error(error),{status:503});
}
function technicals(bars){
 const cs=bars.map(x=>x.c), last=cs.length-1;
 const avg=(a)=>a.reduce((x,y)=>x+y,0)/a.length;
 function ma(n){return cs.length>=n?round(avg(cs.slice(-n))):null}
 function rsi(n){if(cs.length<n+1)return null;let gain=0,loss=0;for(let i=cs.length-n;i<cs.length;i++){const d=cs[i]-cs[i-1];gain+=Math.max(0,d);loss+=Math.max(0,-d)}
  return round(loss===0?100:100-100/(1+gain/loss));}
 function atr(n){if(bars.length<n+1)return null;let xs=[];for(let i=bars.length-n;i<bars.length;i++){const b=bars[i],p=bars[i-1].c;xs.push(Math.max(b.h-b.l,Math.abs(b.h-p),Math.abs(b.l-p)))}return round(avg(xs));}
 const ret=[];for(let i=1;i<cs.length;i++){if(cs[i-1]>0)ret.push(Math.log(cs[i]/cs[i-1]))}
 const v20=ret.slice(-20);let vol20=null;if(v20.length>=15){const m=avg(v20),variance=v20.reduce((s,x)=>s+(x-m)**2,0)/(v20.length-1);vol20=round(Math.sqrt(variance)*Math.sqrt(252)*100)}
 const recent=bars.slice(-20),recent50=bars.slice(-50);
 const price=cs[last],m20=ma(20),m50=ma(50);
 let trend='INSUFFICIENT DATA';if(m20!==null&&m50!==null)trend=price>m20&&m20>m50?'BULLISH':price<m20&&m20<m50?'BEARISH':'MIXED';
 const range20High=recent.length>=20?round(Math.max(...recent.map(x=>x.h))):null;
 const range20Low=recent.length>=20?round(Math.min(...recent.map(x=>x.l))):null;
 return {close:round(price),sma20:m20,sma50:m50,rsi14:rsi(14),atr14:atr(14),
  high20:range20High,low20:range20Low,realizedVol20:vol20,trend,
  return5d:cs.length>=6?round((price/cs[last-5]-1)*100):null,
  return20d:cs.length>=21?round((price/cs[last-20]-1)*100):null,
  sampleSize:bars.length};
}
module.exports={chart,technicals,validSymbol,PERIODS,round};