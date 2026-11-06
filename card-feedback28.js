/* Card feedback follows the existing theme, volume and motion settings. */
(()=>{
 const scores={advance:[392,494,587,784],fusion:[330,440,554,660],acquire:[659,880]};
 let context,tail=0;
 function prepare(){if(!state.audioEnabled||Number(state.audioVolume??35)<=0)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  try{context=context||new C();if(context.state==='suspended')context.resume().catch(()=>{})}catch{}}
 document.addEventListener('pointerdown',e=>{if(e.target.closest('#wildOverlay,#wd28Dialog'))prepare()},{capture:true,passive:true});
 function sound(kind){prepare();if(!context||!state.audioEnabled)return;const level=Math.min(1,Math.max(0,Number(state.audioVolume??35)/100));if(!level)return;
  const spacing=kind==='acquire'?.09:.105,start=Math.max(context.currentTime+.008,tail);
  const type=state.theme==='vintage'?'triangle':'sine',duration=state.theme==='ocean'?.29:.19;
  scores[kind].forEach((freq,i)=>{const at=start+i*spacing,o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.00011,level*.075),at+.015);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g).connect(context.destination);o.start(at);o.stop(at+duration+.01);o.onended=()=>{o.disconnect();g.disconnect()}});tail=start+scores[kind].length*spacing+.03;
 }
 function animate(kind){if(kind==='acquire'||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('wd26-reduced'))return;
  const anchor=document.querySelector('#wildOverlay .wild-reveal');if(!anchor)return;
  const fx=document.createElement('div');fx.className='wd28-fx '+kind;fx.setAttribute('aria-hidden','true');fx.innerHTML='<i></i><i></i><i></i>';anchor.append(fx);setTimeout(()=>fx.remove(),950);
 }
 window.WD28CardFX={sound,animate};
})();
