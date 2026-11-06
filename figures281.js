/* Keep the original Georgia glyphs. Some system versions only have old-style
   figures, so align their visible tops and baselines using actual glyph metrics. */
(()=>{
 const targets='.stat strong,.hero-stat strong,.wd271-progress-number>strong';
 const ns='http://www.w3.org/2000/svg',ctx=document.createElement('canvas').getContext('2d');
 if(!ctx)return;
 function format(node){
  if(node.firstElementChild?.tagName.toLowerCase()==='svg')return;
  const value=node.textContent.trim();if(!/^[0-9]+%?$/.test(value))return;
  ctx.font='100px Georgia, serif';const advance=66,height=72,width=advance*value.length;
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 '+width+' 84');
  svg.setAttribute('role','img');svg.setAttribute('aria-label',value);svg.style.cssText='height:.93em;width:'+(.93*width/84)+'em;max-width:100%;overflow:visible;vertical-align:baseline';
  [...value].forEach((ch,i)=>{const m=ctx.measureText(ch),bottom=m.actualBoundingBoxDescent||0,extent=m.actualBoundingBoxAscent+bottom;
   const t=document.createElementNS(ns,'text');t.setAttribute('text-anchor','middle');t.setAttribute('fill','currentColor');t.style.cssText='font:100px Georgia,serif;letter-spacing:0';t.setAttribute('transform','translate('+(advance*(i+.5))+' 77) scale(1 '+(extent?height/extent:1)+') translate(0 '+(-bottom)+')');t.textContent=ch;svg.append(t)});
  node.replaceChildren(svg);
 }
 document.querySelectorAll(targets).forEach(format);
 const pending=new Set();let raf=0;
 new MutationObserver(ms=>{for(const m of ms){const el=m.target.nodeType===1?m.target:m.target.parentElement;if(el?.matches(targets))pending.add(el);for(const added of m.addedNodes)if(added.nodeType===1){if(added.matches(targets))pending.add(added);added.querySelectorAll(targets).forEach(n=>pending.add(n))}}
 if(pending.size&&!raf)raf=requestAnimationFrame(()=>{raf=0;for(const n of pending)format(n);pending.clear()})}).observe(document.body,{childList:true,characterData:true,subtree:true});
})();
