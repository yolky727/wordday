/* Card feedback follows the existing theme, volume and motion settings. */
(()=>{
 const scores={advance:[392,494,587,784],fusion:[330,440,554,660],acquire:[659,880],play:[294,392],skill:[440,554,659],roundWin:[523,659,784],roundLoss:[330,262],roundDraw:[392,440],matchWin:[523,659,784,1047],matchLoss:[392,330,262]};
 let context,battleGeneration=0;const voices=new Set(),isBattle=k=>/^(play|skill|round|match)/.test(k);
 function stopBattle(){for(const o of voices){try{o.stop()}catch{}}voices.clear()}
 function prepare(){if(!state.audioEnabled||Number(state.audioVolume??35)<=0)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  try{context=context||new C();if(context.state!=='running')context.resume().catch(()=>{})}catch{}}
 document.addEventListener('pointerdown',e=>{if(e.target.closest('#wildOverlay,#wd28Dialog'))prepare()},{capture:true,passive:true});
 function notes(kind){if(!context||context.state!=='running'||!state.audioEnabled)return;const level=Math.min(1,Math.max(0,Number(state.audioVolume??35)/100));if(!level)return;
  if(isBattle(kind))stopBattle();
  const spacing=kind==='acquire'?.09:.105,start=context.currentTime+.008;
  const timbres={wood:['triangle',.12],bell:['sine',.4],piano:['triangle',.28],ambient:['sine',.32]},timbre=timbres[state.audioTheme]||['sine',.19];const type=state.theme==='midnight'?'sine':timbre[0],duration=state.theme==='ocean'?.29:timbre[1];
  scores[kind].forEach((freq,i)=>{const at=start+i*spacing,o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.00011,level*.075),at+.015);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g).connect(context.destination);if(isBattle(kind))voices.add(o);o.start(at);o.stop(at+duration+.01);o.onended=()=>{voices.delete(o);o.disconnect();g.disconnect()}});
 }
 function animate(kind){if(kind==='acquire'||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('wd26-reduced'))return;
  const anchor=document.querySelector('#wildOverlay .wild-reveal');if(!anchor)return;
  const fx=document.createElement('div');fx.className='wd28-fx '+kind;fx.setAttribute('aria-hidden','true');fx.innerHTML='<i></i><i></i><i></i>';anchor.append(fx);setTimeout(()=>fx.remove(),950);
 }
 function perform(kind,visual){
  const generation=isBattle(kind)?++battleGeneration:0;if(kind==='acquire')++battleGeneration;if(generation||kind==='acquire')stopBattle();prepare();let done=false,timer;
  function start(){if(done)return;done=true;if(generation&&generation!==battleGeneration)return;clearTimeout(timer);if(visual)animate(kind);notes(kind)}
  if(!context||context.state==='running'||!state.audioEnabled){start();return}
  timer=setTimeout(start,120);context.resume().then(start,start);
 }
 const sound=k=>perform(k,false),success=k=>perform(k,true);
 window.WD28CardFX={sound,animate,success,prepare};
})();
