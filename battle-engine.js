/* Serializable battle rules. Indices address the four original slots throughout a match. */
(function(root){
'use strict';
const byName={
'熊猫':['以和为贵','亮牌后，把自己的基础失败保护为平局。','guard'],
'企鹅':['冰面滑行','先手遇到能捕食自己的对策牌时，换一张未出战手牌，企鹅留到后面。','swap'],
'浣熊':['翻找口袋','查看对方本回合尚未出战的全部手牌，直到回合结束。','scout'],
'北极熊':['极地压制','先手公开出牌，本回合封锁对方技能。','seal'],
'鲸':['深海庇护','庇护一张剩余己方手牌，使其下次的基础失败变为平局。','bless'],
'虎鲸':['协同围猎','此前己方打出过海洋动物，后手可将基础平局改为胜利。','win'],
'火烈鸟':['群舞佯攻','先手盖牌，对方选定后再揭晓。','hide'],
'孔雀':['开屏邀战','先手时禁止对面一张剩余牌本轮出战，至少留一张可选。','ban'],
'变色龙':['拟态伪装','先手显示为另一张己方剩余牌，按自身身份结算。','mask'],
'熊':['守林反击','后手对阵陆生哺乳动物，将基础平局改为胜利。','win'],
'水獭':['结伴漂流','己方上一轮出过水生或半水生动物，基础失败改为平局。','guard'],
'考拉':['树冠避战','面对不能攀树的陆地对手，基础失败改为平局。','guard'],
'猫头鹰':['夜视侦察','先手侦察对方一张未出战手牌，得知身份与技能状态。','peek'],
'老虎':['伏击','后手对阵非巨型陆地食草动物，基础平局改为胜利。','win'],
'狮子':['狮群接力','上一轮己方陆地动物获胜，本轮基础平局改为胜利。','win'],
'狼':['追踪猎物','标记一张剩余敌牌，持续明示直到该牌出战。','track'],
'章鱼':['墨幕','后手时将基础失败改为平局。','guard'],
'海豹':['破冰换气','对阵陆地动物时将基础失败改为平局。','guard'],
'鹿':['警觉疾奔','先手遇到陆地捕食者，基础失败改为平局。','guard'],
'大象':['象群守护','保护一张剩余的陆地食草牌，其下次面对陆地捕食者的基础失败改为平局。','bless'],
'长颈鹿':['高处瞭望','亮牌后随机查看最多两张剩余敌牌。','look'],
'斑马':['条纹迷阵','先手展示自己和一张己方剩余牌两种可能身份，隐藏真实出牌。','pair'],
'犀牛':['迎面冲锋','先手对阵非巨型陆地动物，基础平局改为胜利。','win'],
'袋鼠':['疾跃回避','后手对阵陆地动物，直接保护本轮为平局。','draw'],
'树懒':['静止伪装','在手中被侦察或追踪时，可以消耗机会拒绝揭示自身。','resist'],
'蝙蝠':['回声定位','对方盖牌、伪装或制造二选一时，揭示真身并锁定蝙蝠应战。','echo'],
'豹':['树上突袭','后手对阵能攀树的非巨型动物，基础平局改为胜利。','win'],
'海豚':['声呐定位','查看对方剩余手牌中的所有海洋动物。','sonar'],
'鲨鱼':['循迹追击','己方上一轮获胜，本轮面对海洋动物，基础平局改为胜利。','win'],
'天鹅':['护巢','先手对阵鸟类，将本回合保护为平局。','draw'],
'鹦鹉':['学舌','复现本局此前一次成功侦察的查看效果，不能复制改判、封技或持续追踪。','copy'],
'鹰':['高空俯冲','后手对阵非猛禽鸟类，基础平局改为胜利。','win'],
'驼鹿':['鹿角架势','后手遭陆地捕食者捕食，基础失败改为平局。','guard'],
'鳄鱼':['水边伏击','先手对阵非巨型陆地食草动物，基础平局改为胜利。','win']};
const groups={
 marine:'企鹅 章鱼 海豹 鲸 虎鲸 鲨鱼 水母 螃蟹 龙虾 虾 鱿鱼 河豚 海豚 小丑鱼',
 water:'水獭 青蛙 河马 海狸 鳄鱼 海龟 天鹅 鸭 鹅 火烈鸟',
 bird:'企鹅 鸭 鸡 小鸡 火烈鸟 天鹅 鹅 孔雀 鹦鹉 鹰 猫头鹰',
 flight:'猫头鹰 蝙蝠 鹰 鸭 火烈鸟 天鹅 鹅 孔雀 鹦鹉 蝴蝶 蜜蜂',
 herb:'兔子 熊猫 考拉 牛 鹿 羊 山羊 马 大象 长颈鹿 斑马 犀牛 袋鼠 树懒 海狸 羊驼 骆驼 野牛 水牛 驼鹿 河马',
 giant:'大象 犀牛 河马 长颈鹿 鲸',
 climb:'猫 熊 熊猫 浣熊 狐狸 考拉 猴子 树懒 豹 松鼠 变色龙',
 mammal:'猫 狗 兔子 狐狸 熊 熊猫 仓鼠 考拉 老虎 狮子 牛 猪 猴子 狼 刺猬 鹿 松鼠 马 羊 山羊 大象 长颈鹿 斑马 河马 犀牛 袋鼠 树懒 海狸 獾 臭鼬 老鼠 大鼠 豹 北极熊 羊驼 骆驼 野牛 水牛 驼鹿 野猪',
 hunter:'猫 狗 狐狸 熊 猫头鹰 老虎 狮子 狼 豹 北极熊 鹰 鳄鱼 獾 浣熊'};
const has=(name,tag)=>groups[tag].split(' ').includes(name);
const land=n=>!has(n,'marine')&&!has(n,'flight')&&!['水獭','青蛙','鳄鱼','海龟','河马','海狸'].includes(n);
// Explicit representative wild predator–prey links only. Common names may represent species groups.
const food={
 '狗':'考拉','猫':'老鼠 大鼠 麻雀 小鸡','狐狸':'兔子 老鼠 大鼠 松鼠 鸡','熊':'鹿','水獭':'螃蟹 虾 青蛙','青蛙':'蝴蝶 瓢虫','猫头鹰':'老鼠 大鼠 兔子 仓鼠','老虎':'鹿 野猪 水牛','狮子':'斑马','狼':'鹿 驼鹿 野牛 兔子','章鱼':'螃蟹 龙虾 虾','海豹':'鱿鱼 章鱼 企鹅','浣熊':'螃蟹 青蛙','獾':'老鼠 兔子','臭鼬':'老鼠','豹':'鹿 猴子 野猪 熊猫','北极熊':'海豹','海豚':'鱿鱼','虎鲸':'海豹 海豚 鲨鱼 鱿鱼 企鹅 水獭','鲨鱼':'海豹 鱿鱼','螃蟹':'虾','火烈鸟':'虾','鹰':'兔子 老鼠 鸭','野猪':'老鼠','变色龙':'蝴蝶','鳄鱼':'斑马 鹿 野猪','企鹅':'虾 鱿鱼'};
const eats=(a,b)=>(food[a]||'').split(' ').includes(b);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function shuffled(arr){arr=arr.slice();for(let i=arr.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
function newGame(pool,owned,advanced,chosen=[]){
 const legal=new Set(pool),own=[...new Set(owned)].filter(n=>legal.has(n));if(own.length<4)throw Error('需发现至少 4 种萌物');
 if(chosen.length>4||new Set(chosen).size!==chosen.length||chosen.some(n=>!own.includes(n)||!advanced.includes(n)))throw Error('手选卡必须是已进阶的不同萌物');
 const hands=[[...chosen,...shuffled(own.filter(n=>!chosen.includes(n)))].slice(0,4),shuffled(pool).slice(0,4)];
 const g={id:Date.now()+'-'+Math.random(),hands,spent:[null,null],played:[[],[]],score:[0,0],history:[],round:0,first:pick([0,1]),intel:[{},{}],bless:[{},{}],copiable:[],finished:false};
 begin(g);return g;
}
function begin(g){for(const seen of g.intel)for(const [j,v] of Object.entries(seen))if(v.until>0&&v.until<=g.round)delete seen[j];g.round++;g.lead=g.round===5?-1:(g.first+g.round-1)%2;g.actor=g.lead<0?0:g.lead;g.phase=g.lead<0?'duel':'lead';g.cards=[null,null];g.fx={};g.notes=[];g.draw=false;g.wins=[false,false];g.reviewed=[false,false];g.interrupt=null;if(g.round===5){g.played=[[],[]];g.cards[1]=pick([0,1,2,3])}clock(g)}
function clock(g){g.deadline=Date.now()+20000}
const available=(g,s)=>[0,1,2,3].filter(i=>!g.played[s].includes(i)&&!(g.fx.ban?.side===s&&g.fx.ban.slot===i));
const rest=(g,s)=>available(g,s).filter(i=>i!==g.cards[s]);
const nameAt=(g,s)=>g.hands[s][g.cards[s]];
function base(g,s){const a=nameAt(g,s),b=nameAt(g,1-s);return Number(eats(a,b))-Number(eats(b,a))}
function displayedLead(g,viewer){const s=g.lead;if(s<0||g.cards[s]===null)return '';if(viewer===s||g.fx.echo)return nameAt(g,s);if(g.fx.hide)return '暗牌';if(g.fx.mask)return g.fx.mask;if(g.fx.pair)return g.fx.pair.join(' 或 ');return nameAt(g,s)}
function afterCondition(n,g,s){
 const enemy=nameAt(g,1-s),own=base(g,s),lead=g.lead===s,reply=g.lead===1-s,last=g.history.at(-1),prev=last?.names[s],won=last?.winner===s;
 switch(n){
 case '熊猫':return own<0;case '企鹅':return lead&&own<0&&rest(g,s).length>0;case '鲸':return rest(g,s).length>0;
 case '虎鲸':return reply&&own===0&&g.history.some(h=>has(h.names[s],'marine'));
 case '熊':return reply&&own===0&&has(enemy,'mammal')&&land(enemy);case '水獭':return own<0&&!!prev&&(has(prev,'marine')||has(prev,'water'));case '考拉':return own<0&&land(enemy)&&!has(enemy,'climb');
 case '老虎':return reply&&own===0&&land(enemy)&&has(enemy,'herb')&&!has(enemy,'giant');case '狮子':return own===0&&won&&land(prev);
 case '章鱼':return reply&&own<0;case '海豹':return own<0&&land(enemy);case '鹿':return lead&&own<0&&land(enemy)&&has(enemy,'hunter');
 case '大象':return rest(g,s).some(i=>has(g.hands[s][i],'herb')&&land(g.hands[s][i]));case '犀牛':return lead&&own===0&&land(enemy)&&!has(enemy,'giant');
 case '袋鼠':return reply&&land(enemy);case '豹':return reply&&own===0&&has(enemy,'climb')&&!has(enemy,'giant');case '鲨鱼':return own===0&&won&&has(enemy,'marine');
 case '天鹅':return lead&&has(enemy,'bird');case '鹰':return reply&&own===0&&has(enemy,'bird')&&!['鹰','猫头鹰'].includes(enemy);
 case '驼鹿':return reply&&own<0&&land(enemy)&&has(enemy,'hunter');case '鳄鱼':return lead&&own===0&&land(enemy)&&has(enemy,'herb')&&!has(enemy,'giant');
 default:return true}
}
function options(g,s){
 if(g.finished||g.spent[s]||g.actor!==s||g.fx.seal===1-s)return [];
 if(g.interrupt){const i=g.hands[s].indexOf('树懒');return i>=0?[{i,k:'resist'}]:[]}
 const opts=[];
 for(const i of available(g,s)){
  const n=g.hands[s][i],k=byName[n]?.[2];if(!k)continue;
  const add=(target,mode)=>opts.push({i,k,...(target==null?{}:{target}),...(mode?{mode}:{})});
  if(g.phase==='lead'&&['seal','hide','mask','pair','ban','peek'].includes(k)){
   if(k==='mask'||k==='pair'){available(g,s).filter(j=>j!==i).forEach(j=>add(j))}
   else if(k==='ban'){const ids=available(g,1-s);if(ids.length>1)ids.forEach(j=>add(j))}
   else if(k==='peek')available(g,1-s).forEach(j=>add(j));else add();
  }else if(g.phase==='reply'&&k==='echo'&&(g.fx.hide||g.fx.mask||g.fx.pair))add();
  else if(g.phase==='show'&&g.cards[s]===i&&afterCondition(n,g,s)){
   if(['guard','win','draw'].includes(k))add();
   if(k==='swap'||k==='bless')rest(g,s).filter(j=>n!=='大象'||(has(g.hands[s][j],'herb')&&land(g.hands[s][j]))).forEach(j=>add(j));
   const rivals=rest(g,1-s);
   if(k==='track')rivals.forEach(j=>add(j));
   if(['scout','look','sonar'].includes(k)&&rivals.length)add();
   if(k==='copy'&&rivals.length)for(const mode of new Set(g.copiable)){if(['peek','track'].includes(mode))rivals.forEach(j=>add(j,mode));else add(null,mode)}
  }
 }
 return opts;
}
function reveal(g){g.phase='show';g.actor=g.lead<0?0:g.lead;clock(g)}
function play(g,s,i){if(g.actor!==s||g.interrupt||!['lead','reply','duel'].includes(g.phase)||!available(g,s).includes(i))return false;g.cards[s]=i;
 if(g.phase==='lead'){g.phase='reply';g.actor=1-s;clock(g)}else reveal(g);return true}
function settle(g){const a=base(g,0);let protect=g.draw;
 for(let s=0;s<2;s++){const b=g.bless[s][g.cards[s]];if(b&&base(g,s)<0&&(b==='鲸'||(land(nameAt(g,1-s))&&has(nameAt(g,1-s),'hunter'))))protect=true;delete g.bless[s][g.cards[s]]}
 const delta=protect?0:a!==0?a:Number(g.wins[0])-Number(g.wins[1]);const winner=delta>0?0:delta<0?1:-1;
 if(winner>=0)g.score[winner]++;
 g.history.push({round:g.round,names:[nameAt(g,0),nameAt(g,1)],base:a,winner,notes:g.notes.slice(),protect});
 for(let s=0;s<2;s++){g.played[s].push(g.cards[s]);delete g.intel[1-s][g.cards[s]]}
 g.phase='report';g.actor=-1;g.deadline=0;
 if(g.round===5||(g.round===4&&g.score[0]!==g.score[1])){g.finished=true;g.phase='end'}
}
function pass(g,s){if(s!==g.actor)return false;if(g.interrupt){finishScan(g,false);return true}
 if(g.phase!=='show')return false;g.reviewed[s]=true;if(g.reviewed[1-s])settle(g);else{g.actor=1-s;clock(g)}return true}
function finishScan(g,resisted){const q=g.interrupt;g.interrupt=null;g.actor=q.s;
 const shown=q.slots.filter(j=>!(resisted&&g.hands[1-q.s][j]==='树懒'));
 for(const j of shown){g.intel[q.s][j]={name:g.hands[1-q.s][j],status:q.mode==='peek'?(g.spent[1-q.s]?'技能机会已用':'技能机会尚在'):null,until:q.mode==='scout'?g.round:q.mode==='track'&&!q.copy?99:0}}
 if(shown.length)g.copiable.push(q.mode);g.notes.push('侦察揭示 '+shown.length+' 张牌'+(resisted?'，一张牌拒绝揭示':''));
 if(q.pre)play(g,q.s,q.i);else pass(g,q.s);
}
function activate(g,s,choice){
 const o=options(g,s).find(v=>v.i===choice.i&&v.k===choice.k&&v.target===choice.target&&v.mode===choice.mode);if(!o)return false;
 const n=g.hands[s][o.i],k=o.k;g.spent[s]={round:g.round,name:n,skill:byName[n][0]};g.notes.push((s?'系统':'玩家')+'发动「'+byName[n][0]+'」');
 if(k==='resist'){finishScan(g,true);return true}
 if(['scout','peek','track','look','sonar','copy'].includes(k)){const mode=o.mode||k,pre=g.phase==='lead',others=pre?available(g,1-s):rest(g,1-s);
  const slots=['peek','track'].includes(mode)?[o.target]:mode==='look'?shuffled(others).slice(0,2):mode==='sonar'?others.filter(j=>has(g.hands[1-s][j],'marine')):others;
  g.interrupt={s,i:o.i,mode,slots,pre,copy:k==='copy'};if(!g.spent[1-s]&&g.fx.seal!==s&&slots.some(j=>g.hands[1-s][j]==='树懒')){g.actor=1-s;clock(g)}else finishScan(g,false);return true;
 }
 if(k==='seal')g.fx.seal=s;if(k==='hide')g.fx.hide=true;if(k==='mask')g.fx.mask=g.hands[s][o.target];if(k==='pair')g.fx.pair=shuffled([n,g.hands[s][o.target]]);if(k==='ban')g.fx.ban={side:1-s,slot:o.target};if(k==='echo')g.fx.echo=true;
 if(g.phase!=='show'){play(g,s,o.i);return true}
 if(k==='swap'){g.cards[s]=o.target;g.notes.push('企鹅换为'+nameAt(g,s))}
 if(k==='bless')g.bless[s][o.target]=n;if(k==='win')g.wins[s]=true;if(k==='draw'||k==='guard')g.draw=true;pass(g,s);return true;
}
function advance(g){if(g.phase!=='report'||g.finished)return false;begin(g);return true}
function automatic(g,s,allowSkill=true){
 const opts=options(g,s);if(g.interrupt){if(allowSkill&&opts.length)activate(g,s,opts[0]);else pass(g,s);return}
 if(g.phase==='show'){if(allowSkill&&opts.length){const priority=opts.filter(v=>['win','guard','swap'].includes(v.k)||v.k==='draw'&&base(g,s)<0);if(priority.length)activate(g,s,pick(priority));else{const useful=opts.filter(v=>v.k!=='draw');if(useful.length&&(g.round>=3||Math.random()<.55))activate(g,s,pick(useful));else pass(g,s)}}else pass(g,s);return}
 if(allowSkill&&opts.length&&(g.round>=3||Math.random()<.38)){activate(g,s,pick(opts));return}
 const candidates=available(g,s),seen=g.phase==='reply'?displayedLead(g,s):'';
 const scores=candidates.map(i=>{
  const n=g.hands[s][i];let score=Math.random();
  if(seen&&!seen.includes(' 或 ')&&seen!=='暗牌'){
   score+=eats(n,seen)?4:eats(seen,n)?-4:0;
   if(!g.spent[s]&&byName[n]?.[2]==='win'&&!eats(n,seen)&&!eats(seen,n)){
    // Evaluate a hypothetical reveal using only the visible opponent identity.
    const model={...g,hands:g.hands.map(a=>a.slice()),cards:g.cards.slice()};
    model.cards[s]=i;model.hands[1-s][model.cards[1-s]]=seen;
    if(afterCondition(n,model,s))score+=3;
   }
  }
  return {i,score}
 });
 play(g,s,scores.sort((a,b)=>b.score-a.score)[0].i);
}
root.WDBattle={byName,newGame,available,rest,base,options,activate,pass,play,advance,automatic,displayedLead,shuffled,eats};
})(typeof window==='undefined'?globalThis:window);
