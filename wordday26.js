/* WORDDAY 2.6.1: progressive UI enhancements, preserving existing localStorage keys. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const prefKey='wordday_26_preferences';let prefs={ambient:false,volume:12,reduced:false};try{prefs={...prefs,...JSON.parse(localStorage.getItem(prefKey)||'{}')}}catch{}
const savePrefs=()=>{try{localStorage.setItem(prefKey,JSON.stringify(prefs))}catch{}};
const personal=$('personal');const shortcuts=$('personalShortcuts');
const settings=document.createElement('section');settings.id='wd26Settings';settings.className='panel wd26-settings';settings.hidden=true;
settings.innerHTML='<div class="panel-head"><h2>设置 <span class="wd26-english">/ SETTINGS</span></h2><button class="secondary" id="wd26SettingsBack" aria-label="返回个人" title="返回个人">←</button></div><div id="wd26SettingsContent"></div>';
shortcuts?.after(settings);
const settingsButton=document.createElement('button');settingsButton.className='secondary';settingsButton.id='wd26SettingsOpen';settingsButton.textContent='⚙ 设置';const settingsEntry=document.createElement('div');settingsEntry.className='wd263-settings-entry';settingsEntry.append(settingsButton);shortcuts?.after(settingsEntry);
const settingsContent=$('wd26SettingsContent');
function movePanel(el,title){if(!el)return;const wrap=document.createElement('div');wrap.className='wd26-setting-group';wrap.innerHTML=`<h3>${title}</h3>`;settingsContent.append(wrap);wrap.append(el)}
const themePanel=document.querySelector('[data-theme-choice]')?.closest('.panel');
const feedbackPanel=$('soundEnabled')?.closest('.panel');
const studio=$('wd24ThemeStudio');
movePanel(feedbackPanel,'交互与反馈');movePanel(themePanel,'主题配色');movePanel(studio,'主题工作室');
const audio=document.createElement('div');audio.className='wd26-setting-group';audio.innerHTML=`<h3>声音与反馈 <small>SOUND EFFECTS</small></h3><p class="smallnote">已移除所有主题背景音乐，保留学习交互音效、海洋音色及测试连击音效。可在上方「交互与反馈」调节音效。</p><div class="wd26-setting-line"><div><strong>减少动画</strong><p>降低界面运动强度</p></div><input id="wd26Reduced" type="checkbox"></div>`;settingsContent.append(audio);
const backup=document.createElement('div');backup.className='wd26-setting-group';backup.innerHTML='<h3>数据与备份</h3><p class="smallnote">保存当前设备的学习记录、个人资料和萌物收藏。</p><div class="tools"><button id="wd26Export">导出备份</button><button class="secondary" id="wd26Import">导入备份</button><input type="file" id="wd26ImportFile" accept="application/json,.json" hidden></div>';settingsContent.append(backup);
function openSettings(){document.querySelectorAll('#personal > .panel').forEach(el=>{if(el!==settings)el.dataset.wd26Hidden=el.style.display,el.style.display='none'});settings.hidden=false;settings.style.display='block';window.scrollTo({top:0,behavior:'smooth'})}
function closeSettings(){settings.hidden=true;settings.style.display='none';document.querySelectorAll('#personal > .panel').forEach(el=>{if(el!==settings&&el.dataset.wd26Hidden!==undefined){el.style.display=el.dataset.wd26Hidden;delete el.dataset.wd26Hidden}})}
settingsButton.onclick=openSettings;$('wd26SettingsBack').onclick=closeSettings;
document.querySelectorAll('[data-main-tab]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.mainTab!=='personal')closeSettings()}));
// Repair Safari range gestures, provide live visible feedback.
for(const range of document.querySelectorAll('#wd24Motion,#soundVolume,#wd26Volume')){range.style.touchAction='pan-x';range.addEventListener('input',()=>{range.style.setProperty('--range-pct',((range.value-range.min)/(range.max-range.min)*100)+'%');if(range.id==='wd24Motion'){$('wd26MotionOut')?.replaceChildren(document.createTextNode(range.value+'%'));document.documentElement.style.setProperty('--wd26-motion-factor',String(Number(range.value)/100))}});range.dispatchEvent(new Event('input'))}
const motion=$('wd24Motion');if(motion){const out=document.createElement('output');out.id='wd26MotionOut';out.textContent=motion.value+'%';motion.after(out)}
// 2.6.2: Background music removed permanently; old preferences migrated safely.
prefs.ambient=false;savePrefs();$('wd26Reduced').checked=prefs.reduced;
$('wd26Reduced').onchange=e=>{prefs.reduced=e.target.checked;document.documentElement.classList.toggle('wd26-reduced',prefs.reduced);savePrefs()};document.documentElement.classList.toggle('wd26-reduced',prefs.reduced);
// User-owned JSON backup with explicit confirmation before replacement.
$('wd26Export').onclick=()=>{const obj={format:'WORDDAY-BACKUP',version:'2.6',created:new Date().toISOString(),entries:{}};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&(/wordday|wildwords|wd23|wd24/i).test(key))obj.entries[key]=localStorage.getItem(key)}const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='WORDDAY_backup_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
$('wd26Import').onclick=()=>$('wd26ImportFile').click();$('wd26ImportFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>5e6)throw Error('备份文件过大');const obj=JSON.parse(await file.text());if(obj.format!=='WORDDAY-BACKUP'||!obj.entries||typeof obj.entries!=='object')throw Error('不是有效的 WORDDAY 备份');if(!confirm('导入将覆盖当前设备的对应学习数据。建议先导出当前备份。确定继续吗？'))return;for(const [key,val] of Object.entries(obj.entries)){if((/wordday|wildwords|wd23|wd24/i).test(key)&&typeof val==='string')localStorage.setItem(key,val)}location.reload()}catch(err){alert('导入失败：'+err.message)}};
// Birthday and introduction are private local profile fields.
const modal=$('profileModal');const saveProfile=$('saveProfile');const birthday=document.createElement('div');birthday.innerHTML='<label class="smallnote" for="wd26Birthday">生日（选填 · 默认不公开）</label><input id="wd26Birthday" type="date" class="field" style="width:100%;margin:7px 0 12px"><label class="smallnote" for="wd26Bio">一句自我介绍（选填）</label><textarea id="wd26Bio" class="field" maxlength="120" rows="2" style="width:100%;margin:7px 0 12px" placeholder="分享一点关于自己……"></textarea>';
saveProfile?.before(birthday);
function fillProfile(){let data={};try{data=JSON.parse(localStorage.getItem('wordday_26_profile')||'{}')}catch{}$('wd26Birthday').value=data.birthday||'';$('wd26Bio').value=data.bio||''}
$('editProfile')?.addEventListener('click',fillProfile);saveProfile?.addEventListener('click',()=>{localStorage.setItem('wordday_26_profile',JSON.stringify({birthday:$('wd26Birthday').value,bio:$('wd26Bio').value.trim()}))});
// First-time introduction appears between splash and daily cards.
let onboardingActive=false;
window.wordday26BeforeDaily=(next)=>{if(localStorage.getItem('wordday_26_intro_done')){next();return}if(onboardingActive)return;onboardingActive=true;
const layer=document.createElement('div');layer.className='wd26-intro';layer.innerHTML=`<section class="wd26-intro-card" role="dialog" aria-modal="true" aria-label="介绍一下你自己"><div class="wd26-kicker">WORDDAY / HELLO THERE</div><h2>介绍一下你自己。</h2><p>每一段学习旅程，都从认识自己开始。</p><label>昵称<input id="wd26IntroName" maxlength="20" placeholder="你的昵称"></label><label>头像（选填）<input id="wd26IntroAvatar" type="file" accept="image/*"></label><label>生日（选填）<input id="wd26IntroBirth" type="date"></label><label>自我介绍（选填）<textarea id="wd26IntroBio" maxlength="120" rows="2" placeholder="写一点关于自己……"></textarea></label><p class="wd26-intro-tip">头像可在「个人 → 编辑资料」中选择预设、萌物头像或上传图片。生日默认不公开。</p><button id="wd26IntroSave">开启我的 WORDDAY</button><button id="wd26IntroSkip" class="secondary">稍后填写</button></section>`;document.body.append(layer);
let introAvatar='';$('wd26IntroAvatar').onchange=ev=>{const file=ev.target.files?.[0];if(!file||file.size>8e6){if(file)alert('请选择小于8MB的图片');return}const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=160;const ctx=c.getContext('2d');const m=Math.min(img.width,img.height);ctx.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,160,160);introAvatar=c.toDataURL('image/jpeg',.75);URL.revokeObjectURL(url)};img.src=url};
function finish(save){if(save){const name=$('wd26IntroName').value.trim();if(name){const n=$('nicknameInput');if(n)n.value=name;const original=localStorage.getItem('wordday_v1');try{if(original){const st=JSON.parse(original);st.profile=st.profile||{};st.profile.name=name;if(introAvatar)st.profile.avatar=introAvatar;localStorage.setItem('wordday_v1',JSON.stringify(st))}}catch{}}if(introAvatar){try{const st=JSON.parse(localStorage.getItem('wordday_v1')||'{}');st.profile=st.profile||{};st.profile.avatar=introAvatar;localStorage.setItem('wordday_v1',JSON.stringify(st))}catch{}}localStorage.setItem('wordday_26_profile',JSON.stringify({birthday:$('wd26IntroBirth').value,bio:$('wd26IntroBio').value.trim()}))}localStorage.setItem('wordday_26_intro_done','1');layer.remove();onboardingActive=false;next()}
$('wd26IntroSave').onclick=()=>finish(true);$('wd26IntroSkip').onclick=()=>finish(false);
};
// Isolated quiz viewport without disturbing existing quiz logic.
const quiz=$('quiz');const quizPlay=$('quizPlay');const quizResult=$('quizResult');const quizReady=$('quizReady');
if(quiz){const exit=document.createElement('button');exit.className='secondary wd26-quiz-exit';exit.textContent='← 返回测试中心';quizPlay?.prepend(exit);exit.onclick=()=>{if(!confirm('返回测试中心？可以使用“保存并退出测试”保留当前进度。'))return;quizPlay.style.display='none';quizReady.style.display='block';document.body.classList.remove('wd26-quiz-focus')};const observer=new MutationObserver(()=>{const active=quizPlay?.style.display==='block'||quizResult?.style.display==='block';document.body.classList.toggle('wd26-quiz-focus',active&&quiz.classList.contains('active'));void 0});observer.observe(quizPlay,{attributes:true,attributeFilter:['style']});observer.observe(quizResult,{attributes:true,attributeFilter:['style']});document.querySelectorAll('[data-tab],[data-main-tab]').forEach(b=>b.addEventListener('click',()=>{if(!quiz.classList.contains('active'))document.body.classList.remove('wd26-quiz-focus')}))}
// Keep floating navigation behavior; smooth transitions are CSS-only.
const version=$('wd24Version');if(version)version.textContent='WORDDAY 2.6.4 · Wildwords Refinement';document.querySelector('.brand small')?.replaceChildren(document.createTextNode('2.6 · WILDWORDS'));
})();

/* 2.6.1 · refined tactile feedback; preserve original ocean bell */
(()=>{
 if(typeof playFeedback!=='function')return;
 const oceanFeedback=playFeedback;
 let ctx;
 const scores={
  forest:{tap:[523],known:[523,659],correct:[587,784],wrong:[392,349],finish:[523,659,784],achievement:[659,784,1047]},
  vintage:{tap:[440],known:[440,554],correct:[523,659],wrong:[330,294],finish:[440,523,659],achievement:[523,659,880]},
  midnight:{tap:[392],known:[392,587],correct:[494,659],wrong:[294,262],finish:[392,494,587],achievement:[494,587,784]}
 };
 playFeedback=function(kind){
  if(!state.audioEnabled)return;
  const theme=state.theme||'forest';
  if(theme==='ocean')return oceanFeedback(kind);
  try{
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
   ctx=ctx||new AC();if(ctx.state==='suspended')ctx.resume();
   const notes=(scores[theme]||scores.forest)[kind]||(scores[theme]||scores.forest).tap;
   const vol=Math.max(0,Math.min(1,Number(state.audioVolume??35)/100));
   notes.forEach((hz,i)=>{
    const at=ctx.currentTime+i*.092;
    const dur=theme==='midnight'?.28:theme==='vintage'?.23:.17;
    const primary=ctx.createOscillator(),secondary=ctx.createOscillator();
    const g=ctx.createGain(),filter=ctx.createBiquadFilter();
    primary.type=theme==='vintage'?'triangle':'sine';primary.frequency.setValueAtTime(hz,at);
    secondary.type='sine';secondary.frequency.setValueAtTime(hz*2,at);
    filter.type='lowpass';filter.frequency.value=theme==='forest'?1450:theme==='vintage'?2200:1200;
    g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.00015,vol*.065),at+.018);
    g.gain.exponentialRampToValueAtTime(.0001,at+dur);
    const g2=ctx.createGain();g2.gain.value=.085;
    primary.connect(filter);secondary.connect(g2).connect(filter);filter.connect(g).connect(ctx.destination);
    primary.start(at);secondary.start(at);primary.stop(at+dur+.02);secondary.stop(at+dur+.02);
   });
  }catch(e){console.warn('Feedback unavailable',e)}
 };
})();

