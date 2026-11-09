(() => {
'use strict';
const root = document.getElementById('expressions');
const key = 'wordday_expressions_30';
const collectionKey = 'wordday_wildwords_25';
const load = (name, fallback) => {
  try { return JSON.parse(localStorage.getItem(name)) || fallback; }
  catch { return fallback; }
};
const data = Object.assign({ learned:{}, favorites:{}, wrong:{}, days:{}, themes:{}, quizHistory:[] }, load(key, {}));
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const dayKey = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
};
const sceneForDay = () => Math.floor(Date.parse(dayKey())/86400000) % scenes.length;
const scenes = window.WDExpressionScenes;
const tiers = ['CET-4','CET-6','IELTS'];
const cards = scenes.flatMap(([title, phrases, ...sentences], i) => {
  const phraseLevels = [0,0,1,0,1,0,1,2,1];
  const parse = (entry, kind, index) => {
    const [en, zh, note] = entry.split('~');
    return { id:kind+i+'-'+index, kind, en, zh, note, scene:i, title, main:kind==='s'?window.WDExpressionMains[i][index]:null, exam:tiers[kind==='p'?phraseLevels[index]:index===0?i<12?0:1:i<12?1:2] };
  };
  return [...phrases.split(';').concat(window.WDExpressionExtra[i]).map((r,j)=>parse(r,'p',j)), ...sentences.map((r,j)=>parse(r,'s',j))];
});
cards.push(...window.WDExpressionSources.map((c,i)=>({...c,id:'official-'+i,kind:'s',title:scenes[c.scene][0]})));
const byId = new Map(cards.map(card => [card.id,card]));
const shuffle = source => {
  const copy = [...source];
  for (let i=copy.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]] = [copy[j],copy[i]];
  }
  return copy;
};
const tagNames = ['口语','写作','翻译','校园','工作','生活','易混'];
const opts = {
  mode:[['p','短语'],['s','句子'],['mixed','混合']],
  exam:[['','全部难度'], ...tiers.map(x=>[x,x+' 练习'])],
  source:[['','全部内容'],['learned','已学'],['favorites','收藏'],['wrong','错题'],['official','官方样题']],
  count:[['5','5 题'],['10','10 题'],['20','20 题']]
};
let tab = 'p', exam = '', source = '', query = '', sceneFilter = '', current = null, position = 0, context = [], quiz = null, quizError = '', theme = false, libraryPage = false, busy = false, reading = false, explore = false, wordNode = 0, renderedDay = dayKey();
const button = (action, label, cls='secondary', attrs='') => '<button type="button" data-ex="'+action+'" class="'+cls+'" '+attrs+'>'+label+'</button>';
const select = (name, label, choices, value) => '<label><span>'+label+'</span><select class="field" name="'+name+'" data-filter="'+name+'">'+choices.map(([key,label])=>'<option value="'+esc(key)+'" '+(key===value?'selected':'')+'>'+esc(label)+'</option>').join('')+'</select></label>';
function save(notify = true) {
  localStorage.setItem(key,JSON.stringify(data));
  if (notify) document.dispatchEvent(new Event('wd28badges'));
}
function event(field) {
  const record = data.days[dayKey()] ??= {};
  record[field] = (record[field] || 0)+1;
}
function learned(card) {
  const record = data.learned[card.id] ??= { times:0, due:'' };
  const today = dayKey();
  if (record.last !== today) {
    record.times++;
    event('studied');
  }
  const due = new Date();
  due.setDate(due.getDate() + [1,3,7,14,30][Math.min(record.times-1,4)]);
  record.last = today;
  record.due = [due.getFullYear(),String(due.getMonth()+1).padStart(2,'0'),String(due.getDate()).padStart(2,'0')].join('-');
  delete data.wrong[card.id];
  save();
}
function pool(kind, level, from, search='', scene='') {
  return cards.filter(c => (kind==='mixed'||c.kind===kind) && (!level||c.exam===level) &&
    (!from || (from==='due' ? data.learned[c.id]?.due<=dayKey() : from==='official'?Boolean(c.url):data[from]?.[c.id])) &&
    (!search||[c.en,c.zh,c.title].some(x=>x.toLowerCase().includes(search))) && (scene===''||c.scene===Number(scene)));
}
function showCard(c) {
  current = c.id;
  render();
}
function cardView(c) {
  const word=c.en.toLowerCase().match(/[a-z]+/g)?.filter(w=>w.length>4).find(w=>findWord(w));
  const related = cards.filter(r=>r.scene===c.scene && r.kind!==c.kind).slice(0,c.kind==='p'?2:3);
  const comparison = cards.filter(r=>r.scene===c.scene&&r.kind===c.kind&&r.id!==c.id).slice(0,2);
  return '<article class="ex-card"><div class="ex-meta"><span>'+esc(c.title)+' · '+c.exam+' 练习</span>'+
    button('favorite',data.favorites[c.id]?'★ 收藏标签':'☆ 收藏','secondary','aria-label="设置收藏标签"')+'</div>'+
    '<h3 lang="en">'+esc(c.en)+'</h3><p class="ex-zh">'+esc(c.zh)+'</p>'+
    (c.note?'<div class="ex-note"><b>句子主干</b> <span lang="en">'+esc(c.main)+'</span><br><b>句型</b> '+esc(c.note)+'</div>':'<p class="ex-note"><b>同场景例句</b> '+esc(related[0]?.en)+'</p>')+
    '<details><summary>'+(c.kind==='p'?'同场景短语辨析':'同场景句型对照')+'</summary>'+comparison.map(r=>'<p><b lang="en">'+esc(r.en)+'</b> · '+esc(r.zh)+'</p>').join('')+'</details>'+
    '<div class="ex-links">'+related.map(r=>button('context',esc(r.en),'secondary','data-id="'+r.id+'"')).join('')+'</div>'+
    '<footer>'+(c.url?'<a href="'+esc(c.url)+'" target="_blank" rel="noopener noreferrer">'+esc(c.type)+'</a>':'<span>原创练习</span>')+(word?button('word','查词','secondary','data-word="'+word+'"'):'')+button('listen','发音')+button('learned','记住了','')+'</footer></article>';
}
function learning() {
  const list = pool(tab,exam,source,query,sceneFilter);
  const c = byId.get(current) || list[Math.min(position,list.length-1)];
  return '<div class="ex-controls">'+select('exam','考试方向',opts.exam,exam)+select('scene','场景',[['','全部场景'],...scenes.map(([name],i)=>[String(i),name])],sceneFilter)+
    select('source','范围',[...opts.source,['due','到期复习']],source)+
    '<form class="ex-search"><label><span>搜索表达</span><input class="field" type="search" name="q" value="'+esc(query)+'" placeholder="英文、中文或场景"></label><button type="submit" class="secondary">查找</button></form></div>'+
    (c?cardView(c)+'<div class="ex-steps">'+(context.length?button('back','← 返回上一张'):button('prev','← 上一张','secondary',position<=0?'disabled':''))+
      '<span>'+ (context.length?'关联表达':(position+1)+' / '+list.length)+'</span>'+button('next','下一张 →','secondary',context.length||position>=list.length-1?'disabled':'')+'</div>':
      '<p class="ex-empty">这个范围暂无内容。试试换个筛选条件。</p>');
}
function startQuiz(form) {
  const filters = new FormData(form);
  const list = shuffle(pool(filters.get('mode'),filters.get('exam'),filters.get('source')));
  if (!list.length) { quizError='该范围暂无题目，请换一个范围。'; render(); return; }
  quizError = '';
  const count=Number(filters.get('count'));
  const selected=list.slice(0,count);
  if(filters.get('mode')==='mixed' && selected.every(c=>c.kind===selected[0].kind)) {
    const other=list.find(c=>c.kind!==selected[0].kind);
    if(other) selected[selected.length-1]=other;
  }
  const questions=selected.map((c,index)=>{
    const field=c.kind==='p'&&index%2===1?'en':c.kind==='s'&&index%2===1?'note':'zh';
    const correct=c[field], prompt=field==='en'?c.zh:c.en;
    const distractors=shuffle(cards.filter(r=>r.kind===c.kind&&r.exam===c.exam&&r[field]&&r[field]!==correct));
    const options=[correct];
    for(const r of distractors) if(options.length<4&&!options.includes(r[field])) options.push(r[field]);
    return {c,options:shuffle(options),correct,prompt,field,answer:null};
  });
  quiz = { questions,index:0,finished:false };
  render();
}
function test() {
  if (!quiz) return '<form class="ex-test-form">'+select('mode','题型',opts.mode,'mixed')+select('exam','考试方向',opts.exam,'')+
    select('source','出题范围',opts.source,'')+select('count','题数',opts.count,'10')+'<button type="submit">开始测试</button>'+
    (quizError?'<p role="status">'+quizError+'</p>':'')+'</form>';
  if (quiz.finished) {
    const rows = ['p','s'].map(kind=>{
      const subset = quiz.questions.filter(q=>q.c.kind===kind);
      return subset.length?(kind==='p'?'短语':'句子')+' '+subset.filter(q=>q.answer===q.correct).length+' / '+subset.length:'';
    }).filter(Boolean).join(' · ');
    return '<div class="ex-empty"><h3>测试完成</h3><p>'+rows+'</p>'+button('reviewQuiz','回看整题')+button('resetQuiz','新测试','')+'</div>';
  }
  const {c,options,answer,correct,prompt,field} = quiz.questions[quiz.index];
  return '<article class="ex-card"><div class="ex-meta"><span>'+(quiz.index+1)+' / '+quiz.questions.length+' · '+(field==='en'?'选英文表达':field==='note'?'选句型解析':'选中文释义')+'</span></div><h3'+(field==='en'?'':' lang="en"')+'>'+esc(prompt)+'</h3>'+
    '<div class="ex-options">'+options.map((opt,i)=>button('answer',esc(opt),'secondary '+(answer!==null?(opt===correct?'ex-correct':opt===answer?'ex-incorrect':''):''),'data-index="'+i+'" '+(answer===null?'':'disabled'))).join('')+'</div>'+
    (answer===null?'':'<p class="ex-note">'+(answer===correct?'答对了':'正确答案 · '+esc(correct))+(field==='note'?' · 主干 '+esc(c.main):c.note?' · '+esc(c.note):' · '+esc(c.title))+'</p>')+
    '<div class="ex-steps">'+button('quizPrev','← 上一题','secondary',quiz.index===0?'disabled':'')+
    button('quizNext',quiz.index===quiz.questions.length-1?'查看结果':'下一题 →','',answer===null?'disabled':'')+'</div></article>';
}
function notebook() {
  const list = cards.filter(c=>data.favorites[c.id]);
  return '<div class="ex-notebook">'+(list.map(c=>'<div><span><b lang="en">'+esc(c.en)+'</b><small>'+esc(data.favorites[c.id].join(' · '))+'</small></span>'+
    button('openSaved','查看','secondary','data-id="'+c.id+'"')+button('tagSaved','标签','secondary','data-id="'+c.id+'"')+'</div>').join('')||'<p class="ex-empty">在卡片上点 ☆，选好标签后即可收藏。</p>')+'</div>';
}
const themeRun = () => data.themes[dayKey()] ??= {step:0};
function themeContent() {
  const scene = sceneForDay();
  const run = themeRun();
  const list = cards.filter(c=>c.scene===scene);
  if (run.step>=3) {
    const label=(kind,initial)=>{
      const receipt=window.WILDWORDS.data.expressionRewards?.[dayKey()+'/'+kind];
      return receipt?(receipt.shown<receipt.ids.length?'继续翻牌':'查看奖励'):initial;
    };
    return '<div class="ex-theme-content"><h3>今日表达接力已完成</h3><div class="ex-actions">'+button('rewardThree',label('rewardThree','翻开 3 张奖励卡'))+button('chest',label('chest','开启主题宝箱'),'')+'</div></div>';
  }
  const item = run.step===0?list.find(c=>c.kind==='p'):list.filter(c=>c.kind==='s')[run.step-1];
  const alternatives = run.step<2?[item.zh,...cards.filter(c=>c.kind===item.kind&&c.scene!==(scene)&&c.scene===(scene+1)%scenes.length).slice(0,2).map(c=>c.zh)]:[];
  const choices = [...alternatives.slice(1,1+scene%3),...alternatives.slice(0,1),...alternatives.slice(1+scene%3)];
  return '<div class="ex-theme-content"><small>第 '+(run.step+1)+' / 3 步 · '+['辨认短语','理解句子','场景回应'][run.step]+'</small><h3'+(run.step===2?'':' lang="en"')+'>'+esc(run.step===2?item.zh:item.en)+'</h3>'+
    (run.step===2?'<form class="ex-reply"><label><span>想象你就在现场，试着用自己的话写一句英文</span><textarea name="reply" class="field" required minlength="8" maxlength="300" placeholder="Write your response">'+esc(run.draft||'')+'</textarea></label><details><summary>查看参考表达</summary><p lang="en">'+esc(item.en)+'</p></details><button type="submit">完成接力</button></form>':
    '<div class="ex-options">'+choices.map(opt=>button('themeChoice',esc(opt),'secondary','data-right="'+Number(opt===item.zh)+'"')).join('')+'</div><p role="status" id="exThemeFeedback"></p>')+'</div>';
}
const wordMap=[
  ['clarify','澄清','explain','解释','confuse','使困惑',23],
  ['confirm','确认','verify','核实','deny','否认',15],
  ['cancel','取消','call off','取消活动','proceed','继续进行',12],
  ['extend','延长','prolong','延长持续时间','shorten','缩短',1],
  ['increase','增加','rise','上升','decrease','减少',25],
  ['include','包含','cover','涵盖费用或范围','exclude','排除',19],
  ['accept','接受','agree to','同意某个提议','reject','拒绝',5],
  ['reserve','预订','book','预订场地或时间','release','释放已占用的位置',28]
];
function exploreView() {
  const [word,zh,related,relatedZh,opposite,oppositeZh,scene]=wordMap[wordNode];
  return '<div class="ex-map"><h3>词汇探索</h3><div class="ex-map-nodes">'+wordMap.map(([term],i)=>
    button('wordNode',term,i===wordNode?'':'secondary','data-id="'+i+'" aria-pressed="'+(i===wordNode)+'"')).join('')+
    '</div><article class="ex-card"><h3 lang="en">'+esc(word)+'</h3><p>'+esc(zh)+'</p><div class="ex-map-branches">'+
    '<div><small>近义或相关用法</small><strong lang="en">'+esc(related)+'</strong><p>'+esc(relatedZh)+'</p></div>'+
    '<div><small>对照用法</small><strong lang="en">'+esc(opposite)+'</strong><p>'+esc(oppositeZh)+'</p></div></div>'+
    button('readScene','去场景中练习','secondary','data-id="'+scene+'"')+'</article></div>';
}
function readView() {
  const list=window.WDExpressionReading;
  const [title,en,zh,scene]=list[sceneForDay()%list.length];
  return '<article class="ex-card"><small>每日短读 · 原创</small><h3>'+esc(title)+'</h3><p lang="en">'+esc(en)+'</p><details><summary>查看译文</summary><p>'+esc(zh)+'</p></details>'+button('readScene','查看相关表达','secondary','data-id="'+scene+'"')+'</article>';
}
function render() {
  renderedDay=dayKey();
  const ready = Object.values(window.WILDWORDS?.data.encounters||{}).some(r=>r?.status==='ready');
  root.innerHTML = '<header class="ex-header"><div><p class="ex-eyebrow">WORDDAY / EXPRESSIONS</p><h2>表达</h2><p>从一个场景，练到一句能用的话。</p></div>'+'<div class="ex-header-actions">'+button('reading',reading?'返回学习':'每日短读')+button('notebook',libraryPage?'返回学习':'素材本')+button('explore',explore?'返回学习':'词汇探索')+'</div>'+'</header>'+
    '<section class="panel ex-theme"><div class="ex-theme-top"><div><p class="ex-eyebrow">今日场景</p><h3>'+esc(scenes[sceneForDay()][0])+'</h3></div>'+button('theme',theme?'收起':'表达接力',theme?'secondary':'')+'</div>'+
    (theme?themeContent():'')+'</section>'+
    '<section class="panel ex-body">'+(explore?exploreView():reading?readView():libraryPage?'<h3>素材本</h3>'+notebook():
      '<div class="ex-tabs" aria-label="表达练习类型">'+opts.mode.slice(0,2).concat([['test','测试']]).map(([id,label])=>button('tab',label,tab===id?'':'secondary','data-id="'+id+'" aria-pressed="'+(tab===id)+'"')).join('')+'</div>'+
      (ready?button('encounter','🐾 表达奇遇','secondary'):'')+(tab==='test'?test():learning()))+'</section>';
}
function tagDialog(c) {
  openDialog('收藏标签','<p>'+esc(c.en)+'</p><form class="ex-tagform"><fieldset><legend>至少选一个，可多选</legend><div class="ex-tags">'+tagNames.map(name=>'<label><input type="checkbox" name="tag" value="'+name+'" '+(data.favorites[c.id]?.includes(name)?'checked':'')+'><span>'+name+'</span></label>').join('')+'</div></fieldset><p role="status"></p><div class="ex-actions">'+(data.favorites[c.id]?'<button type="button" class="secondary ex-remove">移除收藏</button>':'')+'<button type="submit">保存</button></div></form>');
  const form = dialog.querySelector('form');
  form.addEventListener('submit',ev=>{
    ev.preventDefault();
    const tags = new FormData(form).getAll('tag');
    if (!tags.length) { form.querySelector('[role=status]').textContent='请至少选一个标签。'; return; }
    data.favorites[c.id] = tags;
    save(); closeDialog(); render();
  });
  form.querySelector('.ex-remove')?.addEventListener('click',()=>{
    delete data.favorites[c.id]; save(); closeDialog(); render();
  });
}
const dialog = document.createElement('dialog');
dialog.className = 'ex-dialog';
dialog.setAttribute('aria-labelledby','exDialogTitle');
document.body.append(dialog);
function openDialog(title, body) {
  dialog.innerHTML = '<header><h2 id="exDialogTitle">'+title+'</h2><button type="button" class="secondary ex-close">关闭</button></header>'+body;
  dialog.querySelector('.ex-close').addEventListener('click',closeDialog);
  if (!dialog.open) dialog.showModal();
}
function closeDialog() { if (dialog.open) dialog.close(); }
const locked = work => navigator.locks ? navigator.locks.request('wd28-reward',work) : work();
function chestCards() {
  const W = window.WILDWORDS;
  const counts = [1,1,1,Number(Math.random()<.5),Number(Math.random()<.03)];
  [.90,.80,.40,.10].forEach((p,tier)=>{
    const roll = Math.random();
    for (let i=0;i<4 && roll<p/2**i;i++) counts[tier]++;
  });
  return counts.flatMap((count,tier)=>Array.from({length:count},()=>W.sample(tier).id));
}
async function rewards(kind, mode='open', rewardDay=dayKey()) {
  if (busy) return;
  busy=true;
  const W = window.WILDWORDS, receiptKey = rewardDay+'/'+kind;
  try {
    const receipt = await locked(()=>{
      const raw = load(collectionKey,W.data);
      const claims = raw.expressionRewards ??= {};
      let receipt = claims[receiptKey];
      if (!receipt) {
        if(mode==='reveal'||data.themes[rewardDay]?.step<3||!data.themes[rewardDay]) throw new Error('Reward unavailable');
        const ids = kind==='chest'?chestCards():Array.from({length:3},()=>W.randomCard().id).sort((a,b)=>W.animals.find(c=>c.id===a).rarity-W.animals.find(c=>c.id===b).rarity);
        receipt = claims[receiptKey] = {ids,shown:0};
        for (const id of ids) {
          raw.discovered[id] = true;
          raw.inventory[id] = Number(raw.inventory[id]||0)+1;
        }
      }
      if (mode==='reveal') receipt.shown = Math.min(receipt.ids.length, receipt.shown+1);
      localStorage.setItem(collectionKey,JSON.stringify(raw));
      Object.assign(W.data,raw);
      return receipt;
    });
    render();
    document.dispatchEvent(new Event('wd28badges'));
    if (mode==='reveal') window.WD28CardFX?.sound('acquire');
    reveal(kind,receipt,rewardDay);
  } catch {
    openDialog('奖励暂未打开','<p>奖励读取或保存失败，请关闭后重试。</p>');
  } finally { busy=false; }
}
function reveal(kind,{ids,shown},rewardDay) {
  const W = window.WILDWORDS, left=ids.length-shown, last=W.animals.find(c=>c.id===ids[shown-1]);
  const art = '<div class="ex-chest" aria-hidden="true"><div class="ex-chest-lid"></div><div class="ex-chest-base"><span>✦</span></div></div>';
  const sparks = '<div class="ex-sparks" aria-hidden="true">'+Array.from({length:14},(_,i)=>'<i style="--i:'+i+'">✦</i>').join('')+'</div>';
  const card = c => W.card(c,false,!!W.data.advanced[c.id],'');
  openDialog(kind==='chest'?'主题宝箱':'主题奖励','<div class="ex-reveal '+(last?'ex-flip':'')+'">'+(last?'<div class="ex-reward-card">'+card(last)+'</div>'+sparks:art)+'</div>'+
    '<div class="ex-reward-foot"><span>剩余卡牌 <b>'+left+'</b></span>'+(left?'<button class="ex-next-reward">'+(shown?'翻开下一张':'开箱')+'</button>':'<button class="ex-next-reward">完成</button>')+'</div>'+
    (shown===ids.length?'<details class="ex-reward-summary"><summary>本次获得</summary><div>'+ids.map(id=>card(W.animals.find(c=>c.id===id))).join('')+'</div></details>':''));
  dialog.querySelector('.ex-next-reward').addEventListener('click',()=>{
    if (!left) { closeDialog(); return; }
    if (!shown&&kind==='chest') {
      dialog.querySelector('.ex-next-reward').disabled=true;
      dialog.querySelector('.ex-chest')?.classList.add('opening');
      setTimeout(()=>{if(dialog.open) rewards(kind,'reveal',rewardDay);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:420);
    } else rewards(kind,'reveal',rewardDay);
  });
}
root.addEventListener('input',ev=>{
  if(ev.target.matches('.ex-reply textarea') && renderedDay===dayKey()) {
    themeRun().draft=ev.target.value;
    save(false);
  }
});
root.addEventListener('change',ev=>{
  if (ev.target.form?.classList.contains('ex-test-form')) return;
  const name = ev.target.dataset.filter;
  if (name==='exam') exam=ev.target.value;
  else if (name==='source') source=ev.target.value;
  else if (name==='scene') sceneFilter=ev.target.value;
  else return;
  current=null; position=0; context=[]; render();
});
root.addEventListener('submit',ev=>{
  ev.preventDefault();
  if(ev.target.classList.contains('ex-reply') && renderedDay!==dayKey()) { render(); return; }
  if (ev.target.classList.contains('ex-test-form')) startQuiz(ev.target);
  else if (ev.target.classList.contains('ex-search')) {
    query = new FormData(ev.target).get('q').trim().toLowerCase();
    current=null; position=0; context=[]; render();
  } else if (ev.target.classList.contains('ex-reply') && themeRun().step===2) {
    const reply = new FormData(ev.target).get('reply').trim();
    if (reply.length<8 || !/[A-Za-z]/.test(reply)) { ev.target.elements.reply.focus(); return; }
    const run = themeRun();
    run.reply = reply;
    delete run.draft;
    run.step=3;
    event('themes');
    save(); render();
  }
});
root.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-ex]');
  if (!b) return;
  if(['themeChoice','rewardThree','chest'].includes(b.dataset.ex) && renderedDay!==dayKey()) { render(); return; }
  const c=byId.get(current)||pool(tab,exam,source,query,sceneFilter)[position];
  switch(b.dataset.ex) {
    case 'tab': tab=b.dataset.id; current=null; position=0; context=[]; render(); break;
    case 'notebook': reading=false; explore=false; libraryPage=!libraryPage; render(); break;
    case 'reading': reading=!reading; explore=false; libraryPage=false; render(); break;
    case 'explore': explore=!explore; libraryPage=false; reading=false; render(); break;
    case 'wordNode': wordNode=Number(b.dataset.id); render(); break;
    case 'readScene': reading=false; explore=false; tab='p'; exam=''; source=''; query=''; sceneFilter=b.dataset.id; current=null; context=[]; position=0; render(); break;
    case 'theme': theme=!theme; render(); break;
    case 'themeChoice':
      if (b.dataset.right==='1') { themeRun().step++; save(false); render(); }
      else document.getElementById('exThemeFeedback').textContent='再试一次，留意句中的关键词。';
      break;
    case 'rewardThree': case 'chest': if (themeRun().step>=3) rewards(b.dataset.ex); break;
    case 'favorite': if(c) tagDialog(c); break;
    case 'tagSaved': tagDialog(byId.get(b.dataset.id)); break;
    case 'openSaved': {
      const saved=byId.get(b.dataset.id);
      libraryPage=false; tab=saved.kind; context=[]; showCard(saved); break;
    }
    case 'context': context.push(c.id); showCard(byId.get(b.dataset.id)); break;
    case 'back': showCard(byId.get(context.pop())); break;
    case 'prev': current=null; position=Math.max(0,position-1); render(); break;
    case 'next': current=null; position++; render(); break;
    case 'learned':
      if (c) {
        learned(c);
        if (context.length) current=context.pop();
        else if (!source || source==='learned' || source==='favorites') { current=null; position=Math.min(position+1,Math.max(0,pool(tab,exam,source,query,sceneFilter).length-1)); }
        else { current=null; position=Math.min(position,Math.max(0,pool(tab,exam,source,query,sceneFilter).length-1)); }
        render();
      }
      break;
    case 'word': showDetail(b.dataset.word); break;
    case 'listen': if (c) speak(c.en); break;
    case 'encounter': window.WILDWORDS?.encounter(); break;
    case 'answer': {
      const q=quiz.questions[quiz.index];
      if (q.answer!==null) break;
      q.answer=q.options[Number(b.dataset.index)];
      if (q.answer===q.correct) { event('correct'); delete data.wrong[q.c.id]; }
      else data.wrong[q.c.id]=true;
      save(); render(); break;
    }
    case 'quizPrev': quiz.index--; render(); break;
    case 'quizNext':
      if (quiz.index<quiz.questions.length-1) quiz.index++;
      else {
        quiz.finished=true;
        if (!quiz.recorded) {
          quiz.recorded=true; event('tests');
          data.quizHistory.unshift({date:dayKey(),correct:quiz.questions.filter(q=>q.answer===q.correct).length,total:quiz.questions.length});
          data.quizHistory.length=Math.min(data.quizHistory.length,100);
          save();
        }
      }
      render(); break;
    case 'reviewQuiz': quiz.finished=false; quiz.index=0; render(); break;
    case 'resetQuiz': quiz=null; render(); break;
  }
});
window.WDExpressions={
  open() {
    const stage=document.getElementById('studyStage');
    if (stage?.classList.contains('active')) switchTab('learn');
    mainTab='expressions';
    updateNavPill();
    document.querySelector('.nav').style.display='none';
    document.querySelector('.hero').style.display='none';
    document.querySelectorAll('[data-main-tab]').forEach(b=>b.classList.toggle('active',b.dataset.mainTab==='expressions'));
    document.querySelectorAll('.wrap > .section').forEach(s=>s.classList.toggle('active',s===root));
    render();
    window.scrollTo(0,0);
  },
  fromWord(word) {
    const token = String(word).toLowerCase();
    const match = cards.find(c=>c.en.toLowerCase().match(/[a-z]+/g)?.includes(token));
    if (!match) return false;
    tab=match.kind; libraryPage=false; reading=false; explore=false; context=[]; current=match.id; this.open();
    return true;
  },
  hasWord(word) { return cards.some(c=>c.en.toLowerCase().match(/[a-z]+/g)?.includes(String(word).toLowerCase())); },
  showEncounter() {
    if(mainTab!=='expressions' || root.querySelector('[data-ex="encounter"]')) return;
    root.querySelector('.ex-theme-top')?.insertAdjacentHTML('afterend',button('encounter','🐾 表达奇遇'));
  },
  snapshot() { return data; },
  importBackup(incoming) {
    if(!incoming || typeof incoming!=='object') return;
    for(const field of ['learned','favorites','wrong','days','themes']) {
      const records=incoming[field];
      if(records && typeof records==='object' && !Array.isArray(records)) data[field]={...records,...data[field]};
    }
    if(Array.isArray(incoming.quizHistory)) {
      const history=[...data.quizHistory,...incoming.quizHistory];
      data.quizHistory=[...new Map(history.map(row=>[JSON.stringify(row),row])).values()].slice(0,100);
    }
    save();
  },
  stats() { return { learned:Object.keys(data.learned).length, tests:Object.values(data.days).reduce((n,d)=>n+(d.tests||0),0), themes:Object.values(data.days).reduce((n,d)=>n+(d.themes||0),0) }; },
  totals(days) { return Object.fromEntries(['studied','correct','tests','themes'].map(k=>[k,days.reduce((n,d)=>n+(data.days[d]?.[k]||0),0)])); }
};
const originalDetail=showDetail;
showDetail=function(word) {
  originalDetail(word);
  const body=document.getElementById('detailBody');
  if(!window.WDExpressions.hasWord(word)||!body) return;
  const link=document.createElement('button');
  link.type='button';
  link.className='secondary';
  link.textContent='查看相关表达';
  link.addEventListener('click',()=>{closeDetail();window.WDExpressions.fromWord(word);});
  body.append(link);
};
})();
