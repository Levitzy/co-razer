// HTML Paragraphs quizzes
(function(){
  const q1 = document.getElementById('pq1');
  const q2 = document.getElementById('pq2');
  const q3 = document.getElementById('pq3');
  const q4 = document.getElementById('pq4');
  const q5 = document.getElementById('pq5');
  const qDone = document.getElementById('pq-done');
  const show = el => { if (!el) return; el.classList.remove('is-hidden'); el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const hide = el => { if (!el) return; el.classList.add('is-hidden'); el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); };

  // Q1: True/False
  const inputs = document.querySelectorAll('#pq1 input[type="radio"][name="pq1"]');
  const feedback = q1?.querySelector('.q-feedback');
  inputs.forEach(r => r.addEventListener('change', () => {
    const correct = r.value === 'true'; // Paragraphs do start on a new line
    if (feedback) feedback.textContent = correct ? 'Correct!' : 'Incorrect';
    inputs.forEach(i => i.disabled = true);
    setTimeout(() => { hide(q1); show(q2); }, 600);
  }));

  // Q2: Hello World paragraph line
  (function(){
    const TMAP = { 'p-line': '<p>Hello World!</p>' };
    const lslots = Array.from(document.querySelectorAll('#phello-quiz .lslot'));
    const lchips = document.querySelectorAll('#phello-quiz .ltag');
    const score = document.getElementById('pq2-score');
    function update(){ const ok = lslots.every(s => s.dataset.token === s.dataset.accept); score.textContent = `Score: ${ok ? 1 : 0}/1`; if (ok){ hide(q2); show(q3);} }
    lchips.forEach(chip => { chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token||''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); }); chip.addEventListener('dragend', () => chip.classList.remove('dragging')); });
    lslots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('over'); const token=e.dataTransfer.getData('text/plain'); if(!TMAP[token]) return; slot.dataset.token=token; slot.textContent=TMAP[token]; update(); });
      slot.addEventListener('dblclick', () => { const prev=slot.dataset.token||''; if(!prev) return; slot.dataset.token=''; slot.textContent=''; update(); });
      slot.addEventListener('keydown', e => { if(e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev){} slot.dataset.token=''; slot.textContent=''; update(); } });
    });
    const reveal=document.getElementById('pq2-reveal'); const reset=document.getElementById('pq2-reset');
    reveal && reveal.addEventListener('click', ()=>{ const showing = reveal.dataset.state==='shown'; if(!showing){ lslots.forEach(s=>{ s.dataset.token='p-line'; s.textContent=TMAP['p-line'];}); update(); reveal.textContent='Hide Answer'; reveal.dataset.state='shown'; } else { lslots.forEach(s=>{ s.dataset.token=''; s.textContent='';}); update(); reveal.textContent='Show Answer'; reveal.dataset.state='hidden'; } });
    reset && reset.addEventListener('click', ()=>{ lslots.forEach(s=>{ s.dataset.token=''; s.textContent=''; }); update(); if(reveal){ reveal.textContent='Show Answer'; reveal.dataset.state='hidden'; } });
  })();

  // Q3: Cleanup with end tags (</h1>, </p>)
  (function(){
    const AMAP = { 'h1-close': '</h1>', 'p-close': '</p>' };
    const slots = Array.from(document.querySelectorAll('#cleanup-quiz .lslot'));
    const chips = document.querySelectorAll('#cleanup-quiz .ltag');
    const score = document.getElementById('pq3-score');
    function update(){ let correct=0; slots.forEach(s=>{ const ok = s.dataset.token===s.dataset.accept; if(ok) correct++; s.classList.toggle('correct', ok && s.dataset.token); s.classList.toggle('incorrect', !ok && s.dataset.token);}); score.textContent=`Score: ${correct}/2`; if(correct===2){ hide(q3); show(q4);} }
    chips.forEach(chip => { chip.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', chip.dataset.token||''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); }); chip.addEventListener('dragend', ()=> chip.classList.remove('dragging')); });
    slots.forEach(slot=>{ slot.addEventListener('dragover', e=>{ e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; }); slot.addEventListener('dragleave', ()=> slot.classList.remove('over')); slot.addEventListener('drop', e=>{ e.preventDefault(); slot.classList.remove('over'); const token=e.dataTransfer.getData('text/plain'); if(!AMAP[token]) return; const prev=slot.dataset.token||''; if(prev && prev!==token){ document.querySelector(`#cleanup-quiz .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); } if(!prev || prev!==token){ document.querySelector(`#cleanup-quiz .ltag[data-token="${token}"]`)?.classList.add('chip-used'); } slot.dataset.token=token; slot.textContent=AMAP[token]; update();}); slot.addEventListener('dblclick', ()=>{ const prev=slot.dataset.token||''; if(!prev) return; document.querySelector(`#cleanup-quiz .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update();}); slot.addEventListener('keydown', e=>{ if(e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev) document.querySelector(`#cleanup-quiz .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); }}); });
    const reveal=document.getElementById('pq3-reveal'); const reset=document.getElementById('pq3-reset');
    reveal && reveal.addEventListener('click', ()=>{ const showing=reveal.dataset.state==='shown'; if(!showing){ const ans=['h1-close','p-close']; slots.forEach((s,i)=>{ s.dataset.token=ans[i]; s.textContent=AMAP[ans[i]]; document.querySelector(`#cleanup-quiz .ltag[data-token="${ans[i]}"]`)?.classList.add('chip-used'); }); update(); reveal.textContent='Hide Answer'; reveal.dataset.state='shown'; } else { slots.forEach(s=>{ const prev=s.dataset.token||''; if(prev) document.querySelector(`#cleanup-quiz .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); }); update(); reveal.textContent='Show Answer'; reveal.dataset.state='hidden'; }});
    reset && reset.addEventListener('click', ()=>{ slots.forEach(s=>{ const prev=s.dataset.token||''; if(prev) document.querySelector(`#cleanup-quiz .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); }); update(); if(reveal){ reveal.textContent='Show Answer'; reveal.dataset.state='hidden'; } });
  })();

  // Q4: Insert hr
  (function(){
    const TMAP={ 'hr':'<hr>' };
    const slots=Array.from(document.querySelectorAll('#hr-quiz .slot'));
    const chips=document.querySelectorAll('#hr-quiz .tag');
    const score=document.getElementById('pq4-score');
    function update(){ const ok = slots.every(s=> s.dataset.token===s.dataset.accept); score.textContent=`Score: ${ok?1:0}/1`; if(ok){ hide(q4); show(q5);} }
    chips.forEach(chip=>{ chip.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', chip.dataset.token||''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); }); chip.addEventListener('dragend', ()=> chip.classList.remove('dragging')); });
    slots.forEach(slot=>{ slot.addEventListener('dragover', e=>{ e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; }); slot.addEventListener('dragleave', ()=> slot.classList.remove('over')); slot.addEventListener('drop', e=>{ e.preventDefault(); slot.classList.remove('over'); const token=e.dataTransfer.getData('text/plain'); if(!TMAP[token]) return; slot.dataset.token=token; slot.textContent=TMAP[token]; update(); }); slot.addEventListener('dblclick', ()=>{ const prev=slot.dataset.token||''; if(!prev) return; slot.dataset.token=''; slot.textContent=''; update();}); slot.addEventListener('keydown', e=>{ if(e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev){} slot.dataset.token=''; slot.textContent=''; update(); }}); });
    const reveal=document.getElementById('pq4-reveal'); const reset=document.getElementById('pq4-reset');
    reveal && reveal.addEventListener('click', ()=>{ const showing=reveal.dataset.state==='shown'; if(!showing){ slots.forEach(s=>{ s.dataset.token='hr'; s.textContent=TMAP['hr']; }); update(); reveal.textContent='Hide Answer'; reveal.dataset.state='shown'; } else { slots.forEach(s=>{ s.dataset.token=''; s.textContent=''; }); update(); reveal.textContent='Show Answer'; reveal.dataset.state='hidden'; } });
    reset && reset.addEventListener('click', ()=>{ slots.forEach(s=>{ s.dataset.token=''; s.textContent=''; }); update(); if(reveal){ reveal.textContent='Show Answer'; reveal.dataset.state='hidden'; } });
  })();

  // Q5: Insert br
  (function(){
    const TMAP={ 'br':'<br>' };
    const slots=Array.from(document.querySelectorAll('#br-quiz .slot'));
    const chips=document.querySelectorAll('#br-quiz .tag');
    const score=document.getElementById('pq5-score');
    function update(){ const ok = slots.every(s=> s.dataset.token===s.dataset.accept); score.textContent=`Score: ${ok?1:0}/1`; if(ok){ hide(q5); show(qDone);} }
    chips.forEach(chip=>{ chip.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', chip.dataset.token||''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); }); chip.addEventListener('dragend', ()=> chip.classList.remove('dragging')); });
    slots.forEach(slot=>{ slot.addEventListener('dragover', e=>{ e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; }); slot.addEventListener('dragleave', ()=> slot.classList.remove('over')); slot.addEventListener('drop', e=>{ e.preventDefault(); slot.classList.remove('over'); const token=e.dataTransfer.getData('text/plain'); if(!TMAP[token]) return; slot.dataset.token=token; slot.textContent=TMAP[token]; update(); }); slot.addEventListener('dblclick', ()=>{ const prev=slot.dataset.token||''; if(!prev) return; slot.dataset.token=''; slot.textContent=''; update();}); slot.addEventListener('keydown', e=>{ if(e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev){} slot.dataset.token=''; slot.textContent=''; update(); }}); });
    const reveal=document.getElementById('pq5-reveal'); const reset=document.getElementById('pq5-reset');
    reveal && reveal.addEventListener('click', ()=>{ const showing=reveal.dataset.state==='shown'; if(!showing){ slots.forEach(s=>{ s.dataset.token='br'; s.textContent=TMAP['br']; }); update(); reveal.textContent='Hide Answer'; reveal.dataset.state='shown'; } else { slots.forEach(s=>{ s.dataset.token=''; s.textContent=''; }); update(); reveal.textContent='Show Answer'; reveal.dataset.state='hidden'; } });
    reset && reset.addEventListener('click', ()=>{ slots.forEach(s=>{ s.dataset.token=''; s.textContent=''; }); update(); if(reveal){ reveal.textContent='Show Answer'; reveal.dataset.state='hidden'; } });
  })();

  // Restart button
  document.getElementById('pq-restart')?.addEventListener('click', () => {
    // Reset radios
    document.querySelectorAll('#pq1 input[type="radio"]').forEach(i => { i.checked=false; i.disabled=false; });
    const fb = document.querySelector('#pq1 .q-feedback'); if (fb) fb.textContent='';
    // Clear all slots/choices states
    document.querySelectorAll('#para-quiz .slot, #para-quiz .lslot').forEach(s => { s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    document.querySelectorAll('#para-quiz .tag.chip-used, #para-quiz .ltag.chip-used').forEach(c => c.classList.remove('chip-used'));
    const res = [['#pq2-score','0/1'],['#pq3-score','0/2'],['#pq4-score','0/1'],['#pq5-score','0/1']];
    res.forEach(([sel,val]) => { const el=document.querySelector(sel); if (el) el.textContent = `Score: ${val}`; });
    // Show q1
    [q2,q3,q4,q5,qDone].forEach(hide); show(q1);
  });
})();

