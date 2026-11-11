/* WORDDAY 3.2 — local-first communication practice. No simulated AI scoring. */
window.WDCreateExpressionStudio = function({root,data,save,event,esc,button,dayKey,speak,navigate,challengeComplete}) {
const lessons=window.WDExpressionStudioLessons||[];
const store=data.studio??={records:{},history:[],active:null,category:'',level:'',mode:'guided'};
store.records??={};store.history??=[];
let libraryQuery='',audioDb,recorder=null,stream=null,recordTimer=null,recordTarget=null,recordStarted=0,recordStopping=false,recorderPending=false,mountedPage='',lastView='',audioUrls=[];
const b=(action,text,secondary=false,extra='')=>'<button type="button" data-studio="'+action+'" class="'+(secondary?'secondary':'')+'" '+extra+'>'+text+'</button>';
const lesson=id=>lessons.find(l=>l.id===id);
const active=()=>store.active;
const currentLesson=()=>lesson(active()?.lessonId);
const due=()=>lessons.filter(l=>store.records[l.id]?.due&&store.records[l.id].due<=dayKey());
const currentTask=()=>{const a=active(),l=currentLesson();return a.phase==='transfer'?l.transfer:l.turns[a.index];};
const response=()=>{const a=active();if(a.phase==='transfer')return a.transfer??={draft:'',checks:[]};return a.answers[a.index]??={draft:'',checks:[]};};
const audioKey=()=>active().id+'/'+(active().phase==='transfer'?'transfer':active().index);
const wc=s=>(s.match(/[a-z]+(?:['’-][a-z]+)*/gi)||[]).length;
const tag=t=>'<span class="xs-chip">'+esc(t)+'</span>';
const levels=['起步 · 请求与确认','进阶 · 协商与解释','深入 · 论证与边界'];
function db(){if(!audioDb)audioDb=new Promise((resolve,reject)=>{if(!window.indexedDB){reject(new Error('不可用'));return;}const q=indexedDB.open('wordday_expression_audio_32',1);q.onupgradeneeded=()=>q.result.createObjectStore('clips');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});return audioDb;}
async function audioPut(k,blob){const d=await db();await new Promise((resolve,reject)=>{const t=d.transaction('clips','readwrite');t.objectStore('clips').put(blob,k);t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}
async function audioGet(k){const d=await db();return new Promise((resolve,reject)=>{const q=d.transaction('clips').objectStore('clips').get(k);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}
async function audioDelete(k){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('clips','readwrite');t.objectStore('clips').delete(k);t.oncomplete=resolve;t.onerror=()=>reject(t.error);});}
function stopRecording(){if(recorder?.state==='recording'&&!recordStopping){recordStopping=true;recorder.stop();}clearTimeout(recordTimer);stream?.getTracks().forEach(t=>t.stop());stream=null;}
function status(message){const n=root.querySelector('#xsStatus');if(n)n.textContent=message;}
function syncRecordingButtons(){const btn=root.querySelector('[data-studio="record"]');if(btn){btn.disabled=recorderPending||recordStopping;btn.textContent=recorderPending?'正在请求麦克风…':recorder?.state==='recording'?'■ 停止录音':'● 录一遍';}}
async function record(){
 if(recorderPending||recordStopping)return;
 if(recorder?.state==='recording'){stopRecording();syncRecordingButtons();return;}
 if(!isSecureContext||!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status('当前环境无法录音。请用 HTTPS 打开，或先大声说一遍，再输入你的表达。');return;}
 recorderPending=true;syncRecordingButtons();const a=active(),key=audioKey(),r=response();
 try {
  const acquired=await navigator.mediaDevices.getUserMedia({audio:true});
  if(active()!==a||audioKey()!==key||!mountedPage.startsWith('studio')){acquired.getTracks().forEach(t=>t.stop());return;}
  stream=acquired;const chunks=[];const type=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  const rec=recorder=new MediaRecorder(stream,type?{mimeType:type}:undefined);recordTarget=r;recordStarted=Date.now();
  rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  rec.onerror=()=>{stopRecording();status('录音中断，请重试或改用文字。');};
  rec.onstop=async()=>{window.WDExpressionAudioActive=false;try{const blob=new Blob(chunks,{type:rec.mimeType});const seconds=Math.round((Date.now()-recordStarted)/1000);if(seconds<2||blob.size<100){status('录音过短，请说完整后再停止。');return;}await audioPut(key,blob);r.audio=key;r.seconds=seconds;save(false);if(active()===a&&mountedPage==='studioPractice')navigate('studioPractice');}catch{status('录音未能保存，请改用文字；已有文字草稿保留。');}finally{recordStopping=false;recorder=null;recordTarget=null;syncRecordingButtons();}};
  rec.start();window.WDExpressionAudioActive=true;recordTimer=setTimeout(()=>{stopRecording();syncRecordingButtons();},90000);status('正在录音 · 最长 90 秒。只保存在此设备，不上传；文字备份不包含录音。');
 }catch(e){stream?.getTracks().forEach(t=>t.stop());stream=null;status(e.name==='NotAllowedError'?'未开启麦克风权限。可以继续用文字练习。':'无法启动麦克风，请重试或改用文字。');}
 finally{recorderPending=false;syncRecordingButtons();}
}
const groupCount=()=>new Set(store.history.map(h=>lesson(h.lessonId)?.category)).size;
function home(){
 const a=active()?.phase==='complete'?null:active(),next=a?lesson(a.lessonId):due()[0]||lessons.find(l=>!store.records[l.id])||lessons[0];
 return '<section class="xs-launch xs-glass"><div class="xs-launch-copy"><p class="ex-eyebrow">SAY SOMETHING REAL</p><h3>从看得懂，到说得出。</h3><p>选一个真实场景，回应追问，再换个条件说一遍。</p><div class="xs-tags">'+tag('5 类场景')+tag('21 组实练')+tag('文字 / 录音')+'</div></div><div class="xs-launch-action"><span class="xs-caption">'+(a?'继续未完成的练习':due().length?'今天该复练了':'今天试一试')+'</span><strong>'+esc(next.title)+'</strong>'+b(a?'resume':'start',a?'继续实练 →':'开始实练 →',false,'data-id="'+next.id+'"')+'</div><footer>'+b('library','全部情境 ↗',true)+b('review','间隔复练 · '+due().length,true)+b('journal','我的表达 · '+store.history.length,true)+'</footer></section>';
}
function shellHead(kicker,title,desc){return '<div class="xs-page-title"><p class="ex-eyebrow">'+kicker+'</p><h2>'+title+'</h2><p>'+desc+'</p></div>';}
function library(){
 const subset=lessons.filter(l=>(!store.category||l.category===store.category)&&(!store.level||String(l.level)===store.level)&&(!libraryQuery||(l.title+l.brief+l.category).includes(libraryQuery)));
 return shellHead('REAL-LIFE LAB','情境实练','一次练一件事。用词不必和参考答案相同，把意思说明白更重要。')+
 '<form class="xs-library-form xs-glass"><label>场景<select name="category" class="field">'+['','大学生活','学术讨论','职场沟通','社会议题','日常口语'].map(x=>'<option '+(x===store.category?'selected':'')+' value="'+x+'">'+(x||'全部场景')+'</option>').join('')+'</select></label><label>练习深度<select name="level" class="field"><option value="">全部深度</option>'+levels.map((t,i)=>'<option value="'+(i+1)+'" '+(String(i+1)===store.level?'selected':'')+'>'+t+'</option>').join('')+'</select></label><label class="xs-search">找一个你会遇到的场景<input name="query" class="field" placeholder="如：实习、答疑、室友" value="'+esc(libraryQuery)+'"></label><button type="submit">确定</button></form>'+
 '<p class="xs-caption">'+subset.length+' 个场景 · 全部为原创情境练习</p><div class="xs-lesson-grid">'+subset.map(l=>{const r=store.records[l.id];return '<article class="xs-lesson xs-glass"><div class="xs-tags">'+tag(l.category)+tag(levels[l.level-1].split(' · ')[0])+'</div><h3>'+esc(l.title)+'</h3><p>'+esc(l.brief)+'</p><small>'+(r?'练过 '+r.sessions+' 次 · '+(r.due<=dayKey()?'可复练':'下次 '+r.due):'3 轮互动 + 1 次迁移')+'</small>'+b('start',r?'换个说法，再练一遍 ↗':'进入情境 ↗',false,'data-id="'+l.id+'"')+'</article>';}).join('')+'</div>'+(subset.length?'':'<p class="ex-empty">没有匹配情境。试试更简短的关键词。</p>');
}
function start(id,review=false,challenge=false){
 if(recording())return;
 const l=lesson(id);if(!l)return;
 if(active()&&active().phase!=='complete'&&active().lessonId===id){navigate('studioPractice');return;}
 if(active()&&active().phase!=='complete'&&!window.confirm('当前实练尚未完成。开始另一场会替换当前草稿，已完成的表达记录会保留。'))return;
 store.active={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),lessonId:id,phase:'brief',index:0,answers:[],mode:review||challenge?'challenge':store.mode||'guided',review,started:Date.now()};save(false);navigate('studioPractice');
}
function recording(){if(recorderPending||recorder?.state==='recording'||recordStopping){status('请先停止录音并等待保存。');return true;}return false;}
function header(l){const a=active(),step=a.phase==='brief'?0:a.phase==='intent'?1:a.phase==='turn'?2+a.index:a.phase==='transfer'?5:6;return '<div class="xs-lesson-heading"><div class="xs-tags">'+tag(l.category)+tag(a.review?'闭卷复练':a.mode==='guided'?'支架练习':'独立挑战')+'</div><h2>'+esc(l.title)+'</h2><div class="xs-route" aria-label="练习阶段">'+['理解','回应','追问','收束','迁移'].map((t,i)=>'<span class="'+(step===i+1?'active':step>i+1?'done':'')+'">'+t+'</span>').join('')+'</div></div>';}
function practice(){const a=active(),l=currentLesson();if(!a||!l)return library();
 if(a.phase==='complete')return complete(l);
 let body=header(l);
 if(a.phase==='brief')return body+'<section class="xs-brief xs-glass"><p class="ex-eyebrow">THE SITUATION</p><h3>你现在遇到了这件事</h3><p>'+esc(l.brief)+'</p><div class="xs-note"><b>你的角色</b><p>'+esc(l.role)+'</p></div><fieldset class="xs-mode"><legend>这次怎么练</legend><label><input type="radio" name="xsMode" value="guided" '+(a.mode==='guided'?'checked':'')+'> 有支架 <small>可查搭配，先说再看参考</small></label><label><input type="radio" name="xsMode" value="challenge" '+(a.mode==='challenge'?'checked':'')+'> 独立挑战 <small>不先看搭配，练主动提取</small></label></fieldset>'+b('begin','进入对话 →')+'<p class="xs-caption">可随时保存退出。不考生僻词；打开搭配或参考后仍可完成，但不计作独立复练。</p></section>';
 if(a.phase==='intent'){
  if(!a.intentOptions){a.intentOptions=[l.intent,...l.wrong].map((t,i)=>({t,correct:i===0}));for(let i=3;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a.intentOptions[i],a.intentOptions[j]]=[a.intentOptions[j],a.intentOptions[i]];}save(false);}
  return body+'<section class="xs-glass xs-question"><p class="ex-eyebrow">READ THE ROOM</p><h3>这次沟通，最需要完成什么？</h3><p>'+esc(l.brief)+'</p><div class="ex-options">'+a.intentOptions.map((o,i)=>b('intent',esc(o.t),true,'data-index="'+i+'" '+(a.intentDone?'disabled':''))).join('')+'</div>'+(a.intentDone?'<div class="xs-note" role="status"><b>沟通目标</b><p>'+esc(l.why)+'</p></div>'+b('toTurns','开始回应 →'):'<p id="xsStatus" role="status" class="xs-caption"></p>')+'</section>';
 }
 const t=currentTask(),r=response(),transfer=a.phase==='transfer';
 const cue=transfer?'换一个条件，你还能自己组织吗？':'对方说';
 const previous=!transfer&&a.index>0?a.answers[a.index-1]:null;
 return body+(previous?'<details class="xs-transcript xs-glass"><summary>上一轮你说过什么</summary><p lang="en">'+esc(previous.draft||'已录音作答')+'</p></details>':'')+
 '<section class="xs-turn xs-glass"><div class="xs-meta"><span class="ex-eyebrow">'+(transfer?'TRANSFER':'CONVERSATION · '+(a.index+1)+' / 3')+'</span>'+(!transfer?b('listen','▷ 听对方说',true):'')+'</div><small class="xs-caption">'+cue+'</small>'+
 (!transfer?'<blockquote lang="en">'+esc(t.npc)+'</blockquote>':'')+'<div class="xs-task"><b>你的任务</b><p>'+esc(t.task)+'</p></div>'+
 (a.mode==='guided'&&!transfer?'<details class="xs-chunks" '+(r.help?'open':'')+'><summary>需要时看搭配，不用照抄整句</summary>'+l.chunks.map(c=>'<div><b lang="en">'+esc(c.en)+'</b><span>'+esc(c.zh)+'</span><small>'+esc(c.use)+'</small></div>').join('')+'</details>':'')+
 '<form class="xs-response"><label for="xsDraft">先自己说或写，再看参考</label><textarea id="xsDraft" name="draft" class="field" maxlength="1600" placeholder="用你自己的英语完成任务。不需要逐字翻译中文。">'+esc(r.draft||'')+'</textarea><div class="xs-composer-bar"><span id="xsWordCount">'+wc(r.draft||'')+' 词 · 草稿自动保存</span>'+b('record','● 录一遍',true)+'</div>'+(r.audio?'<div class="xs-audio"><audio controls preload="metadata" data-audio="'+esc(r.audio)+'" aria-label="回听自己的表达"></audio>'+b('exportAudio','保存录音',true,'data-id="'+esc(r.audio)+'"')+b('deleteAudio','删除录音',true)+'</div>':'')+'<p id="xsStatus" role="status" aria-live="polite" class="xs-caption"></p>'+
 (!r.submitted?'<button type="submit">完成这一版 · 对照反馈</button>':'<button type="submit" class="secondary">用修改后的表达重新对照</button>')+'</form>'+
 (r.submitted?feedback(t,r):'')+'</section><footer class="xs-session-foot">'+b('pause','保存并退出',true)+'<span>模拟对话 · 预设追问</span></footer>';
}
function feedback(t,r){const a=active();return '<section class="xs-feedback"><p class="ex-eyebrow">COMPARE & REVISE</p><h3>检查意思，再打磨表达。</h3><p class="xs-caption">下面是信息线索检查，不是语法、语音或语义评分。不同说法也可能成立，请按真实内容自检。</p><div class="xs-checklist">'+t.checks.map((c,i)=>{let detected=false;try{detected=new RegExp(c.pattern,'i').test(r.draft||'');}catch{}return '<label><input type="checkbox" data-xs-check="'+i+'" '+(r.checks?.includes(i)?'checked':'')+'><span><b>'+esc(c.label)+'</b><small>'+(detected?'发现相关词，请确认意思表达准确':r.audio&&!r.draft?'回听后自行核对':'暂未发现相关词，换种说法也可能成立')+'</small></span></label>';}).join('')+'</div><details class="xs-model" '+(r.modelOpen?'open':'')+'><summary>看一种自然说法与表达思路</summary><p lang="en">'+esc(t.model)+'</p>'+b('modelListen','▷ 听参考',true)+'<p>'+esc(t.note||'条件变了，信息也要一起变。先让对方知道你的目的，再补必要细节。')+'</p></details><div class="xs-edit-note"><b>再说一遍会改什么？</b><input class="field" data-xs-note value="'+esc(r.note||'')+'" maxlength="240" placeholder="例如：把请求的时间说具体一点"></div>'+b('advance',a.phase==='transfer'?'完成实练 →':a.index===2?'换个场景条件 →':'进入下一轮 →',false,r.dirty?'disabled':'')+'<p class="xs-caption">未勾选的项目会保留为复练重点。参考不是唯一正确答案。</p></section>';}
function complete(l){const a=active(),h=store.history.find(h=>h.id===a.id);return '<section class="xs-complete xs-glass"><p class="ex-eyebrow">A CONVERSATION, COMPLETED</p><div class="xs-complete-mark" aria-hidden="true">❝</div><h2>这次，你把话说出来了。</h2><p>'+esc(l.title)+' · 3 轮互动与 1 次迁移</p><div class="xs-summary-grid"><div><b>'+((h?.answers||[]).filter(r=>r.draft||r.audio).length)+'</b><span>主动表达</span></div><div><b>'+esc(store.records[l.id]?.due||'明天')+'</b><span>下次不看参考再练</span></div></div><p class="xs-note">'+(h?.independent?'你自评已完成各项沟通任务，并未打开参考。后续复练会逐步拉长间隔。':'本次用过提示或还有信息缺口。已记录，下一次继续练熟。')+'</p>'+(a.challengeReward?b('relayRewards','领取本期接力奖励 →'):'')+b('journal','查看我的表达 →')+b('library','换个生活场景',true)+'<p class="xs-caption">完成次数代表练习量，不等于已达到某个口语等级。</p></section>';}
function finish(){const a=active(),l=currentLesson();if(store.history.some(h=>h.id===a.id)){a.phase='complete';save(false);navigate('studioPractice');return;}
 const answers=[...a.answers,a.transfer],independent=answers.every((r,i)=>r&&r.checks?.length===(i===3?l.transfer:l.turns[i]).checks.length&&!r.modelOpen&&!r.help);
 const prior=store.records[l.id]||{sessions:0,level:0};const eligible=a.review&&prior.due<=dayKey()&&prior.last!==dayKey();
 const level=eligible&&independent?Math.min(4,prior.level+1):!independent?0:prior.level;
 const date=new Date(dayKey()+'T12:00:00');date.setDate(date.getDate()+[1,3,7,14,30][level]);const dueDate=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
 store.records[l.id]={sessions:prior.sessions+1,level,last:dayKey(),due:eligible||!prior.due||!independent?dueDate:prior.due};
 store.history.unshift({id:a.id,lessonId:l.id,date:dayKey(),answers:JSON.parse(JSON.stringify(answers)),independent,review:a.review,star:false});
 if(a.relayKey)a.challengeReward=challengeComplete(a.relayKey,l.id);
 a.phase='complete';event('sessions');if(eligible&&independent)event('recalled');save();try{playFeedback('finish');}catch{}navigate('studioPractice');
}
function reviews(){const queue=due();return shellHead('SPACED RETRIEVAL','隔几天，再自己说一遍。','今天的复练先隐藏提示和参考。1、3、7、14、30 天逐步拉开间隔；能否独立完成由你诚实自检。')+'<section class="xs-glass xs-review-state"><b>'+queue.length+'</b><span>个到期情境</span><p>做过选择题不等于会表达。复练时换自己的说法，优先解决上次没说清的信息。</p></section><div class="xs-lesson-grid">'+queue.map(l=>{const h=store.history.find(h=>h.lessonId===l.id);return '<article class="xs-glass xs-lesson">'+tag(l.category)+'<h3>'+esc(l.title)+'</h3><p>'+esc(h?.answers.flatMap((r,i)=>((i===3?l.transfer:l.turns[i]).checks||[]).filter((_,j)=>!r.checks?.includes(j)).map(c=>c.label)).slice(0,3).join(' · ')||'换一种说法完成同样的沟通任务')+'</p>'+b('reviewStart','不看提示，再练一次','', 'data-id="'+l.id+'"')+'</article>';}).join('')+'</div>'+(!queue.length?'<section class="xs-glass xs-empty"><h3>今天没有到期复练</h3><p>完成一次情境实练后，这里会出现复练安排。</p>'+b('library','先选一个场景 →')+'</section>':'');}
function journal(){return shellHead('YOUR OWN WORDS','我的表达','把练习留下来。回听、看修改、再组织一次，比收集更多漂亮句子更重要。')+'<div class="xs-journal-stats"><span>'+store.history.length+' 次实练</span><span>'+groupCount()+' / 5 类场景</span><span>'+store.history.filter(h=>h.review&&h.independent).length+' 次独立复练自评</span></div>'+(store.history.length?store.history.map(h=>{const l=lesson(h.lessonId);if(!l)return '';return '<details class="xs-journal-item xs-glass" '+(h.star?'open':'')+'><summary><span><b>'+esc(l.title)+'</b><small>'+esc(h.date)+' · '+(h.review?'复练':'实练')+(h.star?' · 已标记':'')+'</small></span></summary><div class="xs-journal-body">'+b('star',h.star?'★ 取消重点':'☆ 标为重点',true,'data-id="'+h.id+'"')+h.answers.map((r,i)=>'<section><small>'+['回应','追问','收束','迁移'][i]+'</small><h4>'+esc((i===3?l.transfer:l.turns[i]).task)+'</h4><blockquote lang="en">'+esc(r.draft||'录音作答')+'</blockquote>'+(r.first&&r.first!==r.draft?'<details><summary>对照最初一版</summary><p lang="en">'+esc(r.first)+'</p></details>':'')+(r.audio?'<audio controls preload="none" data-audio="'+esc(r.audio)+'" aria-label="回听这次表达"></audio>'+b('exportAudio','保存这段录音',true,'data-id="'+esc(r.audio)+'"'):'')+(r.note?'<p class="xs-note">下次改进：'+esc(r.note)+'</p>':'')+'</section>').join('')+b('copy','复制本次文字',true,'data-id="'+h.id+'"')+b('start','重新练这个情境',false,'data-id="'+l.id+'"')+'</div></details>';}).join(''):'<section class="xs-glass xs-empty"><h3>这里留给你自己的句子。</h3><p>完成情境实练后，文字、修改和录音都会在这里。</p>'+b('library','去做第一次实练 →')+'</section>')+'<p class="xs-caption">文字随学习备份导出；录音仅存此浏览器，备份文件不包含音频。</p>'+b('clearAudio','删除所有本地实练录音',true);}
root.addEventListener('input',e=>{if(e.target.matches('#xsDraft')){const r=response();r.draft=e.target.value;if(r.submitted){r.dirty=true;r.checks=[];const next=root.querySelector('[data-studio=advance]');if(next)next.disabled=true;root.querySelectorAll('[data-xs-check]').forEach(c=>c.checked=false);status('修改已保存。请重新对照反馈，再继续下一轮。');}save(false);const counter=root.querySelector('#xsWordCount');if(counter)counter.textContent=wc(r.draft)+' 词 · 草稿自动保存';}if(e.target.matches('[data-xs-note]')){response().note=e.target.value;save(false);}});
root.addEventListener('change',e=>{if(e.target.matches('[data-xs-check]')){const r=response(),i=Number(e.target.dataset.xsCheck);r.checks=r.checks.filter(x=>x!==i);if(e.target.checked)r.checks.push(i);save(false);}if(e.target.name==='xsMode'){active().mode=e.target.value;store.mode=e.target.value;save(false);}});
root.addEventListener('toggle',e=>{if(!e.target.isConnected||!active()||!['turn','transfer'].includes(active().phase))return;if(e.target.matches('.xs-model')&&e.target.open){response().modelOpen=true;save(false);}if(e.target.matches('.xs-chunks')&&e.target.open){response().help=true;save(false);}},true);
root.addEventListener('submit',e=>{if(e.target.matches('.xs-library-form')){e.preventDefault();const f=new FormData(e.target);store.category=f.get('category');store.level=f.get('level');libraryQuery=f.get('query').trim();save(false);navigate('studio');}if(e.target.matches('.xs-response')){e.preventDefault();if(recording())return;const r=response();r.draft=e.target.elements.draft.value.trim();if(!r.audio&&wc(r.draft)<6){status('请至少写 6 个英文词，或先录一段完整回应。词数只用于避免空提交，不代表质量。');return;}r.first??=r.draft;r.submitted=true;r.dirty=false;r.checks=[];save(false);navigate('studioPractice');root.querySelector('.xs-feedback')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}});
root.addEventListener('click',async e=>{const btn=e.target.closest('[data-studio]');if(!btn)return;const k=btn.dataset.studio;
 if(!['record'].includes(k)&&recording())return;
 if(k==='relayStart'){start(btn.dataset.id,false,true);if(active()?.lessonId===btn.dataset.id&&active().phase!=='complete'){active().relayKey=btn.dataset.period;save(false);}}
 if(k==='relayRewards')navigate('relay');
 if(k==='library')navigate('studio');if(k==='review')navigate('studioReview');if(k==='journal')navigate('studioJournal');if(k==='start')start(btn.dataset.id);if(k==='reviewStart')start(btn.dataset.id,true);if(k==='resume')navigate('studioPractice');
 if(k==='begin'){active().phase='intent';save(false);navigate('studioPractice');}
 if(k==='intent'){const a=active(),o=a.intentOptions[Number(btn.dataset.index)];if(!o.correct){status('再想一步：对方需要哪些具体信息，才能和你一起作决定？');btn.disabled=true;try{playFeedback('wrong');}catch{}}else{a.intentDone=true;save(false);navigate('studioPractice');}}
 if(k==='toTurns'){active().phase='turn';save(false);navigate('studioPractice');}
 if(k==='listen')speak(currentTask().npc);if(k==='modelListen')speak(currentTask().model);
 if(k==='record')await record();
 if(k==='exportAudio'){try{const blob=await audioGet(btn.dataset.id);if(!blob)throw new Error('missing');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='WORDDAY-expression-'+btn.dataset.id.replace(/[^a-z0-9-]/gi,'-')+(blob.type.includes('mp4')?'.m4a':'.webm');link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}catch{btn.textContent='录音无法读取';}}
 if(k==='deleteAudio'){const r=response();await audioDelete(r.audio).catch(()=>{});delete r.audio;delete r.seconds;save(false);navigate('studioPractice');}
 if(k==='advance'){const a=active(),r=response();if(!r.submitted||r.dirty)return;if(a.phase==='transfer')finish();else{if(a.index===2)a.phase='transfer';else a.index++;save(false);navigate('studioPractice');}}
 if(k==='pause'){save(false);navigate('home');}
 if(k==='star'){const h=store.history.find(h=>h.id===btn.dataset.id);if(h){h.star=!h.star;save(false);navigate('studioJournal');}}
 if(k==='copy'){const h=store.history.find(h=>h.id===btn.dataset.id);try{await navigator.clipboard.writeText(lesson(h.lessonId).title+'\n'+h.answers.map(r=>r.draft||'[录音]').join('\n\n'));btn.textContent='已复制';}catch{btn.textContent='请长按文字复制';}}
 if(k==='clearAudio'&&confirm('删除此设备上的全部实练录音？文字、学习进度和修改记录会保留。')){try{const d=await db();await new Promise((resolve,reject)=>{const t=d.transaction('clips','readwrite');t.objectStore('clips').clear();t.oncomplete=resolve;t.onerror=reject;});for(const h of store.history)for(const r of h.answers)delete r.audio;if(active()){for(const r of active().answers)delete r.audio;if(active().transfer)delete active().transfer.audio;}save(false);navigate('studioJournal');}catch{btn.textContent='未能删除，请重试';}}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopRecording();});
window.addEventListener('pagehide',stopRecording);
new MutationObserver(()=>{if(!root.classList.contains('active'))stopRecording();}).observe(root,{attributes:true,attributeFilter:['class']});
return {home,view:p=>p==='studio'?library():p==='studioReview'?reviews():p==='studioJournal'?journal():practice(),
 mounted(p){mountedPage=p;for(const u of audioUrls)URL.revokeObjectURL(u);audioUrls=[];if(!p.startsWith('studio'))stopRecording();const stage=root.querySelector('.ex-stage');const signature=p==='studioPractice'?p+'/'+active()?.phase+'/'+active()?.index:p;if(lastView!==signature&&stage)stage.scrollTop=0;lastView=signature;root.querySelectorAll('audio[data-audio]').forEach(async el=>{try{const blob=await audioGet(el.dataset.audio);if(blob&&el.isConnected){const u=URL.createObjectURL(blob);audioUrls.push(u);el.src=u;}else if(el.isConnected)el.outerHTML='<p class="xs-caption">此设备没有这段录音，文字记录仍保留。</p>';}catch{if(el.isConnected)el.outerHTML='<p class="xs-caption">录音暂时无法读取，文字记录仍保留。</p>';}});syncRecordingButtons();},
 stats:()=>({sessions:store.history.length,recalled:store.history.filter(h=>h.review&&h.independent).length}),
 guard:()=>!recording(),
};
};
