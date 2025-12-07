// HTML Styles quizzes logic
(function(){
  const q1 = document.getElementById('sq1');
  const q2 = document.getElementById('sq2');
  const q3 = document.getElementById('sq3');
  const q4 = document.getElementById('sq4');
  const q5 = document.getElementById('sq5');
  const q6 = document.getElementById('sq6');
  const q7 = document.getElementById('sq7');
  const qDone = document.getElementById('sq-done');
  const show = el => { if(!el) return; el.classList.remove('is-hidden'); el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); el.scrollIntoView({ behavior:'smooth', block:'start' }); };
  const hide = el => { if(!el) return; el.classList.add('is-hidden'); el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); };

  // Q1: DnD background syntax
  const SQ1_CORRECT = "<body style='background-color:pink;'>";
  const s1Drop = document.getElementById('sq1-drop');
  const s1Choices = document.querySelectorAll('#sq1 .dnd-choice');
  const s1Result = document.getElementById('sq1-result');
  if (!s1Drop) return;
  s1Choices.forEach(choice => {
    choice.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', choice.dataset.value || '');
      e.dataTransfer.effectAllowed = 'copy';
      choice.classList.add('dragging');
    });
    choice.addEventListener('dragend', () => choice.classList.remove('dragging'));
  });
  s1Drop.addEventListener('dragover', e => { e.preventDefault(); s1Drop.classList.add('over'); e.dataTransfer.dropEffect = 'copy'; });
  s1Drop.addEventListener('dragleave', () => s1Drop.classList.remove('over'));
  s1Drop.addEventListener('drop', e => {
    e.preventDefault(); s1Drop.classList.remove('over');
    const val = e.dataTransfer.getData('text/plain');
    s1Drop.textContent = val || 'Drop answer here';
    s1Drop.dataset.value = val;
    s1Drop.classList.remove('correct','incorrect');
    s1AutoCheck();
  });
  function s1AutoCheck(){
    const ok = (s1Drop.dataset.value || '') === SQ1_CORRECT;
    s1Result.innerHTML = ok ? '<strong>Correct!</strong>' : 'Incorrect.';
    s1Drop.classList.toggle('correct', ok);
    s1Drop.classList.toggle('incorrect', !ok);
    if (ok) { hide(q1); show(q2); }
  }
  // Reveal/reset
  const s1Reveal = document.getElementById('sq1-reveal');
  const s1Reset = document.getElementById('sq1-reset');
  s1Reveal && s1Reveal.addEventListener('click', () => {
    const showing = s1Reveal.dataset.state === 'shown';
    if (!showing) {
      s1Drop.dataset.value = SQ1_CORRECT;
      s1Drop.textContent = SQ1_CORRECT;
      s1AutoCheck();
      s1Reveal.textContent = 'Hide Answer';
      s1Reveal.dataset.state = 'shown';
    } else {
      s1Drop.dataset.value = '';
      s1Drop.textContent = 'Drop answer here';
      s1Result.textContent = '';
      s1Drop.classList.remove('correct','incorrect');
      s1Reveal.textContent = 'Show Answer';
      s1Reveal.dataset.state = 'hidden';
    }
  });
  s1Reset && s1Reset.addEventListener('click', () => {
    s1Drop.dataset.value = '';
    s1Drop.textContent = 'Drop answer here';
    s1Result.textContent = '';
    s1Drop.classList.remove('correct','incorrect');
    if (s1Reveal) { s1Reveal.textContent = 'Show Answer'; s1Reveal.dataset.state = 'hidden'; }
  });

  // Helper for link-quiz style stages with lslots
  function lstage(scopeId, answers, next) {
    const ALMAP = {
      'style-attr': 'style',
      'color-blue': '"color:blue;"',
      'font-courier': '"font-family:courier;"',
      'align-center': '"text-align:center;"',
      'size-50': '"font-size:50px;"',
      'bg-yellow': '"background-color:yellow;"'
    };
    const scope = `#${scopeId}`;
    const lslots = Array.from(document.querySelectorAll(`${scope} .lslot`));
    const chips = document.querySelectorAll(`${scope} .ltag`);
    const score = document.querySelector(`${scope.replace('-quiz','').replace('color','sq2').replace('font','sq3').replace('alignp','sq4').replace('size','sq5').replace('bgdoc','sq6').replace('centerdoc','sq7')}-score`) || document.querySelector('#sq2-score');
    function update(){ let correct=0; lslots.forEach((s,i)=>{ const need = s.dataset.accept||''; const ok = s.dataset.token === need; if (ok) correct++; s.classList.toggle('correct', ok && s.dataset.token); s.classList.toggle('incorrect', !ok && s.dataset.token); }); const total = lslots.length; if (score) score.textContent = `Score: ${correct}/${total}`; if (correct===total && typeof next==='function') next(); }
    chips.forEach(chip => { chip.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', chip.dataset.token||''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); }); chip.addEventListener('dragend', ()=> chip.classList.remove('dragging')); });
    lslots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('over'); const tok = e.dataTransfer.getData('text/plain'); if (!ALMAP[tok]) return; const prev = slot.dataset.token||''; if (prev && prev!==tok) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); if (!prev || prev!==tok) document.querySelector(`${scope} .ltag[data-token="${tok}"]`)?.classList.add('chip-used'); slot.dataset.token = tok; slot.textContent = ALMAP[tok]; update(); });
      slot.addEventListener('dblclick', () => { const prev = slot.dataset.token||''; if (!prev) return; document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); });
      slot.addEventListener('keydown', e => { if (e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev = slot.dataset.token||''; if (prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); } });
    });
    // Reveal & Reset
    const reveal = document.getElementById(scopeId.replace('-quiz','-reveal'));
    const reset = document.getElementById(scopeId.replace('-quiz','-reset'));
    reveal && reveal.addEventListener('click', () => {
      const showing = reveal.dataset.state==='shown';
      if (!showing) {
        lslots.forEach((s,i)=>{ const tok = answers[i]; s.dataset.token = tok; s.textContent = ALMAP[tok]; document.querySelector(`${scope} .ltag[data-token="${tok}"]`)?.classList.add('chip-used'); });
        update(); reveal.textContent='Hide Answer'; reveal.dataset.state='shown';
      } else {
        lslots.forEach(s=>{ const prev=s.dataset.token||''; if(prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
        update(); reveal.textContent='Show Answer'; reveal.dataset.state='hidden';
      }
    });
    reset && reset.addEventListener('click', () => {
      lslots.forEach(s=>{ const prev=s.dataset.token||''; if(prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
      update(); if(reveal){ reveal.textContent='Show Answer'; reveal.dataset.state='hidden'; }
    });
    return { update };
  }

  // Wire stages
  const q2Stage = lstage('color-quiz', ['style-attr','color-blue'], () => { hide(q2); show(q3); });
  const q3Stage = lstage('font-quiz', ['style-attr','font-courier'], () => { hide(q3); show(q4); });
  const q4Stage = lstage('alignp-quiz', ['style-attr','align-center'], () => { hide(q4); show(q5); });
  const q5Stage = lstage('size-quiz', ['style-attr','size-50'], () => { hide(q5); show(q6); });
  const q6Stage = lstage('bgdoc-quiz', ['style-attr','bg-yellow'], () => { hide(q6); show(q7); });
  const q7Stage = lstage('centerdoc-quiz', ['style-attr','align-center'], () => { hide(q7); show(qDone); });

  // Restart
  document.getElementById('sq-restart')?.addEventListener('click', () => {
    // Reset q1 dnd
    s1Drop.dataset.value = '';
    s1Drop.textContent = 'Drop answer here';
    s1Result.textContent = '';
    s1Drop.classList.remove('correct','incorrect');
    if (s1Reveal) { s1Reveal.textContent = 'Show Answer'; s1Reveal.dataset.state = 'hidden'; }
    // Clear all lslots and chips
    document.querySelectorAll('#styles-quiz .lslot').forEach(s => { s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    document.querySelectorAll('#styles-quiz .ltag.chip-used').forEach(c => c.classList.remove('chip-used'));
    ['#sq2-score','#sq3-score','#sq4-score','#sq5-score','#sq6-score','#sq7-score'].forEach((sel, idx) => { const el=document.querySelector(sel); if(el){ const totals=[2,2,2,2,2,2]; el.textContent=`Score: 0/${totals[idx]}`; } });
    // Show q1
    [q2,q3,q4,q5,q6,q7,qDone].forEach(hide); show(q1);
  });
})();
