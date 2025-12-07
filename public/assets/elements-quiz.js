// Elements page quiz — copied from basics.html interactive quizzes
(function() {
  const CORRECT = '<br>';
  const drop = document.getElementById('dnd-drop');
  const choices = document.querySelectorAll('.dnd-choice');
  const result = document.getElementById('dnd-result');
  let selected = '';

  if (!drop) return; // abort if quiz markup not present

  choices.forEach(choice => {
    choice.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', choice.dataset.value || '');
      e.dataTransfer.effectAllowed = 'copy';
      choice.classList.add('dragging');
    });
    choice.addEventListener('dragend', () => choice.classList.remove('dragging'));
  });

  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('over');
    e.dataTransfer.dropEffect = 'copy';
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('over');
    selected = e.dataTransfer.getData('text/plain');
    drop.textContent = selected || 'Drop answer here';
    drop.dataset.value = selected;
    drop.classList.remove('correct','incorrect');
    autoCheck();
  });

  function autoCheck() {
    const val = drop.dataset.value || '';
    const ok = val === CORRECT;
    result.innerHTML = ok ? '<strong>Correct!</strong> Your score: 1/1.' : 'Incorrect. Your score: 0/1.';
    drop.classList.toggle('correct', ok);
    drop.classList.toggle('incorrect', !ok);
    if (ok) showQuiz2();
  }

  // Stage 1: reveal + reset controls
  const dqReveal = document.getElementById('dq-reveal');
  const dqReset = document.getElementById('dq-reset');
  dqReveal && dqReveal.addEventListener('click', () => {
    const showing = dqReveal.dataset.state === 'shown';
    if (!showing) {
      drop.dataset.value = CORRECT; drop.textContent = CORRECT; autoCheck();
      dqReveal.textContent = 'Hide Answer'; dqReveal.dataset.state = 'shown';
    } else {
      drop.dataset.value = ''; drop.textContent = 'Drop answer here'; result.textContent='';
      drop.classList.remove('correct','incorrect');
      dqReveal.textContent = 'Show Answer'; dqReveal.dataset.state = 'hidden';
    }
  });
  dqReset && dqReset.addEventListener('click', () => {
    drop.dataset.value = ''; drop.textContent = 'Drop answer here'; result.textContent='';
    drop.classList.remove('correct','incorrect');
    if (dqReveal) { dqReveal.textContent = 'Show Answer'; dqReveal.dataset.state = 'hidden'; }
  });

  // Quiz 2: Place HTML tags
  const stage1 = document.getElementById('quiz1-screen');
  const stage2 = document.getElementById('quiz2-screen');
  let quiz2Shown = stage2 && !stage2.classList.contains('is-hidden');
  function showQuiz2() {
    if (quiz2Shown) return;
    quiz2Shown = true;
    if (stage1) {
      stage1.classList.add('is-hidden');
      stage1.setAttribute('aria-hidden', 'true');
      stage1.setAttribute('inert', '');
    }
    if (stage2) {
      stage2.classList.remove('is-hidden');
      stage2.removeAttribute('aria-hidden');
      stage2.removeAttribute('inert');
      const heading = document.getElementById('quiz2-heading');
      (heading || stage2).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const TOKENS = {
    'html-open': '<html>',
    'html-close': '</html>',
    'body-open': '<body>',
    'body-close': '</body>',
    'h1-open': '<h1>',
    'h1-close': '</h1>',
    'p-open': '<p>',
    'p-close': '</p>',
    'br': '<br>'
  };

  const tagChoices = document.querySelectorAll('#tags-quiz .tag');
  const slots = Array.from(document.querySelectorAll('#tags-quiz .slot'));
  const tagScore = document.getElementById('tags-score');

  function tagsUseChip(token) {
    const chip = document.querySelector(`#tags-quiz .tag[data-token="${token}"]:not(.chip-used)`);
    if (chip) chip.classList.add('chip-used');
  }
  function tagsRestoreChip(token) {
    const chip = document.querySelector(`#tags-quiz .tag[data-token="${token}"].chip-used`);
    if (chip) chip.classList.remove('chip-used');
  }
  function tagsRestoreAllChips() {
    document.querySelectorAll('#tags-quiz .tag.chip-used').forEach(c => c.classList.remove('chip-used'));
  }
  function tagsClearSlots() {
    slots.forEach(s => { s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    tagScore.textContent = 'Score: 0/9';
  }

  function updateTagScore() {
    let correct = 0;
    slots.forEach(slot => {
      const placed = slot.dataset.token || '';
      const need = slot.dataset.accept || '';
      const ok = placed === need;
      if (ok) correct++;
      slot.classList.toggle('correct', ok && placed);
      slot.classList.toggle('incorrect', !ok && placed);
    });
    tagScore.textContent = `Score: ${correct}/9`;
    if (correct === 9) showQuiz3();
  }

  tagChoices.forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', chip.dataset.token || '');
      e.dataTransfer.effectAllowed = 'copy';
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
    chip.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const token = chip.dataset.token || '';
      const target = slots.find(s => (s.dataset.accept || '') === token && !s.dataset.token);
      if (!target || !TOKENS[token] || chip.classList.contains('chip-used')) return;
      tagsUseChip(token);
      target.dataset.token = token; target.textContent = TOKENS[token];
      updateTagScore();
    });
  });

  slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('over');
      e.dataTransfer.dropEffect = 'copy';
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('over');
      const token = e.dataTransfer.getData('text/plain');
      if (!token || !TOKENS[token]) return;
      const prev = slot.dataset.token || '';
      if (prev && prev !== token) tagsRestoreChip(prev);
      if (!prev || prev !== token) tagsUseChip(token);
      slot.dataset.token = token;
      slot.textContent = TOKENS[token];
      updateTagScore();
    });
    // Clear on double-click or Backspace/Delete
    slot.addEventListener('dblclick', () => {
      const prev = slot.dataset.token || '';
      if (!prev) return;
      tagsRestoreChip(prev);
      slot.dataset.token = '';
      slot.textContent = '';
      slot.classList.remove('correct','incorrect');
      updateTagScore();
    });
    slot.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        const prev = slot.dataset.token || '';
        if (prev) tagsRestoreChip(prev);
        slot.dataset.token = '';
        slot.textContent = '';
        slot.classList.remove('correct','incorrect');
        updateTagScore();
      }
    });
  });

  // Stage 2: reveal + reset
  const tqReveal = document.getElementById('tq-reveal');
  const tqReset = document.getElementById('tq-reset');
  tqReveal && tqReveal.addEventListener('click', () => {
    const showing = tqReveal.dataset.state === 'shown';
    if (!showing) {
      const answers = ['html-open','body-open','h1-open','h1-close','p-open','br','p-close','body-close','html-close'];
      tagsClearSlots(); tagsRestoreAllChips();
      slots.forEach((s, i) => { s.dataset.token = answers[i]; s.textContent = TOKENS[answers[i]]; tagsUseChip(answers[i]); });
      updateTagScore();
      tqReveal.textContent = 'Hide Answer'; tqReveal.dataset.state = 'shown';
    } else {
      tagsClearSlots(); tagsRestoreAllChips(); updateTagScore();
      tqReveal.textContent = 'Show Answer'; tqReveal.dataset.state = 'hidden';
    }
  });
  tqReset && tqReset.addEventListener('click', () => {
    tagsClearSlots(); tagsRestoreAllChips(); updateTagScore();
    if (tqReveal) { tqReveal.textContent = 'Show Answer'; tqReveal.dataset.state = 'hidden'; }
  });

  // Quiz 3: Bracket selection
  const stage3 = document.getElementById('quiz3-screen');
  function showQuiz3() {
    if (!stage3 || !stage2) return;
    if (!stage3.classList.contains('is-hidden')) return;
    stage2.classList.add('is-hidden');
    stage2.setAttribute('aria-hidden','true');
    stage2.setAttribute('inert','');
    stage3.classList.remove('is-hidden');
    stage3.removeAttribute('aria-hidden');
    stage3.removeAttribute('inert');
    const h = document.getElementById('quiz3-heading');
    (h || stage3).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const BMAP = { 'lt': '<', 'gt': '>', 'lt-slash': '</' };
  const btags = document.querySelectorAll('#brackets-quiz .btag');
  const bslots = Array.from(document.querySelectorAll('#brackets-quiz .bslot'));
  const bscoreEl = document.getElementById('brackets-score');

  function bUseChip(token) {
    const chip = document.querySelector(`#brackets-quiz .btag[data-token="${token}"]:not(.chip-used)`);
    if (chip) chip.classList.add('chip-used');
  }
  function bRestoreChip(token) {
    const chip = document.querySelector(`#brackets-quiz .btag[data-token="${token}"].chip-used`);
    if (chip) chip.classList.remove('chip-used');
  }
  function bRestoreAll() {
    document.querySelectorAll('#brackets-quiz .btag.chip-used').forEach(c => c.classList.remove('chip-used'));
  }
  function bClearSlots() {
    bslots.forEach(s => { s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    bscoreEl.textContent = 'Score: 0/4';
  }

  function updateBracketScore() {
    let correct = 0;
    bslots.forEach(s => {
      const placed = s.dataset.token || '';
      const need = s.dataset.accept || '';
      const ok = placed === need;
      if (ok) correct++;
      s.classList.toggle('correct', ok && placed);
      s.classList.toggle('incorrect', !ok && placed);
    });
    bscoreEl.textContent = `Score: ${correct}/4`;
    if (correct === 4) showQuiz4();
  }

  btags.forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', chip.dataset.token || '');
      e.dataTransfer.effectAllowed = 'copy';
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
    chip.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const token = chip.dataset.token || '';
      const target = bslots.find(s => (s.dataset.accept || '') === token && !s.dataset.token);
      if (!target || !BMAP[token] || chip.classList.contains('chip-used')) return;
      bUseChip(token);
      target.dataset.token = token; target.textContent = BMAP[token];
      updateBracketScore();
    });
  });

  bslots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('over');
      e.dataTransfer.dropEffect = 'copy';
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('over');
      const token = e.dataTransfer.getData('text/plain');
      if (!token || !BMAP[token]) return;
      const prev = slot.dataset.token || '';
      if (prev && prev !== token) bRestoreChip(prev);
      if (!prev || prev !== token) bUseChip(token);
      slot.dataset.token = token;
      slot.textContent = BMAP[token];
      updateBracketScore();
    });
    slot.addEventListener('dblclick', () => {
      const prev = slot.dataset.token || '';
      if (!prev) return;
      bRestoreChip(prev);
      slot.dataset.token = '';
      slot.textContent = '';
      slot.classList.remove('correct','incorrect');
      updateBracketScore();
    });
    slot.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        const prev = slot.dataset.token || '';
        if (prev) bRestoreChip(prev);
        slot.dataset.token = '';
        slot.textContent = '';
        slot.classList.remove('correct','incorrect');
        updateBracketScore();
      }
    });
  });

  const bReveal = document.getElementById('bq-reveal');
  bReveal && bReveal.addEventListener('click', () => {
    const showing = bReveal.dataset.state === 'shown';
    if (!showing) {
      const answers = ['lt','gt','lt-slash','gt'];
      bClearSlots();
      bRestoreAll();
      bslots.forEach((s, i) => { s.dataset.token = answers[i]; s.textContent = BMAP[answers[i]]; bUseChip(answers[i]); });
      updateBracketScore();
      bReveal.textContent = 'Hide Answer';
      bReveal.dataset.state = 'shown';
    } else {
      bClearSlots();
      bRestoreAll();
      updateBracketScore();
      bReveal.textContent = 'Show Answer';
      bReveal.dataset.state = 'hidden';
    }
  });
  const bReset = document.getElementById('bq-reset');
  bReset && bReset.addEventListener('click', () => {
    bClearSlots(); bRestoreAll(); updateBracketScore();
    if (bReveal) { bReveal.textContent = 'Show Answer'; bReveal.dataset.state = 'hidden'; }
  });

  // Quiz 4: Anchor tag fill
  const stage4 = document.getElementById('quiz4-screen');
  function showQuiz4() {
    if (!stage4 || !stage3) return;
    if (!stage4.classList.contains('is-hidden')) return;
    stage3.classList.add('is-hidden');
    stage3.setAttribute('aria-hidden','true');
    stage3.setAttribute('inert','');
    stage4.classList.remove('is-hidden');
    stage4.removeAttribute('aria-hidden');
    stage4.removeAttribute('inert');
    const h = document.getElementById('quiz4-heading');
    (h || stage4).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const ALMAP = { 'h1-open': '<h1>', 'h1-close': '</h1>' };
  const ltags = document.querySelectorAll('#link-quiz .ltag');
  const lslots = Array.from(document.querySelectorAll('#link-quiz .lslot'));
  const lscoreEl = document.getElementById('link-score');

  function aUseChip(token) {
    const chip = document.querySelector(`#link-quiz .ltag[data-token="${token}"]:not(.chip-used)`);
    if (chip) chip.classList.add('chip-used');
  }
  function aRestoreChip(token) {
    const chip = document.querySelector(`#link-quiz .ltag[data-token="${token}"].chip-used`);
    if (chip) chip.classList.remove('chip-used');
  }
  function aRestoreAll() {
    document.querySelectorAll('#link-quiz .ltag.chip-used').forEach(c => c.classList.remove('chip-used'));
  }
  function aClearSlots() {
    lslots.forEach(s => { s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    lscoreEl.textContent = 'Score: 0/2';
  }

  function updateLinkScore() {
    let correct = 0;
    lslots.forEach(s => {
      const placed = s.dataset.token || '';
      const need = s.dataset.accept || '';
      const ok = placed === need;
      if (ok) correct++;
      s.classList.toggle('correct', ok && placed);
      s.classList.toggle('incorrect', !ok && placed);
    });
    lscoreEl.textContent = `Score: ${correct}/2`;
    if (correct === 2) showDone();
  }

  ltags.forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', chip.dataset.token || '');
      e.dataTransfer.effectAllowed = 'copy';
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
    chip.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const token = chip.dataset.token || '';
      const target = lslots.find(s => (s.dataset.accept || '') === token && !s.dataset.token);
      if (!target || !ALMAP[token] || chip.classList.contains('chip-used')) return;
      aUseChip(token);
      target.dataset.token = token; target.textContent = ALMAP[token];
      updateLinkScore();
    });
  });

  lslots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('over');
      e.dataTransfer.dropEffect = 'copy';
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('over');
      const token = e.dataTransfer.getData('text/plain');
      if (!token || !ALMAP[token]) return;
      const prev = slot.dataset.token || '';
      if (prev && prev !== token) aRestoreChip(prev);
      if (!prev || prev !== token) aUseChip(token);
      slot.dataset.token = token;
      slot.textContent = ALMAP[token];
      updateLinkScore();
    });
    slot.addEventListener('dblclick', () => {
      const prev = slot.dataset.token || '';
      if (!prev) return;
      aRestoreChip(prev);
      slot.dataset.token = '';
      slot.textContent = '';
      slot.classList.remove('correct','incorrect');
      updateLinkScore();
    });
    slot.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        const prev = slot.dataset.token || '';
        if (prev) aRestoreChip(prev);
        slot.dataset.token = '';
        slot.textContent = '';
        slot.classList.remove('correct','incorrect');
        updateLinkScore();
      }
    });
  });

  const aReveal = document.getElementById('aq-reveal');
  aReveal && aReveal.addEventListener('click', () => {
    const showing = aReveal.dataset.state === 'shown';
    if (!showing) {
      const answers = ['h1-open','h1-close'];
      aClearSlots();
      aRestoreAll();
      lslots.forEach((s, i) => { s.dataset.token = answers[i]; s.textContent = ALMAP[answers[i]]; aUseChip(answers[i]); });
      updateLinkScore();
      aReveal.textContent = 'Hide Answer';
      aReveal.dataset.state = 'shown';
    } else {
      aClearSlots();
      aRestoreAll();
      updateLinkScore();
      aReveal.textContent = 'Show Answer';
      aReveal.dataset.state = 'hidden';
    }
  });
  const aReset = document.getElementById('aq-reset');
  aReset && aReset.addEventListener('click', () => {
    aClearSlots(); aRestoreAll(); updateLinkScore();
    if (aReveal) { aReveal.textContent = 'Show Answer'; aReveal.dataset.state = 'hidden'; }
  });

  // Done screen
  const stageDone = document.getElementById('quiz-done');
  function showDone() {
    if (!stageDone) return;
    if (stage4) {
      stage4.classList.add('is-hidden');
      stage4.setAttribute('aria-hidden','true');
      stage4.setAttribute('inert','');
    }
    stageDone.classList.remove('is-hidden');
    stageDone.removeAttribute('aria-hidden');
    stageDone.removeAttribute('inert');
    stageDone.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Restart all quizzes
  const restartBtn = document.getElementById('quiz-restart');
  restartBtn && restartBtn.addEventListener('click', () => {
    // reset quiz1
    drop.dataset.value = '';
    drop.textContent = 'Drop answer here';
    result.textContent = '';
    drop.classList.remove('correct','incorrect');

    // reset quiz2
    tagsClearSlots();
    tagsRestoreAllChips();

    // reset quiz3
    bClearSlots();
    bRestoreAll();
    const bRev = document.getElementById('bq-reveal');
    if (bRev) { bRev.textContent = 'Show Answer'; bRev.dataset.state = 'hidden'; }

    // reset quiz4
    aClearSlots();
    aRestoreAll();
    const aRev = document.getElementById('aq-reveal');
    if (aRev) { aRev.textContent = 'Show Answer'; aRev.dataset.state = 'hidden'; }

    // show stage1
    [stage2, stage3, stage4, stageDone].forEach(st => {
      if (!st) return;
      st.classList.add('is-hidden');
      st.setAttribute('aria-hidden','true');
      st.setAttribute('inert','');
    });
    if (stage1) {
      stage1.classList.remove('is-hidden');
      stage1.removeAttribute('aria-hidden');
      stage1.removeAttribute('inert');
      stage1.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    quiz2Shown = false;
  });
})();
