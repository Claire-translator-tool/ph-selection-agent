import { includesAny, normalizeText, clamp } from './textUtils.js';

function ruleScore(text, rule) {
  const positives = includesAny(text, rule.positive || []);
  const negatives = includesAny(text, rule.negative || []);
  return {
    ioType: rule.ioType,
    ioLabel: rule.label,
    direction: rule.direction,
    positives,
    negatives,
    score: positives.length * 18 - negatives.length * 22
  };
}

function applyHardDirectionRules(text, scored) {
  const n = normalizeText(text);

  // 用户纠正过的关键规则：AI 板卡接收现场 4-20mA / 检测压力变化 = AI，不是 AO。
  const aiHard = [
    n.includes('AI') && (n.includes('接收') || n.includes('采集') || n.includes('检测') || n.includes('测量')),
    n.includes('现场') && n.includes('4-20MA') && (n.includes('PLC') || n.includes('DCS')) && (n.includes('接收') || n.includes('进入')),
    (n.includes('压力') || n.includes('液位') || n.includes('流量')) && n.includes('变送器') && !n.includes('控制')
  ];

  const aoHard = [
    (n.includes('AO') || n.includes('AQ')) && (n.includes('输出') || n.includes('控制') || n.includes('驱动')),
    n.includes('4-20MA') && (n.includes('调节阀') || n.includes('定位器') || n.includes('执行器')),
    n.includes('PLC') && n.includes('输出') && (n.includes('阀') || n.includes('定位器'))
  ];

  const diHard = [
    n.includes('DI') && (n.includes('反馈') || n.includes('检测') || n.includes('进入')),
    n.includes('限位开关') || n.includes('接近开关') || n.includes('阀位反馈') || n.includes('状态反馈')
  ];

  const doHard = [
    n.includes('DO') && (n.includes('输出') || n.includes('控制') || n.includes('驱动')),
    n.includes('控制电磁阀') || n.includes('驱动继电器') || n.includes('报警器')
  ];

  const force = aiHard.some(Boolean) ? 'AI'
    : aoHard.some(Boolean) ? 'AO'
    : diHard.some(Boolean) ? 'DI'
    : doHard.some(Boolean) ? 'DO'
    : null;

  if (!force) return scored;

  return scored.map((item) => ({
    ...item,
    score: item.ioType === force ? item.score + 60 : item.score - 35,
    hardRule: item.ioType === force ? `硬规则命中：${force}` : item.hardRule
  }));
}

export function classifyIo(text, rules) {
  const ioRules = rules?.ioRules || [];
  let scored = ioRules.map((rule) => ruleScore(text, rule));
  scored = applyHardDirectionRules(text, scored).sort((a, b) => b.score - a.score);

  const best = scored[0] || {
    ioType: 'UNKNOWN',
    ioLabel: '未识别',
    direction: '信号方向未识别',
    positives: [],
    negatives: [],
    score: 0
  };

  const confidence = best.score > 0 ? clamp(45 + best.score, 0, 95) : 20;
  const needConfirm = confidence < 65;

  return {
    ...best,
    confidence,
    needConfirm,
    ranked: scored.slice(0, 4)
  };
}
