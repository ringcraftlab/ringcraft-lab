import fs from 'node:fs/promises';

const sourcePath = 'public/data/pens.json';
const officialPath = 'public/data/pens.official-report.json';
const rakutenPath = 'public/data/pens.rakuten-report.json';
const manualPath = 'public/data/pens.manual-verifications.json';
const outJson = 'public/data/pens.expanded-candidates.json';
const outCsv = 'public/data/pens.expanded-candidates.csv';

const trustedBrands = [
  '三菱鉛筆',
  'Mitsubishi Uni',
  'Mitsubishi Pencil',
  'Pilot',
  'パイロット',
  'PILOT',
  'Sailor',
  'セーラー',
  'Platinum',
  'プラチナ',
  'Pelikan',
  'Montblanc',
  'Lamy',
  'LAMY',
  'Kaweco',
  'TWSBI',
  'Opus 88',
  'Ohto',
  'OHTO',
  'Traveler\'s Company',
  'Fisher',
  'Zebra',
  'ゼブラ',
  'Tombow',
  'トンボ鉛筆',
  'Caran d\'Ache',
  'Parker',
  'Cross',
  'Rotring',
  'Penco',
  'Pentel',
  'ぺんてる',
  'Anterique',
  'ANTOU',
  'Filofax',
  'LIHIT LAB',
  'MILAN',
  'MUJI',
  'BIGiDESIGN',
  'Machine Era',
  'Schon DSGN',
  'Tactile Turn',
  'ystudio',
  '大西製作所',
  'BENU',
  'Conklin',
  'Craft Design Technology',
  'サクラクレパス',
  'LEUCHTTURM1917',
  'Kakimori',
  'RETRO1951',
  'Rhodia',
  'Craft A',
];

const rows = new Map();

const source = await readJson(sourcePath, []);
const official = await readJson(officialPath, { accepted: [], needsReview: [] });
const rakuten = await readJson(rakutenPath, { accepted: [], rejected: [] });
const manual = await readJson(manualPath, []);

for (const row of source) {
  if (!isTrustedBrand(row.brand)) continue;
  if (!isShortEnough(row.length)) continue;
  upsert({
    brand: normalizeBrand(row.brand),
    model: row.model,
    type: row.type,
    length: row.length,
    diameter: row.diameter ?? null,
    confidence: 'manasCandidate',
    source: 'Manas',
    evidence: '',
    sourceUrl: row.amazonUrl || row.rakutenUrl || '',
    amazonUrl: row.amazonUrl || '',
    rakutenUrl: row.rakutenUrl || '',
    imageUrl: row.imageUrl || '',
    note: '既存Manas候補。公式/販売店根拠は未確認',
  });
}

for (const row of rakuten.accepted || []) {
  const pen = row.pen || {};
  if (!isShortEnough(pen.length)) continue;
  upsert({
    brand: normalizeBrand(pen.brand),
    model: pen.model,
    type: pen.type,
    length: pen.length,
    diameter: pen.diameter ?? null,
    confidence: 'rakutenEvidence',
    source: 'Rakuten',
    evidence: row.evidence || '',
    sourceUrl: pen.rakutenUrl || row.product?.url || '',
    amazonUrl: pen.amazonUrl || '',
    rakutenUrl: pen.rakutenUrl || row.product?.url || '',
    imageUrl: pen.imageUrl || '',
    note: '楽天商品ページに全長根拠あり',
  });
}

