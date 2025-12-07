// HTML Quotations & Citations quizzes
(function(){
  const q1 = document.getElementById('qq1');
  const q2 = document.getElementById('qq2');
  const q3 = document.getElementById('qq3');
  const q4 = document.getElementById('qq4');
  const qDone = document.getElementById('qq-done');

  const show = el => { if (!el) return; el.classList.remove('is-hidden'); el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const hide = el => { if (!el) return; el.classList.add('is-hidden'); el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); };

  // Q1: Drag-and-drop (which is NOT an element?) => <quote>
  (function(){
    const drop = document.getElementById('qq1-drop');
    const choices = document.querySelectorAll('#qq1 .dnd-choice');
    const result = document.getElementById('qq1-result');
    const CORRECT = '<quote>';
    if (!drop) return;

    choices.forEach(choice => {
      choice.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', choice.dataset.value||''); e.dataTransfer.effectAllowed='copy'; choice.classList.add('dragging'); });
      choice.addEventListener('dragend', () => choice.classList.remove('dragging'));
    });

    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', e => {
      e.preventDefault(); drop.classList.remove('over');
      const val = e.dataTransfer.getData('text/plain');
      drop.textContent = val || 'Drop answer here';
      drop.dataset.value = val || '';
      drop.classList.remove('correct','incorrect');
      const ok = (drop.dataset.value||'') === CORRECT;
      if (result) result.innerHTML = ok ? '<strong>Correct!</strong>' : 'Incorrect.';
      drop.classList.toggle('correct', ok);
      drop.classList.toggle('incorrect', !ok);
      if (ok) setTimeout(() => { hide(q1); show(q2); }, 600);
    });
  })();

  // Helper for stages that place tokens into lslots
  function linkStage(scopeId, tokenMap, scoreId, onComplete) {
    const scope = `#${scopeId}`;
    const lslots = Array.from(document.querySelectorAll(`${scope} .lslot`));
    const chips = document.querySelectorAll(`${scope} .ltag`);
    const score = document.getElementById(scoreId);
    if (!lslots.length) return { reset(){}, update(){} };

    function update(){
      let correct = 0; const total = lslots.length;
      lslots.forEach(s => { const ok = (s.dataset.token||'') === (s.dataset.accept||''); if (ok) correct++; s.classList.toggle('correct', ok && s.dataset.token); s.classList.toggle('incorrect', !ok && s.dataset.token); });
      if (score) score.textContent = `Score: ${correct}/${total}`;
      if (correct === total && typeof onComplete === 'function') onComplete();
    }

    chips.forEach(chip => {
      chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token||''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
      chip.addEventListener('keydown', e => { if (e.key!=='Enter' && e.key!==' ') return; e.preventDefault(); const token = chip.dataset.token||''; const target = lslots.find(s => (s.dataset.accept||'')===token && !s.dataset.token); if (!target || !tokenMap[token] || chip.classList.contains('chip-used')) return; chip.classList.add('chip-used'); target.dataset.token = token; target.textContent = tokenMap[token]; update(); });
    });

    lslots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('over'); const token = e.dataTransfer.getData('text/plain'); if (!token || !tokenMap[token]) return; const prev = slot.dataset.token||''; if (prev && prev!==token) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); if (!prev || prev!==token) document.querySelector(`${scope} .ltag[data-token="${token}"]`)?.classList.add('chip-used'); slot.dataset.token = token; slot.textContent = tokenMap[token]; update(); });
      slot.addEventListener('dblclick', () => { const prev = slot.dataset.token||''; if (prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); });
      slot.addEventListener('keydown', e => { if (e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); } });
    });

    function reset(){
      lslots.forEach(s => { const prev = s.dataset.token||''; if (prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
      if (score) score.textContent = `Score: 0/${lslots.length}`;
      document.querySelectorAll(`${scope} .ltag.chip-used`).forEach(c => c.classList.remove('chip-used'));
    }

    return { reset, update };
  }

  // Stage wiring
  const s2 = linkStage('q-quiz',   { 'q-open': '<q>', 'q-close': '</q>' }, 'qq2-score', () => { hide(q2); show(q3); });
  const s3 = linkStage('bq-quiz',  { 'bq-open': '<blockquote', 'cite-attr': ' cite="http://www.worldwildlife.org/who/index.html"', 'bq-close': '</blockquote>' }, 'qq3-score', () => { hide(q3); show(q4); });
  const s4 = linkStage('abbr-quiz',{ 'abbr-open': '<abbr', 'title-attr': ' title="World Health Organization"', 'abbr-close': '</abbr>' }, 'qq4-score', () => { hide(q4); show(qDone); });

  // Restart
  document.getElementById('qq-restart')?.addEventListener('click', () => {
    // Reset q1 radios
    document.querySelectorAll('#qq1 input[type="radio"][name="qq1"]').forEach(i => { i.checked=false; i.disabled=false; });
    const fb = document.querySelector('#qq1 .q-feedback'); if (fb) fb.textContent='';
    s2?.reset(); s3?.reset(); s4?.reset();
    [q2,q3,q4,qDone].forEach(hide); show(q1);
  });
})();
