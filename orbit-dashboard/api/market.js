// ORBIT market data bridge. Read-only Yahoo Finance chart endpoint (unofficial).
// Quotes can be delayed or unavailable; never fabricate missing prices.
const DEFAULT=['SPY','QQQ','DIA','IWM','^VIX','^TNX','DX-Y.NYB','BTC-USD','MSFT','AMZN','GOOGL','JPM','AAPL','NVDA','SMH','XLF','XLK','XLE','GLD'];
function isTicker(s){return /^[A-Z0-9^=._-]{1,16}$/.test(s);}
async function one(symbol){
 let error='Unavailable';
 for(const host of ['query1.finance.yahoo.com','query2.finance.yahoo.com']){
  try{
   const u='https://'+host+'/v8/finance/chart/'+encodeURIComponent(symbol)+'?range=1d&interval=5m';
   const r=await fetch(u,{headers:{'Accept':'application/json','User-Agent':'Mozilla/5.0 (compatible; ORBITDashboard/1.1)'},signal:AbortSignal.timeout(5000)});
   if(!r.ok){error='Yahoo HTTP '+r.status;continue;}
   const b=await r.json(),m=b?.chart?.result?.[0]?.meta;
   if(!m||!Number.isFinite(m.regularMarketPrice))throw Error('No quote from vendor');
   const previousClose=m.chartPreviousClose??m.previousClose;
   return {symbol,price:m.regularMarketPrice,previousClose:Number.isFinite(previousClose)?previousClose:null,
    changePct:Number.isFinite(previousClose)&&previousClose>0?((m.regularMarketPrice/previousClose)-1)*100:null,
    volume:Number.isFinite(m.regularMarketVolume)?m.regularMarketVolume:null,
    timestamp:Number.isFinite(m.regularMarketTime)?m.regularMarketTime:null,
    delayMinutes:Number.isFinite(m.exchangeDataDelayedBy)?m.exchangeDataDelayedBy:null,
    marketState:m.marketState||null,source:'Yahoo Finance chart (unofficial)'};
  }catch(e){error=e?.message||'Vendor error';}
 }
 return {symbol,error};
}
module.exports=async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'GET only'});}
 const raw=typeof req.query.symbols==='string'?req.query.symbols:'';
 const symbols=[...new Set((raw?raw.split(','):DEFAULT).map(s=>s.trim().toUpperCase()).filter(isTicker))].slice(0,38);
 if(!symbols.length)return res.status(400).json({error:'No symbols'});
 const quotes={}; let i=0;
 await Promise.all(Array.from({length:Math.min(8,symbols.length)},async()=>{while(i<symbols.length){const sym=symbols[i++];quotes[sym]=await one(sym);}}));
 res.setHeader('Cache-Control','public, s-maxage=60, stale-while-revalidate=30');
 return res.status(200).json({source:'Yahoo Finance chart (unofficial, delay varies)',fetchedAt:new Date().toISOString(),quotes});
};