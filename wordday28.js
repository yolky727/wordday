/* WORDDAY 2.8 — battle, quests, and read-only practice history. */
(()=>{
'use strict';
const W=window.WILDWORDS,B=window.WDBattle,$=id=>document.getElementById(id);
const byName=new Map(W.animals.map(a=>[a.cn,a])),pool=[...byName.keys()];
const owned=()=>W.animals.filter(a=>W.data.discovered[a.id]).map(a=>a.cn);
const advanced=()=>W.animals.filter(a=>W.data.advanced[a.id]&&W.data.discovered[a.id]).map(a=>a.cn);
const dateKey=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
function weekDates(){const now=new Date(),start=new Date(now);start.setDate(start.getDate()-(start.getDay()+6)%7);return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return dateKey(d)})}
const key='wordday_battle28';
function readStore(){try{return JSON.parse(localStorage.getItem(key))||{}}catch{return {}}}
let store=readStore();store.daily??={};store.total??={games:0,wins:0,points:0,skills:0};let game=store.active||null;
function save(){store.active=game;localStorage.setItem(key,JSON.stringify(store))}
function record(){if(!game?.finished||game.recorded)return;const day=dateKey();const d=store.daily[day]??={games:0,wins:0,points:0,skills:0};for(const entry of [d,store.total]){entry.finals=(entry.finals||0)+Number(game.round===5&&game.score[0]>game.score[1]);entry.games++;entry.wins+=Number(game.score[0]>game.score[1]);entry.points+=game.score[0];entry.skills+=Number(!!game.spent[0])}game.recorded=true;save();document.dispatchEvent(new Event('wd28badges'))}
const dialog=document.createElement('dialog');dialog.id='wd28Dialog';dialog.setAttribute('aria-labelledby','wd28Title');document.body.append(dialog);
let scene='lobby',selection=[],skillPanel=false,chosenSkill=null,chosenSlot=null,taskTab='day',returnFocus=null,claiming=false;
const text=s=>esc(s),btn=(action,label,cls='secondary',disabled=false)=>'<button type="button" class="'+cls+'" data-b="'+action+'" '+(disabled?'disabled':'')+'>'+label+'</button>';
function show(){returnFocus=document.activeElement;if(!dialog.open)dialog.showModal();paint()}
function close(){dialog.close();returnFocus?.focus?.()}
function frame(title,body){dialog.innerHTML='<header class="b28-head"><h2 id="wd28Title">'+title+'</h2>'+btn('close','关闭')+'</header>'+body}
function en(n){return byName.get(n)?.name||({'暗牌':'Hidden'}[n])||String(n||'').split(' 或 ').map(x=>byName.get(x)?.name||x).join(' / ')}
function skill(n){return B.byName[n]}
function fighter(n){return text(en(n))}
function lobby(){
 const found=owned(),up=advanced(),locked=found.length<4;
 selection=selection.filter(n=>up.includes(n));const picks=up.map(n=>btn('pick:'+n,fighter(n)+(selection.includes(n)?' ✓':''),selection.includes(n)?'b28-evolved':'secondary b28-evolved',!selection.includes(n)&&selection.length===4)).join('');
 frame('卡牌战斗', '<p class="b28-lede">集齐 4 种萌物，即可与系统进行四回合对战。</p><section><h3>选择进阶卡 <small>'+selection.length+' / 4</small></h3><p>可手选任意稀有度的进阶卡。空位从已发现的萌物中随机补齐。</p><div class="b28-grid">'+(picks||'<p>暂无进阶卡，可使用已发现的卡牌随机组队。</p>')+'</div></section>'+btn('start',locked?'已发现 '+found.length+' / 4 种':'组队开战','',locked)+rules());
}
function ecologyNote(a,b){
 const note={'豹/熊猫':'此条关系对应豹对大熊猫幼体的捕食。','狗/考拉':'此条关系对应野犬与考拉。','海豹/企鹅':'海豹卡在此代表豹海豹。','虎鲸/水獭':'此条关系对应有记录的部分虎鲸种群与海獭。','虎鲸/鲨鱼':'不同虎鲸种群食性不同，此处采用捕食鲨鱼的种群。'};
 return note[a+'/'+b]||note[b+'/'+a]||'';
}
function rules(){return '<details><summary>对战规则</summary><p>首回合随机先手，之后轮流先手。系统从全部图鉴随机取 4 张。每次选择限时 20 秒，超时自动出牌或跳过技能。前四回合每张牌出战一次，比较胜场；平分进入决胜局，双方从原四张牌秘密选牌，同时揭晓。加赛仍平则整场平局。</p><p>双方各有一次整场技能机会，含决胜局。先手、后手技能在同时选牌时休眠。游戏特性优先：Mouse 与 Rat 的钻隙克制 Elephant，Hedgehog 的棘阵克制 Wolf，Bee 的蜂扰克制 Rhino。其次检查捕食关系。其余按战术环：Rush → Feint → Ambush → Guard → Reach → Rush。每类胜过顺序里的后两类，同类平局。没有特殊或直接捕食关系时，符合条件的改判技能可先于战术克制结算。平局保护优先于平局转胜。胜负不消耗库存。</p></details>'}
function start(){if(owned().length<4)return;game=B.newGame(pool,owned(),advanced(),selection);scene='fight';finalVisible=false;chosenSlot=null;step()}
let autoTimer=0,autoPassAt=0,finalVisible=false;
function clearTimers(){clearTimeout(autoTimer);autoTimer=0;autoPassAt=0}
dialog.addEventListener('close',clearTimers);
function step(){clearDrag();if(game?.finished)record();save();skillPanel=false;chosenSkill=null;chosenSlot=null;paint()}
function plan(){
 clearTimers();if(!dialog.open||scene!=='fight'||!game)return;
 const g=game,round=g.round,phase=g.phase,actor=g.actor;
 const later=(ms,action)=>{autoTimer=setTimeout(()=>{if(dialog.open&&scene==='fight'&&game===g&&g.round===round&&g.phase===phase&&g.actor===actor)action()},ms)};
 if(phase==='end'){if(!finalVisible)later(1350,()=>{finalVisible=true;paint()});return}
 if(phase==='report'){later(1550,()=>{B.advance(g);step()});return}
 if(actor===1){later(600,()=>{B.automatic(g,1);step()});return}
 if(phase==='show'&&!g.interrupt&&!skillPanel){
   const eligible=B.options(g,0).length>0;
   const delay=eligible?5500:1050;autoPassAt=Date.now()+delay;later(delay,()=>{B.pass(g,0);step()});
 }
}
function labelOption(o){const n=game.hands[0][o.i];let target='';if(o.target!=null){const friendly=['mask','pair','bless','swap'].includes(o.k);target=friendly?' · '+en(game.hands[0][o.target]):' · 对方第 '+(o.target+1)+' 槽'}return skill(n)[0]+target+(o.mode?' · 复制侦察':'')}
function panel(){
 const opts=B.options(game,0),cards=game.hands[0];let html='<div class="b28-skillbox"><h3>选择技能</h3>';
 cards.forEach((n,i)=>{const def=skill(n);if(!def)return;const local=opts.filter(o=>o.i===i);
 html+='<div class="b28-skillrow"><strong>'+fighter(n)+' · '+def[0]+'</strong><p>'+def[1]+'</p>'+(local.length?local.map(o=>btn('opt:'+opts.indexOf(o),text(labelOption(o)))).join(''):'<small>当前不能发动：'+(game.played[0].includes(i)?'本牌已出战':game.fx.seal===1?'本轮遭到封锁':'需满足上方时机与条件')+'</small>')+'</div>'});
 if(!cards.some(skill))html+='<p>本次手牌没有特殊技能，可以直接出牌。</p>';
 if(chosenSkill){html+='<p>发动后将消耗本场唯一机会。</p>'+btn('confirm','确认发动 · '+text(labelOption(chosenSkill)),'')}
 return html+btn('skills','收起技能')+'</div>';
}
function face(n,side=''){return '<div class="a-face '+side+'"><small>'+text(B.style(n)||'')+'</small><strong>'+fighter(n)+'</strong></div>'}
function fight(){
 const g=game;if(!g){scene='lobby';return lobby()}
 const last=g.history.at(-1),report=['report','end'].includes(g.phase),reveal=report||g.phase==='show';
 const round=g.round===5?'决胜局':'回合 '+g.round+' / 4';
 const tally='<div class="a-score"><span>我方 <b>'+g.score[0]+'</b></span><strong>'+round+'</strong><span><b>'+g.score[1]+'</b> 系统</span></div>';
 const history='<details class="a-log"><summary>对战记录</summary>'+g.history.map(h=>'<p>'+h.round+' · '+h.names.map(fighter).join(' / ')+' · '+(['我方获胜','系统获胜'][h.winner]||'平局')+'<br><small>'+text(h.reason||'2.8 规则')+' '+text(h.notes.join('；'))+'</small></p>').join('')+'</details>';
 if(g.finished&&finalVisible){
   const win=g.score[0]>g.score[1],draw=g.score[0]===g.score[1];
   frame('对战结算','<div class="a-final '+(win?'win':draw?'tie':'loss')+'" role="status"><small>'+ (win?'VICTORY':draw?'DRAW':'DEFEAT')+'</small><h3>'+ (win?'你赢了':draw?'平局':'系统获胜')+'</h3><b>'+g.score.join(' : ')+'</b><p>'+g.history.length+' 回合 · 战绩已保存</p></div>'+history+'<div class="b28-actions">'+btn('again','再战一场','')+btn('close','返回妙想')+'</div>');return
 }
 let html=tally+'<div class="b28-oplabel">系统手牌</div><div class="b28-hand">'+g.hands[1].map((n,i)=>{
  const used=g.played[1].includes(i),current=i===g.cards[1],known=g.intel[0][i];const shown=used||current&&reveal?n:current&&g.lead===1?B.displayedLead(g,0):known?.name;
  return '<div class="b28-opcard '+(used?'b28-played':'')+'"><small>'+String(i+1).padStart(2,'0')+'</small><b>'+ (shown?fighter(shown):'W')+'</b></div>'}).join('')+'</div>';
 const enemy=g.cards[1]===null?'':reveal?g.hands[1][g.cards[1]]:g.lead===1?B.displayedLead(g,0):'';
 html+='<div id="aDrop" class="a-field '+(reveal?'revealed':'')+'" aria-label="出牌区">'+(enemy?face(enemy,'opponent'):'<div class="a-placeholder">系统牌位</div>')+'<span class="a-vs">VS</span>'+(g.cards[0]!==null?face(g.hands[0][g.cards[0]],'player'):'<div class="a-placeholder mine">拖到这里出牌</div>');
 if(report&&last){html+='<div class="a-flash '+(last.winner===0?'win':last.winner===1?'loss':'tie')+'" role="status"><small>'+round+'</small><strong>'+ (last.winner===0?'胜出':last.winner===1?'落败':'平局')+'</strong><span>'+text(last.reason||'回合结束')+'</span></div>'}
 html+='</div>';
 if(!report){
  const prompt=g.actor===1?'系统正在行动…':g.interrupt?'可用树懒拒绝侦察':g.phase==='show'?(B.options(g,0).length?'可发动技能 · 倒计时后自动结算':'正在结算'):g.phase==='duel'?'双方秘密选牌':g.phase==='reply'?'选择对策牌':'你先出牌';
  html+='<div class="b28-turn"><span>'+prompt+'</span><b id="b28Clock"></b></div>';
  if(reveal){const pred=B.matchup(g.hands[0][g.cards[0]],g.hands[1][g.cards[1]]);html+='<p class="a-hint">'+pred.kind+' · '+(pred.delta>0?'我方占优':pred.delta<0?'系统占优':'双方持平')+'</p>'}
  if(g.actor===0&&!g.interrupt&&['lead','reply','duel'].includes(g.phase)){
    const legal=B.available(g,0);
    html+='<div class="a-hand">'+g.hands[0].map((n,i)=>btn('slot:'+i,'<small>'+text(B.style(n))+'</small><strong>'+fighter(n)+'</strong>','secondary a-card '+(advanced().includes(n)?'b28-evolved':''),!legal.includes(i))).join('')+'</div><small class="a-hint">拖入出牌区，或轻点手牌直接打出。</small>';
  }
 }
 html+='<div class="b28-actions">'+btn('skills',g.spent[0]?'技能已使用':'选择技能','secondary',!!g.spent[0]||report||g.actor===1)+(g.spent[0]?'<small>第 '+g.spent[0].round+' 回合 · '+fighter(g.spent[0].name)+' · '+text(g.spent[0].skill)+'</small>':'')+'</div>';
 if(skillPanel&&!report&&!g.spent[0])html+=panel();
 if(!report&&g.actor===0&&(g.interrupt||skillPanel&&g.phase==='show'))html+=btn('pass',g.interrupt?'允许侦察':'跳过技能');
 if(Object.keys(g.intel[0]).length)html+='<p class="b28-alert">已侦察：'+Object.entries(g.intel[0]).map(([i,v])=>'#'+(+i+1)+' '+fighter(v.name)).join(' · ')+'</p>';
 html+=history;frame('卡牌战斗',html);plan();tick(false)
}
function tasks(){
 const days=taskTab==='day'?[dateKey()]:weekDates(),prefix=(taskTab==='day'?'D':'W')+days[0]+'/',uniqueWords=days.reduce((c,d)=>c+new Set(state.daily[d]||[]).size,0),studyDays=days.filter(d=>state.daily[d]?.length).length;
 const quizzes=(state.quizHistory||[]).filter(r=>days.includes(r.date)),sum=field=>days.reduce((n,d)=>n+(store.daily[d]?.[field]||0),0);
 const specs=taskTab==='day'?[['学习 5 个单词',uniqueWords,5],['完成一次测试或一场对战',quizzes.length+sum('games'),1]]:[
 ['累计学习 15 词',uniqueWords,15],['累计学习 40 词',uniqueWords,40],['在 3 天留下学习记录',studyDays,3],['完成 3 次测试',quizzes.length,3],['测试累计答对 20 题',quizzes.reduce((n,r)=>n+(+r.correct||0),0),20],['完成 2 场对战',sum('games'),2],['赢得 3 个战斗回合',sum('points'),3]];
 return specs.map(([label,n,max],i)=>({label,n,max,id:prefix+i}));
}
function taskPage(){const rows=tasks(),claims=W.data.taskClaims||{};
 frame('任务与奖励','<div class="b28-tabs">'+btn('day','每日任务',taskTab==='day'?'':'secondary')+btn('week','每周任务',taskTab==='week'?'':'secondary')+'</div><p>'+ (taskTab==='day'?'每天 2 项，按本地日期更新。':'每周一开始，共 7 项。')+'每项完成可领取一张随机卡，重复卡进入库存。</p>'+rows.map((r,i)=>'<div class="b28-task"><div><strong>'+r.label+'</strong><small>'+Math.min(r.n,r.max)+' / '+r.max+'</small></div>'+btn('claim:'+i,claims[r.id]?'已领取':r.n>=r.max?'抽取 1 张':'进行中',r.n>=r.max&&!claims[r.id]?'':'secondary',!!claims[r.id]||r.n<r.max)+'</div>').join('')+(store.message?'<p aria-live="polite">'+text(store.message)+'</p>':''));}
