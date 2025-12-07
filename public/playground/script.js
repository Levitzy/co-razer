(() => {
  const LS_KEYS = {
    html: 'corazer.playground.html',
    cssFiles: 'corazer.playground.cssFiles',
    auto: 'corazer.playground.auto',
  };

  const DEFAULT_HTML = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Playground</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <main>\n    <h1>Hello, Playground 👋</h1>\n    <p>Edit index.html and linked CSS files. Add more files below and include them with &lt;link rel=\"stylesheet\" href=\"...\"&gt;.</p>\n  </main>\n</body>\n</html>`;

  const DEFAULT_CSS = `:root { color-scheme: light; }\nbody {\n  font: 16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial;\n  margin: 20px;\n  color: #0f172a;\n}\nmain { max-width: 820px; margin-inline: auto; }\nh1 {\n  margin: 0 0 6px;\n  font-size: clamp(1.6rem, 4vw, 2.4rem);\n  color: #111827;\n}\np { color: #334155; margin: 0 0 8px; }\nsection.card {\n  margin-top: 16px; padding: 12px; border-radius: 12px;\n  border: 1px solid #e5e7eb; background: #f8fafc;\n}`;

  const htmlEl = document.getElementById('html-input');
  const cssEditorsMount = document.getElementById('css-editors');
  const addCssBtn = document.getElementById('add-css-btn');
  const iframe = document.getElementById('preview');
  const autoToggle = document.getElementById('auto-update');
  const runBtn = document.getElementById('run-btn');
  const resetBtn = document.getElementById('reset-btn');

  const readLS = (k, fallback = '') => { try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; } };
  const writeLS = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const INDENT = '  ';

  // Lightweight editor-style indentation for textareas (Tab / Shift+Tab)
  function installIndentation(textarea, indent = INDENT) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();

      const { selectionStart, selectionEnd, value } = textarea;
      const start = selectionStart;
      const end = selectionEnd;
      const isShift = e.shiftKey;

      // Single-caret: insert or remove indent at caret
      if (start === end) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        if (!isShift) {
          textarea.value = value.slice(0, start) + indent + value.slice(end);
          textarea.selectionStart = textarea.selectionEnd = start + indent.length;
        } else {
          // Outdent only if present
          if (value.slice(lineStart, lineStart + indent.length) === indent) {
            textarea.value = value.slice(0, lineStart) + value.slice(lineStart + indent.length);
            const delta = start - lineStart >= indent.length ? indent.length : (start - lineStart);
            const pos = Math.max(lineStart, start - delta);
            textarea.selectionStart = textarea.selectionEnd = pos;
          }
        }
      } else {
        // Multi-line: indent/outdent every line intersecting selection
        const blockStart = value.lastIndexOf('\n', start - 1) + 1;
        const blockEndNewline = value.indexOf('\n', end);
        const blockEnd = blockEndNewline === -1 ? value.length : blockEndNewline;
        const before = value.slice(0, blockStart);
        const selected = value.slice(blockStart, blockEnd);
        const after = value.slice(blockEnd);

        const lines = selected.split('\n');
        const modified = (!isShift)
          ? lines.map(l => indent + l).join('\n')
          : lines.map(l => l.startsWith(indent) ? l.slice(indent.length) : l.replace(/^\t/, '')).join('\n');

        textarea.value = before + modified + after;
        // Reselect whole modified block (simple, predictable behavior)
        textarea.selectionStart = blockStart;
        textarea.selectionEnd = blockStart + modified.length;
      }

      // Trigger input listeners for persistence and live preview
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  // Virtual CSS files management
  function loadCssFiles() {
    const raw = readLS(LS_KEYS.cssFiles, '');
    if (!raw) {
      // Migrate from legacy single CSS key if present
      const legacy = readLS('corazer.playground.css', '');
      const initial = legacy || DEFAULT_CSS;
      return [{ name: 'styles.css', content: initial }];
    }
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
      return [{ name: 'styles.css', content: DEFAULT_CSS }];
    } catch {
      return [{ name: 'styles.css', content: DEFAULT_CSS }];
    }
  }
  function saveCssFiles(files) { writeLS(LS_KEYS.cssFiles, JSON.stringify(files)); }

  // In-memory state
  let cssFiles = loadCssFiles();
  let lastObjectUrls = [];

  // Render CSS editors list
  function renderCssEditors() {
    cssEditorsMount.innerHTML = '';
    cssFiles.forEach((file, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'pg-file';
      wrapper.dataset.index = String(index);

      const header = document.createElement('div');
      header.className = 'pg-file__header';

      const nameInput = document.createElement('input');
      nameInput.className = 'pg-file__name';
      nameInput.value = file.name;
      nameInput.setAttribute('aria-label', 'CSS filename');

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'pg-file__delete';
      delBtn.textContent = 'Delete';

      header.append(nameInput, delBtn);

      const content = document.createElement('textarea');
      content.className = 'pg-file__content';
      content.value = file.content;
      content.setAttribute('spellcheck', 'false');
      content.setAttribute('aria-label', `CSS content for ${file.name}`);

      wrapper.append(header, content);
      cssEditorsMount.appendChild(wrapper);

      // Enable Tab indentation in CSS editors
      installIndentation(content);

      nameInput.addEventListener('input', () => {
        const v = nameInput.value.trim() || `styles-${index + 1}.css`;
        cssFiles[index].name = v;
        saveCssFiles(cssFiles);
        if (autoToggle.checked) debouncedUpdate();
      });

      delBtn.addEventListener('click', () => {
        cssFiles.splice(index, 1);
        if (!cssFiles.length) cssFiles.push({ name: 'styles.css', content: '' });
        saveCssFiles(cssFiles);
        renderCssEditors();
        if (autoToggle.checked) debouncedUpdate();
      });

      content.addEventListener('input', () => {
        cssFiles[index].content = content.value;
        saveCssFiles(cssFiles);
        if (autoToggle.checked) debouncedUpdate();
      });
    });
  }

  function normalizeHref(href) {
    try { return href.trim().replace(/^\.\//, '').replace(/^\//, '').toLowerCase(); } catch { return href; }
  }

  function buildSrcdocWithFiles(html) {
    let doc;
    try {
      doc = new DOMParser().parseFromString(html, 'text/html');
    } catch {
      // Fallback to raw when parsing fails
      return html;
    }

    // Ensure viewport meta exists for responsiveness
    if (!doc.querySelector('meta[name="viewport"]')) {
      const meta = doc.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width, initial-scale=1');
      doc.head?.appendChild(meta);
    }

    // Remove any previously injected styles marked with our attribute
    doc.querySelectorAll('style[data-pg-filename]').forEach(s => s.remove());

    // Inline matching CSS files by replacing <link> with <style>
    const links = Array.from(doc.querySelectorAll('link[rel~="stylesheet"][href]'));
    if (links.length) {
      const fileMap = new Map(cssFiles.map(f => [normalizeHref(f.name), f.content]));
      links.forEach(link => {
        const href = normalizeHref(link.getAttribute('href') || '');
        if (!fileMap.has(href)) return;
        const style = doc.createElement('style');
        style.setAttribute('data-pg-filename', href);
        style.appendChild(doc.createTextNode(String(fileMap.get(href))));
        link.replaceWith(style);
      });
    }

    // Serialize back, including doctype
    const doctype = '<!DOCTYPE html>';
    return doctype + '\n' + doc.documentElement.outerHTML;
  }

  function updatePreview() {
    const html = htmlEl.value;
    const src = buildSrcdocWithFiles(html);
    iframe.srcdoc = src;
  }

  function debounce(fn, ms) {
    let t = 0;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
  const debouncedUpdate = debounce(updatePreview, 200);

  // Initial state
  const savedHTML = readLS(LS_KEYS.html, DEFAULT_HTML);
  const savedAuto = readLS(LS_KEYS.auto, 'true') !== 'false';
  htmlEl.value = savedHTML;
  autoToggle.checked = savedAuto;
  // Enable Tab indentation in HTML editor
  installIndentation(htmlEl);
  renderCssEditors();
  updatePreview();

  // Persistence
  htmlEl.addEventListener('input', () => {
    writeLS(LS_KEYS.html, htmlEl.value);
    if (autoToggle.checked) debouncedUpdate();
  });
  autoToggle.addEventListener('change', () => {
    writeLS(LS_KEYS.auto, String(autoToggle.checked));
  });

  // Controls
  runBtn.addEventListener('click', updatePreview);
  resetBtn.addEventListener('click', () => {
    // Reset HTML and CSS files to defaults
    htmlEl.value = DEFAULT_HTML;
    cssFiles = [{ name: 'styles.css', content: DEFAULT_CSS }];
    saveCssFiles(cssFiles);
    writeLS(LS_KEYS.html, DEFAULT_HTML);
    renderCssEditors();
    updatePreview();
  });

  addCssBtn.addEventListener('click', () => {
    // Create a unique filename
    const base = 'styles';
    let n = cssFiles.length + 1;
    let name = `${base}-${n}.css`;
    const existing = new Set(cssFiles.map(f => f.name));
    while (existing.has(name)) { n += 1; name = `${base}-${n}.css`; }
    cssFiles.push({ name, content: '' });
    saveCssFiles(cssFiles);
    renderCssEditors();
    if (autoToggle.checked) debouncedUpdate();
  });
})();
