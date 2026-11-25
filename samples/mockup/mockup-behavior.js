(() => {
  const form = document.getElementById('mock-request-form');
  const tbody = document.getElementById('mock-list-body');
  const feedback = document.getElementById('mock-feedback');
  const feedbackText = document.getElementById('mock-feedback-text');
  const countBadge = document.querySelector('[data-mock-count]');
  const tabList = document.getElementById('tab-list');

  if (!form || !tbody) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tool = document.getElementById('req-tool')?.value.trim();
    const dept = document.getElementById('req-dept')?.value;
    const budget = Number(document.getElementById('req-budget')?.value || 0);
    const owner = document.getElementById('req-owner')?.value.trim();

    if (!tool || !owner) {
      feedback.hidden = false;
      feedback.setAttribute('data-type', 'error');
      feedbackText.textContent = '必須項目（ツール名・申請者名）を入力してください。';
      return;
    }

    const tr = document.createElement('tr');
    const autoApprove = budget <= 5000;
    const statusBadge = autoApprove
      ? '<span class="dads-badge dads-badge--success">少額枠・即時承認</span>'
      : '<span class="dads-badge dads-badge--warning">決裁待ち</span>';
    tr.innerHTML = `
      <td>${tool.replaceAll('<', '&lt;')}</td>
      <td>${dept}</td>
      <td>${owner.replaceAll('<', '&lt;')}</td>
      <td data-num>¥${budget.toLocaleString('ja-JP')}</td>
      <td>${statusBadge}</td>
    `;
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