for (const row of manual || []) {
  if (!isCandidateLength(row.length) && row.status !== 'exclude' && row.status !== 'review') continue;
  upsert({
    brand: normalizeBrand(row.brand),
    model: row.model,
    type: row.type,
    length: row.length ?? null,
    diameter: row.diameter ?? null,
    confidence: 'verifiedExternal',
    statusOverride: row.status || '',
    source: 'ManualVerification',
    evidence: row.evidence || '',
    sourceUrl: row.sourceUrl || '',
    amazonUrl: row.amazonUrl || `https://www.amazon.co.jp/s?k=${encodeURIComponent(`${row.brand} ${row.model}`)}`,
    rakutenUrl: row.rakutenUrl || `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${row.brand} ${row.model}`)}/`,
    imageUrl: row.imageUrl || '',
    note: row.note || 'ユーザー確認済み外部根拠',
  });
}

for (const row of official.accepted || []) {
  if (!isShortEnough(row.length)) continue;
  upsert({
    brand: normalizeBrand(row.brand),
    model: row.model,
    type: row.type,
    length: row.length,
    diameter: row.diameter ?? null,
    confidence: 'official',
    source: 'Official',
    evidence: row.evidence || '',
    sourceUrl: row.officialUrl || '',
    amazonUrl: `https://www.amazon.co.jp/s?k=${encodeURIComponent(`${row.brand} ${row.model}`)}`,
    rakutenUrl: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${row.brand} ${row.model}`)}/`,
    imageUrl: '',
    note: row.note || 'メーカー公式で全長確認済み',
  });
}

for (const row of official.needsReview || []) {
  if (!isShortEnough(row.candidateLength)) continue;
  upsert({
    brand: normalizeBrand(row.brand),
    model: row.model,
    type: '',
    length: row.candidateLength,
    diameter: null,
    confidence: 'needsReview',
    source: 'OfficialCandidate',
    evidence: '',
    sourceUrl: row.officialUrl || '',
    amazonUrl: `https://www.amazon.co.jp/s?k=${encodeURIComponent(`${row.brand} ${row.model}`)}`,
    rakutenUrl: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${row.brand} ${row.model}`)}/`,
    imageUrl: '',
    note: row.reason || '公式周辺情報あり。全長根拠は要確認',
  });
}

const candidates = [...rows.values()]
  .map((row) => ({
    ...row,
    canonicalModel: canonicalModel(row),
  }))
  .map((row, _index, list) => ({
    ...row,
    status: deriveStatus(row, list),
  }))
  .sort((a, b) => a.brand.localeCompare(b.brand, 'ja')
    || statusRank(a.status) - statusRank(b.status)
    || rank(a.confidence) - rank(b.confidence)
    || compareLength(a.length, b.length)
    || a.canonicalModel.localeCompare(b.canonicalModel, 'ja')
    || a.model.localeCompare(b.model, 'ja'))
  .map((row, index) => ({ id: index + 1, ...row }));

await fs.writeFile(outJson, `${JSON.stringify(candidates, null, 2)}\n`);
await fs.writeFile(outCsv, toCsv(candidates));

console.log(`candidates: ${candidates.length}`);
for (const confidence of ['official', 'verifiedExternal', 'rakutenEvidence', 'needsReview', 'manasCandidate']) {
  console.log(`${confidence}: ${candidates.filter((row) => row.confidence === confidence).length}`);
}
console.log(`wrote ${outJson}`);
console.log(`wrote ${outCsv}`);

function upsert(next) {
  const key = makeKey(next);
  const existing = rows.get(key);
  if (!existing || rank(next.confidence) < rank(existing.confidence)) {
    rows.set(key, next);
  }
}

function makeKey(row) {
  return `${normalizeBrand(row.brand)}|${normalizeModel(row.model)}|${normalizeType(row.type)}`;
}

function rank(confidence) {
  return {
    official: 1,
    verifiedExternal: 2,
    rakutenEvidence: 3,
    needsReview: 4,
    manasCandidate: 5,
  }[confidence] || 9;
}

function statusRank(status) {
  return {
    active: 1,
    discontinued: 2,
    review: 3,
    duplicate: 4,
    exclude: 5,
  }[status] || 9;
}