async function claim(index){
 if(claiming)return;claiming=true;
 try{const r=tasks()[index];if(!r||r.n<r.max)return;
 const grant=()=>{const raw=JSON.parse(localStorage.getItem('wordday_wildwords_25')||'null')||JSON.parse(JSON.stringify(W.data));
 raw.taskClaims??={};if(Object.hasOwn(raw.taskClaims,r.id))return;const a=W.randomCard();raw.discovered[a.id]=true;raw.inventory[a.id]=Number(raw.inventory[a.id]||0)+1;raw.taskClaims[r.id]=a.id;
 localStorage.setItem('wordday_wildwords_25',JSON.stringify(raw));Object.assign(W.data,raw);window.WD28CardFX?.sound('acquire');store.message='获得 '+a.cn+' · '+a.name;document.dispatchEvent(new Event('wd28badges'))};
 if(navigator.locks)await navigator.locks.request('wd28-reward',grant);else grant();taskPage();
 }catch{toast('保存奖励失败，请重试')}finally{claiming=false}
}
function paint(){if(!dialog.open)return;if(scene==='fight')fight();else if(scene==='tasks')taskPage();else lobby()}
function tick(advance=true){
 if(!dialog.open||scene!=='fight'||!game||['report','end'].includes(game.phase))return;
 const left=Math.max(0,Math.ceil((Math.min(game.deadline,autoPassAt||game.deadline)-Date.now())/1000));if($('b28Clock'))$('b28Clock').textContent=left+' 秒';
 if(advance&&!left&&game.actor===0){B.automatic(game,game.actor,false);step()}
}
let drag=null,suppressClickUntil=0;
function clearDrag(){if(!drag)return;drag.ghost?.remove();$('aDrop')?.classList.remove('over');drag=null}
dialog.addEventListener('pointerdown',ev=>{
 const card=ev.target.closest('.a-card:enabled');if(!card||!ev.isPrimary||ev.button!==0)return;
 drag={card,slot:Number(card.dataset.b.split(':')[1]),id:ev.pointerId,x:ev.clientX,y:ev.clientY,round:game.round,phase:game.phase,gameId:game.id};
 card.setPointerCapture?.(ev.pointerId)
});
dialog.addEventListener('pointermove',ev=>{
 if(!drag||ev.pointerId!==drag.id)return;const d=drag;
 if(!d.ghost&&Math.hypot(ev.clientX-d.x,ev.clientY-d.y)<7)return;
 if(!d.ghost){d.ghost=d.card.cloneNode(true);d.ghost.removeAttribute('data-b');d.ghost.classList.add('a-ghost');d.ghost.setAttribute('aria-hidden','true');dialog.append(d.ghost)}
 d.ghost.style.left=ev.clientX+'px';d.ghost.style.top=ev.clientY+'px';
 const r=$('aDrop')?.getBoundingClientRect();$('aDrop')?.classList.toggle('over',!!r&&ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom)
});
dialog.addEventListener('pointerup',ev=>{
 if(!drag||ev.pointerId!==drag.id)return;const d=drag,r=$('aDrop')?.getBoundingClientRect();
 const valid=d.ghost&&r&&ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom;
 if(d.ghost)suppressClickUntil=performance.now()+400;clearDrag();
 if(valid&&game.id===d.gameId&&game.round===d.round&&game.phase===d.phase){if(game.deadline<=Date.now()){tick();return}if(B.play(game,0,d.slot))step()}
});
dialog.addEventListener('click',ev=>{if(performance.now()<suppressClickUntil){ev.preventDefault();ev.stopImmediatePropagation()}},true);
dialog.addEventListener('pointercancel',clearDrag);dialog.addEventListener('close',clearDrag);
dialog.addEventListener('click',ev=>{const b=ev.target.closest('[data-b]');if(!b||b.disabled)return;const [op,arg]=b.dataset.b.split(':');
 if(op==='close')return close();if(op==='start')return start();if(op==='pick'){selection=selection.includes(arg)?selection.filter(n=>n!==arg):[...selection,arg];return lobby()}
 if(op==='day'||op==='week'){taskTab=op;return taskPage()}if(op==='claim')return claim(+arg);
 if(!game)return;if(game.deadline&&Date.now()>=game.deadline){tick();return}
 if(op==='again'){scene='lobby';selection=[];return lobby()}if(op==='next'){B.advance(game);return step()}
 if(op==='slot'){if(B.play(game,0,+arg))step();return}if(op==='skills'){skillPanel=!skillPanel;chosenSkill=null;return paint()}
 if(op==='opt'){chosenSkill=B.options(game,0)[+arg];return paint()}if(op==='confirm'){if(chosenSkill&&B.activate(game,0,chosenSkill))step();return}
 if(op==='pass'){B.pass(game,0);return step()}if(op==='play'&&chosenSlot!==null&&B.play(game,0,chosenSlot))step();
});
setInterval(tick,300);
const home=document.createElement('section');home.className='panel';home.id='battleHome';const rewards=document.createElement('section');rewards.className='panel';rewards.id='rewardHome';rewards.innerHTML='<div class="panel-head"><h2>任务与奖励</h2></div><p class="smallnote">每日 2 项 · 每周 7 项，每完成一项可抽一张卡。</p><button id="enterTasks28">查看任务</button>';
function homeContent(){const count=owned().length;home.innerHTML='<div class="panel-head"><h2>萌物对战</h2><span class="sub">已发现 '+count+' / 74 种</span></div><p class="smallnote">'+(count<4?'再发现 '+(4-count)+' 种萌物即可解锁战斗。':'从进阶卡中挑选队员，或随机组建四张牌的阵容。')+'</p><div class="b28-actions"><button id="enterBattle28" '+(count<4?'disabled':'')+'>'+(game&&!game.finished?'继续对战':'进入战斗')+'</button></div>';
 $('enterBattle28').onclick=()=>{if(owned().length<4)return;scene=game&&!game.finished?'fight':'lobby';show();if(scene==='fight')tick()};$('enterTasks28').onclick=()=>{scene='tasks';store.message='';show()}}
$('wildInline').after(home,rewards);homeContent();document.addEventListener('wd28badges',homeContent);
document.querySelector('[data-main-tab="ideas"]')?.addEventListener('click',homeContent);
window.WD28Stats=()=>({found:owned().length,advanced:advanced().length,...store.total});
window.addEventListener('storage',event=>{
 if(event.key==='wordday_wildwords_25'&&event.newValue){try{Object.assign(W.data,JSON.parse(event.newValue));homeContent();if(dialog.open&&scene==='tasks')paint()}catch{}}
 if(event.key===key&&event.newValue){try{const update=JSON.parse(event.newValue);if(update.daily&&update.total){store=update;game=store.active||null;chosenSlot=null;skillPanel=false;chosenSkill=null;homeContent();paint()}}catch{}}
});
document.dispatchEvent(new Event('wd28badges'));
$('wd24Version').textContent='WORDDAY 2.8.1 · 萌物竞技场';document.querySelector('.brand small').textContent='THE DAILY PRACTICE · 2.8.1';
})();
