(() => {
  const messagesEl = document.getElementById('ai-messages');
  const formEl = document.getElementById('ai-form');
  const inputEl = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');
  const clearBtn = document.getElementById('ai-clear');
  

  if (!messagesEl || !formEl || !inputEl) return;

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Initialize marked and escape raw HTML outside code blocks via renderer
  const markedLib = window.marked || null;
  if (markedLib) {
    const renderer = new markedLib.Renderer();
    renderer.html = (html) => escapeHtml(html);
    markedLib.setOptions({
      gfm: true,
      breaks: true,
      mangle: false,
      headerIds: false,
      renderer
    });
  }

  function renderMessage(role, text, opts = {}) {
    const el = document.createElement('div');
    el.className = `msg msg-${role}`;
    el.style.border = '1px solid var(--border)';
    el.style.borderRadius = '12px';
    el.style.padding = '10px 12px';
    el.style.background = role === 'user' ? 'rgba(255,255,255,0.02)' : 'rgba(100,245,161,0.06)';

    const who = document.createElement('div');
    who.className = 'msg-who';
    who.textContent = role === 'user' ? 'You' : 'AI';
    who.style.fontSize = '0.8rem';
    who.style.fontWeight = '600';
    who.style.color = 'var(--muted)';

    const body = document.createElement('div');
    body.className = 'msg-body';
    body.style.whiteSpace = 'pre-wrap';
    body.style.marginTop = '4px';

    
    const useMarkdown = !!opts.markdown && !!markedLib;
    if (useMarkdown) {
      body.style.whiteSpace = 'normal';
      body.innerHTML = markedLib.parse(String(text));
      // Make links open in new tab safely
      body.querySelectorAll('a').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });
      enhanceCodeBlocks(body);
    } else {
      body.innerHTML = escapeHtml(String(text));
    }

    el.appendChild(who);
    el.appendChild(body);
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  // Lightly normalize markdown while typing: ensure balanced fences for stable parsing
  function normalizeMarkdown(md, { live = false } = {}) {
    let text = String(md);
    if (!live) return text;
    const backtickCount = (text.match(/```/g) || []).length;
    const tildeCount = (text.match(/~~~(?=\s|$)/g) || []).length;
    if (backtickCount % 2 === 1) text += '\n```';
    if (tildeCount % 2 === 1) text += '\n~~~';
    return text;
  }

  function enhanceCodeBlocks(scopeEl, { withCopyButtons = true } = {}) {
    if (!scopeEl || !withCopyButtons) return;
    scopeEl.querySelectorAll('pre > code').forEach(code => {
      const pre = code.parentElement;
      if (!pre) return;
      pre.style.position = 'relative';
      if (!pre.querySelector('.copy-btn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Copy';
        btn.className = 'copy-btn';
        btn.style.position = 'absolute';
        btn.style.top = '8px';
        btn.style.right = '8px';
        btn.style.padding = '4px 8px';
        btn.style.fontSize = '12px';
        btn.style.borderRadius = '8px';
        btn.style.border = '1px solid var(--border)';
        btn.style.background = 'rgba(255,255,255,0.06)';
        btn.style.color = 'var(--text)';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(code.textContent || '');
            const prev = btn.textContent;
            btn.textContent = 'Copied!';
            btn.disabled = true;
            setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 1200);
          } catch (err) {
            const prev = btn.textContent;
            btn.textContent = 'Failed';
            setTimeout(() => { btn.textContent = prev; }, 1000);
          }
        });
        pre.appendChild(btn);
      }
    });
  }

  // Render markdown (or plain text) into an existing message body element
  function renderMarkdownInto(bodyEl, mdText, opts = {}) {
    if (!bodyEl) return;
    const useMarkdown = !!markedLib;
    if (useMarkdown) {
      bodyEl.style.whiteSpace = 'normal';
      const live = !!opts.live;
      const text = normalizeMarkdown(mdText, { live });
      bodyEl.innerHTML = markedLib.parse(text);
      bodyEl.querySelectorAll('a').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });
      if (opts.withCopyButtons !== false) enhanceCodeBlocks(bodyEl, { withCopyButtons: true });
    } else {
      bodyEl.style.whiteSpace = 'pre-wrap';
      bodyEl.textContent = String(mdText);
    }
  }

  // Typewriter effect into an existing message's body element
  function typeWriter(bodyEl, fullText, { scrollEl = messagesEl, liveMarkdown = false, parseMarkdownAfter = true } = {}) {
    return new Promise(resolve => {
      if (!bodyEl) { resolve(); return; }
      const text = String(fullText);
      bodyEl.classList.add('typing');
      if (liveMarkdown && markedLib) {
        bodyEl.style.whiteSpace = 'normal';
        bodyEl.innerHTML = '';
      } else {
        bodyEl.style.whiteSpace = 'pre-wrap';
        bodyEl.textContent = '';
      }

      let i = 0;
      const n = text.length;
      const baseDelay = 18; // ms per tick, slightly slower for MD parsing

      function step() {
        if (i >= n) {
          bodyEl.classList.remove('typing');
          if (parseMarkdownAfter || (liveMarkdown && markedLib)) {
            renderMarkdownInto(bodyEl, text, { withCopyButtons: true });
          } else {
            bodyEl.textContent = text;
          }
          if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
          resolve();
          return;
        }

        const remaining = n - i;
        const chunk = remaining > 1500 ? 10 : remaining > 600 ? 6 : remaining > 200 ? 3 : 1;
        i += chunk;
        const sofar = text.slice(0, i);
        if (liveMarkdown && markedLib) {
          renderMarkdownInto(bodyEl, sofar, { withCopyButtons: false, live: true });
        } else {
          bodyEl.textContent += text.slice(i - chunk, i);
        }
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
        setTimeout(() => requestAnimationFrame(step), baseDelay);
      }
      step();
    });
  }

  // Simple animated dots for the thinking placeholder
  function startThinkingAnimation(msgEl) {
    const body = msgEl && msgEl.querySelector('.msg-body');
    if (!body) return () => {};
    let dots = 0;
    let cancelled = false;
    const base = 'Thinking';
    body.classList.add('typing');
    body.textContent = base;
    const id = setInterval(() => {
      if (cancelled) return;
      dots = (dots + 1) % 4; // 0..3
      body.textContent = base + '.'.repeat(dots);
    }, 400);
    return () => { cancelled = true; clearInterval(id); body.classList.remove('typing'); };
  }

  async function ask(prompt) {
    if (!prompt.trim()) return;
    renderMessage('user', prompt);

    // loading placeholder
    const thinking = renderMessage('ai', 'Thinking');
    const stopDots = startThinkingAnimation(thinking);

    try {
      sendBtn.disabled = true;
      const payload = { prompt };
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        const errText = `Error: ${data && data.error ? data.error : 'Request failed'}`;
        const body = thinking.querySelector('.msg-body');
        stopDots();
        if (body) { body.classList.remove('typing'); body.textContent = errText; }
        return;
      }
      const text = data && data.text ? data.text : '(no response)';
      const body = thinking.querySelector('.msg-body');
      stopDots();
      await typeWriter(body, text, { liveMarkdown: true, parseMarkdownAfter: true });
    } catch (e) {
      const body = thinking.querySelector('.msg-body');
      const errText = `Error: ${e.message || e}`;
      stopDots();
      if (body) { body.classList.remove('typing'); body.textContent = errText; }
    } finally {
      sendBtn.disabled = false;
    }
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = inputEl.value;
    inputEl.value = '';
    ask(q);
  });

  clearBtn && clearBtn.addEventListener('click', () => {
    messagesEl.innerHTML = '';
    inputEl.value = '';
    inputEl.focus();
  });

  // Suggestions
  document.querySelectorAll('[data-example]')
    .forEach(btn => btn.addEventListener('click', () => {
      inputEl.value = btn.textContent.trim();
      inputEl.focus();
    }));

  
})();
