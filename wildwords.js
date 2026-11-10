/* WORDDAY 2.5 · WILDWORDS: offline collectible system */
(()=>{'use strict';
const $=id=>document.getElementById(id);
// Fixed 2.6.4 rarity mapping; original animal IDs and saved collection keys are unchanged.
const WILD264_RARITY={0:0,1:0,2:0,3:1,4:2,5:3,6:3,7:2,8:0,9:0,10:2,11:2,12:2,13:2,14:0,15:0,16:1,17:2,19:0,20:0,21:0,22:2,23:2,24:0,25:1,26:3,27:0,28:0,29:0,30:0,31:0,32:1,33:2,34:2,35:2,36:1,37:2,38:2,39:2,40:1,41:1,42:1,43:2,44:0,45:1,51:2,56:3,59:2,60:3,61:3,62:2,63:1,67:1,68:0,69:1,70:0,71:1,72:1,77:3,78:2,79:0,80:3,81:2,86:2,95:1,97:1,98:1,99:1,100:2,104:1,110:3,113:2,116:0,18:2,120:2,121:2,122:1,123:0,124:0,125:0,126:1,127:0,128:2,129:2,130:1,131:3,132:2,133:4,134:4,135:4};
const animals=[
['Cat','猫','🐱'],['Dog','狗','🐶'],['Rabbit','兔子','🐰'],['Fox','狐狸','🦊'],['Bear','熊','🐻'],['Panda','熊猫','🐼'],['Penguin','企鹅','🐧'],['Otter','水獭','🦦'],['Hamster','仓鼠','🐹'],['Frog','青蛙','🐸'],['Koala','考拉','🐨'],['Owl','猫头鹰','🦉'],['Tiger','老虎','🐯'],['Lion','狮子','🦁'],['Cow','奶牛','🐮'],['Pig','猪','🐷'],['Monkey','猴子','🐵'],['Wolf','狼','🐺'],['Octopus','章鱼','🐙'],['Butterfly','蝴蝶','🦋'],['Bee','蜜蜂','🐝'],['Turtle','乌龟','🐢'],['Seal','海豹','🦭'],['Deer','鹿','🦌'],['Squirrel','松鼠','🐿️'],['Hedgehog','刺猬','🦔'],['Raccoon','浣熊','🦝'],['Duck','鸭子','🦆'],['Chicken','鸡','🐔'],['Chick','小鸡','🐤'],['Horse','马','🐴'],['Sheep','绵羊','🐑'],['Goat','山羊','🐐'],['Elephant','大象','🐘'],['Giraffe','长颈鹿','🦒'],['Zebra','斑马','🦓'],['Hippo','河马','🦛'],['Rhino','犀牛','🦏'],['Kangaroo','袋鼠','🦘'],['Sloth','树懒','🦥'],['Beaver','海狸','🦫'],['Badger','獾','🦡'],['Skunk','臭鼬','🦨'],['Bat','蝙蝠','🦇'],['Mouse','老鼠','🐭'],['Rat','大鼠','🐀'],['Guinea Pig','豚鼠','🐹'],['Ferret','雪貂','🦦'],['Mole','鼹鼠','🐾'],['Weasel','黄鼠狼','🐾'],['Lynx','猞猁','🐈'],['Leopard','豹','🐆'],['Cheetah','猎豹','🐆'],['Jaguar','美洲豹','🐆'],['Cougar','美洲狮','🐈'],['Red Panda','小熊猫','🦝'],['Polar Bear','北极熊','🐻‍❄️'],['Arctic Fox','北极狐','🦊'],['Walrus','海象','🦭'],['Dolphin','海豚','🐬'],['Whale','鲸','🐳'],['Orca','虎鲸','🐋'],['Shark','鲨鱼','🦈'],['Clownfish','小丑鱼','🐠'],['Goldfish','金鱼','🐟'],['Seahorse','海马','🐠'],['Starfish','海星','⭐'],['Jellyfish','水母','🪼'],['Crab','螃蟹','🦀'],['Lobster','龙虾','🦞'],['Shrimp','虾','🦐'],['Squid','鱿鱼','🦑'],['Pufferfish','河豚','🐡'],['Eel','鳗鱼','🐟'],['Stingray','黄貂鱼','🐟'],['Manta Ray','蝠鲼','🐟'],['Pelican','鹈鹕','🦤'],['Flamingo','火烈鸟','🦩'],['Swan','天鹅','🦢'],['Goose','鹅','🪿'],['Peacock','孔雀','🦚'],['Parrot','鹦鹉','🦜'],['Toucan','巨嘴鸟','🐦'],['Hummingbird','蜂鸟','🐦'],['Robin','知更鸟','🐦'],['Sparrow','麻雀','🐦'],['Eagle','鹰','🦅'],['Falcon','隼','🦅'],['Hawk','鹰隼','🦅'],['Woodpecker','啄木鸟','🐦'],['Kingfisher','翠鸟','🐦'],['Puffin','海鹦','🐧'],['Kiwi','几维鸟','🐦'],['Ostrich','鸵鸟','🐦'],['Emu','鸸鹋','🐦'],['Alpaca','羊驼','🦙'],['Llama','美洲驼','🦙'],['Camel','骆驼','🐪'],['Bison','野牛','🦬'],['Buffalo','水牛','🐃'],['Moose','驼鹿','🫎'],['Reindeer','驯鹿','🦌'],['Antelope','羚羊','🦌'],['Gazelle','瞪羚','🦌'],['Boar','野猪','🐗'],['Tapir','貘','🐾'],['Capybara','水豚','🐹'],['Armadillo','犰狳','🐾'],['Anteater','食蚁兽','🐾'],['Pangolin','穿山甲','🐾'],['Chameleon','变色龙','🦎'],['Gecko','壁虎','🦎'],['Iguana','鬣蜥','🦎'],['Crocodile','鳄鱼','🐊'],['Alligator','短吻鳄','🐊'],['Tortoise','陆龟','🐢'],['Ladybug','瓢虫','🐞'],['Dragonfly','蜻蜓','🪰'],['Firefly','萤火虫','✨'],['Moth','飞蛾','🦋'],
["Snake", "蛇", "🐍"],["Scorpion", "蝎子", "🦂"],["Spider", "蜘蛛", "🕷️"],["Snail", "蜗牛", "🐌"],["Ant", "蚂蚁", "🐜"],["Cricket", "蟋蟀", "🦗"],["Beetle", "甲虫", "🪲"],["Donkey", "驴", "🫏"],["Gorilla", "大猩猩", "🦍"],["Orangutan", "红毛猩猩", "🦧"],["Turkey", "火鸡", "🦃"],["Dodo", "渡渡鸟", "🦤"],["Dove", "鸽子", "🕊️"],["Dragon", "龙", "🐉"],["Phoenix", "凤凰", "🐦‍🔥"],["Unicorn", "独角兽", "🦄"]
].map((a,i)=>({id:i,name:a[0],cn:a[1],emoji:a[2],rarity:Object.prototype.hasOwnProperty.call(WILD264_RARITY,i)?WILD264_RARITY[i]:0}));
// 2.6.1: One recognizable, distinct animal emoji per active card.
// Legacy IDs are NEVER renumbered: old inventories and discoveries remain intact.
const originalAnimals=animals.slice();
const allowedNames=new Set(["Cat","Dog","Rabbit","Fox","Bear","Panda","Penguin","Otter","Hamster","Frog","Koala","Owl","Tiger","Lion","Cow","Pig","Monkey","Wolf","Octopus","Butterfly","Bee","Turtle","Seal","Deer","Squirrel","Hedgehog","Raccoon","Duck","Chicken","Chick","Horse","Sheep","Goat","Elephant","Giraffe","Zebra","Hippo","Rhino","Kangaroo","Sloth","Beaver","Badger","Skunk","Bat","Mouse","Rat","Leopard","Polar Bear","Dolphin","Whale","Orca","Shark","Clownfish","Jellyfish","Crab","Lobster","Shrimp","Squid","Pufferfish","Flamingo","Swan","Goose","Peacock","Parrot","Eagle","Alpaca","Camel","Bison","Buffalo","Moose","Boar","Chameleon","Crocodile","Ladybug"]);
for(const name of ["Snake", "Scorpion", "Spider", "Snail", "Ant", "Cricket", "Beetle", "Donkey", "Gorilla", "Orangutan", "Turkey", "Dodo", "Dove", "Unicorn", "Dragon", "Phoenix"])allowedNames.add(name);
const usedEmoji=new Set();
const activeAnimals=originalAnimals.filter(a=>{if(!allowedNames.has(a.name)||usedEmoji.has(a.emoji))return false;usedEmoji.add(a.emoji);return true});
animals.length=0;animals.push(...activeAnimals);
const exactEmoji=new Set(animals.map(a=>a.name));
function specimen(a){return `<span class="wild-emoji" aria-label="${esc(a.cn)}" role="img">${a.emoji}</span>`}
const activeById=new Map(animals.map(a=>[a.id,a]));
const tier=['COMMON','RARE','EPIC','MYTHIC','LUMINOUS'],tcn=['普通','稀有','史诗','奇珍','流光'];
const KEY='wordday_wildwords_25';let data;try{data=JSON.parse(localStorage.getItem(KEY)||'null')}catch{};if(!data||typeof data!=='object')data={};data.inventory=data.inventory||{};data.discovered=data.discovered||{};data.advanced=data.advanced||{};data.daily=data.daily||{};data.encounters=data.encounters||{};data.activeSeconds=Number(data.activeSeconds)||0;data.lastActivity=Date.now();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){console.warn('WILDWORDS 保存失败',e);notify('存储失败，请检查浏览器可用空间')}}
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function day(){const d=today();if(!data.daily[d])data.daily[d]={used:0,seen:false};return data.daily[d]}
const owned=id=>!!data.discovered[id];const qty=id=>Number(data.inventory[id]||0);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sample=rarity=>{const pool=animals.filter(x=>x.rarity===rarity);return pool[Math.floor(Math.random()*pool.length)]};
function randomCard(luminous=true){const r=Math.random()*100,shift=luminous?.7:0;return sample(r<65-shift?0:r<90-shift?1:r<98-shift?2:r<100-shift?3:4)}
function notify(msg){if(typeof toast==='function')toast(msg);else alert(msg)}
const overlay=document.createElement('div');overlay.id='wildOverlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','WILDWORDS 萌物卡牌');overlay.innerHTML='<div class="wild-dialog" id="wildBody"></div>';document.body.appendChild(overlay);
function close(){albumScroll={dialog:0,grid:0};overlay.classList.remove('show');overlay.querySelector('#wildBody').innerHTML='';updateBadges();updateAvatars()}
function view(html){overlay.querySelector('#wildBody').innerHTML=html;overlay.classList.add('show')}
function top(label,title){return `<div class="wild-top"><div><div class="wild-kicker">WILDWORDS / ${label}</div><div class="wild-title">${title}</div></div><button class="secondary" id="wildClose">关闭 ×</button></div>`}
function wireClose(){const b=$('wildClose');if(b)b.onclick=close}
const luminousArt={"Unicorn": ["<path stroke=\"#3ecaff\" d=\"M-7 53 Q12 16 61 -3 M52 137 Q91 127 108 93\"/><path stroke=\"#ff72d0\" d=\"M-6 43 Q24 18 75 -4 M39 140 Q85 118 105 105\"/>", "<path stroke=\"#3ecaff\" d=\"M-7 53 Q12 16 61 -3 M52 137 Q91 127 108 93\"/><path stroke=\"#ff72d0\" d=\"M-6 43 Q24 18 75 -4 M39 140 Q85 118 105 105\"/><path stroke=\"#a48bff\" d=\"M-8 65 Q16 28 43 22 M65 135 Q91 115 109 73\"/>"], "Dragon": ["<g class=\"dragon-strike\"><path class=\"dragon-bloom\" d=\"M69 -3 72 8 81 10 78 15 88 18 85 23 96 30 95 37 104 43 M81 10 87 5 95 7 101 1 M88 18 93 16 97 21 103 20 M96 30 90 32 93 40\"/><path class=\"dragon-core\" d=\"M69 -3 72 8 81 10 78 15 88 18 85 23 96 30 95 37 104 43 M81 10 87 5 95 7 101 1 M88 18 93 16 97 21 103 20 M96 30 90 32 93 40\"/></g><g class=\"dragon-strike\"><path class=\"dragon-bloom\" d=\"M-3 88 6 93 4 100 12 106 10 112 22 116 20 122 30 125 36 136 M12 106 19 102 26 105 29 110 M22 116 30 115 35 120 42 119 M4 100 -2 104\"/><path class=\"dragon-core\" d=\"M-3 88 6 93 4 100 12 106 10 112 22 116 20 122 30 125 36 136 M12 106 19 102 26 105 29 110 M22 116 30 115 35 120 42 119 M4 100 -2 104\"/></g>", "<g class=\"dragon-strike\"><path class=\"dragon-bloom\" d=\"M69 -3 72 8 81 10 78 15 88 18 85 23 96 30 95 37 104 43 M81 10 87 5 95 7 101 1 M88 18 93 16 97 21 103 20 M96 30 90 32 93 40\"/><path class=\"dragon-core\" d=\"M69 -3 72 8 81 10 78 15 88 18 85 23 96 30 95 37 104 43 M81 10 87 5 95 7 101 1 M88 18 93 16 97 21 103 20 M96 30 90 32 93 40\"/></g><g class=\"dragon-strike\"><path class=\"dragon-bloom\" d=\"M-3 88 6 93 4 100 12 106 10 112 22 116 20 122 30 125 36 136 M12 106 19 102 26 105 29 110 M22 116 30 115 35 120 42 119 M4 100 -2 104\"/><path class=\"dragon-core\" d=\"M-3 88 6 93 4 100 12 106 10 112 22 116 20 122 30 125 36 136 M12 106 19 102 26 105 29 110 M22 116 30 115 35 120 42 119 M4 100 -2 104\"/></g><g class=\"dragon-strike\"><path class=\"dragon-bloom\" d=\"M103 72 94 76 97 82 90 86 92 94 83 100 87 105 79 112 M90 86 83 86 78 93 M92 94 100 98\"/><path class=\"dragon-core\" d=\"M103 72 94 76 97 82 90 86 92 94 83 100 87 105 79 112 M90 86 83 86 78 93 M92 94 100 98\"/></g><g class=\"dragon-strike\"><path class=\"dragon-bloom\" d=\"M-3 29 5 25 4 20 12 17 10 12 19 9 22 -2 M12 17 19 19 24 15\"/><path class=\"dragon-core\" d=\"M-3 29 5 25 4 20 12 17 10 12 19 9 22 -2 M12 17 19 19 24 15\"/></g>"], "Phoenix": ["<path d=\"M0 134V94q12 12 10 24q8-4 5-13q13 10 11 23q12-3 17-14q5 11 1 20Z\"/><path d=\"M53 134q19-8 18-20q6 5 7 11q11-9 5-21q12 4 12 14q8-14 5-26v42Z\"/>", "<path d=\"M0 134V94q12 12 10 24q8-4 5-13q13 10 11 23q12-3 17-14q5 11 1 20Z\"/><path d=\"M53 134q19-8 18-20q6 5 7 11q11-9 5-21q12 4 12 14q8-14 5-26v42Z\"/><path d=\"M98 133q-16-18-4-42q-1 13 6 19q-2-13 0-22v45Z\"/>"]};
function luminousFX(a,advanced){
 const type={Unicorn:'aurora',Dragon:'lightning',Phoenix:'flames'}[a.name];
 const art=luminousArt[a.name][Number(advanced)];
 return '<svg class="luminous-fx '+type+'" viewBox="0 0 100 134" preserveAspectRatio="none" aria-hidden="true">'+art+'</svg>';
}
function card(a,small=false,advanced=false,cls=''){
 const classes=['wild-card',small?'small':'',advanced?'advanced':'',cls].filter(Boolean).join(' ');
 const count=a.rarity===4?(advanced?16:5):advanced?(a.rarity===3?16:a.rarity===2?10:a.rarity===1?4:0):0;
 const sparks=count?'<span class="wild-rarity-sparks" aria-hidden="true">'+Array.from({length:count},(_,i)=>'<i style="--spark-index:'+i+'"></i>').join('')+'</span>':'';
 const arc=advanced&&a.rarity===3?'<svg class="wild-prism-arc" aria-hidden="true" focusable="false" viewBox="0 0 160 210" preserveAspectRatio="none"><path class="wild-prism-blue" d="M58 214 Q140 192 163 126 Q146 192 58 214Z"/><path class="wild-prism-rose" d="M62 214 Q151 200 163 139 Q148 193 62 214Z"/><path class="wild-prism-core" d="M58 214 Q146 193 163 130 Q145 194 58 214Z"/></svg>':'';
 return `<div class="${classes}" data-rarity="${a.rarity}"${a.rarity===4?' data-luminous="'+a.name+'"':''}>${a.rarity===4?luminousFX(a,advanced):''}${arc}${arc.replace('wild-prism-arc','wild-prism-arc wild-prism-top')}${sparks}<span class="wild-tier">WILDWORDS · ${tier[a.rarity]}</span>${specimen(a)}<div><div class="wild-en">${esc(a.name)}</div><div class="wild-cn">${esc(a.cn)}</div></div><span class="wild-id">NO. ${String(a.id+1).padStart(3,'0')}</span></div>`;
}
function award(a,withSound=true){if(withSound)window.WD28CardFX?.sound('acquire');data.discovered[a.id]=true;data.inventory[a.id]=qty(a.id)+1;persist();updateAvatars();document.dispatchEvent(new Event('wd28badges'))}
let pending=null;
function reveal(a,source){pending={id:a.id,source};const first=!owned(a.id);view(top('DISCOVERY',first?'NEW DISCOVERY':'ANIMAL RECALL')+`<div class="wild-reveal">${first?card(a,false,false,`reveal-${a.rarity}`):card(a,false,false,`reveal-${a.rarity}`).replace(`<div class="wild-en">${esc(a.name)}</div>`,`<div class="wild-en">???</div>`)}</div>`+(first?`<p class="wild-muted" style="text-align:center">第一次遇见 ${esc(a.name)} · ${esc(a.cn)}，已加入收藏，并解锁对应头像。</p><div class="wild-actions"><button id="wildDone">收入图鉴 ✓</button></div>`:`<p class="wild-muted" style="text-align:center">你已经认识这位萌物伙伴。正确拼写英文才能获得重复卡，错误则本次获取失败。</p><div class="wild-form"><label for="wildAnswer">请输入 ${esc(a.cn)} 的英文名称</label><input id="wildAnswer" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="English name"><button id="wildCheck">确认拼写</button></div>`));wireClose();if(first){award(a,source!=='fusion');$('wildDone').onclick=()=>source==='daily'&&day().used<3?daily():close()}else{$('wildCheck').onclick=()=>check(a);$('wildAnswer').addEventListener('keydown',e=>{if(e.key==='Enter')check(a)});$('wildAnswer').focus()}}
function check(a){const v=$('wildAnswer').value.trim().toLowerCase().replace(/\s+/g,' ');const correct=v===a.name.toLowerCase();if(correct)award(a);view(top('ANIMAL RECALL',correct?'SPELLING COMPLETE':'TRY AGAIN NEXT TIME')+`<div class="wild-reveal">${card(a,false,false,correct?'reveal-'+a.rarity:'')}</div><p style="text-align:center">${correct?'拼写正确！已获得 1 张基础卡。库存 '+qty(a.id)+' 张。':'拼写错误，本次卡牌获取失败。'}</p><p class="wild-muted" style="text-align:center">正确拼写：<strong>${esc(a.name)}</strong> · ${esc(a.cn)}</p><div class="wild-actions"><button id="wildDone">继续学习</button></div>`);wireClose();$('wildDone').onclick=()=>pending?.source==='daily'&&day().used<3?daily():close()}
function daily(){const d=day();d.seen=true;persist();view(top('DAILY DISCOVERY','今天会遇见谁？')+`<p class="wild-muted">每天三次免费翻牌，重复萌物需要正确拼写才能领取。答错同样消耗次数。</p><div class="wild-three">${[0,1,2].map(i=>`<button class="wild-back" data-slot="${i}" ${i<d.used?'disabled':''}>${i<d.used?'今日已翻':'CARD 0'+(i+1)}</button>`).join('')}</div><p class="wild-progress">今日剩余 ${3-d.used} / 3 次</p><div class="wild-actions"><button class="secondary" id="wildLater">稍后翻牌</button><button id="wildAlbum">查看萌物图鉴</button></div>`);wireClose();$('wildLater').onclick=close;$('wildAlbum').onclick=album;document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{if(day().used>=3)return;day().used++;persist();reveal(randomCard(true),'daily')})}
let albumScroll={dialog:0,grid:0};
function album(){document.dispatchEvent(new Event('wd28badges'));const found=animals.filter(a=>owned(a.id)).length;view(top('COLLECTION','萌物收藏图鉴')+`<p class="wild-muted">已发现 ${found} / ${animals.length} 种萌物 · ${Object.values(data.advanced).filter(Boolean).length} 种进阶卡面</p><div class="wild-actions"><button id="wildDaily">每日翻牌（剩余 ${3-day().used}）</button><button class="secondary" id="wildFusion">合成与融合</button></div><div class="wild-grid" style="margin-top:16px">${[...animals].sort((a,b)=>b.rarity-a.rarity||a.id-b.id).map(a=>`<div class="wild-grid-item">${owned(a.id)?`<button type="button" class="wild-inspect-trigger" data-inspect="${a.id}" aria-label="查看 ${esc(a.name)} 卡牌正反面">${card(a,true,!!data.advanced[a.id],'owned')}<span class="wild-inspect-hint">↻ 360°</span></button>`:`<div class="wild-card small" data-rarity="${a.rarity}"><span class="wild-tier">${tier[a.rarity]}</span><span class="wild-emoji">?</span><span class="wild-en">尚未发现</span><span class="wild-id">NO. ${String(a.id+1).padStart(3,'0')}</span></div>`}<div class="wild-note">${owned(a.id)?`基础卡 ${qty(a.id)} 张${data.advanced[a.id]?' · 已进阶':''}`:'待发现'}</div></div>`).join('')}</div>`);wireClose();$('wildDaily').onclick=daily;$('wildFusion').onclick=fusion;const dlg=$('wildBody'),grid=dlg.querySelector('.wild-grid');dlg.scrollTop=albumScroll.dialog;if(grid)grid.scrollTop=albumScroll.grid;document.querySelectorAll('[data-inspect]').forEach(b=>b.onclick=()=>{albumScroll={dialog:dlg.scrollTop,grid:grid?.scrollTop||0};inspectCard(activeById.get(Number(b.dataset.inspect)))})}
const luminousSeals={
 Unicorn:'<path d="M25 3l4.5 14 14 5-14 5L25 43l-5-16-14-5 14-5z"/><path d="M11 5v8M7 9h8m24 23v8m-4-4h8"/>',
 Dragon:'<path d="M29 3 12 25h12l-4 20 20-26H27z"/><path d="m6 14 5-4-1-5m32 27-4 5 2 5"/>',
 Phoenix:'<path d="M26 4c4 12-4 14-1 23 4-1 7-5 7-10 9 8 12 15 7 23-5 8-20 10-27 1-6-8-2-18 6-26-1 8 1 10 4 12 0-9 1-16 4-23z"/><path d="M25 45c-6-3-7-8-1-14 1 5 6 6 6 10 0 2-2 4-5 4z"/>'
};
function backFace(a){const symbols=['✿','◇','✧','✦','✷'];return `<div class="wild-card wild-card-back ${data.advanced[a.id]?'advanced':''}" data-rarity="${a.rarity}"${a.rarity===4?' data-luminous="'+a.name+'"':''}>${a.rarity===4?luminousFX(a,!!data.advanced[a.id]):''}<div class="wild-back-top">WILDWORDS <span>·</span> ${tier[a.rarity]}</div><div class="wild-back-art" aria-hidden="true"><div class="wild-back-orbit"></div><div class="wild-back-symbol">${a.rarity===4?'<svg class="luminous-seal" viewBox="0 0 50 50">'+luminousSeals[a.name]+'</svg>':symbols[a.rarity]}</div><div class="wild-back-ring"></div></div><div class="wild-back-name">${a.rarity===4?esc(a.name):'THE LITTLE WONDERS'}</div><div class="wild-back-bottom"><span>NO. ${String(a.id+1).padStart(3,'0')}</span></div></div>`}
function inspectCard(a){
 if(!a||!owned(a.id))return;
 const advanced=!!data.advanced[a.id];
 view(top('CARD VIEW / 360°',esc(a.name))+
 `<div class="wild-inspect-copy">拖动旋转 · 轻点翻面</div><div class="wild-inspect-stage"><div class="wild-inspect-rotor" id="wildRotor"><div class="wild-inspect-face wild-inspect-front">${card(a,false,advanced,'')}</div><div class="wild-inspect-face wild-inspect-rear">${backFace(a)}</div></div></div><div class="wild-inspect-controls"><button class="secondary" id="wildFlipView" aria-label="翻转卡牌">↻ 翻面</button><button class="secondary" id="wildResetView" aria-label="重置角度">◎ 复位</button><button class="secondary" id="wildReturnAlbum">← 图鉴</button></div>`);
 const copies=document.createElement('p');
 copies.className='wild-inspect-foot';copies.textContent='基础卡 '+qty(a.id)+' 张'+(advanced?' · 已进阶':'');
 $('wildBody').append(copies);
 const passive=window.WDBattle?.passives[a.cn],skillInfo=window.WDBattle?.byName[a.cn];
 if(passive||skillInfo){
  const details=document.createElement('details');
  details.className='wild-card-abilities';details.innerHTML='<summary>能力</summary>';
  for(const line of [passive,skillInfo&&skillInfo[0]+' · '+skillInfo[1]].filter(Boolean)){
   const p=document.createElement('p');p.textContent=line;details.append(p);
  }
  $('wildBody').append(details);
 }
 wireClose();$('wildClose').onclick=album;
 const stage=document.querySelector('.wild-inspect-stage'),rotor=$('wildRotor');let y=0,x=-7,drag=false,startX=0,startY=0,oldY=0,oldX=0,moved=false;
 function paint(){
  rotor.style.transform=`rotateX(${x}deg) rotateY(${y}deg)`;
 }
 function begin(e){if(drag||e.button!==0)return;drag=true;moved=false;startX=e.clientX;startY=e.clientY;oldY=y;oldX=x;stage.setPointerCapture?.(e.pointerId);rotor.classList.add('dragging')}
 function move(e){if(!drag)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;y=oldY+dx*.75;x=Math.max(-35,Math.min(35,oldX-dy*.35));paint()}
 function end(e){if(!drag)return;drag=false;rotor.classList.remove('dragging');if(!moved){y+=180;paint()}}
 stage.addEventListener('pointerdown',begin);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',end);const cancel=()=>{drag=false;rotor.classList.remove('dragging')};stage.addEventListener('pointercancel',cancel);stage.addEventListener('lostpointercapture',cancel);
 $('wildFlipView').onclick=()=>{y+=180;paint()};$('wildResetView').onclick=()=>{y=0;x=-7;paint()};$('wildReturnAlbum').onclick=album;paint();
}
function spareCards(id,inventory=data.inventory,advanced=data.advanced){
 return Math.max(0,Number(inventory[id]||0)-(advanced[id]?0:1));
}
function fusion(){
 let mode='advance',selected=[],rarity=0;
 const costs=[8,6,5,15];
 function usable(a){return mode==='advance'?qty(a.id)>=3&&!data.advanced[a.id]:a.rarity===rarity&&spareCards(a.id)>0}
 function render(){
 const pool=animals.filter(usable),required=mode==='advance'?1:costs[rarity];
 selected=selected.filter(id=>pool.some(a=>a.id===id));
 const count=mode==='advance'?(selected.length?3:0):selected.reduce((n,id)=>n+1,0);
 const available=mode==='advance'?pool.length:pool.reduce((n,a)=>n+spareCards(a.id),0);
 view(top('CARD ATELIER','萌物工坊')+`<div class="wild-atelier-tabs"><button id="waAdvance" class="${mode==='advance'?'on':''}">✧ 进阶</button><button id="waFusion" class="${mode==='fusion'?'on':''}">◇ 融合</button></div><p class="wild-muted">${mode==='advance'?'选择一张可进阶的萌物卡':'选择重复卡牌，点选卡面即可加入融合'}</p>${mode==='fusion'?`<div class="wild-atelier-tiers">${[0,1,2,3].map(r=>`<button data-r="${r}" class="${rarity===r?'on':''}">${r===3?tcn[r]:tcn[r]+' → '+tcn[r+1]}</button>`).join('')}</div>`:''}<div class="wild-atelier-progress"><strong>${count} / ${mode==='advance'?3:required}</strong><span>${mode==='advance'?'张同款基础卡':'张重复卡'} · ${available?'点击卡牌选择':'继续收藏即可解锁'}</span></div><div class="wild-atelier-grid">${pool.map(a=>`<button class="wild-atelier-pick ${selected.includes(a.id)?'picked':''}" data-pick="${a.id}" aria-pressed="${selected.includes(a.id)}">${card(a,true,false,'')}<small>${esc(a.cn)} · ${mode==='fusion'?'可用 '+spareCards(a.id)+' 张'+(data.advanced[a.id]?' · <span class="ex-advanced">已进阶</span>':''):qty(a.id)+' 张'} ${selected.includes(a.id)?'✓ '+selected.filter(id=>id===a.id).length:''}</small></button>`).join('')||'<p class="wild-muted">还没有可使用的萌物卡，继续探索吧。</p>'}</div><button id="waGo" ${mode==='advance'?(!selected.length?'disabled':''):count!==required?'disabled':''}>${mode==='advance'?'开启进阶':'开始融合'} ✦</button><div class="wild-actions"><button id="waBack" class="secondary">返回图鉴</button></div>`);
 wireClose();$('waBack').onclick=album;
 $('waAdvance').onclick=()=>{mode='advance';selected=[];render()};$('waFusion').onclick=()=>{mode='fusion';selected=[];render()};
 document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{rarity=+b.dataset.r;selected=[];render()});
 document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
  const id=+b.dataset.pick;
  if(mode==='advance'){selected=[id];render();return}
  const at=selected.indexOf(id);
  if(selected.length<required&&selected.filter(x=>x===id).length<spareCards(id))selected.push(id);
  else if(at>=0)selected.splice(at,1);
  const dialog=overlay.querySelector('.wild-dialog'), grid=b.closest('.wild-atelier-grid');
  const dialogTop=dialog.scrollTop, gridTop=grid.scrollTop, overlayTop=overlay.scrollTop;
  const hadFocus=document.activeElement===b;
  render();
  if(hadFocus)overlay.querySelector('[data-pick="'+id+'"]')?.focus({preventScroll:true});
  overlay.querySelector('.wild-atelier-grid').scrollTop=gridTop;
  dialog.scrollTop=dialogTop;
  overlay.scrollTop=overlayTop;
 });
 $('waGo').onclick=async()=>{const go=$('waGo');
 if(go.dataset.armed!=='1'){go.dataset.armed='1';go.textContent=mode==='advance'?'确认进阶 · 消耗三张基础卡':'确认融合 · 消耗 '+required+' 张重复卡';return}
 go.disabled=true;window.WD28CardFX?.prepare();if(mode==='advance'){
 const a=activeById.get(selected[0]);if(!a||qty(a.id)<3||data.advanced[a.id])return;

 data.inventory[a.id]-=3;data.advanced[a.id]=true;persist();document.dispatchEvent(new Event('wd28badges'));view(top('ADVANCED','进阶成功')+`<div class="wild-reveal">${card(a,false,true,'reveal-'+a.rarity)}</div><button id="waDone">返回图鉴</button>`);window.WD28CardFX?.success('advance');wireClose();$('waDone').onclick=album;
 }else{
 if(selected.length!==required)return;const counts={};selected.forEach(id=>counts[id]=(counts[id]||0)+1);if(Object.entries(counts).some(([id,n])=>spareCards(id)<n))return;

 if(rarity===3){
  const grant=()=>{
   const raw=JSON.parse(localStorage.getItem(KEY)||'null')||JSON.parse(JSON.stringify(data));
   if(Object.entries(counts).some(([id,n])=>spareCards(id,raw.inventory,raw.advanced||{})<n))return null;
   const a=sample(4);
   for(const [id,n] of Object.entries(counts))raw.inventory[id]-=n;
   raw.inventory[a.id]=Number(raw.inventory[a.id]||0)+1;raw.discovered[a.id]=true;
   localStorage.setItem(KEY,JSON.stringify(raw));Object.assign(data,raw);
   return a;
  };
  try{
   const a=navigator.locks?await navigator.locks.request('wd28-reward',grant):grant();
   if(!a){notify('重复卡库存不足');render();return}
   updateAvatars();document.dispatchEvent(new Event('wd28badges'));
   view(top('LUMINOUS','获得卡牌')+`<div class="wild-reveal">${card(a)}</div><button id="waDone">返回图鉴</button>`);wireClose();$('waDone').onclick=album;
  }catch{notify('融合未保存，请重试');render();return}
 }else{
  for(const [id,n] of Object.entries(counts))data.inventory[id]-=n;
  persist();reveal(sample(rarity+1),'fusion');
 }
 window.WD28CardFX?.success('fusion');
 }};
 }
 render();
}
function updateAvatars(){const el=$('avatarChoices');if(!el)return;el.querySelectorAll('[data-avatar]').forEach(b=>{const matches=animals.filter(a=>exactEmoji.has(a.name)&&a.emoji===b.dataset.avatar);if(matches.length!==1)return;const allowed=owned(matches[0].id);b.classList.toggle('wild-locked',!allowed);b.setAttribute('aria-label',allowed?`已解锁头像 ${b.dataset.avatar}`:`未解锁头像 ${b.dataset.avatar}，先收集对应萌物卡`);b.title=allowed?'已解锁':'获得对应萌物卡后解锁'});if(!el.dataset.wildProtected){el.dataset.wildProtected='1';el.addEventListener('click',ev=>{const b=ev.target.closest('[data-avatar]');if(b?.classList.contains('wild-locked')){ev.preventDefault();ev.stopImmediatePropagation();notify('先获得对应萌物卡牌才能解锁头像')}},true)}}
function updateBadges(){
 const active=Object.values(data.encounters).some(v=>v?.status==='ready');
 const paw=$('wildPawDraw');
 if(paw)paw.hidden=!active;
 const shortcut=$('wildOpenEncounter');
 if(shortcut)shortcut.style.display=active?'inline-block':'none';
}
function encounter(){const keys=Object.keys(data.encounters).filter(k=>data.encounters[k]?.status==='ready');if(!keys.length){notify('继续学习，下一位萌物伙伴可能很快出现');return}const k=keys[0];data.encounters[k].status='claimed';persist();updateBadges();reveal(randomCard(),'encounter')}
function install(){document.querySelector('.brand small')?.replaceChildren(document.createTextNode('2.6.1 · WILDWORDS'));const footer=$('wd24Version');if(footer)footer.textContent='WORDDAY 2.6.1 · WILDWORDS Edition';const splashFoot=document.querySelector('.wd-splash-foot');if(splashFoot)splashFoot.textContent='WILDWORDS · 2.9.9.1';const home=$('wildIdeasHome');if(home){home.innerHTML=`<section class="panel" id="wildInline"><div class="panel-head"><h2>萌物收藏 · Animal Collection</h2><span class="sub">${animals.length} 位萌物伙伴</span></div><p class="wild-muted">每天三次免费翻牌，学习中随机遇见萌物。收集萌物卡解锁头像，重复卡需完成英文拼写。</p><div class="wild-actions"><button id="wildOpenDaily">✦ 翻牌</button><button class="secondary" id="wildOpenAlbum">萌物图鉴</button><button class="secondary" id="wildOpenFusion">✧ 合成</button><button class="secondary" id="wildOpenEncounter" style="display:none">🐾 奇遇</button></div></section>`;$('wildOpenDaily').onclick=daily;$('wildOpenAlbum').onclick=album;$('wildOpenFusion').onclick=fusion;$('wildOpenEncounter').onclick=encounter}
updateAvatars();updateBadges();
const splash=$('wdSplash');
function offerDaily(){
 if(day().seen||day().used>=3||overlay.classList.contains('show'))return;
 const open=()=>{if(!day().seen&&day().used<3&&!overlay.classList.contains('show'))daily()};
 if(window.wordday26BeforeDaily)window.wordday26BeforeDaily(open);else open();
}
if(splash?.classList.contains('visible')){
 for(const id of ['wdEnter','wdSkip'])$(id)?.addEventListener('click',()=>setTimeout(offerDaily,180),{once:true});
}else setTimeout(offerDaily,350);
// Visible learning interactions, not idle page time, accumulate encounter eligibility.
window.addEventListener('storage',ev=>{if(ev.key!==KEY||!ev.newValue)return;try{Object.assign(data,JSON.parse(ev.newValue));updateBadges()}catch{}});
let lastActive=0;document.addEventListener('input',ev=>{if(ev.target.closest('#expressions'))lastActive=Date.now()});document.addEventListener("visibilitychange",()=>{if(document.hidden)lastActive=0});document.addEventListener('click',ev=>{const btn=ev.target.closest('button');if(!btn||overlay.classList.contains('show'))return;if(!btn.closest('#learn,#quiz,#review,#studyStage,#expressions'))return;lastActive=Date.now()},true);setInterval(()=>{if(document.hidden||!['learn','expressions'].includes(mainTab)||overlay.classList.contains('show')||document.querySelector('dialog[open]')||Date.now()-lastActive>45000)return;data.activeSeconds+=10;if(data.activeSeconds>=120){data.activeSeconds-=120;if(!Object.values(data.encounters).some(x=>x?.status==='ready')){data.encounters[today()]={status:'ready',created:Date.now()};notify('🐾 有萌物奇遇！');window.WDExpressions?.showEncounter()}}persist();updateBadges();const eb=$('wildOpenEncounter');if(eb)eb.style.display=Object.values(data.encounters).some(x=>x.status==='ready')?'inline-block':'none'},10000);
$('wildPawDraw')?.addEventListener('click',encounter);
}
install();window.WILDWORDS={animals,data,daily,album,fusion,randomCard,sample,card,encounter,refreshIdeas:updateBadges};
})();
