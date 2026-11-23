'use strict';
const {chart,technicals,validSymbol,PERIODS}=require('../lib/market');
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','public, s-maxage=65, stale-while-revalidate=55');
 if(req.method!=='GET')return res.status(405).json({error:'GET only'});
 const symbol=String(req.query.symbol||'SPY').toUpperCase(),range=String(req.query.range||'1d');
 if(!validSymbol(symbol)||!Object.hasOwn(PERIODS,range))return res.status(400).json({error:'Invalid symbol or timeframe'});
 try{
  const [series,daily]=await Promise.all([chart(symbol,range,PERIODS[range]),range==='3mo'?Promise.resolve(null):chart(symbol,'3mo','1d')]);
  const t=technicals((daily||series).candles);
  return res.status(200).json({symbol,range,quote:series.quote,candles:series.candles,technical:t,source:series.source,retrievedAt:series.retrievedAt,pricesMayBeDelayed:true});
 }catch(e){return res.status(e.status||503).json({error:e.message||'History currently unavailable',symbol});}
};