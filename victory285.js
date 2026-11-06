/* Victory receipts and card grants share one atomic collection write. */
(()=>{'use strict';
const W=window.WILDWORDS,key='wordday_wildwords_25';
function read(){const raw=JSON.parse(localStorage.getItem(key)||'null')||JSON.parse(JSON.stringify(W.data));raw.battleRewards285??={wins:0,credited:{},queue:[],claimed:{}};return raw}
function write(raw){localStorage.setItem(key,JSON.stringify(raw));Object.assign(W.data,raw);document.dispatchEvent(new Event('wd285rewards'))}
const locked=fn=>navigator.locks?navigator.locks.request('wd28-reward',fn):Promise.resolve().then(fn);
function view(){const r=read().battleRewards285;return{wins:r.wins,progress:r.wins%3,pending:r.queue.length,ticket:r.queue[0]||null}}
function credit(g){return locked(()=>{
 if(!g?.finished||!g.rewardEligible285||g.score[0]<=g.score[1])return false;
 const raw=read(),r=raw.battleRewards285;if(Object.hasOwn(r.credited,g.id))return false;
 const enemies=g.hands[1].map(n=>W.animals.find(a=>a.cn===n)?.id);if(enemies.length!==4||enemies.some(id=>id==null))throw Error('对手卡牌记录不完整');
 r.credited[g.id]=true;r.wins++;
 if(r.wins%3===0)r.queue.push({id:g.id,enemies,earnedAt:new Date().toISOString(),winNumber:r.wins});
 write(raw);return true;
})}
function claim(id){return locked(()=>{
 const raw=read(),r=raw.battleRewards285;if(Object.hasOwn(r.claimed,id))return{already:true};
 const index=r.queue.findIndex(t=>t.id===id);if(index<0)return null;
 const ticket=r.queue[index],a=W.animals.find(a=>a.id===ticket.enemies[Math.floor(Math.random()*ticket.enemies.length)]);if(!a)throw Error('卡牌不存在');
 raw.discovered??={};raw.inventory??={};raw.discovered[a.id]=true;raw.inventory[a.id]=Number(raw.inventory[a.id]||0)+1;
 r.claimed[id]=a.id;r.queue.splice(index,1);write(raw);document.dispatchEvent(new Event('wd28badges'));
 return{animal:a,ticket};
})}
window.WD285Rewards={view,credit,claim};
})();
