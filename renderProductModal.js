function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function imageHtml(product) {
  if (product.image) {
    return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.model)} 产品图片">`;
  }
  return `<div class="image-placeholder modal-placeholder"><span>${escapeHtml(product.ioType || 'PH')}</span><small>待补图片</small></div>`;
}

export function renderProductModal(product, documents = []) {
  const specs = product.specs || [];
  const basis = product.selectionBasis || [];
  return `
    <div class="modal-card">
      <button class="modal-close" data-action="close-modal">×</button>
      <section class="modal-hero">
        <div class="modal-product-image">${imageHtml(product)}</div>
        <div>
          <span class="badge primary">${escapeHtml(product.category || '产品')}</span>
          <h2>${escapeHtml(product.model)} ${escapeHtml(product.name)}</h2>
          <p>${escapeHtml(product.description)}</p>
          <div class="mini-tags">${(product.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
        </div>
      </section>

      <section class="modal-section">
        <h3>核心特点</h3>
        <div class="feature-grid">
          ${(product.features || []).map((feature) => `<div>✓ ${escapeHtml(feature)}</div>`).join('')}
        </div>
      </section>

      <section class="modal-section">
        <h3>关键参数</h3>
        <table class="spec-table">
          <tbody>
            ${specs.map((row) => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`).join('')}
          </tbody>
        </table>
      </section>

      <section class="modal-section">
        <h3>选型依据</h3>
        <div class="basis-list">
          ${basis.map((item) => `<article><span>${escapeHtml(item.title)}</span><p>${escapeHtml(item.body)}</p></article>`).join('')}
        </div>
      </section>

      <section class="modal-section">
        <h3>资料模块</h3>
        <div class="doc-grid">
          ${documents.length ? documents.map((doc) => `
            <a class="doc-card" href="${escapeHtml(doc.href)}" target="_blank" rel="noopener">
              <span>${escapeHtml(doc.type)}</span>
              <strong>${escapeHtml(doc.title)}</strong>
              <small>${escapeHtml(doc.status || '')}</small>
              <p>${escapeHtml(doc.note || '')}</p>
            </a>`).join('') : '<p class="muted">暂无该型号资料，请在 data/documents.json 中补充。</p>'}
        </div>
      </section>
    </div>
  `;
}
