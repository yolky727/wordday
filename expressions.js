(() => {
'use strict';
const root = document.getElementById('expressions');
const key = 'wordday_expressions_30';
const collectionKey = 'wordday_wildwords_25';
const load = (name, fallback) => {
  try { return JSON.parse(localStorage.getItem(name)) || fallback; }
  catch { return fallback; }
};
const data = Object.assign({ learned:{}, favorites:{}, wrong:{}, days:{}, themes:{}, quizHistory:[], targets:{p:7,s:3}, dailyLearned:{}, reviewDone:{} }, load(key, {}));
data.targets ??= {p:7,s:3}; data.dailyLearned ??= {}; data.reviewDone ??= {};
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const dayKey = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
};
const calendarDay = () => Math.floor(Date.parse(dayKey())/86400000);
const themeKey = () => 'relay31/'+Math.floor(calendarDay()/3);
const themeScene = () => Math.floor(calendarDay()/3)%scenes.length;
const relaySteps = 6;
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
let tab = 'p', exam = '', source = '', query = '', sceneFilter = '', current = null, position = 0, context = [], quiz = data.quizDraft?.questions?.length ? data.quizDraft : null, quizError = '', busy = false, wordNode = 0, renderedDay = dayKey();
let page = 'home', returnPage = 'home', settingsOpen = false;
const quizPrefs = {exam:'', source:'', count:'10', ...data.quizPrefs};
function restoreLearningFilters(kind) {
  const saved=data.learningFilters?.[kind]||{};
  exam=saved.exam||''; source=saved.source||''; query=saved.query||''; sceneFilter=saved.scene||'';
}
const testModes = [['p','短语测试'],['s','句子测试'],['mixed','综合测试']];
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
    const todaySet=data.dailyLearned[today]??={p:[],s:[]};
    const dayItems=todaySet[card.kind]??=[];
    if(!dayItems.includes(card.id)) dayItems.push(card.id);
    if(data.wrong[card.id] || record.times>1) {
      const reviewed=data.reviewDone[today]??=[];
      if(!reviewed.includes(card.id)) reviewed.push(card.id);
    }
  }
  // Daily progress is a distinct-card set, including explicit review sessions.
  const todaySet=data.dailyLearned[today]??={p:[],s:[]};
  const dayItems=todaySet[card.kind]??=[];
  if(!dayItems.includes(card.id)) dayItems.push(card.id);
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
// V3.1.5: regular study shows only cards not yet mastered. Explicit review,
// favorites, wrong answers, and official collections remain accessible.
function studyPool() {
  const list=pool(tab,exam,source,query,sceneFilter);
  return source==='' ? list.filter(c=>!data.learned[c.id]?.times) : list;
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
    '<footer>'+(c.url?'<a href="'+esc(c.url)+'" target="_blank" rel="noopener noreferrer">'+esc(c.type)+'</a>':'<span>原创练习</span>')+(word?button('word','查词','secondary','data-word="'+word+'"'):'')+button('listen','发音')+button('learned','记住了','','data-card-id="'+esc(c.id)+'"')+'</footer></article>';
}
function learning() {
  const list = studyPool();
  const c = (current && list.find(item=>item.id===current)) || list[Math.min(position,list.length-1)];
  return '<details class="ex-settings" '+(settingsOpen?'open':'')+'><summary>筛选与搜索</summary><form class="ex-controls ex-filter-form">'+select('exam','考试方向',opts.exam,exam)+select('scene','场景',[['','全部场景'],...scenes.map(([name],i)=>[String(i),name])],sceneFilter)+
    select('source','范围',[...opts.source,['due','到期复习']],source)+
    '<div class="ex-search"><label><span>搜索表达</span><input class="field" type="search" name="q" value="'+esc(query)+'" placeholder="英文、中文或场景"></label><button type="submit">确定</button></div></form></details>'+
    '<div class="ex-daily-goal"><label>每日'+(tab==='p'?'短语':'句子')+'目标 <input type="number" class="field" id="exGoal" min="'+(tab==='p'?7:3)+'" max="200" value="'+Math.max(tab==='p'?7:3,Number(data.targets[tab]||0))+'"></label>'+button('saveGoal','保存目标')+'<small>今日已学 '+new Set(data.dailyLearned[dayKey()]?.[tab]||[]).size+' 个</small></div>'+
    (source==='official'?'<p class="ex-official-links"><a href="https://cet.neea.edu.cn/html1/folder/16113/1588-1.htm" target="_blank" rel="noopener noreferrer">四六级官方样卷</a> · <a href="https://ielts.org/take-a-test/preparation-resources/sample-test-questions" target="_blank" rel="noopener noreferrer">IELTS 官方完整样题</a></p>':'')+
    (c?cardView(c)+'<div class="ex-steps">'+(context.length?button('back','← 返回上一张'):button('prev','← 上一张','secondary',position<=0?'disabled':''))+
      '<span>'+ (context.length?'关联表达':(position+1)+' / '+list.length)+'</span>'+button('next','下一张 →','secondary',context.length||position>=list.length-1?'disabled':'')+'</div>':
      '<p class="ex-empty">'+(source===''?'当前范围已全部学完！可以在「筛选与搜索」中选择「已学」进行复习。':'这个范围暂无内容。试试换个筛选条件。')+'</p>');
}
function startQuiz(mode) {
  const list = shuffle(pool(mode,quizPrefs.exam,quizPrefs.source));
  if (!list.length) { quizError='该范围暂无题目，请换一个范围。'; render(); return; }
  quizError = '';
  const count=Number(quizPrefs.count);
  const selected=list.slice(0,count);
  if(mode==='mixed' && selected.every(c=>c.kind===selected[0].kind)) {
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
  quiz = { mode,questions,index:0,finished:false,streak:0 };
  page='test';
  data.quizDraft=quiz;
  save(false);
  settingsOpen=false;
  render();
}
function test(center=false) {
  if (center) {
    const available=pool('mixed',quizPrefs.exam,quizPrefs.source).length;
    return '<div class="ex-test-title"><h2>自由测试中心</h2><span>随时开始 · 三种模式</span></div>'+
      '<details class="ex-settings" '+(settingsOpen?'open':'')+'><summary>题目设置</summary><div class="ex-controls ex-test-filters">'+
      select('exam','考试方向',opts.exam,quizPrefs.exam)+select('source','出题范围',opts.source,quizPrefs.source)+
      select('count','题数',opts.count,quizPrefs.count)+'</div></details>'+
      '<section class="quiz-lock ex-test-choices"><div class="lock-icon" aria-hidden="true">✦</div><h3>选择测试</h3>'+
      '<p>当前范围 '+available+' 条表达 · 每场最多 '+quizPrefs.count+' 题</p>'+
      (quiz&&!quiz.finished?button('resumeQuiz','继续上次测试'):'')+
      '<div class="ex-mode-grid">'+testModes.map(([id,label])=>button('startQuiz',label,'','data-id="'+id+'"')).join('')+'</div>'+
      (quizError?'<p role="status">'+quizError+'</p>':'')+
      '<div class="quiz-mode-stats ex-mode-grid">'+testModes.map(([id,label])=>{
        const attempts=data.quizHistory.filter(row=>row.mode===id);
        const total=attempts.reduce((n,row)=>n+row.total,0);
        const correct=attempts.reduce((n,row)=>n+row.correct,0);
        return '<div class="quiz-mode-stat"><strong>'+label+'</strong><span>'+(total?attempts.length+' 次测试 · '+Math.round(correct/total*100)+'% 正确率':'暂无分模式成绩')+'</span></div>';
      }).join('')+'</div></section>';
  }
  if (quiz.finished) {
    const rows = ['p','s'].map(kind=>{
      const subset = quiz.questions.filter(q=>q.c.kind===kind);
      return subset.length?(kind==='p'?'短语':'句子')+' '+subset.filter(q=>q.answer===q.correct).length+' / '+subset.length:'';
    }).filter(Boolean).join(' · ');
    return '<div class="ex-empty"><h3>测试完成</h3><p>'+rows+'</p>'+button('reviewQuiz','回看整题')+button('resetQuiz','新测试','')+'</div>';
  }
  const {c,options,answer,correct,prompt,field} = quiz.questions[quiz.index];
  return '<article class="ex-card ex-question"><div class="ex-meta"><span>'+(quiz.index+1)+' / '+quiz.questions.length+' · '+(field==='en'?'选英文表达':field==='note'?'选句型解析':'选中文释义')+'</span><span>⚡ 连对 '+(quiz.streak||0)+'</span></div><progress max="'+quiz.questions.length+'" value="'+(quiz.index+1)+'" aria-label="测试进度"></progress><h3'+(field==='en'?'':' lang="en"')+'>'+esc(prompt)+'</h3>'+
    '<div class="ex-options">'+options.map((opt,i)=>button('answer','<span class="ex-option-index" aria-hidden="true">'+String.fromCharCode(65+i)+'</span><span>'+esc(opt)+'</span>','secondary '+(answer!==null?(opt===correct?'ex-correct':opt===answer?'ex-incorrect':''):''),'data-index="'+i+'" '+(answer===null?'':'disabled'))).join('')+'</div>'+
    (answer===null?'':'<p class="ex-note">'+(answer===correct?'答对了':'正确答案 · '+esc(correct))+(field==='note'?' · 主干 '+esc(c.main):c.note?' · '+esc(c.note):' · '+esc(c.title))+'</p>')+
    '<div class="ex-quiz-actions">'+button('quizFavorite',data.favorites[c.id]?'★ 已收藏':'☆ 收藏')+(quiz.recorded?'':button('saveQuiz','保存并退出'))+'</div>'+
    '<div class="ex-steps">'+button('quizPrev','← 上一题','secondary',quiz.index===0?'disabled':'')+
    button('quizNext',quiz.index===quiz.questions.length-1?'查看结果':'下一题 →','',answer===null?'disabled':'')+'</div></article>';
}
function wrongBook() {
  const list=cards.filter(c=>data.wrong[c.id]);
  if(!list.length) return '<p class="ex-empty">答错的表达会自动收录在这里。</p>';
  return '<div class="ex-wrong-tools">'+button('practiceWrong','重练错题','')+'</div><div class="ex-notebook">'+list.map(c=>
    '<div><span><b lang="en">'+esc(c.en)+'</b><small>'+esc(c.zh)+'</small></span>'+
    button('openWrong','复习','secondary','data-id="'+c.id+'"')+'</div>').join('')+'</div>';
}
function notebook() {
  const list = cards.filter(c=>data.favorites[c.id]);
  return '<div class="ex-notebook">'+(list.map(c=>'<div><span><b lang="en">'+esc(c.en)+'</b><small>'+esc(data.favorites[c.id].join(' · '))+'</small></span>'+
    button('openSaved','查看','secondary','data-id="'+c.id+'"')+button('tagSaved','标签','secondary','data-id="'+c.id+'"')+'</div>').join('')||'<p class="ex-empty">在卡片上点 ☆，选好标签后即可收藏。</p>')+'</div>';
}
function relayQuestion(c, field, slot) {
  const correct=c[field];
  const sameKind=cards.filter(r=>r.kind===c.kind&&r[field]&&r[field]!==correct);
  const candidates=[...shuffle(sameKind.filter(r=>r.scene===c.scene)),...shuffle(sameKind.filter(r=>r.scene!==c.scene))];
  const options=[...new Set(candidates.map(r=>r[field]))].slice(0,3);
  options.splice(slot,0,correct);
  return {id:c.id,field,options};
}
function relaySentenceField(card) {
  return card.main?.trim().toLowerCase().replace(/[.!?]+$/,'')===card.en.trim().toLowerCase().replace(/[.!?]+$/,'')?'zh':'main';
}
function themeRun() {
  const key=themeKey(), saved=data.themes[key];
  if(saved) {
    const last=saved.questions?.[4];
    const item=byId.get(last?.id);
    if(saved.step<=4&&last?.field==='main'&&item&&relaySentenceField(item)==='zh') {
      saved.questions[4]=relayQuestion(item,'zh',Math.max(0,last.options.indexOf(item.main)));
      save(false);
    }
    return saved;
  }
  const list=cards.filter(c=>c.scene===themeScene()&&!c.url);
  const phrases=list.filter(c=>c.kind==='p');
  const sentences=list.filter(c=>c.kind==='s');
  const positions=shuffle([0,1,2,3]);
  const specs=[[phrases[0],'zh'],[phrases[1],'en'],[sentences[0],'zh'],[phrases[2],'en'],[sentences[1],relaySentenceField(sentences[1])]];
  const questions=specs.map(([c,field],i)=>relayQuestion(c,field,i===4?(positions[3]+1)%4:positions[i]));
  return data.themes[key]={step:0,questions,response:sentences[1].id};
}
function themeContent() {
  const run=themeRun();
  if(run.step>=relaySteps) {
    const rewardRow=(kind,title,description,mark)=>{
      const receipt=window.WILDWORDS.data.expressionRewards?.[themeKey()+'/'+kind];
      const status=!receipt?'待领取':receipt.shown<receipt.ids.length?'还有 '+(receipt.ids.length-receipt.shown)+' 张待翻':'已领取';
      const action=!receipt?'领取':receipt.shown<receipt.ids.length?'继续翻牌':'查看卡牌';
      return '<li><span class="ex-relay-reward-mark" aria-hidden="true">'+mark+'</span><div><strong>'+title+'</strong><small>'+description+' · '+status+'</small></div>'+
        button(kind,action,kind==='chest'&&!receipt?'':'secondary','aria-label="'+action+' · '+title+'"')+'</li>';
    };
    return '<section class="ex-relay-complete"><div class="ex-relay-banner"><div><p class="ex-eyebrow">WORDDAY / RELAY</p><h3>本期接力已完成</h3><p>'+esc(scenes[themeScene()][0])+'</p></div>'+
      '<div class="ex-relay-meter" aria-label="已完成 '+relaySteps+' 个步骤">'+relaySteps+'<span> / '+relaySteps+'</span><small>练习完成</small></div></div>'+
      '<div class="ex-relay-rewards"><h4>接力奖励</h4><ul>'+rewardRow('rewardThree','三张奖励卡','固定三张','◇')+rewardRow('chest','主题卡包','逐张揭晓','✦')+'</ul></div></section>';
  }
  const question=run.questions[run.step], item=byId.get(question?.id||run.response);
  const label=question?({zh:'选中文意思',en:'选英文表达',main:'找出句子主干'})[question.field]:'场景回应';
  const prompt=question&&question.field!=='en'?item.en:item.zh;
  return '<article class="ex-card"><small>第 '+(run.step+1)+' / '+relaySteps+' 步 · '+label+'</small><h3>'+esc(prompt)+'</h3>'+
    (question?'<div class="ex-options">'+question.options.map((opt,i)=>button('themeChoice',esc(opt),'secondary','data-index="'+i+'"')).join('')+'</div><p role="status" id="exThemeFeedback"></p>':
    '<form class="ex-reply"><label><span>在这个场景中写至少两句、共 12 个英文词。第一句回应提示，第二句补充理由、细节或一个后续问题。</span><textarea name="reply" class="field" required maxlength="500" placeholder="Write your response">'+esc(run.draft||'')+'</textarea></label><details><summary>查看一句参考表达</summary><p lang="en">'+esc(item.en)+'</p></details><p role="status"></p><button type="submit">完成接力</button></form>')+'</article>';
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
  const [word,zh,related,relatedZh,opposite,oppositeZh]=wordMap[wordNode];
  return '<div class="ex-map"><div class="ex-map-nodes">'+wordMap.map(([term],i)=>
    button('wordNode',term,i===wordNode?'':'secondary','data-id="'+i+'" aria-pressed="'+(i===wordNode)+'"')).join('')+
    '</div><article class="ex-card"><h3 lang="en">'+esc(word)+'</h3><p>'+esc(zh)+'</p><div class="ex-map-branches">'+
    '<div><small>近义或相关用法</small><strong lang="en">'+esc(related)+'</strong><p>'+esc(relatedZh)+'</p></div>'+
    '<div><small>对照用法</small><strong lang="en">'+esc(opposite)+'</strong><p>'+esc(oppositeZh)+'</p></div></div>'+
    button('word','查看词条','secondary','data-word="'+word+'"')+'</article></div>';
}
function readView() {
  const list=window.WDExpressionReading;
  const [title,en,zh,scene]=list[calendarDay()%list.length];
  return '<article class="ex-card"><small>每日短读 · 原创</small><h3>'+esc(title)+'</h3><p lang="en">'+esc(en)+'</p><details><summary>查看译文</summary><p>'+esc(zh)+'</p></details>'+button('readScene','查看相关表达','secondary','data-id="'+scene+'"')+'</article>';
}
const titles={p:'短语卡',s:'句子卡',test:'表达测试',relay:'表达接力',notebook:'素材本',wrong:'表达错题本'};
function openPage(next, back='home') {
  page=next;
  returnPage=back;
  settingsOpen=false;
  render();
  if(next==='home') root.querySelector('[data-id="test"]')?.focus({preventScroll:true});
  else if(!root.querySelector('.ex-test-window[open]')) root.querySelector('.ex-stage-heading')?.focus({preventScroll:true});
}
function render() {
  const scroll=root.querySelector('.ex-stage')?.scrollTop||0;
  renderedDay=dayKey();
  const ready=Object.values(window.WILDWORDS?.data.encounters||{}).some(r=>r?.status==='ready');
  const encounter=ready?button('encounter','🐾 表达奇遇'):'';
  const testCenter=page==='testCenter';
  const existingCenter=root.querySelector('.ex-test-window');
  if(testCenter&&existingCenter?.open) {
    existingCenter.querySelector('.ex-test-window-body').innerHTML=test(true);
    return;
  }
  existingCenter?.close();
  if(page!=='home'&&!testCenter) {
    const body=page==='relay'?(themeRun().step<relaySteps?'<p class="ex-stage-topic">'+esc(scenes[themeScene()][0])+'</p>':'')+themeContent():
      page==='notebook'?notebook():page==='wrong'?wrongBook():page==='test'?test():learning();
    root.innerHTML='<div class="ex-stage"><div class="ex-stage-inner'+(page==='test'?' ex-test-shell':'')+'"><header class="ex-stage-bar">'+button('home',returnPage==='notebook'?'← 素材本':returnPage==='wrong'?'← 错题本':'← 表达')+
      '<h2 class="ex-stage-heading" tabindex="-1">'+(page==='test'?'WORDDAY / TEST':titles[page])+'</h2>'+encounter+'</header>'+body+'</div></div>';
    root.querySelector('.ex-stage').scrollTop=scroll;
    return;
  }
  const entries=[
    ['p','PHRASES','短语卡','学搭配，看例句','M7 13h16v13H7z M17 20h16v13H17z M7 18h10 M23 26h10'],
    ['s','SENTENCES','句子卡','读译文，拆主干','M10 9H30V33H10z M14 15h12 M14 21h12 M14 27h7'],
    ['test','PRACTICE','表达测试',quiz&&!quiz.finished?'继续上次测试':'检验短语、句意和句型','M8 12h7v7H8z M22 15h10 M8 24h7v7H8z M22 27h10 M8 26l3 3 6-8']
  ];
  const entry=([id,label,title,desc,path])=>button('tab',
    '<span class="ex-entry-copy"><small class="ex-entry-label" aria-hidden="true">'+label+'</small><b>'+title+'</b><span>'+desc+'</span></span>'+
    '<svg class="ex-entry-art" viewBox="0 0 40 40" aria-hidden="true"><path d="'+path+'"/></svg><i class="ex-entry-arrow" aria-hidden="true">↗</i>',
    'secondary ex-entry','data-id="'+id+'"');
  root.innerHTML='<header class="ex-header"><div><p class="ex-eyebrow">WORDDAY / EXPRESSIONS</p><h2>表达</h2><p>从一个场景，练到一句能用的话。</p></div></header>'+
    '<div class="ex-practice-entries"><section aria-labelledby="exLearnGroup"><h3 id="exLearnGroup">学习表达</h3><div class="ex-study-entries">'+entries.slice(0,2).map(entry).join('')+'</div></section>'+
    '<section aria-labelledby="exTestGroup"><h3 id="exTestGroup">检验掌握</h3>'+entry(entries[2])+'</section></div>'+
    '<section class="panel ex-theme"><div class="ex-theme-top"><div><p class="ex-eyebrow">每三天一题组</p><h3>'+esc(scenes[themeScene()][0])+'</h3></div>'+button('theme','表达接力','')+'</div>'+encounter+'</section>'+
    '<section class="panel ex-daily-reading">'+readView()+'</section>'+
    '<section class="panel ex-notebook-entry ex-wrong-entry"><div><p class="ex-eyebrow">REVIEW</p><h3>表达错题本</h3><p>'+Object.keys(data.wrong).length+' 条待复习</p></div>'+button('wrong','查看错题')+'</section>'+
    '<section class="panel ex-notebook-entry"><div><h3>素材本</h3><p>'+Object.keys(data.favorites).length+' 条收藏</p></div>'+button('notebook','查看收藏')+'</section>';
  if(testCenter) {
    const center=document.createElement('dialog');
    center.className='ex-dialog ex-test-window';
    center.setAttribute('aria-label','表达自由测试中心');
    center.innerHTML='<header class="ex-stage-bar">'+button('home','← 表达','secondary','autofocus')+
      '<h2 class="ex-stage-heading">WORDDAY / TEST</h2></header><div class="ex-test-window-body">'+test(true)+'</div>';
    center.addEventListener('cancel',ev=>{ev.preventDefault();openPage('home');});
    root.append(center);
    center.showModal();
  }
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
  dialog.onclick=null;
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
async function rewards(kind, mode='open', rewardDay=themeKey()) {
  if (busy) return;
  busy=true;
  const W = window.WILDWORDS, receiptKey = rewardDay+'/'+kind;
  try {
    const receipt = await locked(()=>{
      const raw = load(collectionKey,W.data);
      const claims = raw.expressionRewards ??= {};
      let receipt = claims[receiptKey];
      if (!receipt) {
        if(mode==='reveal'||data.themes[rewardDay]?.step<relaySteps||!data.themes[rewardDay]) throw new Error('Reward unavailable');
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
    if(mode==='reveal'&&!dialog.open) return;
    if (mode==='reveal') window.WD28CardFX?.sound('acquire');
    reveal(kind,receipt,rewardDay);
  } catch {
    openDialog('奖励暂未打开','<p>奖励读取或保存失败，请关闭后重试。</p>');
  } finally { busy=false; }
}
function reveal(kind,{ids,shown},rewardDay) {
  const W = window.WILDWORDS, left=ids.length-shown, last=W.animals.find(c=>c.id===ids[shown-1]);
  const art = `<div class="ex-pack" aria-hidden="true">
    <svg viewBox="0 0 220 260" fill="none">
      <g class="ex-pack-particles">
        <circle cx="30" cy="46" r="1.8"/><circle cx="185" cy="38" r="1.5"/>
        <circle cx="17" cy="89" r="2"/><circle cx="199" cy="81" r="2.2"/>
        <circle cx="30" cy="134" r="1.5"/><circle cx="191" cy="122" r="1.5"/>
        <circle cx="21" cy="172" r="2.2"/><circle cx="201" cy="163" r="1.8"/>
        <circle cx="32" cy="210" r="1.6"/><circle cx="190" cy="205" r="2"/>
      </g>
      <path class="ex-pack-body" d="M42 49H178V221Q178 232 167 232H53Q42 232 42 221Z"/>
      <path class="ex-pack-line" d="M53 215H167"/>
      <path class="ex-pack-mouth" d="M48 51L58 46L68 51L78 46L88 51L98 46L108 51L118 46L128 51L138 46L148 51L158 46L168 51L173 48"/>
      <text x="58" y="85" class="ex-pack-mark" font-size="9" font-weight="700" letter-spacing="2" font-family="system-ui">WORDDAY</text>
      <path class="ex-pack-mark" d="M110 105Q115 132 141 137Q115 142 110 169Q105 142 79 137Q105 132 110 105Z"/>
      <text x="58" y="200" class="ex-pack-mark" font-size="8" letter-spacing="1.9" font-family="system-ui">RELAY</text>
      <g class="ex-pack-strip">
        <path class="ex-pack-body" d="M53 29H167Q178 29 178 40V52H42V40Q42 29 53 29Z"/>
        <path class="ex-pack-line" d="M53 46H167" stroke-dasharray="2 3"/>
      </g>
    </svg></div>`;
  const sparks = '<div class="ex-sparks" aria-hidden="true">'+Array.from({length:14},(_,i)=>'<i style="--i:'+i+'">✦</i>').join('')+'</div>';
  const card = c => W.card(c,false,!!W.data.advanced[c.id],'');
  const action=shown?'翻开下一张':'拆开卡包';
  const tapTarget=left?' role="button" tabindex="0" aria-label="'+action+'"':'';
  openDialog(kind==='chest'?'主题卡包':'三张奖励卡','<div class="ex-reveal '+(last?'ex-flip':'')+'"'+tapTarget+'>'+(last?'<div class="ex-reward-card '+(shown===1?'ex-pack-first':'')+'">'+card(last)+'</div>'+sparks:art)+'</div>'+
    '<div class="ex-reward-foot">'+(left?'<span>轻点屏幕'+action+'</span>':'')+'<span>剩余卡牌 <b>'+left+'</b></span></div>'+
    (left?'':'<details class="ex-reward-summary"><summary>本次获得 · '+ids.length+' 张</summary><ul>'+ids.map(id=>{
      const a=W.animals.find(animal=>animal.id===id);
      return '<li data-rarity="'+a.rarity+'"><span class="ex-summary-emoji" aria-hidden="true">'+esc(a.emoji)+'</span><strong>'+esc(a.cn)+'</strong><small lang="en">'+esc(a.name)+'</small></li>';
    }).join('')+'</ul></details>'));
  if(!left) return;
  const surface=dialog.querySelector('.ex-reveal');
  surface.focus({preventScroll:true});
  let advancing=false;
  function advance(){
    if(advancing||!dialog.open) return;
    advancing=true;
    if(!shown){
      const pack=surface.querySelector('.ex-pack');
      pack?.classList.add('opening');
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('wd26-reduced');
      setTimeout(()=>{if(dialog.open&&surface.isConnected) rewards(kind,'reveal',rewardDay);},reduced?0:460);
    } else rewards(kind,'reveal',rewardDay);
  }
  dialog.onclick=ev=>{
    if(!ev.target.closest('button, summary, a')) advance();
  };
  surface.addEventListener('keydown',ev=>{
    if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();advance();}
  });

}
root.addEventListener('input',ev=>{
  if(ev.target.matches('.ex-reply textarea') && renderedDay===dayKey()) {
    themeRun().draft=ev.target.value;
    save(false);
  }
});
root.addEventListener('toggle',ev=>{
  if(ev.target.matches('.ex-settings')&&ev.target.isConnected) settingsOpen=ev.target.open;
},true);
root.addEventListener('change',ev=>{
  if (ev.target.closest('.ex-test-filters')) {
    quizPrefs[ev.target.name]=ev.target.value;
    data.quizPrefs={...quizPrefs}; save(false);
    quizError='';
    render();
    root.querySelector('.ex-test-filters [name="'+ev.target.name+'"]')?.focus();
    return;
  }

});
root.addEventListener('submit',ev=>{
  ev.preventDefault();
  if(ev.target.classList.contains('ex-reply') && renderedDay!==dayKey()) { render(); return; }
  if (ev.target.classList.contains('ex-filter-form')) {
    const filters=new FormData(ev.target);
    query=filters.get('q').trim().toLowerCase();
    exam=filters.get('exam'); source=filters.get('source'); sceneFilter=filters.get('scene');
    (data.learningFilters??={})[tab]={query,exam,source,scene:sceneFilter};
    save(false);
    current=null; position=0; context=[]; settingsOpen=false; render();
  } else if (ev.target.classList.contains('ex-reply') && themeRun().step===relaySteps-1) {
    const reply = new FormData(ev.target).get('reply').trim();
    const words=reply.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[];
    const sentences=reply.split(/[.!?]+/).filter(part=>(part.match(/[A-Za-z]+/g)||[]).length>=3);
    if(words.length<12||sentences.length<2) {
      ev.target.querySelector('[role=status]').textContent='请用句号、问号或感叹号分出至少两句，共写至少 12 个英文词。';
      ev.target.elements.reply.focus();
      return;
    }
    const run = themeRun();
    run.reply = reply;
    delete run.draft;
    run.step=relaySteps;
    event('themes');
    save(); render();
  }
});
root.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-ex]');
  if (!b) return;
  if(['themeChoice','rewardThree','chest'].includes(b.dataset.ex) && renderedDay!==dayKey()) { render(); return; }
  const c=byId.get(b.dataset.cardId)||byId.get(current)||studyPool()[Math.min(position,studyPool().length-1)];
  switch(b.dataset.ex) {
    case 'home': openPage(returnPage); break;
    case 'tab': tab=b.dataset.id; current=null; position=0; context=[]; if(tab!=='test')restoreLearningFilters(tab); openPage(tab==='test'?'testCenter':tab); break;
    case 'notebook': openPage('notebook'); break;
    case 'wrong': openPage('wrong'); break;
    case 'openWrong': {
      const item=byId.get(b.dataset.id);
      tab=item.kind; current=item.id; position=0; context=[]; exam=''; source='wrong'; query=''; sceneFilter='';
      openPage(tab,'wrong'); break;
    }
    case 'practiceWrong':
      quizPrefs.source='wrong'; quizPrefs.exam='';
      openPage('testCenter');
      break;
    case 'readScene': tab='p'; exam=''; source=''; query=''; sceneFilter=b.dataset.id; current=null; context=[]; position=0; openPage('p'); break;
    case 'theme': openPage('relay'); break;
    case 'themeChoice': {
      const run=themeRun(), q=run.questions[run.step];
      if(!q) break;
      const correct=q.options[Number(b.dataset.index)]===byId.get(q.id)[q.field];
      playFeedback(correct?'correct':'wrong');
      if(correct) { run.step++; save(false); render(); }
      else {
        b.disabled=true;
        b.classList.add('ex-incorrect');
        document.getElementById('exThemeFeedback').textContent='这个选项不合适。再看一下题干，试试其他选项。';
      }
      break;
    }
    case 'rewardThree': case 'chest': if(themeRun().step>=relaySteps) rewards(b.dataset.ex); break;
    case 'favorite': if(c) tagDialog(c); break;
    case 'tagSaved': tagDialog(byId.get(b.dataset.id)); break;
    case 'openSaved': {
      const saved=byId.get(b.dataset.id);
      tab=saved.kind; context=[]; current=saved.id; openPage(tab,'notebook'); break;
    }
    case 'context': context.push(c.id); showCard(byId.get(b.dataset.id)); break;
    case 'back': showCard(byId.get(context.pop())); break;
    case 'prev': current=null; position=Math.max(0,position-1); render(); break;
    case 'next': current=null; position++; render(); break;
    case 'learned':
      if (c) {
        // Capture the displayed card by stable ID, never by a stale list index.
        const before=studyPool();
        const index=before.findIndex(item=>item.id===c.id);
        const nextId=before[index+1]?.id || before[index-1]?.id || null;
        learned(c);
        if(context.length) {
          current=context.pop();
        } else {
          const after=studyPool();
          const nextIndex=nextId?after.findIndex(item=>item.id===nextId):-1;
          position=nextIndex>=0?nextIndex:Math.min(Math.max(0,index),Math.max(0,after.length-1));
          current=null;
          if(!after.length && source==='') toast('当前范围全部学习完成！');
        }
        render();
        root.querySelector('.ex-stage')?.scrollTo(0,0);
      }
      break;
    case 'word': showDetail(b.dataset.word); break;
    case 'listen': if (c) speak(c.en); break;
    case 'encounter': window.WILDWORDS?.encounter(); break;
    case 'startQuiz': if(!quiz||quiz.finished||window.confirm('开始新测试会结束当前测试。继续吗？')) startQuiz(b.dataset.id); break;
    case 'resumeQuiz': openPage('test'); break;
    case 'quizFavorite': tagDialog(quiz.questions[quiz.index].c); break;
    case 'saveQuiz':
      data.quizDraft=quiz;
      save(false);
      openPage('home');
      toast('测试已保存，可从表达测试继续');
      break;
    case 'answer': {
      const q=quiz.questions[quiz.index];
      if (q.answer!==null) break;
      q.answer=q.options[Number(b.dataset.index)];
      const correct=q.answer===q.correct;
      quiz.streak=correct?(quiz.streak||0)+1:0;
      playFeedback(correct?'correct':'wrong');
      if(correct) {
        event('correct'); delete data.wrong[q.c.id];
        const milestone=quiz.streak, activeQuiz=quiz;
        setTimeout(()=>{if(mainTab==='expressions'&&page==='test'&&quiz===activeQuiz&&!quiz.finished)window.WDShowStudyCombo?.(milestone);},400);
      }
      else data.wrong[q.c.id]=true;
      save(); render(); break;
    }
    case 'quizPrev': quiz.index--; if(!quiz.recorded)save(false); render(); break;
    case 'quizNext':
      if (quiz.index<quiz.questions.length-1) { quiz.index++; if(!quiz.recorded)save(false); }
      else {
        quiz.finished=true;
        if (!quiz.recorded) {
          quiz.recorded=true; delete data.quizDraft; event('tests'); playFeedback('finish');
          data.quizHistory.unshift({date:dayKey(),mode:quiz.mode,correct:quiz.questions.filter(q=>q.answer===q.correct).length,total:quiz.questions.length});
          data.quizHistory.length=Math.min(data.quizHistory.length,100);
          save();
        }
      }
      render(); break;
    case 'saveGoal': {const min=tab==='p'?7:3;const input=root.querySelector('#exGoal');const n=Number(input?.value);if(!Number.isInteger(n)||n<min||n>200){alert('每日目标需在 '+min+' 到 200 之间');break;}data.targets[tab]=n;save();render();break;}
    case 'reviewQuiz': quiz.finished=false; quiz.index=0; render(); break;
    case 'resetQuiz': quiz=null; delete data.quizDraft; save(false); openPage('testCenter'); break;
  }
});
window.WDExpressions={
  open(next='home') {
    const stage=document.getElementById('studyStage');
    if (stage?.classList.contains('active')) switchTab('learn');
    mainTab='expressions';
    updateNavPill();
    document.querySelector('.nav').style.display='none';
    document.querySelector('.hero').style.display='none';
    document.querySelectorAll('[data-main-tab]').forEach(b=>b.classList.toggle('active',b.dataset.mainTab==='expressions'));
    document.querySelectorAll('.wrap > .section').forEach(s=>s.classList.toggle('active',s===root));
    openPage(next);
    window.scrollTo(0,0);
  },
  fromWord(word) {
    const token = String(word).toLowerCase();
    const match = cards.find(c=>c.en.toLowerCase().match(/[a-z]+/g)?.includes(token));
    if (!match) return false;
    tab=match.kind; context=[]; current=match.id; this.open(tab);
    return true;
  },
  hasWord(word) { return cards.some(c=>c.en.toLowerCase().match(/[a-z]+/g)?.includes(String(word).toLowerCase())); },
  showEncounter() {
    if(mainTab!=='expressions' || root.querySelector('[data-ex="encounter"]')) return;
    (root.querySelector('.ex-stage-bar')||root.querySelector('.ex-theme-top'))?.insertAdjacentHTML('beforeend',button('encounter','🐾 表达奇遇'));
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
  goalProgress(day,kind) {return {done:new Set(data.dailyLearned[day]?.[kind]||[]).size,target:Math.max(kind==='p'?7:3,Number(data.targets[kind]||0))};},
  reviewCount(days) {return days.reduce((n,d)=>n+new Set(data.reviewDone[d]||[]).size,0);},
  totals(days) { return Object.fromEntries(['studied','correct','tests','themes'].map(k=>[k,days.reduce((n,d)=>n+(data.days[d]?.[k]||0),0)])); }
};
const exploration=document.createElement('details');
exploration.className='panel ex-word-exploration';
exploration.innerHTML='<summary>词汇探索</summary>'+exploreView();
document.getElementById('vocabularyCatalog')?.after(exploration);
exploration.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-ex]');
  if(b?.dataset.ex==='wordNode') {
    wordNode=Number(b.dataset.id);
    exploration.querySelector('.ex-map').outerHTML=exploreView();
    exploration.querySelector('[data-id="'+wordNode+'"]')?.focus();
  } else if(b?.dataset.ex==='word') showDetail(b.dataset.word);
});
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
