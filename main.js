import { parseIntent } from './engine/intentParser.js';
import { recommendProducts } from './engine/productMatcher.js';
import { renderResult } from './ui/renderResult.js';
import { renderProductModal } from './ui/renderProductModal.js';
import { renderDocsPanel, getDocsForModel } from './ui/renderDocsPanel.js';

const state = {
  products: [],
  rules: {},
  trainingCases: [],
  documents: {},
  lastIntent: null,
  lastMatches: []
};

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`加载 ${path} 失败：`, error);
    return fallback;
  }
}

async function initData() {
  const [products, rules, trainingCases, documents] = await Promise.all([
    loadJson('./data/products.json', []),
    loadJson('./data/rules.json', {}),
    loadJson('./data/training_cases.json', []),
    loadJson('./data/documents.json', {})
  ]);
  state.products = products;
  state.rules = rules;
  state.trainingCases = trainingCases;
  state.documents = documents;
  renderProductLibrary();
}

function $(selector) {
  return document.querySelector(selector);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function runSelection() {
  const input = $('#need-input').value;
  const intent = parseIntent(input, state.rules);
  const matches = recommendProducts(state.products, intent, state.rules, state.trainingCases);
  state.lastIntent = intent;
  state.lastMatches = matches;
  $('#result').innerHTML = renderResult(intent, matches);

  const firstModel = matches[0]?.product?.model || '';
  if (firstModel) {
    $('#docs-slot').innerHTML = renderDocsPanel(state.documents, firstModel);
  } else {
    $('#docs-slot').innerHTML = '';
  }
}

function clearSelection() {
  $('#need-input').value = '';
  state.lastIntent = null;
  state.lastMatches = [];
  $('#result').innerHTML = '<section class="empty-state">请输入客户需求后开始选型。</section>';
  $('#docs-slot').innerHTML = '';
}

function fillExample(text) {
  $('#need-input').value = text;
  runSelection();
}

function openModal(model) {
  const product = state.products.find((item) => item.model === model);
  if (!product) return;
  const docs = getDocsForModel(state.documents, model);
  const modal = $('#modal');
  modal.innerHTML = renderProductModal(product, docs);
  modal.classList.add('show');
  document.body.classList.add('modal-open');
}

function closeModal() {
  $('#modal').classList.remove('show');
  $('#modal').innerHTML = '';
  document.body.classList.remove('modal-open');
}

function scrollDocs() {
  const panel = $('#docs-panel');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderProductLibrary() {
  const el = $('#library-list');
  if (!el) return;
  el.innerHTML = state.products.map((product) => `
    <button class="library-item" data-action="open-modal" data-model="${escapeHtml(product.model)}">
      <span>${escapeHtml(product.model)}</span>
      <small>${escapeHtml(product.ioLabel)} · ${escapeHtml(product.channelLabel)}</small>
    </button>
  `).join('');
}

function exportCorrection() {
  const customerText = $('#need-input').value.trim();
  const correctIoType = $('#correct-io').value;
  const correctChannelType = $('#correct-channel').value;
  const correctModel = $('#correct-model').value.trim();
  const reason = $('#correct-reason').value.trim();

  if (!customerText || !correctIoType || !correctChannelType || !correctModel) {
    $('#correction-output').textContent = '请至少填写：客户原话、正确 IO、正确通道、正确型号。';
    return;
  }

  const item = {
    id: `case-${Date.now()}`,
    customerText,
    correctIoType,
    correctChannelType,
    correctModel,
    reason: reason || '人工校正案例，待补充原因。',
    approved: false
  };

  $('#correction-output').textContent = JSON.stringify(item, null, 2);
}

function copyCorrection() {
  const text = $('#correction-output').textContent;
  if (!text || text.includes('请至少填写')) return;
  navigator.clipboard?.writeText(text);
  $('#copy-tip').textContent = '已复制。把这段 JSON 追加到 data/training_cases.json，审核后把 approved 改成 true。';
}

function bindEvents() {
  $('#run-btn').addEventListener('click', runSelection);
  $('#clear-btn').addEventListener('click', clearSelection);
  $('#export-correction').addEventListener('click', exportCorrection);
  $('#copy-correction').addEventListener('click', copyCorrection);

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const model = target.dataset.model;

    if (action === 'open-modal') openModal(model);
    if (action === 'close-modal') closeModal();
    if (action === 'scroll-docs') scrollDocs();
    if (action === 'example') fillExample(target.dataset.text || '');
  });

  $('#modal').addEventListener('click', (event) => {
    if (event.target.id === 'modal') closeModal();
  });

  $('#need-input').addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') runSelection();
  });
}

async function boot() {
  await initData();
  bindEvents();
  fillExample('西门子PLC的AI板卡接收来自现场的4-20mA信号，检测现场压力变化，中间加安全栅，一入一出');
}

boot();
