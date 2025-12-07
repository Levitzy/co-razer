// HTML Headings interactive quizzes
(function() {
  // Stage elements
  const q1 = document.getElementById('hq1');
  const q2 = document.getElementById('hq2');
  const q3 = document.getElementById('hq3');
  const qDone = document.getElementById('hq-done');

  const show = (el) => { if (!el) return; el.classList.remove('is-hidden'); el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const hide = (el) => { if (!el) return; el.classList.add('is-hidden'); el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); };

  // ==========================
  // Q1: Largest heading DnD
  // ==========================
  const HQ1_CORRECT = '<h1>';
  const hq1Drop = document.getElementById('hq1-drop');
  const hq1Choices = document.querySelectorAll('#hq1 .dnd-choice');
  const hq1Result = document.getElementById('hq1-result');
  if (!hq1Drop) return; // abort if markup missing

  hq1Choices.forEach(chip => {
    chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.value || ''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
  });

  hq1Drop.addEventListener('dragover', e => { e.preventDefault(); hq1Drop.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
  hq1Drop.addEventListener('dragleave', () => hq1Drop.classList.remove('over'));
  hq1Drop.addEventListener('drop', e => {
    e.preventDefault(); hq1Drop.classList.remove('over');
    const val = e.dataTransfer.getData('text/plain');
    hq1Drop.textContent = val || 'Drop answer here';
    const ok = val === HQ1_CORRECT;
    hq1Result.innerHTML = ok ? '<strong>Correct!</strong>' : 'Incorrect.';
    hq1Drop.classList.toggle('correct', ok);
    hq1Drop.classList.toggle('incorrect', !ok);
    if (ok) { hide(q1); show(q2); }
  });

  // Q1 reveal/reset
  const hq1Reveal = document.getElementById('hq1-reveal');
  const hq1Reset = document.getElementById('hq1-reset');
  hq1Reveal && hq1Reveal.addEventListener('click', () => {
    const showing = hq1Reveal.dataset.state === 'shown';
    if (!showing) {
      hq1Drop.textContent = HQ1_CORRECT; hq1Drop.classList.add('correct'); hq1Drop.classList.remove('incorrect'); hq1Result.innerHTML = '<strong>Correct!</strong>';
      hq1Reveal.textContent = 'Hide Answer'; hq1Reveal.dataset.state = 'shown';
    } else {
      hq1Drop.textContent = 'Drop answer here'; hq1Drop.classList.remove('correct','incorrect'); hq1Result.textContent='';
      hq1Reveal.textContent = 'Show Answer'; hq1Reveal.dataset.state = 'hidden';
    }
  });
  hq1Reset && hq1Reset.addEventListener('click', () => {
    hq1Drop.textContent = 'Drop answer here'; hq1Drop.classList.remove('correct','incorrect'); hq1Result.textContent='';
    if (hq1Reveal) { hq1Reveal.textContent='Show Answer'; hq1Reveal.dataset.state='hidden'; }
  });

  // ==========================
  // Q2: London heading h1
  // ==========================
  const ALMAP = { 'h1-open': '<h1>', 'h1-close': '</h1>', 'h2-open': '<h2>', 'h2-close': '</h2>' };
  const lslots = Array.from(document.querySelectorAll('#london-quiz .lslot'));
  const lchips = document.querySelectorAll('#london-quiz .ltag');
  const lscore = document.getElementById('hq2-score');
  const lReveal = document.getElementById('hq2-reveal');
  const lReset = document.getElementById('hq2-reset');

  function lUpdate() {
    let correct = 0;
    lslots.forEach(s => { const ok = s.dataset.token === s.dataset.accept; if (ok) correct++; s.classList.toggle('correct', ok && s.dataset.token); s.classList.toggle('incorrect', !ok && s.dataset.token); });
    lscore.textContent = `Score: ${correct}/2`;
    if (correct === 2) { hide(q2); show(q3); }
  }

  lchips.forEach(chip => {
    chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token || ''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
    chip.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const token = chip.dataset.token || '';
      const target = lslots.find(s => (s.dataset.accept||'') === token && !s.dataset.token);
      if (!target || !ALMAP[token] || chip.classList.contains('chip-used')) return;
      chip.classList.add('chip-used'); target.dataset.token = token; target.textContent = ALMAP[token]; lUpdate();
    });
  });

  lslots.forEach(slot => {
    slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', e => {
      e.preventDefault(); slot.classList.remove('over');
      const token = e.dataTransfer.getData('text/plain');
      if (!token || !ALMAP[token]) return;
      const prev = slot.dataset.token || '';
      if (prev && prev !== token) { const used = document.querySelector(`#london-quiz .ltag[data-token="${prev}"]`); used && used.classList.remove('chip-used'); }
      if (!prev || prev !== token) { const use = document.querySelector(`#london-quiz .ltag[data-token="${token}"]`); use && use.classList.add('chip-used'); }
      slot.dataset.token = token; slot.textContent = ALMAP[token]; lUpdate();
    });
    slot.addEventListener('dblclick', () => { const prev = slot.dataset.token || ''; if (!prev) return; const chip = document.querySelector(`#london-quiz .ltag[data-token="${prev}"]`); chip && chip.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); lUpdate(); });
    slot.addEventListener('keydown', (e) => { if (e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev = slot.dataset.token || ''; const chip = document.querySelector(`#london-quiz .ltag[data-token="${prev}"]`); if (chip) chip.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); lUpdate(); } });
  });

  lReveal && lReveal.addEventListener('click', () => {
    const showing = lReveal.dataset.state === 'shown';
    if (!showing) {
      // Fill correct
      lslots.forEach((s, i) => { const ans = i === 0 ? 'h1-open' : 'h1-close'; s.dataset.token = ans; s.textContent = ALMAP[ans]; });
      document.querySelector(`#london-quiz .ltag[data-token="h1-open"]`)?.classList.add('chip-used');
      document.querySelector(`#london-quiz .ltag[data-token="h1-close"]`)?.classList.add('chip-used');
      lUpdate(); lReveal.textContent='Hide Answer'; lReveal.dataset.state='shown';
    } else {
      // Clear
      lslots.forEach(s => { const prev = s.dataset.token || ''; if (prev){ document.querySelector(`#london-quiz .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); } s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
      lUpdate(); lReveal.textContent='Show Answer'; lReveal.dataset.state='hidden';
    }
  });
  lReset && lReset.addEventListener('click', () => {
    lslots.forEach(s => { const prev = s.dataset.token || ''; if (prev) document.querySelector(`#london-quiz .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    lUpdate(); if (lReveal) { lReveal.textContent='Show Answer'; lReveal.dataset.state='hidden'; }
  });

  // ==========================
  // Q3: Six headings ordered
  // ==========================
  const TMAP = {
    'h1-line': '<h1>Hello</h1>',
    'h2-line': '<h2>Hello</h2>',
    'h3-line': '<h3>Hello</h3>',
    'h4-line': '<h4>Hello</h4>',
    'h5-line': '<h5>Hello</h5>',
    'h6-line': '<h6>Hello</h6>'
  };
  const sixSlots = Array.from(document.querySelectorAll('#six-quiz .slot'));
  const sixChips = document.querySelectorAll('#six-quiz .tag');
  const sixScore = document.getElementById('hq3-score');
  const sixReveal = document.getElementById('hq3-reveal');
  const sixReset = document.getElementById('hq3-reset');

  function sixUpdate() {
    let correct = 0; sixSlots.forEach(s => { const ok = s.dataset.token === s.dataset.accept; if (ok) correct++; s.classList.toggle('correct', ok && s.dataset.token); s.classList.toggle('incorrect', !ok && s.dataset.token); });
    sixScore.textContent = `Score: ${correct}/6`; if (correct === 6) { hide(q3); show(qDone); }
  }

  sixChips.forEach(chip => {
    chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token || ''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
    chip.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const token = chip.dataset.token || '';
      const target = sixSlots.find(s => (s.dataset.accept||'') === token && !s.dataset.token);
      if (!target || !TMAP[token] || chip.classList.contains('chip-used')) return;
      chip.classList.add('chip-used'); target.dataset.token = token; target.textContent = TMAP[token]; sixUpdate();
    });
  });

  sixSlots.forEach(slot => {
    slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('over'); const token = e.dataTransfer.getData('text/plain'); if (!TMAP[token]) return; const prev = slot.dataset.token || ''; if (prev && prev !== token) document.querySelector(`#six-quiz .tag[data-token="${prev}"]`)?.classList.remove('chip-used'); if (!prev || prev !== token) document.querySelector(`#six-quiz .tag[data-token="${token}"]`)?.classList.add('chip-used'); slot.dataset.token = token; slot.textContent = TMAP[token]; sixUpdate(); });
    slot.addEventListener('dblclick', () => { const prev = slot.dataset.token || ''; if (!prev) return; document.querySelector(`#six-quiz .tag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); sixUpdate(); });
    slot.addEventListener('keydown', (e) => { if (e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev = slot.dataset.token || ''; if (prev) document.querySelector(`#six-quiz .tag[data-token="${prev}"]`)?.classList.remove('chip-used'); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); sixUpdate(); } });
  });

  sixReveal && sixReveal.addEventListener('click', () => {
    const showing = sixReveal.dataset.state === 'shown';
    const answers = ['h1-line','h2-line','h3-line','h4-line','h5-line','h6-line'];
    if (!showing) {
      sixSlots.forEach((s, i) => { s.dataset.token = answers[i]; s.textContent = TMAP[answers[i]]; document.querySelector(`#six-quiz .tag[data-token="${answers[i]}"]`)?.classList.add('chip-used'); });
      sixUpdate(); sixReveal.textContent='Hide Answer'; sixReveal.dataset.state='shown';
    } else {
      sixSlots.forEach(s => { const prev = s.dataset.token || ''; if (prev) document.querySelector(`#six-quiz .tag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
      sixUpdate(); sixReveal.textContent='Show Answer'; sixReveal.dataset.state='hidden';
    }
  });
  sixReset && sixReset.addEventListener('click', () => {
    sixSlots.forEach(s => { const prev = s.dataset.token || ''; if (prev) document.querySelector(`#six-quiz .tag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    sixUpdate(); if (sixReveal) { sixReveal.textContent='Show Answer'; sixReveal.dataset.state='hidden'; }
  });

  // Restart all
  document.getElementById('hq-restart')?.addEventListener('click', () => {
    // Reset q1
    hq1Drop.textContent = 'Drop answer here'; hq1Drop.classList.remove('correct','incorrect'); hq1Result.textContent='';
    if (hq1Reveal) { hq1Reveal.textContent='Show Answer'; hq1Reveal.dataset.state='hidden'; }
    // Reset q2
    lslots.forEach(s => { const prev = s.dataset.token || ''; if (prev) document.querySelector(`#london-quiz .ltag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    lUpdate(); if (lReveal) { lReveal.textContent='Show Answer'; lReveal.dataset.state='hidden'; }
    // Reset q3
    sixSlots.forEach(s => { const prev = s.dataset.token || ''; if (prev) document.querySelector(`#six-quiz .tag[data-token="${prev}"]`)?.classList.remove('chip-used'); s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    sixUpdate(); if (sixReveal) { sixReveal.textContent='Show Answer'; sixReveal.dataset.state='hidden'; }

    // Show q1 again
    [q2, q3, qDone].forEach(hide); show(q1);
  });
})();

