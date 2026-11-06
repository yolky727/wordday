/* WORDDAY 2.7.1: coherent daily learning states, editorial interface. */
(()=>{'use strict';
const $=id=>document.getElementById(id),make=(tag,cls,html)=>{const el=document.createElement(tag);el.className=cls;if(html!==undefined)el.innerHTML=html;return el};
const main=document.querySelector('#learn .layout>main'),settings=$('dailyCardSettings'),target=$('dailyTarget'),level=$('level');main.classList.add('wd271-daily');
document.querySelector('.brand').innerHTML='WORD<span>DAY</span><small>THE DAILY PRACTICE · 2.7.1</small>';
document.querySelector('.hero .eyebrow').textContent='A LITTLE EVERY DAY / 每日积累';document.querySelector('.hero h1').textContent='每日练习';
main.querySelector('.panel-head h2').innerHTML='<span class="wd271-kicker">DAILY PRACTICE</span>今日学习';
$('dailyCardControls').querySelector('strong').textContent='学习计划';$('dailyCardControls').querySelector('.smallnote').textContent='先设置词数与范围，再开始逐词学习';
const replaceButton=id=>{const old=$(id),next=old.cloneNode(true);old.replaceWith(next);return next};
const apply=replaceButton('applyTarget'),shuffle=replaceButton('shuffle'),toggle=replaceButton('dailySettingsToggle');
// Move existing controls into a labelled grid; remove the duplicate Smart Mix selector.
settings.replaceChildren();settings.setAttribute('role','region');settings.setAttribute('aria-label','每日学习设置');
const targetField=make('div','wd271-field');const targetLabel=make('label','','今日目标');targetLabel.htmlFor='dailyTarget';target.removeAttribute('style');target.setAttribute('inputmode','numeric');target.setAttribute('aria-describedby','wd271TargetHint');
const stepper=make('div','wd271-stepper');const less=make('button','secondary','−'),more=make('button','secondary','＋');less.type=more.type='button';less.setAttribute('aria-label','目标减少一个词');more.setAttribute('aria-label','目标增加一个词');stepper.append(less,target,more);targetField.append(targetLabel,stepper);
const presets=make('div','wd271-presets');for(const n of [8,15,30,50]){const b=make('button','secondary',String(n)+' 词');b.type='button';b.dataset.target=n;b.onclick=()=>{target.value=n;updateHint()};presets.append(b)}targetField.append(presets);
const rangeField=make('div','wd271-field');const rangeLabel=make('label','','学习范围');rangeLabel.htmlFor='level';rangeField.append(rangeLabel,level,make('p','smallnote','切换范围立即生效；已完成进度保留。'));
const grid=make('div','wd271-setting-grid');grid.append(targetField,rangeField);const hint=make('p','smallnote');hint.id='wd271TargetHint';hint.setAttribute('aria-live','polite');const settingsActions=make('div','wd271-setting-actions');apply.textContent='保存学习目标';apply.className='';shuffle.textContent='换一组待学词';shuffle.className='secondary';settingsActions.append(shuffle,apply);settings.append(grid,hint,settingsActions);
const preview=make('div','wd271-preview');preview.id='wd271Preview';preview.setAttribute('aria-live','polite');$('startStudy').before(preview);
const number=make('div','wd271-progress-number');main.querySelector('.progress').before(number);
function setSettings(open){settings.classList.toggle('open',open);toggle.textContent=open?'收起设置 −':'学习设置 ＋';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-controls','dailyCardSettings')}
toggle.onclick=()=>setSettings(!settings.classList.contains('open'));setSettings(false);
function updateHint(){const n=Number(target.value),done=(state.daily[today]||[]).length;hint.textContent=Number.isInteger(n)&&n>=1&&n<=100?`今日已学 ${done} 词 · 保存后还需学习 ${Math.max(0,n-done)} 词${n<=done?'。想继续学习，请设置大于已学数量的目标。':''}`:'请输入 1–100 之间的整数。';presets.querySelectorAll('button').forEach(b=>{const selected=Number(b.dataset.target)===n;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))})}
less.onclick=()=>{target.value=Math.max(1,(Number(target.value)||8)-1);updateHint()};more.onclick=()=>{target.value=Math.min(100,(Number(target.value)||8)+1);updateHint()};target.addEventListener('input',updateHint);target.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();apply.click()}});
function renderDashboard(){
 const done=(state.daily[today]||[]).length,total=Number(state.dailyTargets?.[today]||8),words=getDaily();
 document.querySelector('.hero p').textContent=`今天计划学习 ${total} 个词，${$('totalDue').textContent||0} 个词到期复习。`;
 number.innerHTML=`<strong>${String(done).padStart(2,'0')}</strong><span>/ ${String(total).padStart(2,'0')}<small>今日已学 · 词</small></span><b>${Math.min(100,Math.round(done/total*100))}%</b>`;
 preview.innerHTML=words.length?`<div class="wd271-preview-heading"><span>接下来学习</span><span>${words.length} 个待学词</span></div><div class="wd271-word-chips">${words.slice(0,5).map(w=>`<button class="secondary" data-action="detail" data-word="${esc(w[0])}" aria-label="查看 ${esc(w[0])} 释义">${esc(w[0])} <span>↗</span></button>`).join('')}${words.length>5?`<span class="wd271-more-words">+${words.length-5}</span>`:''}</div>`:`<div class="wd271-preview-heading"><strong>${done>=total?'今日目标已完成 ✓':'当前范围暂无待学词'}</strong></div><p class="smallnote">${done>=total?'想继续？打开学习设置，提高今日目标。':'请切换学习范围，或添加自己的单词。'}</p>`;
 $('startStudy').textContent=words.length?`${done?'继续':'开始'}学习 · ${words.length} 词 →`:'查看今日完成情况 →';updateHint();
}
function applyTarget(value){
 const n=Number(value);if(!Number.isInteger(n)||n<1||n>100){toast('请输入 1–100 之间的整数');target.focus();return false}
 state.dailyTargets=state.dailyTargets||{};state.dailyTargets[today]=n;target.value=n;
 // getDaily reconciles the queue against the new target and completed words.
 getDaily();save();renderWords();window.WORDDAY_STUDY?.refresh();renderDashboard();toast('目标已保存，待学单词已更新');return true;
}
window.WORDDAY271={applyTarget,renderDashboard};apply.onclick=()=>{if(applyTarget(target.value)){setSettings(false);preview.scrollIntoView({block:'center'});$('startStudy').focus({preventScroll:true})}};shuffle.onclick=()=>{shuffleDaily();window.WORDDAY_STUDY?.refresh();renderDashboard()};
const oldRender=renderWords;renderWords=function(){oldRender();renderDashboard()};
level.value=state.wd271?.level&&[...level.options].some(o=>o.value===state.wd271.level)?state.wd271.level:'all';level.addEventListener('change',()=>{state.wd271=state.wd271||{};state.wd271.level=level.value;state.wd23.mix=level.value==='CET-4'?'cet':level.value==='IELTS'?'ielts':'balanced';save();renderWords();window.WORDDAY_STUDY?.refresh()});
// Daily learning is the first content; featured reading is secondary.
const aside=document.querySelector('#learn .layout>aside'),featured=$('todayWordCard');aside.prepend(featured);
featured.classList.add('panel','wd271-featured');
const custom=$('addWord').closest('.panel'),details=make('details','wd271-custom');const summary=make('summary','','＋ 添加自己的单词');custom.querySelector('h2')?.remove();details.append(summary);while(custom.firstChild)details.append(custom.firstChild);custom.append(details);
$('vocabularyCatalog').querySelector('h2').innerHTML='<span class="wd271-kicker">WORD LIBRARY</span>词典与词库';
$('wd24Version').textContent='WORDDAY 2.7.1 · Daily Design Edition';
// Full navigation remains visible by default; the existing collapse control still works.
setNavCollapsed(false);document.querySelectorAll('[data-main-tab]').forEach(b=>b.setAttribute('aria-label',b.textContent.trim()));
$('toast').setAttribute('role','status');$('toast').setAttribute('aria-live','polite');
renderWords();
})();
