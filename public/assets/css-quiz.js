// Generic drag-and-drop quiz engine for CSS documentation pages
(function () {
  const quizzes = document.querySelectorAll('.css-quiz');
  if (!quizzes.length) return;

  quizzes.forEach((quiz, quizIndex) => {
    const stages = Array.from(quiz.querySelectorAll('.quiz-stage'));
    if (!stages.length) return;

    const donePanel = quiz.querySelector('[data-role="quiz-done"]');
    let activeStage = 0;
    const stageControllers = stages.map((stage, stageIndex) =>
      initStage(stage, `${quizIndex}-${stageIndex}`)
    );

    function initStage(stage, stagePrefix) {
      const slots = Array.from(stage.querySelectorAll('.drop-slot'));
      const tokens = Array.from(stage.querySelectorAll('.drag-token'));
      const scoreEl = stage.querySelector('[data-role="score"]');
      const feedbackEl = stage.querySelector('[data-role="complete"]');
      const resetButtons = stage.querySelectorAll('[data-role="reset"]');

      slots.forEach((slot, slotIndex) => {
        const placeholder =
          slot.dataset.placeholder || slot.innerHTML.trim() || 'Drop here';
        slot.dataset.placeholder = placeholder;
        slot.dataset.slotId = `${stagePrefix}-${slotIndex}`;
        slot.dataset.token = '';
        slot.innerHTML = placeholder;
        slot.classList.remove('correct', 'incorrect');
        if (!slot.hasAttribute('tabindex')) slot.setAttribute('tabindex', '0');
        if (!slot.hasAttribute('role')) slot.setAttribute('role', 'button');

        slot.addEventListener('dragover', (event) => {
          event.preventDefault();
          slot.classList.add('over');
          event.dataTransfer.dropEffect = 'copy';
        });

        slot.addEventListener('dragleave', () => slot.classList.remove('over'));

        slot.addEventListener('drop', (event) => {
          event.preventDefault();
          slot.classList.remove('over');
          const tokenKey = event.dataTransfer.getData('text/plain');
          if (!tokenKey) return;
          const tokenEl = tokens.find(
            (tok) => (tok.dataset.token || '') === tokenKey
          );
          if (!tokenEl) return;
          assignToken(slot, tokenEl);
        });

        slot.addEventListener('dblclick', () => clearSlot(slot));
        slot.addEventListener('keydown', (event) => {
          if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            clearSlot(slot);
          }
        });
      });

      tokens.forEach((token) => {
        token.setAttribute('draggable', 'true');
        if (!token.hasAttribute('tabindex')) token.setAttribute('tabindex', '0');
        if (!token.hasAttribute('role')) token.setAttribute('role', 'button');

        token.addEventListener('dragstart', (event) => {
          event.dataTransfer.setData('text/plain', token.dataset.token || '');
          event.dataTransfer.effectAllowed = 'copy';
          token.classList.add('dragging');
        });

        token.addEventListener('dragend', () => token.classList.remove('dragging'));

        token.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          const target = slots.find(
            (slot) =>
              (slot.dataset.accept || '') === (token.dataset.token || '') &&
              !(slot.dataset.token || '')
          );
          if (target) assignToken(target, token);
        });
      });

      resetButtons.forEach((btn) =>
        btn.addEventListener('click', () => resetStage())
      );

      function assignToken(slot, tokenEl) {
        if (!slot || !tokenEl) return;
        const tokenName = tokenEl.dataset.token || '';
        if (!tokenName) return;

        const previousSlotId = tokenEl.dataset.slotId;
        if (previousSlotId && previousSlotId !== slot.dataset.slotId) {
          const previousSlot = slots.find(
            (candidate) => candidate.dataset.slotId === previousSlotId
          );
          if (previousSlot) clearSlot(previousSlot, { silent: true });
        }

        clearSlot(slot, { silent: true });

        slot.dataset.token = tokenName;
        const display = tokenEl.dataset.display || tokenEl.innerHTML.trim();
        slot.innerHTML = display;
        tokenEl.classList.add('token-used');
        tokenEl.dataset.slotId = slot.dataset.slotId;
        updateScore();
      }

      function clearSlot(slot, { silent = false } = {}) {
        const currentToken = slot.dataset.token || '';
        if (currentToken) {
          const tokenEl = tokens.find(
            (tok) =>
              (tok.dataset.token || '') === currentToken &&
              (tok.dataset.slotId || '') === slot.dataset.slotId
          );
          if (tokenEl) {
            tokenEl.classList.remove('token-used');
            tokenEl.removeAttribute('data-slot-id');
          }
        }
        slot.dataset.token = '';
        slot.innerHTML = slot.dataset.placeholder;
        slot.classList.remove('correct', 'incorrect');
        if (!silent) updateScore();
      }

      function updateScore() {
        const total = slots.length;
        let correct = 0;

        slots.forEach((slot) => {
          const expected = slot.dataset.accept || '';
          const current = slot.dataset.token || '';
          const isMatch = !!current && current === expected;
          if (isMatch) correct += 1;
          slot.classList.toggle('correct', isMatch);
          slot.classList.toggle('incorrect', !!current && !isMatch);
        });

        if (scoreEl) scoreEl.textContent = `Score: ${correct}/${total}`;

        if (correct === total && total > 0) {
          if (!stage.classList.contains('stage-complete')) {
            stage.classList.add('stage-complete');
            if (feedbackEl) feedbackEl.classList.remove('is-hidden');
            setTimeout(() => advanceStage(stage), 620);
          }
        }
      }

      function resetStage() {
        slots.forEach((slot) => clearSlot(slot, { silent: true }));
        tokens.forEach((token) => {
          token.classList.remove('token-used');
          token.removeAttribute('data-slot-id');
        });
        slots.forEach((slot) => {
          slot.innerHTML = slot.dataset.placeholder;
          slot.classList.remove('correct', 'incorrect');
        });
        if (scoreEl) scoreEl.textContent = `Score: 0/${slots.length}`;
        if (feedbackEl) feedbackEl.classList.add('is-hidden');
        stage.classList.remove('stage-complete');
      }

      resetStage();
      return { reset: resetStage };
    }

    function showStage(index) {
      activeStage = index;
      stages.forEach((stage, idx) => {
        const isActive = idx === index;
        stage.classList.toggle('is-hidden', !isActive);
        stage.classList.toggle('active', isActive);
        if (isActive) {
          stage.removeAttribute('aria-hidden');
          if (typeof stage.focus === 'function') {
            stage.focus();
          }
        } else {
          stage.setAttribute('aria-hidden', 'true');
        }
      });
      if (donePanel) {
        donePanel.classList.add('is-hidden');
        donePanel.setAttribute('aria-hidden', 'true');
      }
    }

    function advanceStage(stage) {
      const index = stages.indexOf(stage);
      if (index === -1 || index !== activeStage) return;

      if (index < stages.length - 1) {
        showStage(index + 1);
      } else {
        finishQuiz();
      }
    }

    function finishQuiz() {
      stages.forEach((stage) => {
        stage.classList.add('is-hidden');
        stage.setAttribute('aria-hidden', 'true');
      });
      if (donePanel) {
        donePanel.classList.remove('is-hidden');
        donePanel.removeAttribute('aria-hidden');
      }
      activeStage = stages.length;
    }

    function restartQuiz() {
      stageControllers.forEach((controller) => controller.reset());
      showStage(0);
    }

    const restartButtons = quiz.querySelectorAll('[data-role="restart"]');
    restartButtons.forEach((btn) =>
      btn.addEventListener('click', () => restartQuiz())
    );

    showStage(0);
  });
})();
