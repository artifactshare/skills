(() => {
  const data = {
    all: {
      mrr: ['4,820', '前月比 +8.4% ▲'],
      deals: ['64', '前月比 +14.3% ▲'],
      churn: ['1.2', '前月比 -0.3pt ▼（改善）'],
      sql: ['28.4', '前月比 -1.8pt ▼（要対策）'],
    },
    ent: {
      mrr: ['2,940', '前月比 +11.2% ▲'],
      deals: ['18', '前月比 +20.0% ▲'],
      churn: ['0.6', '前月比 -0.2pt ▼（改善）'],
      sql: ['34.1', '前月比 +1.4pt ▲'],
    },
    smb: {
      mrr: ['1,880', '前月比 +4.5% ▲'],
      deals: ['46', '前月比 +12.2% ▲'],
      churn: ['2.1', '前月比 -0.4pt ▼（改善）'],
      sql: ['24.6', '前月比 -3.1pt ▼（要対策）'],
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
          const unitEl = valEl.querySelector('.dads-kpi-unit');
          valEl.textContent = val;
          if (unitEl) valEl.appendChild(unitEl);
        }
        if (deltaEl) deltaEl.textContent = delta;
      });
    });
  });
})();
