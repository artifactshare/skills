(() => {
  const frame = document.getElementById('showcase-frame');
  const openLink = document.getElementById('open-standalone');
  const demoBtns = Array.from(document.querySelectorAll('[data-demo]'));
  const paletteBtns = Array.from(document.querySelectorAll('[data-switch-palette]'));
  const copyBtn = document.getElementById('copy-install-btn');
  const installCmd = document.getElementById('install-cmd');

  let currentPalette = 'green';

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

  frame?.addEventListener('load', applyPaletteToFrame);

  demoBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const file = btn.getAttribute('data-file');
      if (!file || !frame) return;
      demoBtns.forEach((b) => {
        b.setAttribute('data-type', b === btn ? 'solid-fill' : 'outline');
      });
      frame.setAttribute('src', file);
      openLink?.setAttribute('href', file);
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
