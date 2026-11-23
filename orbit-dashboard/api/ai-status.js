'use strict';
module.exports=function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'GET only'});
 res.setHeader('Cache-Control','no-store');
 const configured=Boolean(process.env.OPENAI_API_KEY||process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN);
 res.status(200).json({enabled:configured,provider:process.env.OPENAI_API_KEY?'OpenAI API':'OpenAI via Vercel AI Gateway',model:process.env.ORBIT_AI_MODEL||'openai/gpt-5-mini',mode:configured?'available_to_test':'needs_configuration',onDemand:true});
};