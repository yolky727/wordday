(()=>{'use strict';
const $=id=>document.getElementById(id),dialog=document.createElement('dialog');dialog.className='wd28-review';dialog.setAttribute('aria-label','只读回看');document.body.append(dialog);
let items=[],cursor=0,caller=null;
function draw(){const x=items[cursor];dialog.innerHTML='<div class="b28-head"><span>回看 · '+(cursor+1)+' / '+items.length+'</span><button class="secondary" id="r28Close">返回当前进度</button></div><h2>'+esc(x.title)+'</h2><p>'+esc(x.body)+'</p><p class="smallnote">'+esc(x.note||'')+'</p><div class="b28-actions"><button class="secondary" id="r28Prev" aria-label="上一个" '+(cursor===0?'disabled':'')+'>←</button><button class="secondary" id="r28Next" aria-label="下一个">→</button></div>';
 $('r28Close').onclick=()=>dialog.close();$('r28Prev').onclick=()=>{cursor--;draw()};$('r28Next').onclick=()=>{if(cursor===items.length-1)dialog.close();else{cursor++;draw()}}}
dialog.addEventListener('close',()=>caller?.isConnected&&caller.focus());
function open(list){if(!list.length)return;items=list;cursor=list.length-1;caller=document.activeElement;draw();dialog.showModal()}
function nav(mount,list,label,place='prepend'){const row=document.createElement('div');row.className='b28-reviewnav';row.innerHTML='<button class="secondary" aria-label="回看上一个'+label+'" '+(list.length?'':'disabled')+'>←</button><span>回看'+label+'</span><button class="secondary" aria-label="已在当前进度" disabled>→</button>';row.querySelector('button').onclick=()=>open(list);mount[place](row)}
function study(stage){
 const names=state.daily[today]||[],list=names.map(n=>({title:n,body:findWord(n)?.[2]||'',note:state.wd23.history28?.[today]?.[n]||'当天已学习'}));
 const card=stage.querySelector('.study-card');if(!card)return;nav(card,list,'单词','append');
 if(!state.wd23.swipeGuide28&&$('swipeCard')){const tip=document.createElement('div');tip.className='b28-guide';tip.innerHTML='<strong>试试滑动词卡</strong><span>← 左滑：还需复习　　右滑：已掌握 →</span><small>两种操作都会保存进度，也可使用下方按钮。</small><button class="secondary">知道了</button>';card.prepend(tip);tip.querySelector('button').onclick=()=>{state.wd23.swipeGuide28=true;save();tip.remove()}}
}
const previous=renderQuizQuestion;renderQuizQuestion=function(){previous();const mount=$('quizPlay');mount.querySelector('.b28-reviewnav')?.remove();if(!quizSession)return;const list=quizSession.answers.flatMap((a,i)=>a?[{title:quizSession.questions[i]?.prompt||a.word,body:'你的答案：'+a.chosen+'\n正确答案：'+a.correct,note:a.ok?'回答正确':'已记录错题'}]:[]);nav(mount,list,'已答题')};
const oldSubmit=submitQuizAnswer;submitQuizAnswer=function(...args){const result=oldSubmit(...args);const mount=$('quizPlay');if(quizSession&&mount.style.display!=='none'){mount.querySelector('.b28-reviewnav')?.remove();nav(mount,quizSession.answers.flatMap((a,i)=>a?[{title:quizSession.questions[i]?.prompt||a.word,body:'你的答案：'+a.chosen+'\n正确答案：'+a.correct,note:a.ok?'回答正确':'已记录错题'}]:[]),'已答题')}return result};
const priorFinish=finishDailyQuiz;
finishDailyQuiz=function(){const before=state.quizHistory.length;const result=priorFinish();if(state.quizHistory.length>before){const record=state.quizHistory.at(-1);nav($('quizResult'),record.details.map(a=>({title:a.prompt||a.word,body:'你的答案：'+a.chosen+'\n正确答案：'+a.correct,note:a.ok?'回答正确':'已记录错题'})),'本次测试','append')}return result};
window.WD28Review={study};
})();
