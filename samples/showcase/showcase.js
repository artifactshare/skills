(() => {
  const stage = document.getElementById('showcase-stage');
  const frame = document.getElementById('showcase-frame');
  const fsBtn = document.getElementById('fullscreen-btn');
  const fsExitBtn = document.getElementById('fullscreen-exit-btn');
  const fsBar = document.getElementById('showcase-fs-bar');
  const demoBtns = Array.from(document.querySelectorAll('[data-demo]'));
  const paletteBtns = Array.from(document.querySelectorAll('[data-switch-palette]'));
  const copyBtn = document.getElementById('copy-install-btn');
  const installCmd = document.getElementById('install-cmd');

  let currentPalette = 'blue';
  let isExpanded = false;

  const applyPaletteToFrame = () => {
    frame?.contentWindow?.postMessage({ type: 'dads:set-palette', palette: currentPalette }, '*');
    try {
      const docEl = frame?.contentDocument?.documentElement;
      if (docEl) {
        docEl.setAttribute('data-palette', currentPalette);
      }
    } catch {
      // cross-origin or file:// fallback handled by postMessage
    }
  };

  const setExpanded = (expand) => {
    if (!stage || !frame || !fsBar) return;
    isExpanded = expand;
    if (expand) {
      stage.style.position = 'fixed';
      stage.style.inset = '0';
      stage.style.zIndex = '9999';
      fsBar.hidden = false;
      fsExitBtn?.focus();
    } else {
      stage.style.position = '';
      stage.style.inset = '';
      stage.style.zIndex = '';
      fsBar.hidden = true;
      fsBtn?.focus();
    }
  };

  fsBtn?.addEventListener('click', () => setExpanded(true));
  fsExitBtn?.addEventListener('click', () => setExpanded(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isExpanded) {
      setExpanded(false);
    }
  });

  frame?.addEventListener('load', applyPaletteToFrame);

  demoBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const file = btn.getAttribute('data-file');
      if (!file || !frame) return;
      demoBtns.forEach((b) => {
        b.setAttribute('data-type', b === btn ? 'solid-fill' : 'outline');
      });
      frame.setAttribute('src', file);
    });
  });

  paletteBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-switch-palette');
      if (!p) return;
      currentPalette = p;
      document.documentElement.setAttribute('data-palette', p);
      paletteBtns.forEach((b) => {
        b.classList.toggle('dads-badge--primary', b === btn);
      });
      applyPaletteToFrame();
    });
  });

  copyBtn?.addEventListener('click', async () => {
    const text = installCmd?.textContent?.trim() || 'npx skills add artifactshare/skills';
    try {
      await navigator.clipboard.writeText(text);
      const orig = copyBtn.textContent;
      copyBtn.textContent = 'コピーしました';
      setTimeout(() => {
        copyBtn.textContent = orig;
      }, 1800);
    } catch {
      // clipboard unavailable
    }
  });
})();
