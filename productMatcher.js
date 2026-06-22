import { includesAny, clamp } from './textUtils.js';

function channelScore(intent, product) {
  if (intent.channel.type === 'unknown') return 0;
  if (product.channelType === intent.channel.type) return 24;
  return -18;
}

function ioScore(intent, product) {
  if (product.ioType === intent.io.ioType) return 42;
  if (intent.io.ioType === 'UNKNOWN') return 0;
  return -35;
}

function seriesScore(intent, product, rules) {
  if (intent.needs.cheap && String(product.series).includes('C')) return 18;
  if (!intent.needs.cheap && product.series === rules?.seriesRules?.defaultPreferred) return 15;
  return 0;
}

export function scoreProduct(product, intent, rules, trainingCases = []) {
  const text = intent.raw;
  const keywordHits = includesAny(text, product.keywords || []);
  const negativeHits = includesAny(text, product.negativeKeywords || []);
  const signalHits = includesAny(text, product.signals || []);

  const caseHits = trainingCases.filter((item) => {
    if (!item.approved) return false;
    if (item.correctModel !== product.model) return false;
    const sourceWords = String(item.customerText || '')
      .split(/[，。,.、\s]+/)
      .filter((word) => word.length >= 2);
    return includesAny(text, sourceWords).length >= 2;
  });

  let score = 0;
  score += ioScore(intent, product);
  score += channelScore(intent, product);
  score += seriesScore(intent, product, rules);
  score += keywordHits.length * 8;
  score += signalHits.length * 6;
  score -= negativeHits.length * 12;
  score += caseHits.length * 20;
  score += Number(product.priority || 0) / 10;
  if (product.verified) score += 8;
  if (!product.verified) score -= 8;

  const reasons = [];
  if (product.ioType === intent.io.ioType) reasons.push(`IO 类型匹配：${product.ioLabel}`);
  if (intent.channel.type !== 'unknown' && product.channelType === intent.channel.type) reasons.push(`通道匹配：${product.channelLabel}`);
  if (keywordHits.length) reasons.push(`关键词命中：${keywordHits.slice(0, 5).join('、')}`);
  if (signalHits.length) reasons.push(`信号命中：${signalHits.slice(0, 4).join('、')}`);
  if (caseHits.length) reasons.push('命中已审核训练案例');
  if (!product.verified) reasons.push('资料待核验：只能作为候选，不作为最终型号');
  if (negativeHits.length) reasons.push(`冲突词扣分：${negativeHits.slice(0, 4).join('、')}`);

  return {
    product,
    score,
    confidence: clamp(Math.round(score), 0, 98),
    reasons,
    keywordHits,
    negativeHits,
    signalHits
  };
}

export function recommendProducts(products, intent, rules, trainingCases = []) {
  if (!intent.raw) return [];
  return products
    .map((product) => scoreProduct(product, intent, rules, trainingCases))
    .filter((item) => item.score > 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
