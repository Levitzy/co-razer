// Interactive quiz for HTML Attributes page
(function() {
  // Stage 1: DnD correct attribute syntax
  const dndDrop = document.getElementById('attr-drop');
  const dndChoices = document.querySelectorAll('#attr-dnd .dnd-choice');
  const dndResult = document.getElementById('attr-dnd-result');
  const CORRECT_SYNTAX = "<img src='img_girl.jpg'>";

  if (!dndDrop) return; // Abort if page structure missing

  dndChoices.forEach(choice => {
    choice.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', choice.dataset.value || '');
      e.dataTransfer.effectAllowed = 'copy';
      choice.classList.add('dragging');
    });
    choice.addEventListener('dragend', () => choice.classList.remove('dragging'));
  });

  dndDrop.addEventListener('dragover', (e) => { e.preventDefault(); dndDrop.classList.add('over'); e.dataTransfer.dropEffect = 'copy'; });
  dndDrop.addEventListener('dragleave', () => dndDrop.classList.remove('over'));
  dndDrop.addEventListener('drop', (e) => {
    e.preventDefault(); dndDrop.classList.remove('over');
    const val = e.dataTransfer.getData('text/plain');
    dndDrop.textContent = val || 'Drop answer here';
    const ok = val === CORRECT_SYNTAX;
    dndResult.innerHTML = ok ? '<strong>Correct!</strong>' : 'Incorrect.';
    dndDrop.classList.toggle('correct', ok);
    dndDrop.classList.toggle('incorrect', !ok);
    if (ok) showAq2();
  });

  // Stage transitions
  const aq1 = document.getElementById('aq1');
  const aq2 = document.getElementById('aq2');
  const aq3 = document.getElementById('aq3');
  const aq4 = document.getElementById('aq4');
  const aq5 = document.getElementById('aq5');
  const aqDone = document.getElementById('aq-done');

  function hide(el) { if (!el) return; el.classList.add('is-hidden'); el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); }
  function show(el, focusEl) { if (!el) return; el.classList.remove('is-hidden'); el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); (focusEl || el).scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  function showAq2() { hide(aq1); show(aq2, aq2.querySelector('h3')); }
  function showAq3() { hide(aq2); show(aq3, aq3.querySelector('h3')); }
  function showAq4() { hide(aq3); show(aq4, aq4.querySelector('h3')); }
  function showAq5() { hide(aq4); show(aq5, aq5.querySelector('h3')); }
  function showDone() { hide(aq5); show(aqDone, aqDone.querySelector('h3')); }

  // Shared helpers for tag-like chips
  function useChip(scopeSelector, token) {
    const chip = document.querySelector(`${scopeSelector} .tag[data-token="${token}"]:not(.chip-used)`);
    if (chip) chip.classList.add('chip-used');
  }
  function restoreChip(scopeSelector, token) {
    const chip = document.querySelector(`${scopeSelector} .tag[data-token="${token}"].chip-used`);
    if (chip) chip.classList.remove('chip-used');
  }

  // Stage 2: title attribute
  (function initTitleQuiz(){
    const TOKENS = { 'title-about': 'title="About W3Schools"' };
    const scope = '#title-quiz';
    const slots = Array.from(document.querySelectorAll(`${scope} .slot`));
    const score = document.getElementById('title-score');
    const chips = document.querySelectorAll(`${scope} .tag`);
    chips.forEach(chip => chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token || ''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); }));
    chips.forEach(chip => chip.addEventListener('dragend', () => chip.classList.remove('dragging')));
    slots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => {
        e.preventDefault(); slot.classList.remove('over');
        const token = e.dataTransfer.getData('text/plain');
        if (!TOKENS[token]) return;
        const prev = slot.dataset.token || '';
        if (prev && prev !== token) restoreChip(scope, prev);
        if (!prev || prev !== token) useChip(scope, token);
        slot.dataset.token = token; slot.textContent = TOKENS[token];
        const correct = slots.every(s => s.dataset.token && TOKENS[s.dataset.token] && s.dataset.accept === s.dataset.token);
        score.textContent = `Score: ${correct ? 1 : 0}/1`;
        if (correct) setTimeout(showAq3, 500);
      });
      slot.addEventListener('dblclick', () => {
        const prev = slot.dataset.token || ''; if (!prev) return; restoreChip(scope, prev); slot.dataset.token=''; slot.textContent=''; score.textContent='Score: 0/1';
      });
      slot.addEventListener('keydown', e => { if (e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev) restoreChip(scope, prev); slot.dataset.token=''; slot.textContent=''; score.textContent='Score: 0/1'; }});
    });
  })();

  // Stage 3: width/height
  (function initSizeQuiz(){
    const TOKENS = { 'w-250': 'width="250"', 'h-400': 'height="400"' };
    const scope = '#size-quiz';
    const slots = Array.from(document.querySelectorAll(`${scope} .slot`));
    const score = document.getElementById('size-score');
    const chips = document.querySelectorAll(`${scope} .tag`);
    chips.forEach(chip => chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token || ''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); }));
    chips.forEach(chip => chip.addEventListener('dragend', () => chip.classList.remove('dragging')));
    function update() {
      let correct = 0; slots.forEach(s => { const ok = s.dataset.token === s.dataset.accept; if (ok) correct++; s.classList.toggle('correct', ok && s.dataset.token); s.classList.toggle('incorrect', !ok && s.dataset.token); });
      score.textContent = `Score: ${correct}/2`; if (correct === 2) setTimeout(showAq4, 500);
    }
    slots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('over'); const token = e.dataTransfer.getData('text/plain'); if (!TOKENS[token]) return; const prev = slot.dataset.token || ''; if (prev && prev !== token) restoreChip(scope, prev); if (!prev || prev !== token) useChip(scope, token); slot.dataset.token = token; slot.textContent = TOKENS[token]; update(); });
      slot.addEventListener('dblclick', () => { const prev = slot.dataset.token || ''; if (!prev) return; restoreChip(scope, prev); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); });
      slot.addEventListener('keydown', e => { if (e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev) restoreChip(scope, prev); slot.dataset.token=''; slot.textContent=''; slot.classList.remove('correct','incorrect'); update(); }});
    });
  })();

  // Stage 4: href=
  (function initHrefQuiz(){
    const ALMAP = { 'href-eq': 'href=' };
    const scope = '#href-quiz';
    const lslots = Array.from(document.querySelectorAll(`${scope} .lslot`));
    const score = document.getElementById('href-score');
    const chips = document.querySelectorAll(`${scope} .ltag`);
    chips.forEach(chip => chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token || ''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); }));
    chips.forEach(chip => chip.addEventListener('dragend', () => chip.classList.remove('dragging')));
    function update() { const ok = lslots.every(s => s.dataset.token === s.dataset.accept); score.textContent = `Score: ${ok ? 1 : 0}/1`; if (ok) setTimeout(showAq5, 500); }
    lslots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('over'); const token = e.dataTransfer.getData('text/plain'); if (!ALMAP[token]) return; const prev = slot.dataset.token || ''; if (prev && prev !== token) { /* nothing to restore here as there is only one chip */ } slot.dataset.token = token; slot.textContent = ALMAP[token]; update(); });
      slot.addEventListener('dblclick', () => { const prev = slot.dataset.token || ''; if (!prev) return; slot.dataset.token=''; slot.textContent=''; update(); });
      slot.addEventListener('keydown', e => { if (e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev){} slot.dataset.token=''; slot.textContent=''; update(); }});
    });
  })();

  // Stage 5: alt
  (function initAltQuiz(){
    const TOKENS = { 'alt-key': 'alt' };
    const scope = '#alt-quiz';
    const slots = Array.from(document.querySelectorAll(`${scope} .slot`));
    const score = document.getElementById('alt-score');
    const chips = document.querySelectorAll(`${scope} .tag`);
    chips.forEach(chip => chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token || ''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); }));
    chips.forEach(chip => chip.addEventListener('dragend', () => chip.classList.remove('dragging')));
    function update() { const ok = slots.every(s => s.dataset.token === s.dataset.accept); score.textContent = `Score: ${ok ? 1 : 0}/1`; if (ok) setTimeout(showDone, 600); }
    slots.forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('over'); e.dataTransfer.dropEffect='copy'; });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => { e.preventDefault(); slot.classList.remove('over'); const token = e.dataTransfer.getData('text/plain'); if (!TOKENS[token]) return; const prev = slot.dataset.token || ''; if (prev && prev !== token) restoreChip(scope, prev); if (!prev || prev !== token) useChip(scope, token); slot.dataset.token = token; slot.textContent = TOKENS[token]; update(); });
      slot.addEventListener('dblclick', () => { const prev = slot.dataset.token || ''; if (!prev) return; restoreChip(scope, prev); slot.dataset.token=''; slot.textContent=''; update(); });
      slot.addEventListener('keydown', e => { if (e.key==='Backspace'||e.key==='Delete'){ e.preventDefault(); const prev=slot.dataset.token||''; if(prev) restoreChip(scope, prev); slot.dataset.token=''; slot.textContent=''; update(); }});
    });
  })();

  // Restart
  document.getElementById('aq-restart')?.addEventListener('click', () => {
    // Reset stage 1
    dndDrop.textContent = 'Drop answer here'; dndResult.textContent = ''; dndDrop.classList.remove('correct','incorrect');
    // Clear chips and slots in other stages
    document.querySelectorAll('#attr-quiz-stage .slot, #attr-quiz-stage .lslot').forEach(s => { s.dataset.token=''; s.textContent=''; s.classList.remove('correct','incorrect'); });
    document.querySelectorAll('#attr-quiz-stage .tag.chip-used').forEach(c => c.classList.remove('chip-used'));
    const resetScores = [['#title-score','0/1'],['#size-score','0/2'],['#href-score','0/1'],['#alt-score','0/1']];
    resetScores.forEach(([sel,val]) => { const el=document.querySelector(sel); if (el) el.textContent = `Score: ${val}`; });
    // Show stage 1
    [aq2, aq3, aq4, aq5, aqDone].forEach(hide); aq1 && (aq1.classList.remove('is-hidden'), aq1.removeAttribute('aria-hidden'), aq1.removeAttribute('inert'), aq1.scrollIntoView({ behavior: 'smooth' }));
  });
})();

