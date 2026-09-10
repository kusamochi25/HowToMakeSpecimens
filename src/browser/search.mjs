export function normalizeSearch(value) {
  return value.normalize('NFKC').toLocaleLowerCase('ja').replace(/脚/g, '足').replace(/なんか/g, '軟化').replace(/てんそく/g, '展足').replace(/かんそう/g, '乾燥').trim();
}

export function searchRecords(records, query, limit = 12) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const bestByLink = new Map();
  for (const record of records) {
    const title = normalizeSearch(record.title);
    const text = normalizeSearch(record.text);
    if (!terms.every(term => `${title} ${text}`.includes(term))) continue;
    const score = terms.reduce((score, term) => score + (title.includes(term) ? 5 : 1), 0);
    const result = { ...record, score };
    if (!bestByLink.has(record.href) || score > bestByLink.get(record.href).score) bestByLink.set(record.href, result);
  }
  return [...bestByLink.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}
