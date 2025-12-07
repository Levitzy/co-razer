// HTML Comments quizzes logic (no radios; clickable blocks + DnD)
(function(){
  const q1 = document.getElementById('cq1');
  const q2 = document.getElementById('cq2');
  const q3 = document.getElementById('cq3');
  const qDone = document.getElementById('cq-done');

  const show = el => { if (!el) return; el.classList.remove('is-hidden'); el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const hide = el => { if (!el) return; el.classList.add('is-hidden'); el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); };

  // Q1: multiple choice without radio inputs
  (function initQ1(){
    const choices = q1?.querySelectorAll('.c-choice');
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
      c.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(c); }
      });
    });
  })();

  // Helper used by Q2/Q3 (drag tokens <!-- and --> into slots)
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
      chip.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', chip.dataset.token || '');
        e.dataTransfer.effectAllowed = 'copy';
        chip.classList.add('dragging');
      });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
      chip.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        const token = chip.dataset.token || '';
        const target = lslots.find(s => (s.dataset.accept||'') === token && !s.dataset.token);
        if (!target) return;
        chip.classList.add('chip-used');
        target.dataset.token = token; target.textContent = tokenMap[token];
        update();
      });
    });

    lslots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => {
        e.preventDefault(); slot.classList.remove('over');
        const token = e.dataTransfer.getData('text/plain'); if (!tokenMap[token]) return;
        const prev = slot.dataset.token || '';
        if (prev && prev !== token) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used');
        if (!prev || prev !== token) document.querySelector(`${scope} .ltag[data-token="${token}"]`)?.classList.add('chip-used');
        slot.dataset.token = token; slot.textContent = tokenMap[token];
        update();
      });
      slot.addEventListener('dblclick', () => {
        const prev = slot.dataset.token || '';
        if (prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used');
        slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect');
        update();
      });
      slot.addEventListener('keydown', e => {
        if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); const prev = slot.dataset.token || ''; if (prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); }
      });
    });

    function reset(){
      lslots.forEach(s => { const prev=s.dataset.token||''; if (prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
      document.querySelectorAll(`${scope} .ltag.chip-used`).forEach(c => c.classList.remove('chip-used'));
      if (score) score.textContent = `Score: 0/${lslots.length}`;
    }

    return { reset };
  }

  const s2 = linkStage('commentline-quiz', { 'c-open': '<!--', 'c-close': '-->' }, 'cq2-score', () => { hide(q2); show(q3); });
  const s3 = linkStage('commentpara-quiz', { 'c-open': '<!--', 'c-close': '-->' }, 'cq3-score', () => { hide(q3); show(qDone); });

  // Restart all comments quizzes
  document.getElementById('cq-restart')?.addEventListener('click', () => {
    // reset q1
    q1?.querySelectorAll('.c-choice').forEach(c => c.classList.remove('locked','selected','correct','incorrect'));
    const fb = q1?.querySelector('.q-feedback'); if (fb) fb.textContent='';
    // reset later stages
    s2?.reset(); s3?.reset();
    // show first
    [q2,q3,qDone].forEach(hide); show(q1);
  });
})();

