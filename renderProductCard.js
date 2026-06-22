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
    return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.model)} 产品图片" loading="lazy">`;
  }
  return `<div class="image-placeholder"><span>${escapeHtml(product.ioType || 'PH')}</span><small>待补图片</small></div>`;
}

export function renderProductCard(match, index = 0) {
  const { product, confidence, reasons = [] } = match;
  const isTop = index === 0;
  const verifyClass = product.verified ? 'ok' : 'warn';
  const verifyText = product.verified ? '资料已录入' : '资料待核验';
  return `
    <article class="product-card ${isTop ? 'top-card' : ''}" data-model="${escapeHtml(product.model)}">
      <div class="product-image ${product.image ? 'has-image' : ''}">${imageHtml(product)}</div>
      <div class="product-main">
        <div class="card-badges">
          <span class="badge primary">${escapeHtml(product.badge || product.series + ' 系列')}</span>
          <span class="badge ${verifyClass}">${verifyText}</span>
          <span class="badge">置信度 ${confidence}%</span>
        </div>
        <h2>${escapeHtml(product.model)} ${escapeHtml(product.name)}</h2>
        <p class="product-desc">${escapeHtml(product.description)}</p>
        <div class="mini-tags">
          ${(product.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="btn" data-action="open-modal" data-model="${escapeHtml(product.model)}">资料/参数</button>
          <button class="btn ghost" data-action="scroll-docs" data-model="${escapeHtml(product.model)}">技术资料</button>
        </div>
      </div>
      <div class="score-box">
        <strong>${confidence}%</strong>
        <span>${isTop ? '首选候选' : '候选'}</span>
      </div>
      <div class="match-reasons">
        ${reasons.slice(0, 5).map((reason) => `<p>✓ ${escapeHtml(reason)}</p>`).join('')}
      </div>
    </article>
  `;
}
