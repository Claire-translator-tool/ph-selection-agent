import { includesAny } from './textUtils.js';

const DEFAULT_CHANNEL = {
  type: 'unknown',
  label: '未说明通道形式',
  confidence: 0,
  matched: [],
  question: '请确认是一入一出（单通道）、一入两出（一分二），还是两入两出（双通道）。'
};

export function classifyChannel(text, rules) {
  const channelRules = rules?.channelRules || [];
  let best = { ...DEFAULT_CHANNEL };

  for (const rule of channelRules) {
    const matched = includesAny(text, rule.keywords);
    if (matched.length > best.matched.length) {
      best = {
        type: rule.type,
        label: rule.label,
        confidence: Math.min(100, 70 + matched.length * 10),
        matched,
        question: ''
      };
    }
  }

  return best;
}
