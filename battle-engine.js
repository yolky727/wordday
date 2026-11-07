/* Serializable battle rules. Indices address the four original slots throughout a match. */
(function(root){
'use strict';
const byName={
"熊猫":["竹林停战", "本回合判平，双方出战牌回手。", "truce"],
"企鹅":["冰面滑行", "换一张未出战的己方手牌应战，企鹅留在手中。", "swap"],
"浣熊":["偷换顺序", "己方先出牌时，把先手交给对方，之后再选择己方出战牌。", "turn"],
"北极熊":["极地压制", "封锁对方本回合尚未发动的技能。", "seal"],
"鲸":["深海庇护", "本回合落败改平，并庇护一张剩余己方牌，使它下次出战落败也改平。", "bless"],
"虎鲸":["深海豪赌", "普通回合出牌时宣布双倍计分，胜方得两分，平局不得分。", "double"],
"火烈鸟":["群舞佯攻", "先手盖牌，等对方锁定出牌后才揭晓。", "hide"],
"孔雀":["开屏邀战", "先手封住对方剩余牌中稀有度最高的一张，并列随机，至少留一张可出。", "ban"],
"变色龙":["拟态伪装", "借用一张未出战队友牌的身份和基础对位。消耗变色龙，队友牌留手，其技能不触发。", "mimic"],
"熊":["守林反击", "基础对位获胜时，抵消对方的结果提升。", "bear"],
"水獭":["结伴漂流", "亮牌后若本回合会输，改判平局，并让对方在下一普通回合先出牌。", "otter"],
"考拉":["树冠避战", "落败时对方照常得分，考拉回手，对方出战牌照常消耗。", "koala"],
"猫头鹰":["夜视侦察", "先手查看一张对方未出战手牌，身份持续可见直到它出战。", "peek"],
"老虎":["伏击", "后手出战时，基础平局变胜利。", "tiger"],
"狮子":["狮群接力", "本回合获胜后，下一回合己方若打平，改为胜利。", "lion"],
"狼":["追踪猎物", "下一普通回合由对方先出牌。", "wolf"],
"章鱼":["墨幕", "亮牌后抵消对方本回合已发动的结果提升，对方技能机会仍已用。", "octopus"],
"海豹":["破冰换气", "本回合基础平局若被技能改成失败，恢复为平局。", "sealion"],
"鹿":["警觉疾奔", "对方能捕食鹿时，本回合若落败，改为平局。", "deer"],
"大象":["象群守护", "本回合落败改平，并庇护一张剩余己方牌，使它下次出战落败也改平。", "bless"],
"长颈鹿":["高处瞭望", "对方盖牌时先看清暗牌，再决定己方打哪张。", "giraffe"],
"斑马":["条纹迷阵", "本回合跳过特殊克制，按常规对位结算。", "zebra"],
"犀牛":["迎面冲锋", "抵消对方本回合的落败改平保护，直接判平仍生效。", "rhino"],
"袋鼠":["疾跃回避", "亮牌后可直接判平，双方出战牌照常消耗。", "draw"],
"树懒":["静止伪装", "亮牌后若基础对位会输，可直接判平并让树懒回手。", "sloth"],
"蝙蝠":["回声定位", "对方亮牌后换牌时，按换牌前的对手身份结算，对方消耗实际换上的牌。", "bat"],
"豹":["树上突袭", "对阵能攀爬的对手时，取消其本回合获得的队友庇护。", "leopard"],
"海豚":["声呐定位", "决胜局先选海豚，亮牌后可用海豚应战或换另一张己方牌。", "dolphin"],
"鲨鱼":["循迹追击", "对阵海洋动物时，基础平局变胜利。", "shark"],
"天鹅":["护巢", "选一张剩余队友牌。它下次出战若为基础平局，可抵消对方的结果提升。", "swan"],
"鹦鹉":["学舌", "亮牌后借用对方最终出战身份，本回合直接判平，消耗鹦鹉。", "mirror"],
"鹰":["高空俯冲", "对阵非猛禽鸟类时，抵消对方的落败改平保护。", "eagle"],
"驼鹿":["鹿角架势", "若因对方的特殊克制而落败，改为平局。", "moose"],
"鳄鱼":["水边伏击", "先手且基础对位会赢时，抵消对方的落败改平保护。", "croc"]
};
const groups={
 marine:'企鹅 章鱼 海豹 鲸 虎鲸 鲨鱼 水母 螃蟹 龙虾 虾 鱿鱼 河豚 海豚 小丑鱼',
 water:'水獭 青蛙 河马 海狸 鳄鱼 乌龟 天鹅 鸭子 鹅 火烈鸟',
 bird:'企鹅 鸭子 鸡 小鸡 火烈鸟 天鹅 鹅 孔雀 鹦鹉 鹰 猫头鹰',
 flight:'猫头鹰 蝙蝠 鹰 鸭子 火烈鸟 天鹅 鹅 孔雀 鹦鹉 蝴蝶 蜜蜂',
 herb:'兔子 熊猫 考拉 奶牛 鹿 绵羊 山羊 马 大象 长颈鹿 斑马 犀牛 袋鼠 树懒 海狸 羊驼 骆驼 野牛 水牛 驼鹿 河马',
 giant:'大象 犀牛 河马 长颈鹿 鲸',
 climb:'猫 熊 熊猫 浣熊 狐狸 考拉 猴子 树懒 豹 松鼠 变色龙',
 mammal:'猫 狗 兔子 狐狸 熊 熊猫 仓鼠 考拉 老虎 狮子 奶牛 猪 猴子 狼 刺猬 鹿 松鼠 马 绵羊 山羊 大象 长颈鹿 斑马 河马 犀牛 袋鼠 树懒 海狸 獾 臭鼬 老鼠 大鼠 豹 北极熊 羊驼 骆驼 野牛 水牛 驼鹿 野猪',
 hunter:'猫 狗 狐狸 熊 猫头鹰 老虎 狮子 狼 豹 北极熊 鹰 鳄鱼 獾 浣熊'};
const has=(name,tag)=>groups[tag].split(' ').includes(name);
const land=n=>!has(n,'marine')&&!has(n,'flight')&&!['水獭','青蛙','鳄鱼','乌龟','河马','海狸'].includes(n);
// Explicit representative wild predator–prey links only. Common names may represent species groups.
const food={
 '狗':'考拉','猫':'老鼠 大鼠 麻雀 小鸡','狐狸':'兔子 老鼠 大鼠 松鼠 鸡','熊':'鹿','水獭':'螃蟹 虾 青蛙','青蛙':'蝴蝶 瓢虫','猫头鹰':'老鼠 大鼠 兔子 仓鼠','老虎':'鹿 野猪 水牛','狮子':'斑马','狼':'鹿 驼鹿 野牛 兔子','章鱼':'螃蟹 龙虾 虾','海豹':'鱿鱼 章鱼 企鹅','浣熊':'螃蟹 青蛙','獾':'老鼠 兔子','臭鼬':'老鼠','豹':'鹿 猴子 野猪 熊猫','北极熊':'海豹','海豚':'鱿鱼','虎鲸':'海豹 海豚 鲨鱼 鱿鱼 企鹅 水獭','鲨鱼':'海豹 鱿鱼','螃蟹':'虾','火烈鸟':'虾','鹰':'兔子 老鼠 鸭子','野猪':'老鼠','变色龙':'蝴蝶','鳄鱼':'斑马 鹿 野猪','企鹅':'虾 鱿鱼'};
const eats=(a,b)=>(food[a]||'').split(' ').includes(b);
// Explicit user decisions take precedence over editorial comprehensive ratings.
const matchup=(a,b)=>root.WDBattleRules.match(a,b);
const style=()=>'';
const pick=a=>a[Math.floor(Math.random()*a.length)];
function shuffled(arr){arr=arr.slice();for(let i=arr.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
function newGame(pool,owned,advanced,chosen=[],rarity={}){
 const legal=new Set(pool),own=[...new Set(owned)].filter(n=>legal.has(n));
 if(own.length<4)throw Error('需发现至少 4 种萌物');
 if(chosen.length>4||new Set(chosen).size!==chosen.length||chosen.some(n=>!own.includes(n)||!advanced.includes(n)))throw Error('手选卡必须是已进阶的不同萌物');
 const hands=[[...chosen,...shuffled(own.filter(n=>!chosen.includes(n)))].slice(0,4),shuffled(pool).slice(0,4)];
 const g={rulesVersion:'2.9',id:Date.now()+'-'+Math.random(),hands,rarity,spent:[null,null],played:[[],[]],score:[0,0],history:[],round:0,first:pick([0,1]),intel:[{},{}],bless:[{},{}],finished:false};
 begin(g);return g;
}
function begin(g){
 for(const seen of g.intel)for(const [i,v] of Object.entries(seen))if(v.until>0&&v.until<=g.round)delete seen[i];
 g.round++;
 g.lead=g.round===5?-1:g.nextLead??(g.first+g.round-1)%2;
 delete g.nextLead;
 g.actor=g.lead<0?0:g.lead;
 g.phase=g.lead<0?'duel':'lead';
 g.cards=[null,null];g.fx={};g.notes=[];g.draw=false;g.wins=[false,false];g.reviewed=[false,false];g.interrupt=null;
 if(g.round===5){g.played=[[],[]];g.cards[1]=pick([0,1,2,3])}
 clock(g);
}
function clock(g){g.deadline=Date.now()+20000}
const available=(g,s)=>[0,1,2,3].filter(i=>!g.played[s].includes(i)&&!(g.fx.ban?.side===s&&g.fx.ban.slot===i));
const rest=(g,s)=>available(g,s).filter(i=>i!==g.cards[s]);
const slotName=(g,s)=>g.hands[s][g.cards[s]];
function nameAt(g,s){
 const names=[0,1].map(i=>g.fx.mimic?.[i]??slotName(g,i));
 if(g.fx.bat===s)return names[s];
 if(g.fx.bat===1-s)return g.fx.swapped?.[s]??names[s];
 return g.fx.mirror===s?names[1-s]:names[s];
}
function predicted(g){
 return root.WDBattleRules.match(nameAt(g,0),nameAt(g,1),{ignoreSpecial:g.fx.zebra===true});
}
function base(g,s){return predicted(g).delta*(s===0?1:-1)}
function displayedLead(g,viewer){
 const s=g.lead;
 if(s<0||g.cards[s]===null)return '';
 return viewer!==s&&g.fx.hide&&!g.fx.unhide?'暗牌':nameAt(g,s);
}
function boosts(g,pair){
 const values=[0,1].map(s=>{
  const own=pair.delta*(s===0?1:-1),kind=g.spent[s]?.round===g.round?g.spent[s].kind:null;
  return g.wins[s]||own===0&&(kind==='tiger'&&g.lead===1-s||kind==='shark'&&has(nameAt(g,1-s),'marine'));
 });
 for(let s=0;s<2;s++){
  const kind=g.spent[s]?.round===g.round?g.spent[s].kind:null;
  if(g.fx.cancelBoost===s||kind==='bear'&&pair.delta*(s===0?1:-1)>0||pair.delta===0&&g.bless[s][g.cards[s]]==='护巢')values[1-s]=false;
 }
 return values;
}
function resolve(g){
 const pair=predicted(g),up=boosts(g,pair);
 let delta=Math.max(-1,Math.min(1,pair.delta+Number(up[0])-Number(up[1])));
 
 const protection=[false,false],retained=[false,false];
 for(let s=0;s<2;s++){
  const own=delta*(s===0?1:-1);
  const kind=g.spent[s]?.round===g.round?g.spent[s].kind:null;
  const enemyKind=g.spent[1-s]?.round===g.round?g.spent[1-s].kind:null;
  const enemy=nameAt(g,1-s),baseOwn=pair.delta*(s===0?1:-1);
  const ward=g.bless[s][g.cards[s]];
  const wardWorks=ward&&ward!=='护巢'&&!(enemyKind==='leopard'&&has(nameAt(g,s),'climb'));
  const pierced=enemyKind==='rhino'||enemyKind==='eagle'&&has(nameAt(g,s),'bird')&&!['鹰','猫头鹰'].includes(nameAt(g,s))||enemyKind==='croc'&&g.lead===1-s&&baseOwn<0;
  protection[s]=own<0&&!pierced&&Boolean(g.fx.guards?.[s]||wardWorks||kind==='sealion'&&baseOwn===0||kind==='deer'&&eats(enemy,'鹿')||kind==='moose'&&pair.kind==='特殊克制'||kind==='otter');
  retained[s]=kind==='sloth';
 }
 if(g.draw||protection.some(Boolean))delta=0;
 if(delta===0&&!g.draw&&g.lionCarry!=null)delta=g.lionCarry===0?1:-1;
 if(g.fx.truce)retained.fill(true);
 for(let s=0;s<2;s++)if(g.spent[s]?.round===g.round&&g.spent[s].kind==='koala'&&delta*(s===0?1:-1)<0)retained[s]=true;
 return {pair,delta,protection,retained};
}
function options(g,s){
 if(g.finished||g.spent[s]||g.actor!==s||g.fx.seal===1-s||!['lead','reply','duel','show'].includes(g.phase))return [];
 const results=[];
 const show=g.phase==='show',lead=g.phase==='lead',reply=g.phase==='reply';
 const enemy=show||reply&&(!g.fx.hide||g.fx.unhide)?nameAt(g,1-s):null;
 for(const i of available(g,s)){
  if(show&&g.cards[s]!==i)continue;
  const kind=byName[g.hands[s][i]]?.[2];
  if(!kind)continue;
  if(['turn','hide','ban','peek'].includes(kind)&&!lead)continue;
  if(kind==='giraffe'&&!(reply&&g.fx.hide&&!g.fx.unhide))continue;
  if(kind==='double'&&(!lead&&!reply||g.round===5))continue;
  if(kind==='wolf'&&g.round>=4)continue;
  if(kind==='lion'&&g.round>=5)continue;
  if(kind==='dolphin'&&!(show&&g.round===5))continue;
  if(['otter','sloth','draw','mirror','octopus','bat'].includes(kind)&&!show)continue;
  if(kind==='otter'&&resolve(g).delta*(s===0?1:-1)>=0)continue;
  if(kind==='sloth'&&base(g,s)>=0)continue;
  if(kind==='octopus'&&!boosts(g,predicted(g))[1-s])continue;
  if(kind==='bat'&&!g.fx.swapped?.[1-s])continue;
  if(kind==='tiger'&&g.lead!==1-s)continue;
  if(kind==='croc'&&g.lead!==s)continue;
  if(kind==='eagle'&&enemy&&(!has(enemy,'bird')||['鹰','猫头鹰'].includes(enemy)))continue;
  if(kind==='leopard'&&enemy&&!has(enemy,'climb'))continue;
  if(kind==='deer'&&enemy&&!eats(enemy,'鹿'))continue;
  if(kind==='shark'&&enemy&&!has(enemy,'marine'))continue;
  if(kind==='ban'&&available(g,1-s).length<2)continue;
  const add=(target)=>results.push(target===undefined?{i,k:kind}:{i,k:kind,target});
  if(kind==='peek'){available(g,1-s).forEach(add);continue}
  if(['swap','bless','mimic','swan','dolphin'].includes(kind)){
   const targets=available(g,s).filter(j=>j!==i);
   if(kind==='dolphin'||kind==='bless'&&!targets.length)targets.unshift(i);
   targets.forEach(add);
  }else add();
 }
 return results;
}
function reveal(g){
 g.phase='show';g.actor=g.lead<0?0:g.lead;
 // Let a possible swap or boost resolve before the corresponding reaction.
 for(const [reaction,sources] of [['蝙蝠',['企鹅','海豚']],['章鱼',['老虎','鲨鱼']]]){
  for(const s of [0,1])if(slotName(g,s)===reaction&&sources.includes(slotName(g,1-s))&&!g.spent[1-s])g.actor=1-s;
 }
 clock(g);
}
function play(g,s,i){
 if(g.actor!==s||g.interrupt||!['lead','reply','duel'].includes(g.phase)||!available(g,s).includes(i))return false;
 g.cards[s]=i;
 if(g.phase==='lead'){g.phase='reply';g.actor=1-s;clock(g)}else reveal(g);
 return true;
}
function settle(g){
 const r=resolve(g),winner=r.delta>0?0:r.delta<0?1:-1;
 const points=winner<0?0:g.fx.double?2:1;
 if(winner>=0)g.score[winner]+=points;
 const reason=g.draw||r.protection.some(Boolean)?'技能保护':r.delta!==r.pair.delta?'技能改判':r.pair.kind;
 const entries=[0,1].map(s=>g.spent[s]?.round===g.round?g.spent[s].kind:null);
 delete g.lionCarry;
 if(winner>=0&&entries[winner]==='lion')g.lionCarry=winner;
 for(let s=0;s<2;s++){
  if(r.protection[s]&&entries[s]==='otter'&&g.round<4)g.nextLead=1-s;
  if(!r.retained[s]){g.played[s].push(g.cards[s]);delete g.intel[1-s][g.cards[s]]}
  delete g.bless[s][g.cards[s]];
 }
 const savedBy=[0,1].filter(s=>winner<0&&r.pair.delta*(s===0?1:-1)<0&&(r.protection[s]||['truce','draw','sloth','mirror'].includes(entries[s])));
 g.history.push({savedBy,round:g.round,names:[nameAt(g,0),nameAt(g,1)],base:r.pair.delta,winner,points,reason,notes:g.notes.slice(),protect:g.draw||r.protection.some(Boolean)});
 g.phase='report';g.actor=-1;g.deadline=0;
 if(g.round===5||g.round===4&&g.score[0]!==g.score[1]){g.finished=true;g.phase='end'}
}
function pass(g,s){
 if(s!==g.actor||g.phase!=='show')return false;
 g.reviewed[s]=true;
 if(g.reviewed[1-s])settle(g);else{g.actor=1-s;clock(g)}
 return true;
}
function activate(g,s,choice){
 const o=options(g,s).find(v=>v.i===choice.i&&v.k===choice.k&&v.target===choice.target);
 if(!o)return false;
 const n=g.hands[s][o.i],k=o.k;
 g.spent[s]={round:g.round,name:n,skill:byName[n][0],kind:k};
 g.notes.push((s?'沃尔德':'玩家')+'发动「'+byName[n][0]+'」');
 if(k==='turn'){g.lead=1-s;g.actor=1-s;clock(g);return true}
 if(k==='giraffe'){g.fx.unhide=true;clock(g);return true}
 if(k==='peek')g.intel[s][o.target]={name:g.hands[1-s][o.target],until:0};
 if(k==='ban'){
  const ids=available(g,1-s),rank=i=>g.rarity?.[g.hands[1-s][i]]??0;
  const top=Math.max(...ids.map(rank));
  g.fx.ban={side:1-s,slot:pick(ids.filter(i=>rank(i)===top))};
 }
 if(k==='seal')g.fx.seal=s;
 if(k==='hide')g.fx.hide=true;
 if(k==='double')g.fx.double=true;
 if(k==='mimic'){g.fx.mimic??=[];g.fx.mimic[s]=g.hands[s][o.target]}
 if(k==='mirror')g.fx.mirror=s;
 if(k==='zebra')g.fx.zebra=true;
 if(k==='bat')g.fx.bat=s;
 if(k==='octopus')g.fx.cancelBoost=s;
 if(k==='wolf')g.nextLead=1-s;
 if(k==='bless'){g.fx.guards??=[false,false];g.fx.guards[s]=true}
 if((k==='bless'||k==='swan')&&o.target!==o.i)g.bless[s][o.target]=k==='swan'?'护巢':n;
 if(k==='truce')g.fx.truce=true;
 if(['truce','draw','sloth','mirror'].includes(k))g.draw=true;
 const slot=['swap','dolphin'].includes(k)?o.target:o.i;
 if(g.phase==='show'){
  if(slot!==o.i){g.fx.swapped??=[];g.fx.swapped[s]=nameAt(g,s)}
  g.cards[s]=slot;pass(g,s);
 }else play(g,s,slot);
 return true;
}
function advance(g){if(g.phase!=='report'||g.finished)return false;begin(g);return true}
function automatic(g,s,allowSkill=true){
 const opts=allowSkill?options(g,s):[];
 if(g.phase==='show'){
  const current=resolve(g).delta*(s===0?1:-1);
  if(opts.length){
   const choice=opts.map(o=>{
    const copy=JSON.parse(JSON.stringify(g));activate(copy,s,o);
    const after=(copy.phase==='show'?resolve(copy).delta:copy.history.at(-1).winner===s?1:copy.history.at(-1).winner<0?0:-1)*(copy.phase==='show'&&s===1?-1:1);
    return {o,score:after-current};
   }).sort((a,b)=>b.score-a.score)[0];
   if(choice.score>0||choice.score===0&&g.round>=3&&['koala','lion','swan','bless'].includes(choice.o.k))return activate(g,s,choice.o);
  }
  return pass(g,s);
 }
 const seen=g.phase==='reply'?displayedLead(g,s):'';
 const visible=seen&&seen!=='暗牌';
 const candidates=available(g,s);
 const score=n=>visible?4*matchup(n,seen).delta:0;
 const best=candidates.map(i=>({i,score:score(g.hands[s][i])+Math.random()})).sort((a,b)=>b.score-a.score)[0];
 const tactical=opts.filter(o=>['turn','hide','ban','peek','giraffe','seal','wolf','double','mimic'].includes(o.k));
 if(tactical.length&&Math.random()<.28){
  const o=pick(tactical);
  const n=g.hands[s][o.k==='mimic'?o.target:o.i];
  if(!visible||o.k==='giraffe'||score(n)>=score(g.hands[s][best.i]))return activate(g,s,o);
 }
 return play(g,s,best.i);
}
root.WDBattle={style,matchup,byName,newGame,available,rest,base,predicted,nameAt,options,activate,pass,play,advance,automatic,displayedLead,shuffled,eats};
})(typeof window==='undefined'?globalThis:window);
