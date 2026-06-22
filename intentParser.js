import { classifyIo } from './ioClassifier.js';
import { classifyChannel } from './channelClassifier.js';
import { includesAny, normalizeText, unique } from './textUtils.js';

export function parseIntent(text, rules) {
  const raw = String(text || '').trim();
  const io = classifyIo(raw, rules);
  const channel = classifyChannel(raw, rules);
  const n = normalizeText(raw);

  const signalHits = unique([
    ...includesAny(raw, ['4-20mA', '0-10V', 'HART', 'PT100', '热电阻', '热电偶', 'RS485', 'MODBUS', '干接点', 'NPN', 'PNP', '开关量'])
  ]);

  const needs = {
    cheap: includesAny(raw, rules?.seriesRules?.cheapKeywords || []).length > 0,
    sil: includesAny(raw, ['SIL', 'SLL', '功能安全', 'IEC61508', '安全完整性']).length > 0,
    explosion: includesAny(raw, ['防爆', '本安', '危险区', 'Ex', 'IIC', 'IIIC', '隔爆']).length > 0,
    hart: n.includes('HART'),
    surge: includesAny(raw, ['浪涌', '防雷', '雷击', '电涌']).length > 0
  };

  const warnings = [];
  if (!raw) warnings.push('请先输入客户现场需求。');
  if (io.needConfirm) warnings.push('信号方向不够明确，建议补问客户：信号是现场进 PLC/DCS，还是 PLC/DCS 输出到现场设备？');
  if (channel.type === 'unknown') warnings.push(channel.question);
  if (needs.sil) warnings.push('客户要求 SIL/SLL/功能安全时，需要补正式 SIL 证书、FMEDA 或安全手册。');
  if (needs.explosion) warnings.push('客户要求防爆/本安时，需要以证书防爆标志和回路本安参数为准。');

  return {
    raw,
    io,
    channel,
    signals: signalHits,
    needs,
    warnings
  };
}