function deriveStatus(row, list) {
  if (row.statusOverride) return row.statusOverride;

  const duplicateRoot = list
    .filter((candidate) => normalizeBrand(candidate.brand) === normalizeBrand(row.brand)
      && candidate.canonicalModel === row.canonicalModel
      && normalizeType(candidate.type) === normalizeType(row.type))
    .sort((a, b) => rank(a.confidence) - rank(b.confidence) || a.model.length - b.model.length)[0];

  if (duplicateRoot && duplicateRoot !== row && rank(duplicateRoot.confidence) <= rank(row.confidence)) {
    return 'duplicate';
  }

  if (isDiscontinued(row)) return 'discontinued';
  if (row.confidence === 'needsReview' || row.confidence === 'manasCandidate') return 'review';
  return 'active';
}

function compareLength(left, right) {
  const a = typeof left === 'number' ? left : Number.POSITIVE_INFINITY;
  const b = typeof right === 'number' ? right : Number.POSITIVE_INFINITY;
  return a - b;
}

function isDiscontinued(row) {
  const text = `${row.brand} ${row.model} ${row.note}`.toLowerCase();
  return [
    'sl-f1',
    'ba55',
    'chalana',
    'シャレーナ',
    'minimo nbp',
    'm300',
    'mozart 114',
    'cross ion',
    'pocket (vintage',
    'heritage rouge et noir baby',
    '生産終了',
    '製造終了',
    '廃番',
  ].some((keyword) => text.includes(keyword));
}

function normalizeBrand(brand) {
  const value = String(brand || '').trim();
  const lower = value.toLowerCase();
  if (lower.includes('mitsubishi') || value.includes('三菱') || lower.includes('uni')) return '三菱鉛筆';
  if (lower === 'pilot' || value.includes('パイロット')) return 'パイロット';
  if (lower === 'sailor' || value.includes('セーラー')) return 'セーラー';
  if (lower === 'zebra' || value.includes('ゼブラ')) return 'ゼブラ';
  if (lower === 'tombow' || value.includes('トンボ')) return 'トンボ鉛筆';
  if (lower === 'ohto' || value.includes('オート')) return 'OHTO';
  if (lower === 'lamy' || value.includes('ラミー')) return 'LAMY';
  if (lower === 'pentel' || value.includes('ぺんてる')) return 'ぺんてる';
  if (lower.includes('filofax') || value.includes('ファイロファックス')) return 'Filofax';
  if (lower.includes('lihit') || value.includes('リヒト')) return 'LIHIT LAB';
  if (lower === 'milan' || value.includes('ミラン')) return 'MILAN';
  if (lower.includes('antou')) return 'ANTOU';
  if (value.includes('大西') || lower.includes('ohnishi') || lower.includes('onishi')) return '大西製作所';
  if (lower.includes('craft design technology') || lower === 'cdt' || value.includes('クラフトデザイン')) return 'Craft Design Technology';
  if (value.includes('サクラ') || lower.includes('sakura')) return 'サクラクレパス';
  if (lower.includes('leuchtturm') || value.includes('ロイヒト')) return 'LEUCHTTURM1917';
  if (lower.includes('hightide') || value.includes('ハイタイド')) return 'Penco';
  if (lower.includes('kakimori') || value.includes('カキモリ')) return 'Kakimori';
  if (lower.includes('retro51') || lower.includes('retro 51') || lower.includes('retro1951') || value.includes('レトロ')) return 'RETRO1951';
  if (lower.includes('rhodia') || value.includes('ロディア')) return 'Rhodia';
  if (lower.includes('craft a') || lower.includes('crafta') || value.includes('クラフトエー')) return 'Craft A';
  return value;
}

