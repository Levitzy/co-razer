// HTML RGB/RGBA quizzes (drag-and-drop only)
(function(){
  const q1 = document.getElementById('rq1');
  const q2 = document.getElementById('rq2');
  const q3 = document.getElementById('rq3');
  const qDone = document.getElementById('rq-done');

  const show = el => { if (!el) return; el.classList.remove('is-hidden'); el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const hide = el => { if (!el) return; el.classList.add('is-hidden'); el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); };

  // Generic link stage helper
  function linkStage(scopeId, tokenMap, scoreId, onComplete) {
    const scope = `#${scopeId}`;
    const lslots = Array.from(document.querySelectorAll(`${scope} .lslot`));
    const chips = document.querySelectorAll(`${scope} .ltag`);
    const score = document.getElementById(scoreId);
    if (!lslots.length) return { reset(){} };

    function update(){
      let correct = 0; const total = lslots.length;
      lslots.forEach(s => {
        const ok = (s.dataset.token||'') === (s.dataset.accept||'');
        if (ok) correct++;
        s.classList.toggle('correct', ok && s.dataset.token);
        s.classList.toggle('incorrect', !ok && s.dataset.token);
      });
      if (score) score.textContent = `Score: ${correct}/${total}`;
      if (correct === total && typeof onComplete === 'function') onComplete();
    }

    chips.forEach(chip => {
      chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', chip.dataset.token||''); e.dataTransfer.effectAllowed='copy'; chip.classList.add('dragging'); });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
      chip.addEventListener('keydown', e => { if(e.key!=='Enter' && e.key!==' ') return; e.preventDefault(); const token=chip.dataset.token||''; const target=lslots.find(s => (s.dataset.accept||'')===token && !s.dataset.token); if(!target) return; chip.classList.add('chip-used'); target.dataset.token=token; target.textContent=tokenMap[token]; update(); });
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

  // Stage wiring
  const s1 = linkStage('rgb-red', { r:'255', g:'0', b:'0', open:'rgb(', comma:', ', close:')' }, 'rq1-score', () => { hide(q1); show(q2); });
  const s2 = linkStage('rgb-gray', { a:'100', b:'100', c:'100', open:'rgb(', comma:', ', close:')' }, 'rq2-score', () => { hide(q2); show(q3); });
  const s3 = linkStage('rgba-demo', { r:'255', g:'99', b:'71', a:'0.5', open:'rgba(', comma:', ', close:')' }, 'rq3-score', () => { hide(q3); show(qDone); });

  document.getElementById('rq-restart')?.addEventListener('click', () => {
    s1?.reset(); s2?.reset(); s3?.reset();
    [q2,q3,qDone].forEach(hide); show(q1);
  });
})();

