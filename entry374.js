/* WORDDAY 3.7.4: splash and learning-mode entry are separate lifecycle stages. */
(()=>{'use strict';
 const root=document.documentElement,splash=document.getElementById('wdSplash'),button=document.getElementById('wdEnter');
 let ready=false,entering=false,notified=false;
 const isLearning=()=>root.dataset.entryStage==='learning';
 function enterLearning(){
  if(!ready||isLearning())return;
  root.dataset.entryStage='learning';
  splash.classList.remove('visible');splash.setAttribute('aria-hidden','true');splash.removeAttribute('aria-modal');button.disabled=true;
  // A completed frame of the learning page comes before the daily-card offer.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(!isLearning()||notified)return;notified=true;
   document.dispatchEvent(new CustomEvent('wordday:learning-entered',{detail:{mode:'learning'}}));
  }));
 }
 function enter(event){
  if(!ready||entering||isLearning())return;entering=true;button.disabled=true;
  root.dataset.entryStage='entering';
  // Keep the original theme-aware cue and its existing sound/volume preference.
  if(typeof playFeedback==='function')playFeedback('finish');
  const r=splash.getBoundingClientRect();
  splash.style.setProperty('--tap-x',(event?.detail?event.clientX-r.left:r.width/2)+'px');
  splash.style.setProperty('--tap-y',(event?.detail?event.clientY-r.top:r.height/2)+'px');
  splash.classList.add('leaving');
  setTimeout(enterLearning,matchMedia('(prefers-reduced-motion: reduce)').matches?0:500);
 }
 function enable(){ready=true;button.disabled=false;button.addEventListener('click',enter);window.WDLocale37?.translate(splash)}
 window.WDEntry374={isLearning,enterLearning,get stage(){return root.dataset.entryStage}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enable,{once:true});else enable();
})();
