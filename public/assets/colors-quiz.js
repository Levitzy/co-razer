// HTML Colors quizzes logic (no radios; clickable swatches + DnD)
(function(){
  const q1 = document.getElementById('kq1');
  const q2 = document.getElementById('kq2');
  const q3 = document.getElementById('kq3');
  const qDone = document.getElementById('kq-done');

  const show = el => { if (!el) return; el.classList.remove('is-hidden'); el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const hide = el => { if (!el) return; el.classList.add('is-hidden'); el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); };

  // Q1: clickable choices (no radio)
  (function(){
    const choices = q1?.querySelectorAll('.k-choice');
    const feedback = q1?.querySelector('.q-feedback');
    if (!choices?.length) return;
    function select(el){
      if (el.classList.contains('locked')) return;
      const correct = el.dataset.correct === 'true';
      choices.forEach(c => c.classList.add('locked'));
      el.classList.add('selected');
      el.classList.toggle('correct', correct);
      el.classList.toggle('incorrect', !correct);
      if (feedback) feedback.textContent = correct ? 'Correct!' : 'Incorrect';
      setTimeout(() => { hide(q1); show(q2); }, 650);
    }
    choices.forEach(c => {
      c.addEventListener('click', () => select(c));
      c.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); select(c);} });
    });
  })();

  // Helper: link-stage for drag tokens
  function linkStage(scopeId, tokenMap, scoreId, onComplete) {
    const scope = `#${scopeId}`;
    const lslots = Array.from(document.querySelectorAll(`${scope} .lslot`));
    const chips = document.querySelectorAll(`${scope} .ltag`);
    const score = document.getElementById(scoreId);
    if (!lslots.length) return { reset(){} };

    function update(){
      let correct = 0; const total = lslots.length;
      lslots.forEach(s => {
        const placed = s.dataset.token || '';
        const need = s.dataset.accept || '';
        const ok = placed === need; if (ok) correct++;
        s.classList.toggle('correct', ok && placed);
        s.classList.toggle('incorrect', !ok && placed);
      });
      if (score) score.textContent = `Score: ${correct}/${total}`;
      if (correct === total && typeof onComplete === 'function') onComplete();
    }

    chips.forEach(chip => {
      chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token||''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
      chip.addEventListener('keydown', e => { if (e.key!=='Enter' && e.key!==' ') return; e.preventDefault(); const token=chip.dataset.token||''; const target=lslots.find(s => (s.dataset.accept||'')===token && !s.dataset.token); if(!target) return; chip.classList.add('chip-used'); target.dataset.token=token; target.textContent=tokenMap[token]; update(); });
    });

    lslots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('over'); const token=e.dataTransfer.getData('text/plain'); if(!tokenMap[token]) return; const prev=slot.dataset.token||''; if(prev && prev!==token) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); if(!prev || prev!==token) document.querySelector(`${scope} .ltag[data-token="${token}"]`)?.classList.add('chip-used'); slot.dataset.token=token; slot.textContent=tokenMap[token]; update(); });
      slot.addEventListener('dblclick', () => { const prev=slot.dataset.token||''; if(prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); });
      slot.addEventListener('keydown', e => { if(e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); } });
    });

    function reset(){
      lslots.forEach(s => { const prev=s.dataset.token||''; if(prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
      document.querySelectorAll(`${scope} .ltag.chip-used`).forEach(c => c.classList.remove('chip-used'));
      if (score) score.textContent = `Score: 0/${lslots.length}`;
    }
    return { reset };
  }

  const s2 = linkStage('bg-quiz', { 'style-attr': 'style', 'bg-dodger': '"background-color:DodgerBlue;"', 'bg-tomato': '"background-color:Tomato;"' }, 'kq2-score', () => { hide(q2); show(q3); });

  // Q3: clickable swatch matching rgba vs hsla
  (function(){
    const choices = q3?.querySelectorAll('.k-choice');
    const feedback = q3?.querySelector('.q-feedback');
    if (!choices?.length) return;
    function select(el){
      if (el.classList.contains('locked')) return;
      const correct = el.dataset.correct === 'true';
      choices.forEach(c => c.classList.add('locked'));
      el.classList.add('selected');
      el.classList.toggle('correct', correct);
      el.classList.toggle('incorrect', !correct);
      if (feedback) feedback.textContent = correct ? 'Correct!' : 'Incorrect';
      setTimeout(() => { hide(q3); show(qDone); }, 650);
    }
    choices.forEach(c => { c.addEventListener('click', () => select(c)); c.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); select(c);} }); });
  })();

  // Restart
  document.getElementById('kq-restart')?.addEventListener('click', () => {
    q1?.querySelectorAll('.k-choice').forEach(c => c.classList.remove('locked','selected','correct','incorrect'));
    q3?.querySelectorAll('.k-choice').forEach(c => c.classList.remove('locked','selected','correct','incorrect'));
    q1?.querySelector('.q-feedback') && (q1.querySelector('.q-feedback').textContent='');
    q3?.querySelector('.q-feedback') && (q3.querySelector('.q-feedback').textContent='');
    s2?.reset();
    [q2,q3,qDone].forEach(hide); show(q1);
  });
})();

