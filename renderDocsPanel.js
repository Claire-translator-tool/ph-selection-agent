function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getDocsForModel(documents, model) {
  const globalDocs = documents?.globalDocs || [];
  const byModel = documents?.byModel?.[model] || [];
  return [...byModel, ...globalDocs];
}

export function renderDocsPanel(documents, model) {
  const docs = getDocsForModel(documents, model);
  return `
    <section class="panel docs-panel" id="docs-panel">
      <div class="section-title">
        <span>资料模块</span>
        <small>${escapeHtml(model || '未选择型号')}</small>
      </div>
      <div class="doc-grid">
        ${docs.map((doc) => `
          <a class="doc-card" href="${escapeHtml(doc.href)}" target="_blank" rel="noopener">
            <span>${escapeHtml(doc.type)}</span>
            <strong>${escapeHtml(doc.title)}</strong>
            <small>${escapeHtml(doc.status || '')}</small>
            <p>${escapeHtml(doc.note || '')}</p>
          </a>
        `).join('')}
      </div>
      <p class="strict-note">防爆、本安、SIL、回路参数必须以正式样册、证书和安全手册为准；页面推荐只做初步选型。</p>
    </section>
  `;
}
