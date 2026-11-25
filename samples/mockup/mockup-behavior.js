(() => {
  const form = document.getElementById('mock-request-form');
  const tbody = document.getElementById('mock-list-body');
  const feedback = document.getElementById('mock-feedback');
  const feedbackText = document.getElementById('mock-feedback-text');
  const countBadge = document.querySelector('[data-mock-count]');
  const tabList = document.getElementById('tab-list');

  if (!form || !tbody) return;

  const makeCell = (text, isNum = false) => {
    const td = document.createElement('td');
    td.textContent = text;
    if (isNum) td.setAttribute('data-num', '');
    return td;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tool = document.getElementById('req-tool')?.value.trim();
    const dept = document.getElementById('req-dept')?.value || '';
    const budget = Number(document.getElementById('req-budget')?.value || 0);
    const owner = document.getElementById('req-owner')?.value.trim();

    if (!tool || !owner) {
      feedback.hidden = false;
      feedback.setAttribute('data-type', 'error');
      feedbackText.textContent = '必須項目（ツール名・申請者名）を入力してください。';
      return;
    }

    const tr = document.createElement('tr');
    tr.appendChild(makeCell(tool));
    tr.appendChild(makeCell(dept));
    tr.appendChild(makeCell(owner));
    tr.appendChild(makeCell(`¥${budget.toLocaleString('ja-JP')}`, true));

    const statusTd = document.createElement('td');
    const badge = document.createElement('span');
    const autoApprove = budget <= 5000;
    badge.className = autoApprove ? 'dads-badge dads-badge--success' : 'dads-badge dads-badge--warning';
    badge.textContent = autoApprove ? '少額枠・即時承認' : '決裁待ち';
    statusTd.appendChild(badge);
    tr.appendChild(statusTd);

    tbody.prepend(tr);

    if (countBadge) {
      countBadge.textContent = `登録済み ${tbody.querySelectorAll('tr').length} 件`;
    }
    feedback.hidden = false;
    feedback.setAttribute('data-type', 'info-1');
    feedbackText.textContent = `「${tool}」（¥${budget.toLocaleString('ja-JP')}/月）を申請一覧に登録しました。`;
    form.reset();
    tabList?.click();
  });
})();
