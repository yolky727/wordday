(()=>{'use strict';
const W=window.WILDWORDS,B=window.WDBattle,KEY='wordday_wildwords_25';
const modes=[
{id:'rookie',name:'新人驯兽师',tiers:[0],need:3,reward:'pack',description:'沃尔德的门前遛弯💀'},
{id:'apprentice',name:'见习驯兽师',tiers:[0,1],need:5,reward:'pack',description:'沃尔德的小施巧计☠'},
{id:'excellent',name:'卓越驯兽师',tiers:[2,3],need:5,reward:'pack',description:'沃尔德的严苛训练👿'},
{id:'supreme',name:'超凡驯兽师',tiers:[3,4,5],need:5,reward:'luminous',description:'沃尔德的恶魔之吻😈'},
{id:'peerless',name:'无双驯兽师',need:7,reward:null,description:'沃尔德的最终试炼👽'},
{id:'prank',name:'整蛊专家',tiers:[2,3,4,5],need:3,reward:'pack',fun:true,duplicate:true,rule:'沃尔德随机使用四张同名牌。被动不叠加，公共技能限一次。'},
{id:'mirror',name:'镜像对决',need:5,reward:'pack',fun:true,title:'破镜重圆',rule:'双方阵容、进阶状态相同，出牌顺序各自决定。'},
{id:'underdog',name:'小兽逆袭',tiers:[0,1],need:5,reward:'pack',fun:true,title:'无名小卒？',rule:'双方仅使用普通、稀有牌。保留已有进阶优势。'},
{id:'hidden',name:'藏龙卧虎',need:5,reward:'pack',fun:true,title:'逗逗你的',rule:'双方三张普通、一张流光或传奇。未出战牌隐藏身份与稀有度。'},
{id:'swap',name:'命运换位',need:5,reward:'pack',fun:true,title:'借过一下',rule:'配队后选一张牌交换；沃尔德同时选牌，交换后开战。'}];
const topTeams=[['龙','霸王龙','独角兽','猛犸象'],['龙','霸王龙','独角兽','凤凰'],['龙','霸王龙','虎鲸','猛犸象'],['龙','霸王龙','独角兽','鲸'],['龙','霸王龙','猛犸象','长颈龙']];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names=new Map(W.animals.map(c=>[c.cn,c]));
function data(raw=W.data){raw.arena34??={};const a=raw.arena34;for(const key of ['progress','results','rewards','lineups','games','repeatRewards'])a[key]??={};if(a.active?.game&&!a.games[a.active.mode])a.games[a.active.mode]=a.active.game;return a}
function locked(fn){const run=()=>{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');raw.inventory??={};raw.discovered??={};raw.advanced??={};const result=fn(raw,data(raw));localStorage.setItem(KEY,JSON.stringify(raw));Object.assign(W.data,raw);document.dispatchEvent(new Event('wd28badges'));return result};return navigator.locks?navigator.locks.request('wd28-reward',run):Promise.resolve(run())}
function unlocked(m,raw=W.data){const i=modes.indexOf(m);return i===0||m.fun||!!data(raw).progress[modes[i-1].id]?.cleared}
function allowed(m,c){return m.id==='underdog'?c.rarity<=1:m.id==='hidden'?c.rarity===0||c.rarity>=4:true}
function legalPicks(m,chosen=[],raw=W.data){const seen=new Set();let high=false,low=0;return chosen.filter(n=>{const c=names.get(n);if(!c||seen.has(n)||!raw.discovered[c.id]||!raw.advanced[c.id]||!allowed(m,c))return false;if(m.id==='hidden'&&c.rarity===0&&++low>3)return false;if(m.id==='hidden'&&c.rarity>=4){if(high)return false;high=true}seen.add(n);return true}).slice(0,4)}
function lineup(id){const m=modes.find(x=>x.id===id);return legalPicks(m,data().lineups[id]||[])}
function setLineup(id,chosen){const m=modes.find(x=>x.id===id);if(!m)throw Error('模式无效');return locked((raw,a)=>a.lineups[id]=legalPicks(m,chosen,raw))}
function create(m,chosen=[]){
 if(!unlocked(m))throw Error('先完成上一段位');
 const all=W.animals.map(c=>c.cn),rarity=Object.fromEntries(W.animals.map(c=>[c.cn,c.rarity]));
 const own=W.animals.filter(c=>W.data.discovered[c.id]&&allowed(m,c)).map(c=>c.cn),advanced=own.filter(n=>W.data.advanced[names.get(n).id]);
 chosen=legalPicks(m,chosen);let player;
 if(m.id==='hidden'){
  const common=own.filter(n=>rarity[n]===0),high=own.filter(n=>rarity[n]>=4);
  if(common.length<3||!high.length)throw Error('需要三种普通牌和一种流光或传奇牌');
  const low=chosen.filter(n=>rarity[n]===0),top=chosen.find(n=>rarity[n]>=4)||B.shuffled(high)[0];
  player=[...low,...B.shuffled(common.filter(n=>!low.includes(n)))].slice(0,3).concat(top);
 }else{if(own.length<4)throw Error(m.id==='underdog'?'需要发现四种普通或稀有牌':'需发现至少四种萌物');player=[...chosen,...B.shuffled(own.filter(n=>!chosen.includes(n)))].slice(0,4)}
 const g=B.newGame(all,own,advanced,chosen,rarity);g.hands[0]=player;g.evolved[0]=player.filter(n=>advanced.includes(n));
 const pool=W.animals.filter(c=>m.tiers?.includes(c.rarity));
 if(m.id==='mirror'){g.hands[1]=B.shuffled(player);g.evolved[1]=g.evolved[0].slice()}
 else if(m.id==='hidden'){g.hands[1]=B.shuffled(W.animals.filter(c=>c.rarity===0).map(c=>c.cn)).slice(0,3).concat(B.shuffled(W.animals.filter(c=>c.rarity>=4).map(c=>c.cn))[0]);g.evolved[1]=g.hands[1].filter(n=>rarity[n]===5)}
 else{g.hands[1]=m.duplicate?Array(4).fill(B.shuffled(pool)[0].cn):m.id==='peerless'?B.shuffled(topTeams)[0].slice():B.shuffled((m.id==='swap'?W.animals.filter(c=>!player.includes(c.cn)):pool).map(c=>c.cn)).slice(0,4);g.evolved[1]=g.hands[1].filter(n=>rarity[n]===5||m.id==='peerless')}
 g.arenaMode=m.id;g.rewardEligible285=false;if(m.duplicate)g.skillCaps=[1,1];
 if(m.id==='swap')g.arenaSwap={pending:true,enemySlot:Math.floor(Math.random()*4)};
 return g;
}
function exchange(g,slot){if(!g.arenaSwap?.pending||!Number.isInteger(slot)||slot<0||slot>3)throw Error('请选择交换卡牌');const t=g.arenaSwap.enemySlot,a=g.hands[0][slot],b=g.hands[1][t],ae=g.evolved[0].includes(a),be=g.evolved[1].includes(b);g.hands[0][slot]=b;g.hands[1][t]=a;g.evolved[0]=g.evolved[0].filter(n=>n!==a);g.evolved[1]=g.evolved[1].filter(n=>n!==b);if(be&&!g.evolved[0].includes(b))g.evolved[0].push(b);if(ae&&!g.evolved[1].includes(a))g.evolved[1].push(a);g.arenaSwap={pending:false,from:a,to:b};g.deadline=Date.now()+20000;return g}
const cycleNeed=m=>m.id==='peerless'?5:3;
const cycleEnabled=(m,p,a)=>!!p.cleared&&(!m.reward||a.rewards[m.id]?.status==='claimed');
function awardIds(type){const ids=type==='luminous'?[W.sample(4).id]:type==='card'?[(W.randomCard?W.randomCard():W.sample(0)).id]:window.WDChestCards?window.WDChestCards():[W.sample(0).id,W.sample(1).id,W.sample(2).id];if(!ids.length||ids.some(id=>!W.animals.some(c=>c.id===id&&c.rarity!==5)))throw Error('奖励卡牌无效');return ids}
async function complete(g){if(!g.finished||!g.arenaMode)return;return locked((raw,a)=>{
 if(a.results[g.id])return false;const m=modes.find(x=>x.id===g.arenaMode);if(!m)return false;
 const p=a.progress[m.id]??={streak:0,best:0,cleared:false},repeat=cycleEnabled(m,p,a),win=g.score[0]>g.score[1];
 p.streak=win?(p.streak||0)+1:0;p.best=Math.max(p.best||0,p.streak);
 a.results[g.id]={win,at:new Date().toISOString()};a.games[m.id]=g;a.active={mode:m.id,game:g};
 if(repeat){p.cycle=win?(p.cycle||0)+1:0;if(p.cycle>=cycleNeed(m)){const queue=a.repeatRewards[m.id]??=[];queue.push({id:crypto.randomUUID(),ids:awardIds(m.id==='peerless'?'pack':'card'),status:'ready'});p.cycle=0}}
 if(p.streak>=m.need&&!p.cleared){p.cleared=true;p.at=new Date().toISOString();p.cycle=0;if(m.reward)a.rewards[m.id]={id:crypto.randomUUID(),ids:awardIds(m.reward),status:'ready'};if(m.id==='peerless')a.endingPending=true}
 return true;
})}
function ready(id,a=data()){const first=a.rewards[id];return first?.status==='ready'?first:(a.repeatRewards[id]||[]).find(r=>r.status==='ready')}
async function claim(id){const ids=await locked((raw,a)=>{const r=ready(id,a);if(!r)return null;for(const cardId of r.ids){if(!W.animals.some(c=>c.id===cardId&&c.rarity!==5))throw Error('奖励卡牌无效');raw.inventory[cardId]=Number(raw.inventory[cardId]||0)+1;raw.discovered[cardId]=true}r.status='claimed';r.at=new Date().toISOString();return r.ids});if(ids)window.WDBattleArenaUI34?.rewards(ids.map(i=>W.animals.find(c=>c.id===i)),()=>open());render();return ids}
function titles(){const a=data(),out=modes.filter(m=>a.progress[m.id]?.cleared).map(m=>m.title||m.name);if(a.progress.peerless?.cleared)out.push('黄粱一梦','Bless you');return out}
let selected=data().selected||'rookie',pick=[],launching=false; if(!modes.some(m=>m.id===selected))selected='rookie';
const d=document.createElement('dialog');d.id='arena34';document.body.append(d);
function modeStatus(m,p){return p.cleared?'已达成':(p.streak||0)+' / '+m.need+' 连胜'}
function render(){const a=data(),m=modes.find(x=>x.id===selected),p=a.progress[m.id]||{},scroll=d.querySelector('.ar34-ranks')?.scrollTop||0,expanded=d.querySelector('details')?.open;pick=lineup(selected);const advanced=W.animals.filter(c=>W.data.discovered[c.id]&&W.data.advanced[c.id]&&allowed(m,c));
 const pending=a.games[selected]?.arenaSwap?.pending;
 d.innerHTML='<header class="b28-head"><h2>竞技场</h2><button data-ar34="close" class="secondary">关闭</button></header><div class="ar34-ranks" role="group" aria-label="选择挑战模式">'+modes.map(x=>'<button data-ar34="mode" data-id="'+x.id+'" aria-pressed="'+(x.id===selected)+'" class="'+(x.id===selected?'active':'secondary')+'" '+(!unlocked(x)?'disabled':'')+'><span>'+x.name+'</span><small>'+modeStatus(x,a.progress[x.id]||{})+'</small></button>').join('')+'</div><section class="ar34-plan"><small>'+(m.fun?'娱乐模式':'段位挑战')+'</small><h3>'+m.name+'</h3>'+(m.description?'<p class="ar36-description">'+m.description+'</p>':'')+'<p>'+(m.rule|| (m.id==='peerless'?'顶级阵容':m.tiers.map(i=>['普通','稀有','史诗','奇珍','流光','传奇'][i]).join(' · ')))+'</p><p class="smallnote">'+(p.cleared?cycleEnabled(m,p,a)?'后续 '+(p.cycle||0)+' / '+cycleNeed(m)+' 连胜 · '+(m.id==='peerless'?'卡包':'随机单卡'):'首次奖励待领取':m.need+' 连胜 · '+(m.reward==='pack'?'卡包＋称号':m.reward==='luminous'?'随机流光＋称号':'称号'))+'</p>'+(ready(m.id)?'<button data-ar34="claim" data-id="'+m.id+'">领取奖励</button>':'')+'</section><details '+(expanded?'open':'')+'><summary>配队 · 已选 '+pick.length+' / 4</summary><div class="ar34-picks">'+advanced.map(c=>'<button class="secondary" data-ar34="pick" data-name="'+esc(c.cn)+'" aria-pressed="'+pick.includes(c.cn)+'"><span>'+c.emoji+'</span>'+esc(c.cn)+'</button>').join('')+'</div><p class="smallnote">'+(m.id==='hidden'?'三张普通＋一张流光或传奇，空位随机补齐':'空位随机补齐')+'</p></details><div class="ar34-bottom"><button data-ar34="start">'+(pending?'选择交换卡牌':a.games[selected]&&!a.games[selected].finished?'继续挑战':'开始挑战')+'</button></div>'+(selected==='peerless'&&p.cleared?'<button class="secondary ar36-replay" data-ar34="ending">重看结局</button>':'')+'<details><summary>规则</summary><p>各模式独立配队、连胜和奖励。失败或最终平局归零，平分先加赛。首次奖励仅一次，领取后开启循环奖励。</p><p>后续每三连胜获得随机单卡，无双每五连胜获得卡包。领取不重置总连胜；刷新恢复对局。</p></details>';
 d.querySelector('.ar34-ranks').scrollTop=scroll;
}
function showSwap(g){d.innerHTML='<header class="b28-head"><h2>命运换位</h2><button data-ar34="close" class="secondary">关闭</button></header><p class="smallnote">选一张交换，沃尔德已选定。</p><div class="ar36-exchange">'+g.hands[0].map((n,i)=>'<button class="secondary" data-ar34="exchange" data-slot="'+i+'">'+W.card(names.get(n),true,g.evolved[0].includes(n))+'</button>').join('')+'</div>';}
async function enter(g){const m=modes.find(x=>x.id===g.arenaMode);if(g.arenaSwap?.pending){if(!d.open)d.showModal();showSwap(g);return}if(d.open)d.close();window.WDBattleArenaUI34.start(g,m)}
async function launch(){if(launching)return;launching=true;try{const g=await locked((_raw,a)=>{if(a.games[selected]&&!a.games[selected].finished)return a.games[selected];const m=modes.find(x=>x.id===selected),g=create(m,legalPicks(m,a.lineups[selected]||[]));a.games[selected]=g;a.active={mode:selected,game:g};return g});await enter(g)}catch(e){alert(e.message)}finally{launching=false}}
function open(){if(!d.open)d.showModal();render()}
d.addEventListener('click',async e=>{const b=e.target.closest('[data-ar34]');if(!b||b.disabled)return;try{const action=b.dataset.ar34;if(action==='close')d.close();if(action==='mode'){selected=b.dataset.id;await locked((_r,a)=>{a.selected=selected});render()}if(action==='pick'){const m=modes.find(x=>x.id===selected),n=b.dataset.name,next=pick.includes(n)?pick.filter(v=>v!==n):pick.concat(n);if(!pick.includes(n)&&legalPicks(m,next).length!==next.length){alert(m.id==='hidden'?'最多三张普通牌和一张高阶牌':'最多选择四张');return}await setLineup(selected,next);render()}if(action==='start')await launch();if(action==='claim')await claim(b.dataset.id);if(action==='ending')await showEnding(true);if(action==='exchange'){b.disabled=true;const g=await locked((_r,a)=>{const g=a.games[selected];exchange(g,Number(b.dataset.slot));a.active={mode:selected,game:g};return g});await enter(g)}}catch(err){alert(err.message);render()}});
function saveGame(g){return locked((_raw,a)=>{a.games[g.arenaMode]=g;a.active={mode:g.arenaMode,game:g}})}
function progress35(g){const m=modes.find(x=>x.id===g.arenaMode),a=data(),p=a.progress[m.id]||{},cycle=cycleEnabled(m,p,a),n=cycle?p.cycle||0:p.streak||0,need=cycle?cycleNeed(m):m.need;return '<section class="result35-progress"><div><strong>'+m.name+'</strong><span>'+n+' / '+need+'</span></div><div class="result35-steps">'+Array.from({length:need},(_,i)=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</div></section>'}
function actions35(g){return (ready(g.arenaMode)?'<button data-b="arenaClaim">领取奖励</button>':'<button data-b="arenaNext">继续挑战</button>')+'<button class="secondary" data-b="arenaHome">返回竞技场</button>'}
const endingText=['沃尔德想不通，强大如他竟也有被打败的一天，','看来比起实力更重要的是逆境时的勇气和智慧。','你一定能在未来的道路越走越远，战胜生活中的最终boss！'];let endingOpen=false;
async function showEnding(replay=false){if(endingOpen||!data().progress.peerless?.cleared||!replay&&!data().endingPending)return;endingOpen=true;const modal=document.createElement('dialog');modal.id='arenaEnding36';modal.innerHTML='<div class="ar36-stars" aria-hidden="true">'+Array.from({length:12},(_,i)=>'<i style="--x:'+((i*29+7)%96)+'%;--y:'+((i*19+5)%90)+'%;--delay:'+i*.22+'s"></i>').join('')+'</div><div class="ar36-story">'+endingText.map((s,i)=>'<p style="--delay:'+i*3+'s">'+s+'</p>').join('')+'<div class="ar36-end" style="--delay:9s">—The end</div><div class="ar36-titles" style="--delay:10s"><span>无双驯兽师</span><span>黄粱一梦</span><span>Bless you</span></div></div><button class="secondary" data-ending-next>跳过</button>';document.body.append(modal);modal.showModal();let revealed=false;const button=modal.querySelector('[data-ending-next]');const reveal=()=>{revealed=true;modal.classList.add('ar36-revealed');button.textContent='继续'};const timer=setTimeout(reveal,11500);modal.addEventListener('cancel',e=>{e.preventDefault();button.click()});button.onclick=async()=>{if(!revealed){clearTimeout(timer);reveal();return}button.disabled=true;try{await locked((_r,a)=>{a.endingPending=false;a.endingSeen=true});modal.close();modal.remove();endingOpen=false}catch(e){button.disabled=false;alert(e.message)}};}
function result(g){return progress35(g)+'<div class="ar34-result">'+actions35(g)+'</div>'}
window.WDArena34={progress35,actions35,open,modes,topTeams,create,complete,claim,saveGame,result,data,titles,lineup,setLineup,exchange,showEnding,next:async()=>{selected=data().active?.mode||selected;await locked((_r,a)=>{if(a.games[selected]?.finished)delete a.games[selected];a.active=null});await launch()}};
const entry=document.createElement('section');entry.className='panel ar34-entry';entry.innerHTML='<div><span class="wd271-kicker">ARENA</span><h2>竞技场</h2></div><button type="button">进入 →</button>';entry.querySelector('button').onclick=open;document.getElementById('ideas')?.append(entry);
})();
