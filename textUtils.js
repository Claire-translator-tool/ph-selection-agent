export function normalizeText(input = '') {
  return String(input)
    .replace(/\s+/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .toUpperCase();
}

export function includesAny(text, words = []) {
  const raw = String(text || '');
  const normalized = normalizeText(raw);
  return words.filter((word) => {
    const candidate = String(word || '');
    return raw.includes(candidate) || normalized.includes(normalizeText(candidate));
  });
}

export function unique(list = []) {
  return [...new Set(list.filter(Boolean))];
}

export function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}
