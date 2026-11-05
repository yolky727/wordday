/* WORDDAY 2.7 · offline lexicon and accessible dictionary */
(()=>{'use strict';
const byId=id=>document.getElementById(id);
const category=document.createElement('select');category.id='catalogCategory';category.setAttribute('aria-label','词库分类');category.innerHTML=['all','CET-4','IELTS','CET-6','基础词汇','通用拓展','专名与构词','自定义'].map(x=>`<option value="${x}">${x==='all'?'全部分类':x}</option>`).join('');byId('catalogSearch').after(category);category.onchange=()=>{catalogShown=48;renderCatalog()};
let detailFocus=null;
const oldDetail=showDetail;
showDetail=function(name){
 const w=findWord(name);if(!w)return;detailFocus=document.activeElement;const x=lexicalMap.get(name);const custom=(state.custom||[]).some(a=>a[0]===name);
 byId('detailTitle').textContent='词条详情';
 const lines=s=>String(s||'').split('\n').filter(Boolean).map(line=>`<li>${esc(line)}</li>`).join('');
 const exchanges={p:'过去式',d:'过去分词',i:'现在分词',3:'第三人称单数',r:'比较级',t:'最高级',s:'复数',0:'原形'};
 const forms=custom?[]:(x?.exchange||'').split('/').map(v=>v.split(':')).filter(v=>exchanges[v[0]]&&v[1]);
 byId('detailBody').innerHTML=`<div class="wd27-detail-top"><div class="term">${esc(w[0])}</div><span class="tag">${esc(w[4])}</span></div><p class="phonetic">${esc(w[1]||'')} ${esc(w[5]||'')}</p><div class="actions"><button data-action="speak" data-word="${esc(name)}">播放发音</button><button class="secondary" id="wd27DetailFavorite">${state.favorites.includes(name)?'★ 已收藏':'☆ 收藏单词'}</button></div><h3>中文释义</h3><ol class="wd27-senses">${lines(w[2])}</ol>${w[6]?`<h3>英文释义</h3><ol class="wd27-senses">${lines(w[6])}</ol>`:''}${forms.length?`<h3>词形变化</h3><div class="wd27-forms">${forms.map(([k,v])=>`<span><small>${exchanges[k]}</small>${esc(v)}</span>`).join('')}</div>`:''}${w[3]?`<h3>例句</h3><p class="wd27-example">${esc(w[3])}</p>`:'<p class="smallnote">此词条暂未收录例句；可用于释义学习和拼写练习。</p>'}<details class="wd27-source"><summary>词条来源与分类说明</summary><p>${esc(custom?'个人自定义':x?.source||'WORDDAY 原有词条')} · ${esc(w[4])}</p><p>分类来自词典标签或原有学习分类，不表示已核实真题出处。词典内容经过自动匹配与完整性检查，未逐条人工审校。</p>${x?.source==='ECDICT'?'<a href="https://github.com/skywind3000/ECDICT" target="_blank" rel="noopener noreferrer">查看词典来源</a>':''}</details>`;
 const modal=byId('detailModal');modal.style.display='block';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','detailTitle');modal.scrollTop=0;byId('closeDetail').focus();
 byId('wd27DetailFavorite').onclick=()=>{toggleFavorite(name);byId('wd27DetailFavorite').textContent=state.favorites.includes(name)?'★ 已收藏':'☆ 收藏单词'};
};
const close=closeDetail;closeDetail=function(){close();if(detailFocus?.isConnected)detailFocus.focus({preventScroll:true})};
// Existing close button retains its original listener; restore focus for this path too.
byId('closeDetail').addEventListener('click',()=>{if(detailFocus?.isConnected)detailFocus.focus({preventScroll:true})});
document.addEventListener('keydown',e=>{const modal=byId('detailModal');if(modal.style.display!=='block')return;if(e.key==='Escape'){e.preventDefault();closeDetail()}if(e.key==='Tab'){const items=[...modal.querySelectorAll('button,a,summary,[tabindex="0"]')].filter(x=>x.offsetParent!==null),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}});
byId('wd24Version').textContent='WORDDAY 2.7 · Lexicon Edition';document.querySelector('.brand small')?.replaceChildren(document.createTextNode('2.7 · LEXICON'));
// Honor device accessibility preference while retaining the explicit app setting.
if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('wd26-reduced');
renderCatalog();
})();
