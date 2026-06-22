import { parseIntent } from './intentParser.js';
import { recommendProducts } from './productMatcher.js';
import { renderResult } from './renderResult.js';
import { renderProductModal } from './renderProductModal.js';
import { renderDocsPanel, getDocsForModel } from './renderDocsPanel.js';

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
    loadJson('./products.json', []),
    loadJson('./rules.json', {}),
    loadJson('./training_cases.json', []),
    loadJson('./documents.json', {})
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
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'");
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
  $('#result').innerHTML = '请输入客户需求后开始选型。';
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

function bindEvents() {
  $('#run-btn').addEventListener('click', runSelection);
  $('#clear-btn').addEventListener('click', clearSelection);

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
}

boot();
