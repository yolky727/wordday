/* Full-card review stays in the study/quiz surface and never resubmits answers. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
let cursor=null,finished=null,finishedView=false,lastSession=null,drafts={};
const renderBase=renderQuizQuestion;
function reset(){cursor=null;finishedView=false;lastSession=null;drafts={}}
function remember(){if(cursor===null&&!finishedView&&quizSession){const input=$('typedAnswer');if(input)drafts[quizSession.index]=input.value}}
function draw(){
 const live=quizSession,s=finishedView?finished:live;if(!s)return;
 if(!finishedView&&lastSession!==live){cursor=null;drafts={};lastSession=live}
 const actual=s.index,index=cursor??actual,review=finishedView||cursor!==null;
 // Reuse the complete existing renderer, retaining all four question layouts.
 quizSession=s;s.index=index;
 try{renderBase()}finally{s.index=actual;quizSession=live}
 const q=s.questions[index],a=s.answers[index],mount=$('quizPlay');
 mount.querySelector('.b28-reviewnav')?.remove();mount.querySelector('.review284-return')?.remove();
 mount.classList.toggle('review284-active',review);
 if(a){
  document.querySelectorAll('#quizOptions .quiz-option').forEach(b=>{b.disabled=true;const correct=normalizeQuizAnswer(b.dataset.answer)===normalizeQuizAnswer(a.correct),chosen=normalizeQuizAnswer(b.dataset.answer)===normalizeQuizAnswer(a.chosen);b.classList.toggle('correct',correct);b.classList.toggle('wrong',chosen&&!a.ok);b.setAttribute('aria-pressed',String(chosen))});
  if($('typedAnswer')){$('typedAnswer').value=a.chosen;$('typedAnswer').disabled=true}
  if($('submitTyped'))$('submitTyped').disabled=true;
  $('quizFeedback').textContent=(a.ok?'回答正确':'你的答案：'+a.chosen)+' · 正确答案：'+a.correct;
  $('quizFeedback').style.color=a.ok?'var(--green)':'var(--red)';
 }else if(!review&&$('typedAnswer')&&Object.hasOwn(drafts,index))$('typedAnswer').value=drafts[index];
 if(review){$('quizNext').disabled=true;$('quizNext').style.display='none'}
 else{$('quizNext').style.display='';$('quizNext').disabled=!a}
 $('quizSave').hidden=finishedView;
 const fav=$('quizFav');fav.textContent=state.favorites.includes(q.word)?'★ 已收藏':'☆ 收藏本题单词';fav.onclick=()=>{toggleFavorite(q.word);fav.textContent=state.favorites.includes(q.word)?'★ 已收藏':'☆ 收藏本题单词'};
 const end=finishedView?s.questions.length-1:actual;
 const row=document.createElement('div');row.className='b28-reviewnav review284-nav';
 row.innerHTML='<button class="secondary" id="quizPrevious284" aria-label="上一道完整题目" '+(index===0?'disabled':'')+'>←</button><span>'+(review?'回看原题 · ':'当前题目 · ')+(index+1)+' / '+s.questions.length+'</span><button class="secondary" id="quizForward284" aria-label="下一道题目或返回当前题目" '+(!review?'disabled':'')+'>→</button>';
 mount.append(row);
 $('quizPrevious284').onclick=()=>{remember();cursor=Math.max(0,index-1);draw();mount.scrollIntoView({block:'start'})};
 $('quizForward284').onclick=()=>{if(finishedView&&index===end)return showResults();cursor=index+1>=end&&!finishedView?null:index+1;draw();mount.scrollIntoView({block:'start'})};
 if(review){const back=document.createElement('button');back.className='secondary review284-return';back.textContent=finishedView?'返回测试结果':'回到当前题目';back.onclick=()=>{if(finishedView)return showResults();cursor=null;draw();mount.scrollIntoView({block:'start'})};mount.append(back)}
}
function showResults(){finishedView=false;cursor=null;$('quizPlay').style.display='none';$('quizResult').style.display='block';$('quizSave').hidden=false}
renderQuizQuestion=draw;
const startBase=startMode;startMode=function(...args){reset();finished=null;return startBase(...args)};
const submitBase=submitQuizAnswer;submitQuizAnswer=function(...args){if(cursor!==null||finishedView)return;const result=submitBase(...args);draw();return result};
const finishBase=finishDailyQuiz;finishDailyQuiz=function(...args){const candidate=quizSession?JSON.parse(JSON.stringify(quizSession)):null,before=state.quizHistory.length;const result=finishBase(...args);if(state.quizHistory.length>before&&candidate){finished=candidate;const row=document.createElement('div');row.className='b28-reviewnav';row.innerHTML='<button class="secondary" id="quizFinishedReview284">← 回看完整试题</button>';$('quizResult').append(row);$('quizFinishedReview284').onclick=()=>{finishedView=true;cursor=finished.questions.length-1;$('quizResult').style.display='none';$('quizPlay').style.display='block';draw()}}return result};
window.WD28Review={study(stage){
 const card=stage.querySelector('#swipeCard');if(!card||card.querySelector('.review284-status'))return;
 if(!state.wd23.swipeGuide28){const tip=document.createElement('div');tip.className='b28-guide';tip.innerHTML='<strong>试试滑动词卡</strong><span>← 左滑：还需复习　　右滑：已掌握 →</span><small>也可使用下方按钮；底部箭头可回看完整词卡。</small><button class="secondary">知道了</button>';card.prepend(tip);tip.querySelector('button').onclick=()=>{state.wd23.swipeGuide28=true;save();tip.remove()}}
}};
})();
