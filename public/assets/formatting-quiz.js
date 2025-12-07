// HTML Text Formatting quizzes logic
(function(){
  const q1 = document.getElementById('fq1');
  const q2 = document.getElementById('fq2');
  const q3 = document.getElementById('fq3');
  const q4 = document.getElementById('fq4');
  const q5 = document.getElementById('fq5');
  const q6 = document.getElementById('fq6');
  const qDone = document.getElementById('fq-done');

  const show = el => { if (!el) return; el.classList.remove('is-hidden'); el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const hide = el => { if (!el) return; el.classList.add('is-hidden'); el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); };

  // Q1: Drag-and-drop — which two make text bold? (<strong> and <b>)
  (function(){
    const drop = document.getElementById('fq1-drop');
    const choices = document.querySelectorAll('#fq1 .dnd-choice');
    const result = document.getElementById('fq1-result');
    const CORRECT = '<strong> and <b>';
    if (!drop) return;

    choices.forEach(choice => {
      choice.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', choice.dataset.value || '');
        e.dataTransfer.effectAllowed = 'copy';
        choice.classList.add('dragging');
      });
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
      const ok = (drop.dataset.value || '') === CORRECT;
      if (result) result.innerHTML = ok ? '<strong>Correct!</strong>' : 'Incorrect.';
      drop.classList.toggle('correct', ok);
      drop.classList.toggle('incorrect', !ok);
      if (ok) { setTimeout(() => { hide(q1); show(q2); }, 600); }
    });
  })();

  // Helper: wire a link-quiz style stage with <open> and </close> tokens
  function linkStage(scopeId, tokenMap, scoreId, onComplete) {
    const scope = `#${scopeId}`;
    const lslots = Array.from(document.querySelectorAll(`${scope} .lslot`));
    const chips = document.querySelectorAll(`${scope} .ltag`);
    const score = document.getElementById(scoreId);

    if (!lslots.length) return { reset(){} };

    function update(){
      let correct = 0;
      const total = lslots.length;
      lslots.forEach(s => {
        const placed = s.dataset.token || '';
        const need = s.dataset.accept || '';
        const ok = placed === need;
        if (ok) correct++;
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
        const target = lslots.find(s => (s.dataset.accept || '') === token && !s.dataset.token);
        if (!target || !tokenMap[token] || chip.classList.contains('chip-used')) return;
        chip.classList.add('chip-used');
        target.dataset.token = token;
        target.textContent = tokenMap[token];
        update();
      });
    });

    lslots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => {
        e.preventDefault();
        slot.classList.remove('over');
        const token = e.dataTransfer.getData('text/plain');
        if (!token || !tokenMap[token]) return;
        const prev = slot.dataset.token || '';
        if (prev && prev !== token) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used');
        if (!prev || prev !== token) document.querySelector(`${scope} .ltag[data-token="${token}"]`)?.classList.add('chip-used');
        slot.dataset.token = token;
        slot.textContent = tokenMap[token];
        update();
      });
      slot.addEventListener('dblclick', () => {
        const prev = slot.dataset.token || '';
        if (prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used');
        slot.dataset.token = '';
        slot.textContent = '';
        slot.classList.remove('correct','incorrect');
        update();
      });
      slot.addEventListener('keydown', e => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          const prev = slot.dataset.token || '';
          if (prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used');
          slot.dataset.token = '';
          slot.textContent = '';
          slot.classList.remove('correct','incorrect');
          update();
        }
      });
    });

    function reset(){
      lslots.forEach(s => {
        const prev = s.dataset.token || '';
        if (prev) document.querySelector(`${scope} .ltag[data-token="${prev}"]`)?.classList.remove('chip-used');
        s.dataset.token = '';
        s.textContent = '';
        s.classList.remove('correct','incorrect');
      });
      document.querySelectorAll(`${scope} .ltag.chip-used`).forEach(c => c.classList.remove('chip-used'));
      if (score) score.textContent = `Score: 0/${lslots.length}`;
    }

    return { reset };
  }

  // Wire stages 2–6
  const s2 = linkStage('degrade-quiz', { 'strong-open': '<strong>', 'strong-close': '</strong>' }, 'fq2-score', () => { hide(q2); show(q3); });
  const s3 = linkStage('metro-quiz',   { 'em-open': '<em>', 'em-close': '</em>' },               'fq3-score', () => { hide(q3); show(q4); });
  const s4 = linkStage('mark-quiz',    { 'mark-open': '<mark>', 'mark-close': '</mark>' },      'fq4-score', () => { hide(q4); show(q5); });
  const s5 = linkStage('sub-quiz',     { 'sub-open': '<sub>', 'sub-close': '</sub>' },          'fq5-score', () => { hide(q5); show(q6); });
  const s6 = linkStage('del-quiz',     { 'del-open': '<del>', 'del-close': '</del>' },          'fq6-score', () => { hide(q6); show(qDone); });

  // Restart all formatting quizzes
  document.getElementById('fq-restart')?.addEventListener('click', () => {
    // Reset Q1
    document.querySelectorAll('#fq1 input[type="radio"][name="fq1"]').forEach(i => { i.checked = false; i.disabled = false; });
    const fb = document.querySelector('#fq1 .q-feedback'); if (fb) fb.textContent = '';
    // Reset stages 2-6
    s2?.reset(); s3?.reset(); s4?.reset(); s5?.reset(); s6?.reset();
    // Show q1 again
    [q2,q3,q4,q5,q6,qDone].forEach(hide); show(q1);
  });
})();
