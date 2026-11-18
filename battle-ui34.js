/* Shared card geometry and battle chrome for both opponents. */
(()=>{'use strict';const W=window.WILDWORDS;const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(a,advanced=false,full=false,enemy=false){const art=a?W.card(a,true,advanced):'<div class="wild-card small battle34-back"><span class="wild-tier">WILDWORDS</span><b>W</b><span class="wild-id">暗牌</span></div>';return '<span class="battle34-card '+(full?'is-full':'is-compact')+(enemy?' enemy35':'')+'">'+art+'</span>'}
function score(players,points,round){return '<div class="a-score battle34-score"><span>'+esc(players[0])+'<b>'+points[0]+'</b></span><strong>'+(round===5?'决胜局':round+' / 4')+'</strong><span>'+esc(players[1])+'<b>'+points[1]+'</b></span></div>'}
window.WDBattleUI34={card,score};})();
