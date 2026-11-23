'use strict';
(function(){
const $=id=>document.getElementById(id);
const names={SPY:'S&P 500 ETF',QQQ:'Nasdaq 100',DIA:'Dow Jones ETF',IWM:'Russell 2000',NVDA:'NVIDIA',MSFT:'Microsoft',AMZN:'Amazon',AAPL:'Apple',GOOGL:'Alphabet',META:'Meta Platforms',JPM:'JPMorgan Chase',TSLA:'Tesla',PLTR:'Palantir',SMH:'Semiconductors',XLF:'Financial Select',XLK:'Technology Select',XLE:'Energy Select',GLD:'Gold ETF','^VIX':'CBOE Volatility','^TNX':'10Y Treasury','BTC-USD':'Bitcoin','DX-Y.NYB':'US Dollar Index'};
const fixed=['SPY','QQQ','^VIX','^TNX','DIA','IWM','NVDA','MSFT','AMZN','AAPL','GOOGL','JPM','SMH','XLF','XLK','XLE','GLD','BTC-USD','DX-Y.NYB'];
const valid=s=>/^[A-Z0-9^=._-]{1,16}$/.test(s);
let selected='SPY',period='1d',quotes={},series=[],indicators=null,quoteFetchedAt=null,marketBusy=false,historySeq=0,hoverPoints=[],aiReady=false;
let watch;
try{watch=JSON.parse(localStorage.getItem('orbit-watch-v2')||'null')}catch(e){}
if(!Array.isArray(watch))watch=['MSFT','NVDA','AMZN','AAPL','GOOGL','JPM','SPY','QQQ'];
watch=watch.map(s=>String(s).toUpperCase()).filter(valid).slice(0,19);
const escape=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dec=(v,n=2)=>Number.isFinite(v)?Number(v).toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n}):'—';
const dollar=(v,n=2)=>Number.isFinite(v)?'$'+dec(v,n):'—';
const change=v=>Number.isFinite(v)?(v>=0?'+':'')+dec(v)+'%':'—';
const cls=v=>Number.isFinite(v)?(v>=0?'positive':'negative'):'';
const stamp=(t,compact=false)=>Number.isFinite(t)?new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:compact?undefined:'short',day:compact?undefined:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(t*1000)):'Unknown';
const quote=s=>quotes[s]&&Number.isFinite(quotes[s].price)?quotes[s]:null;
const toast=(msg)=>{const el=$('toast');el.textContent=msg;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,4200)};
function setClock(){
 const now=new Date(),nyParts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
 $('nyClock').textContent='NYC · '+nyParts;
 $('displayDate').textContent=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'long',month:'short',day:'numeric',year:'numeric'}).format(now).toUpperCase();
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(now);
 const field=t=>parts.find(x=>x.type===t)?.value||'';
 const minutes=Number(field('hour'))*60+Number(field('minute')),wk=field('weekday');
 const open=!['Sat','Sun'].includes(wk)&&minutes>=570&&minutes<960;
 $('marketHours').innerHTML='<span class="status-light" style="background:'+(open?'#31b492':'#a6b1c0')+'"></span>'+(open?'US session hours':'Outside regular session');
}
function renderCards(){
 document.querySelectorAll('.quote-card').forEach(el=>{
  const sym=el.dataset.quote,q=quote(sym),val=q?(sym==='^TNX'?dec(q.price,3)+'%':sym==='^VIX'?dec(q.price):dollar(q.price)):'—';
  el.querySelector('.quote-main').textContent=val;
  const delta=el.querySelector('.quote-change');delta.textContent=q?change(q.changePct):'Unavailable';delta.className='quote-change '+(q?cls(q.changePct):'');
  el.querySelector('.quote-clock').textContent=q?stamp(q.timestamp,true)+' ET':'—';
 });
}
function renderPulse(){
 const spy=quote('SPY'),qqq=quote('QQQ'),vix=quote('^VIX');
 if(!spy||!qqq){$('regimeHeadline').textContent='No clear signal';$('regimeDescription').textContent='Waiting for verified market data before classifying the session.';return;}
 let signal='Mixed / range',posture='WAIT',text='Direction is inconclusive on the available snapshot. Avoid forcing a trade.';
 if(spy.changePct>.4&&qqq.changePct>.6&&(vix==null||vix.changePct<=0)){signal='Risk-on rebound';posture='SELECTIVE LONG';text='Both major equity ETFs are positive and volatility is not expanding. Verify intraday price structure before any entry.'}
 else if(spy.changePct<-.4&&qqq.changePct<-.6&&(vix==null||vix.changePct>=0)){signal='Risk-off pressure';posture='DEFENSIVE';text='Equities are weak and volatility is not compressing. Consider preserving risk budget; no automatic short recommendation.'}
 else if(spy.changePct>0&&qqq.changePct>0){signal='Cautious risk-on';posture='WATCH';text='Positive index performance, but confirmation is incomplete. Breadth and VWAP are not yet verified.'}
 $('regimeHeadline').textContent=signal;
 $('regimeDescription').textContent=text;
 $('breadthSignal').textContent=spy.changePct>0&&qqq.changePct>0?'Both positive':spy.changePct<0&&qqq.changePct<0?'Both negative':'Divergent';
 $('volSignal').textContent=vix?(vix.price>=30?'Elevated · '+dec(vix.price):vix.price>=20?'Watchful · '+dec(vix.price):'Contained · '+dec(vix.price)):'Not available';
 $('postureSignal').textContent=posture;
}
function renderTable(){
 const body=$('watchBody');
 if(!watch.length){body.innerHTML='<tr><td colspan="5" class="empty-row">Your watchlist is empty. Add a symbol above.</td></tr>';return}
 body.innerHTML=watch.map(sym=>{
 const q=quote(sym);let last=q?dollar(q.price):'—';if(q&&sym==='^TNX')last=dec(q.price,3)+'%';if(q&&sym==='^VIX')last=dec(q.price);
 return '<tr><td><div class="ticker">'+escape(sym)+'</div><div class="ticker-sub">'+escape(names[sym]||'Listed security')+'</div></td>'+
 '<td class="price-cell">'+last+'</td><td class="'+(q?cls(q.changePct):'')+'">'+(q?change(q.changePct):'—')+'</td>'+
 '<td>'+(q?stamp(q.timestamp):'—')+'</td><td><button class="open-research" data-open="'+escape(sym)+'">Explore ↗</button></td></tr>';
 }).join('');
 body.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{
  chooseSymbol(b.dataset.open);
  document.getElementById('research').scrollIntoView({behavior:'smooth'});
 }));
 const count=watch.filter(s=>quote(s)).length;
 $('quoteCoverage').textContent=count+'/'+watch.length+' watchlist quotes available · auto refresh 90s';
}
function renderQuoteMeta(){
 const q=quote(selected);$('detailPrice').textContent=q?dollar(q.price):'—';
 $('detailDelta').textContent=q?change(q.changePct):'Awaiting quote';
 $('detailDelta').className=q?cls(q.changePct):'';
 $('chartTitle').innerHTML=escape(selected)+' <span>'+escape(names[selected]||'Equity')+'</span>';
 $('indSymbol').textContent=selected+' · Daily';
 $('aiSymbol').textContent=selected;
}
async function fetchMarket(silent=false){
 if(marketBusy)return;marketBusy=true;
 if(!silent){$('refreshButton').disabled=true;$('dataStatus').textContent='Updating market data';}
 try{
  const syms=[...new Set([...fixed,...watch,selected])].slice(0,38);
  const response=await fetch('/api/market?symbols='+encodeURIComponent(syms.join(',')),{cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  const got=Object.values(data.quotes||{}).filter(q=>Number.isFinite(q?.price)).length;
  if(!got)throw Error('Provider returned no usable prices');
  quotes=data.quotes;quoteFetchedAt=data.fetchedAt;
  const times=Object.values(quotes).filter(q=>Number.isFinite(q.timestamp)).map(q=>q.timestamp);
  const latest=times.length?Math.max(...times):null;
  $('dataStatus').textContent='Connected · '+got+' verified quotes';
  $('dataTimestamp').textContent='As of '+(latest?stamp(latest)+' ET':'unknown')+' · Yahoo unofficial · delay varies';
  $('dataStatus').closest('.data-pill').style.background='#f0faf5';
  renderCards();renderPulse();renderTable();renderQuoteMeta();
  if(!silent)toast('Quotes updated · '+got+' tickers');
 }catch(e){
  $('dataStatus').textContent='Market feed temporarily unavailable';
  $('dataTimestamp').textContent=String(e.message||e)+' · Charts and strategies may be stale';
  if(!silent)toast('Market data error: '+(e.message||'Unknown'));
 }finally{marketBusy=false;$('refreshButton').disabled=false;}
}
function chooseSymbol(sym){
 if(!valid(sym))return;
 selected=sym;
 document.querySelectorAll('[data-symbol]').forEach(x=>x.classList.toggle('active',x.dataset.symbol===sym));
 renderQuoteMeta();loadHistory();
 $('aiResult').innerHTML='<span class="ai-result-eyebrow">YOUR RESEARCH SPACE</span><p>点击 Generate，为 '+escape(sym)+' 创建新的条件式策略。</p>';
}
function drawChart(bars){
 const svg=$('priceChart'),grid=$('chartGrid'),area=$('chartArea'),line=$('chartLine'),pointer=$('chartPointer'),tooltip=$('chartTooltip');
 grid.replaceChildren();pointer.setAttribute('visibility','hidden');tooltip.hidden=true;
 const values=bars.map(x=>x.c).filter(Number.isFinite);
 if(values.length<2)throw Error('Not enough history to chart');
 const width=900,left=12,right=810,top=19,bottom=280;
 let lo=Math.min(...values),hi=Math.max(...values),pad=(hi-lo)*.15||Math.max(hi*.005,.01);
 lo-=pad;hi+=pad;
 const x=i=>left+(right-left)*i/(bars.length-1),y=v=>bottom-(v-lo)/(hi-lo)*(bottom-top);
 for(let i=0;i<5;i++){
  const yy=top+(bottom-top)*i/4,v=hi-(hi-lo)*i/4;
  const ln=document.createElementNS('http://www.w3.org/2000/svg','line');
  for(const [k,val] of Object.entries({x1:left,x2:right,y1:yy,y2:yy,class:'gridline'}))ln.setAttribute(k,val);
  grid.appendChild(ln);
  const tx=document.createElementNS('http://www.w3.org/2000/svg','text');
  tx.setAttribute('x','824');tx.setAttribute('y',String(yy+4));tx.textContent=dec(v,2);grid.appendChild(tx);
 }
 for(let i=0;i<4;i++){
  const idx=Math.round((bars.length-1)*i/3),tx=document.createElementNS('http://www.w3.org/2000/svg','text');
  tx.setAttribute('x',String(x(idx)));tx.setAttribute('y','311');tx.setAttribute('text-anchor',i===0?'start':i===3?'end':'middle');
  tx.textContent=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:period==='1d'?undefined:'short',day:period==='1d'?undefined:'2-digit',hour:period==='1d'?'2-digit':undefined,minute:period==='1d'?'2-digit':undefined,hour12:false}).format(new Date(bars[idx].t*1000));
  grid.appendChild(tx);
 }
 const path=bars.map((b,i)=>(i?'L':'M')+x(i).toFixed(2)+' '+y(b.c).toFixed(2)).join(' ');
 line.setAttribute('d',path);area.setAttribute('d',path+' L'+right+' '+bottom+' L'+left+' '+bottom+' Z');
 hoverPoints=bars.map((b,i)=>({x:x(i),y:y(b.c),data:b}));pointer.setAttribute('visibility','hidden');
 svg.onpointermove=function(e){
  const rect=svg.getBoundingClientRect(),xx=(e.clientX-rect.left)/rect.width*900;
  const i=Math.max(0,Math.min(hoverPoints.length-1,Math.round((xx-left)/(right-left)*(hoverPoints.length-1))));
  const p=hoverPoints[i];pointer.setAttribute('visibility','visible');
  $('crosshair').setAttribute('x1',p.x);$('crosshair').setAttribute('x2',p.x);
  $('pointCircle').setAttribute('cx',p.x);$('pointCircle').setAttribute('cy',p.y);
  tooltip.hidden=false;
  tooltip.textContent=dollar(p.data.c)+' · '+stamp(p.data.t);
  const px=(p.x/900)*rect.width,py=(p.y/324)*rect.height;
  tooltip.style.left=Math.max(6,Math.min(rect.width-185,px+15))+'px';
  tooltip.style.top=Math.max(5,py-53)+'px';
 };
 svg.onpointerleave=function(){pointer.setAttribute('visibility','hidden');tooltip.hidden=true};
}
function renderIndicators(t){
 indicators=t;const n=v=>Number.isFinite(v)?dollar(v):'—';
 $('rsiValue').textContent=Number.isFinite(t.rsi14)?dec(t.rsi14,1):'—';
 $('rsiFill').style.width=Math.max(0,Math.min(100,t.rsi14||0))+'%';
 $('sma20').textContent=n(t.sma20);$('sma50').textContent=n(t.sma50);
 $('vol20').textContent=Number.isFinite(t.realizedVol20)?dec(t.realizedVol20,1)+'%':'—';
 $('technicalRange').textContent=Number.isFinite(t.low20)&&Number.isFinite(t.high20)?dollar(t.low20)+' – '+dollar(t.high20):'—';
 let words='Not enough verified daily candles for a robust trend classification.';
 if(t.trend==='BULLISH')words='价格位于 SMA20 与 SMA50 之上，20 日均线高于 50 日均线。趋势偏强，但仍需要观察回撤与成交量。';
 if(t.trend==='BEARISH')words='价格低于 SMA20 与 SMA50，短中期价格结构偏弱。优先保护风险预算，避免仅因跌幅较大而抄底。';
 if(t.trend==='MIXED')words='短中期均线方向不一致，趋势暂未确认。更适合等待有效突破或回踩，而非直接追价。';
 if(Number.isFinite(t.rsi14)&&t.rsi14>70)words+=' RSI 偏高，警惕短期追涨。';
 if(Number.isFinite(t.rsi14)&&t.rsi14<30)words+=' RSI 偏低不代表必然反弹。';
 $('techInterpretation').textContent=words;
}
async function loadHistory(){
 const reqId=++historySeq;
 $('chartLoading').style.display='flex';$('chartLoading').innerHTML='<span class="loading-circle"></span>Loading verified price history…';
 $('chartLine').setAttribute('d','');$('chartArea').setAttribute('d','');
 try{
  const response=await fetch('/api/history?symbol='+encodeURIComponent(selected)+'&range='+encodeURIComponent(period),{cache:'no-store',signal:AbortSignal.timeout(20000)});
  const data=await response.json();
  if(reqId!==historySeq)return;
  if(!response.ok||!Array.isArray(data.candles)||data.candles.length<2)throw Error(data.error||'Historical data missing');
  series=data.candles;drawChart(series);renderIndicators(data.technical);
  $('chartSource').textContent='Yahoo Finance · '+(data.quote?.delayMinutes===null?'delay unverified':data.quote.delayMinutes+'m delay')+' · '+series.length+' observations';
  $('chartLoading').style.display='none';
 }catch(e){
  if(reqId!==historySeq)return;
  $('chartLoading').innerHTML='Historical price data unavailable · '+escape(String(e.message||e));
  $('techInterpretation').textContent='技术指标未能获取，当前不提供入场信号。';
 }
}
async function checkAI(){
 try{const r=await fetch('/api/ai-status',{cache:'no-store'}),d=await r.json();aiReady=!!d.enabled;
  $('aiStatus').textContent=aiReady?'OpenAI · On demand':'AI · Configuration needed';
  $('analyzeButton').disabled=!aiReady;
  if(!aiReady)$('aiResult').innerHTML='<span class="ai-result-eyebrow">AI CONNECTION</span><p>尚未检测到有效的服务器端 AI 凭证。图表、指标与风险计算仍可使用。请在 Vercel 配置 API Key 或 AI Gateway 权限。</p>';
 }catch(e){aiReady=false;$('aiStatus').textContent='AI status unavailable';$('analyzeButton').disabled=true;}
}
function renderAI(data){
 const a=data.analysis||{},root=$('aiResult');
 const rows=[['Entry condition',a.entry],['Invalidation',a.invalidation],['Targets',a.targets],['Risk / Reward',a.riskReward],['Change of view',a.whatChanges]];
 let html='<span class="ai-result-eyebrow">EVIDENCE-BASED RESEARCH · '+escape(data.model||'AI')+'</span>'+
 '<div class="ai-verdict">'+escape(a.verdict)+'</div><h3>'+escape(a.title)+'</h3><p>'+escape(a.summary)+'</p>';
 for(const r of rows)html+='<div class="ai-row"><span>'+escape(r[0])+'</span><strong>'+escape(r[1])+'</strong></div>';
 if(a.positive?.length)html+='<p><strong>Positive evidence</strong></p><ul>'+a.positive.slice(0,3).map(s=>'<li>'+escape(s)+'</li>').join('')+'</ul>';
 if(a.risks?.length)html+='<p><strong>Risks</strong></p><ul>'+a.risks.slice(0,3).map(s=>'<li>'+escape(s)+'</li>').join('')+'</ul>';
 html+='<p style="font-size:10px;opacity:.78">Data: '+escape(data.reference?.quoteTimeUTC||'unknown')+' UTC · '+escape(data.reference?.source||'')+'. '+escape(a.dataLimits||'')+'</p>';
 root.innerHTML=html;
}
async function analyze(){
 if(!aiReady){toast('AI is not configured yet');return}
 $('analyzeButton').disabled=true;$('analyzeButton').querySelector('span').textContent='Analyzing verified data…';
 $('aiResult').innerHTML='<span class="ai-result-eyebrow">PROCESSING</span><p>Reading price history, computing technical context, and requesting an OpenAI strategy…</p>';
 try{
  const response=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({symbol:selected,horizon:$('aiHorizon').value,risk:$('aiRisk').value}),signal:AbortSignal.timeout(35000)});
  const d=await response.json();
  if(!response.ok)throw Error(d.message||d.error||'AI provider unavailable');
  renderAI(d);
 }catch(e){
  $('aiResult').innerHTML='<span class="ai-result-eyebrow">MODEL UNAVAILABLE</span><p>'+escape(e.message||'No result')+'</p><p>已有的真实行情和技术指标仍可查看；不会用假 AI 结果替代。</p>';
 }finally{
  $('analyzeButton').disabled=!aiReady;
  $('analyzeButton').querySelector('span').innerHTML='Generate strategy for <b id="aiSymbol">'+escape(selected)+'</b>';
 }
}
function calcRisk(){
 const nav=Number($('navInput').value),risk=Number($('riskInput').value),entry=Number($('entryInput').value),stop=Number($('stopInput').value);
 const ok=nav>0&&risk>0&&risk<=10;
 const budget=ok?nav*risk/100:null;$('riskBudget').textContent=dollar(budget);
 const shares=ok&&entry>stop&&stop>=0&&entry>0?Math.max(0,Math.floor(budget/(entry-stop))):null;
 $('shareCount').textContent=shares===null?'—':dec(shares,0)+' shares';
 $('capitalRequired').textContent=shares===null?'—':dollar(shares*entry);
}
function init(){
 setClock();setInterval(setClock,10000);
 document.querySelectorAll('.side-nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.side-nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active')}));
 document.querySelectorAll('[data-symbol]').forEach(b=>b.addEventListener('click',()=>chooseSymbol(b.dataset.symbol)));
 document.querySelectorAll('[data-range]').forEach(b=>b.addEventListener('click',()=>{period=b.dataset.range;document.querySelectorAll('[data-range]').forEach(x=>x.classList.toggle('active',x===b));loadHistory()}));
 $('watchForm').addEventListener('submit',e=>{e.preventDefault();const sym=$('watchInput').value.trim().toUpperCase();if(!valid(sym)){toast('Please enter a valid ticker');return}if(!watch.includes(sym))watch.unshift(sym);watch=watch.slice(0,19);localStorage.setItem('orbit-watch-v2',JSON.stringify(watch));$('watchInput').value='';renderTable();fetchMarket(true)});
 ['navInput','riskInput','entryInput','stopInput'].forEach(id=>$(id).addEventListener('input',calcRisk));
 $('refreshButton').addEventListener('click',()=>{fetchMarket();loadHistory()});
 $('analyzeButton').addEventListener('click',analyze);
 renderCards();renderPulse();renderTable();renderQuoteMeta();calcRisk();
 checkAI();fetchMarket(true);loadHistory();
 setInterval(()=>{if(!document.hidden)fetchMarket(true)},90000);
 setInterval(()=>{if(!document.hidden)loadHistory()},180000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){fetchMarket(true);loadHistory();}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();