function canonicalModel(row) {
  const text = `${row.brand} ${row.model}`.toLowerCase();
  const original = String(row.model || '').trim();
  const type = normalizeType(row.type);

  if (/zento.*signature|signature.*zento|ゼント.*シグニチャー|シグニチャー.*ゼント|ubzh/i.test(original)) return 'ユニボール ZENTO シグニチャーモデル';
  if (/ユニボール\s*ワン\s*3|uni\s*ball\s*one\s*3|one\s*3/i.test(original)) return 'ユニボール ワン 3';
  if (/ユニボール\s*ワン\s*p|ユニボールワンp|uni\s*ball\s*one\s*p|one\s*p/i.test(original)) return 'ユニボール ワン P';
  if (/バーディ|birdy|hs-40s/i.test(original) && type === 'シャープペン') return 'バーディ HS-40S';
  if (/バーディ|birdy|bs-40s/i.test(original)) return 'バーディ BS-40S';
  if (/プレラ|prera/i.test(original)) return 'プレラ';
  if (/プロフェッショナルギア\s*スリムミニ|pro\s*gear\s*slim\s*mini/i.test(original)) return 'プロフェッショナルギア スリムミニ';
  if (/シャレーナ|chalana/i.test(original)) return 'シャレーナ';
  if (/ts-?3/i.test(original)) return 'TS-3';
  if (/手帳用.*\bt-?3\b|\bt-?3\b/i.test(original)) return '手帳用 T-3';
  if (/sl-?f1|ba55/i.test(original)) return 'SL-F1 mini';
  if (/エアプレス|airpress|bc-ap/i.test(original)) return 'エアプレス BC-AP';
  if (/sharp mini|aps-350es/i.test(original)) return 'Sharp Mini APS-350ES';
  if (/tl01-sp5|tl01-sp/i.test(original)) return 'TL01-SP5';
  if (/tl01-b5|tl01-b|とっても小さなボールペン/i.test(original)) return 'TL01-B5';
  if (/minimo|ミニモ/i.test(original)) return 'minimo';
  if (/lamy.*pico|ラミー.*ピコ|\bpico\b/i.test(original)) return 'pico';
  if (/al sport.*ball/i.test(text)) return 'AL Sport Ballpoint';
  if (/brass sport.*ball/i.test(text)) return 'Brass Sport Ballpoint';
  if (/sport.*ball/i.test(text)) return 'Sport Ballpoint';
  if (/classic sport/i.test(original)) return 'Classic Sport';
  if (/liliput.*ball/i.test(text)) return 'Liliput Ballpoint';
  if (/liliput/i.test(original)) return 'Liliput';
  if (/bullet space pen|space pen bullet/i.test(original)) return 'Bullet Space Pen';
  if (/849/i.test(original)) return '849 Ballpoint';
  if (/timeline/i.test(original)) return 'Timeline';
  if (/ecridor\s*xs/i.test(original)) return 'Ecridor XS';

  return original.replace(/\s*[\[【].*?[\]】]\s*/g, ' ').replace(/[：:].*$/, '').replace(/\s+/g, ' ').trim();
}

function normalizeModel(model) {
  return String(model || '')
    .toLowerCase()
    .replace(/[：:].*$/, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .trim();
}

function normalizeType(type) {
  return String(type || '').trim().toLowerCase();
}

function isTrustedBrand(brand) {
  return trustedBrands.some((trusted) => normalizeBrand(trusted) === normalizeBrand(brand));
}

function isShortEnough(length) {
  return typeof length === 'number' && Number.isFinite(length) && length <= 130;
}

function isCandidateLength(length) {
  return length === null || length === undefined || isShortEnough(length);
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await fs.readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function toCsv(candidates) {
  const rowsForCsv = [
    ['id', 'status', 'confidence', 'brand', 'canonicalModel', 'model', 'type', 'length', 'diameter', 'source', 'sourceUrl', 'evidence', 'note', 'amazonUrl', 'rakutenUrl'],
    ...candidates.map((row) => [
      row.id,
      row.status,
      row.confidence,
      row.brand,
      row.canonicalModel,
      row.model,
      row.type,
      row.length,
      row.diameter ?? '',
      row.source,
      row.sourceUrl,
      row.evidence,
      row.note,
      row.amazonUrl,
      row.rakutenUrl,
    ]),
  ];
  return `\uFEFF${rowsForCsv.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