/* 2.6.3: dedicated full-screen test page; existing test engine unchanged. */
(()=>{
 const quiz=document.getElementById('quiz');if(!quiz)return;
 const header=document.createElement('div');header.className='wd263-quiz-header';
 header.innerHTML='<button class="secondary" id="wd263QuizBack" aria-label="返回" title="返回">←</button><span>WORDDAY / TEST</span><span aria-hidden="true">✦</span>';
 quiz.querySelector('.panel')?.prepend(header);
 const leave=()=>{document.body.classList.remove('wd263-quiz-page','wd26-quiz-focus');};
 const open=()=>{document.body.classList.add('wd263-quiz-page');window.scrollTo(0,0);quiz.scrollTop=0;};
 document.getElementById('wd263QuizBack').onclick=()=>{
  const active=window.quizSession&&document.getElementById('quizPlay')?.style.display!=='none';
  if(active&&!window.confirm('退出测试？已作答进度将保留。'))return;
  leave();
 };
 document.querySelectorAll('[data-tab="quiz"]').forEach(b=>b.addEventListener('click',()=>setTimeout(open,0)));
 // Main navigation tabs leave the test surface when navigated via code.
 document.querySelectorAll('[data-tab]:not([data-tab="quiz"])').forEach(b=>b.addEventListener('click',leave));
})();
/* 2.6.3: 2.5-era combo oscillator sound, no additional per-answer tones. */
(()=>{
 const previous=playFeedback;
 playFeedback=function(kind){
  if(kind!=='combo')return previous.apply(this,arguments);
  if(!state.audioEnabled)return;
  // Midnight uses the same soft sine + subtle triangle partials as its UI interactions.
  if(state.theme==='midnight')return previous.apply(this,arguments);
  try{
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
   const context=window.__wd263ComboContext||(window.__wd263ComboContext=new AC());
   if(context.state==='suspended')context.resume();
   const soundThemes={wood:{type:'triangle',duration:.10,volume:.09},bell:{type:'sine',duration:.48,volume:.07},piano:{type:'triangle',duration:.30,volume:.075},ambient:{type:'sawtooth',duration:.18,volume:.035}};
   const t=soundThemes[state.audioTheme]||soundThemes.wood;
   const vol=Math.max(0,Math.min(1,Number(state.audioVolume??35)/100));
   [660,820,990].forEach((hz,i)=>{
    const at=context.currentTime+i*.10,o=context.createOscillator(),g=context.createGain();
    o.type=t.type;o.frequency.setValueAtTime(hz,at);
    if(state.audioTheme==='piano')o.frequency.exponentialRampToValueAtTime(hz*.996,at+.15);
    g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,t.volume*vol),at+.012);
    g.gain.exponentialRampToValueAtTime(.0001,at+t.duration);
    o.connect(g).connect(context.destination);o.start(at);o.stop(at+t.duration+.03);
   });
  }catch(err){console.warn('Combo sound unavailable',err)}
 };
})();
