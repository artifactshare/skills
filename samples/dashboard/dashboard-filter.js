(() => {
  const data = {
    all: {
      posters: ['48', '前月比 +17.1% ▲'],
      docs: ['312', '前月比 +9.5% ▲'],
      rev: ['64.2', '前月比 +4.8pt ▲'],
      unseen: ['11.4', '前月比 +1.2pt ▲（要改善）'],
    },
    dev: {
      posters: ['21', '前月比 +23.5% ▲'],
      docs: ['168', '前月比 +12.0% ▲'],
      rev: ['71.4', '前月比 +6.1pt ▲'],
      unseen: ['8.3', '前月比 -1.5pt ▼（改善）'],
    },
    biz: {
      posters: ['27', '前月比 +12.5% ▲'],
      docs: ['144', '前月比 +6.7% ▲'],
      rev: ['55.6', '前月比 +3.2pt ▲'],
      unseen: ['15.0', '前月比 +3.4pt ▲（要改善）'],
    },
  };

  const buttons = document.querySelectorAll('[data-seg]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const seg = btn.getAttribute('data-seg');
      const row = data[seg];
      if (!row) return;
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      Object.entries(row).forEach(([key, [val, delta]]) => {
        const valEl = document.querySelector(`[data-kpi="${key}"]`);
        const deltaEl = document.querySelector(`[data-delta="${key}"]`);
        if (valEl) {
          const unit = valEl.querySelector('.dads-kpi-unit')?.outerHTML || '';
          valEl.innerHTML = `${val}${unit}`;
        }
        if (deltaEl) deltaEl.textContent = delta;
      });
    });
  });
})();
