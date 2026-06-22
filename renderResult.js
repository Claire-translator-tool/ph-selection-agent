import { renderProductCard } from './renderProductCard.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMapping(intent, topMatch) {
  const product = topMatch?.product;
  const rows = [
    ['方向判断', intent.io.ioLabel, intent.io.direction],
    ['信号类型', intent.signals.length ? intent.signals.join(' / ') : '未明确', '按客户原话识别，必要时补问'],
    ['通道判断', intent.channel.label, intent.channel.type === 'unknown' ? '需要补问客户' : '已识别'],
    ['系列规则', intent.needs.cheap ? '客户强调经济/便宜' : '客户没有说要便宜', intent.needs.cheap ? '可补 C 系列候选' : '优先选 T 系列'],
    ['推荐型号', product ? product.model : '暂无', product ? product.name : '需要补充型号库']
  ];
  return `
    <section class="panel mapping-panel">
      <h3>一一对应</h3>
      <div class="mapping-list">
        ${rows.map(([label, left, right]) => `
          <div class="mapping-row">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(left)}</strong>
            <b>${escapeHtml(right)}</b>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderAsk(intent, product) {
  const questions = new Set([...(intent.warnings || []), ...((product && product.questions) || [])]);
  return `
    <section class="panel ask-panel">
      <h3>补问客户</h3>
      <div class="question-tags">
        ${[...questions].slice(0, 10).map((q) => `<span>${escapeHtml(q)}</span>`).join('')}
      </div>
    </section>
  `;
}

function renderCheap(product, intent) {
  if (!product?.cheapAlternatives?.length && !intent.needs.cheap) return '';
  const text = product?.cheapAlternatives?.length
    ? product.cheapAlternatives.join(' / ')
    : '请补 C 系列经济型号库';
  return `
    <section class="cheap-box">
      <p>如果客户强调便宜，可改为：</p>
      <strong>${escapeHtml(text)} C 系列安全栅</strong>
      <small>注意：经济候选仍需核对输入/输出、通道、防爆、本安和 SIL 参数。</small>
    </section>
  `;
}

export function renderResult(intent, matches) {
  if (!intent.raw) {
    return '<section class="empty-state">请输入客户需求，例如：PLC 的 AI 板卡接收现场压力变送器 4-20mA 信号，中间加安全栅，一入一出。</section>';
  }

  if (!matches.length) {
    return `
      <section class="empty-state warn-state">
        <h3>未匹配到可靠型号</h3>
        <p>当前只能判断方向为：${escapeHtml(intent.io.ioLabel)}。请补充产品库或训练案例后再推荐具体型号。</p>
      </section>
      ${renderAsk(intent, null)}
    `;
  }

  const top = matches[0];
  return `
    <section class="result-hero">
      ${renderProductCard(top, 0)}
    </section>
    ${renderMapping(intent, top)}
    ${renderCheap(top.product, intent)}
    ${renderAsk(intent, top.product)}
    <section class="panel candidates-panel">
      <div class="section-title"><span>其他候选</span><small>按工程规则打分排序</small></div>
      <div class="candidate-list">
        ${matches.slice(1).map((match, index) => renderProductCard(match, index + 1)).join('') || '<p class="muted">暂无其他候选。</p>'}
      </div>
    </section>
  `;
}
