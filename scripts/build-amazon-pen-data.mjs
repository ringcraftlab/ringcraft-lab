import fs from 'node:fs/promises';

const AMAZON = 'https://www.amazon.co.jp';
const DEFAULT_QUERY_FILE = 'scripts/amazon-pen-searches.json';
const DEFAULT_SEED_FILE = 'public/data/pens.json';
const DEFAULT_TARGET_URLS = 'scripts/amazon-pen-target-urls.txt';
const DEFAULT_OUT = 'public/data/pens.amazon.generated.json';
const DEFAULT_REPORT = 'public/data/pens.amazon-report.json';
const KNOWN_BRANDS = [
  ['パイロット', 'パイロット'],
  ['PILOT', 'PILOT'],
  ['ゼブラ', 'ゼブラ'],
  ['ZEBRA', 'ZEBRA'],
  ['三菱鉛筆', '三菱鉛筆'],
  ['uni', '三菱鉛筆'],
  ['ぺんてる', 'ぺんてる'],
  ['Pentel', 'Pentel'],
  ['トンボ', 'トンボ鉛筆'],
  ['セーラー', 'セーラー'],
  ['プラチナ', 'プラチナ万年筆'],
  ['Kaweco', 'Kaweco'],
  ['LAMY', 'LAMY'],
];

const args = parseArgs(process.argv.slice(2));
const queryFile = args.queries || DEFAULT_QUERY_FILE;
const urlFile = args.urls || null;
const outPath = args.out || DEFAULT_OUT;
const reportPath = args.report || DEFAULT_REPORT;
const maxResultsPerQuery = Number(args.maxResults || 12);
const maxProductPages = Number(args.maxPages || 80);
const delayMs = Number(args.delay || 1200);
const seedFile = args.source || DEFAULT_SEED_FILE;

const TRUSTED_BRANDS = [
  'Kaweco',
  'Pilot',
  'PILOT',
  'パイロット',
  'Sailor',
  'セーラー',
  'Platinum',
  'プラチナ',
  'Pelikan',
  'Montblanc',
  'Lamy',
  'LAMY',
  'TWSBI',
  'Opus 88',
  'Ohto',
  'オート',
  "Traveler's Company",
  'トラベラーズカンパニー',
  'Fisher',
  'フィッシャー',
  'Zebra',
  'ゼブラ',
  'Tombow',
  'トンボ',
  'トンボ鉛筆',
  "Caran d'Ache",
  'Parker',
  'Cross',
  'Rotring',
  'Pentel',
  'ぺんてる',
  'Mitsubishi Uni',
  'Mitsubishi Pencil',
  '三菱鉛筆',
  'uni-ball',
  'ユニボール',
  'Penco',
];

const REJECT_REASONS = {
  noLength: '商品ページから全長を確認できない',
  overLimit: '全長が130mmを超える',
  weakEvidence: '梱包サイズなど、本体全長ではない可能性が高い',
  unsupportedType: 'ボールペン/万年筆ではない',
  untrustedBrand: '信頼メーカー候補ではない',
  fetchFailed: 'ページ取得に失敗',
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const seeds = urlFile || args.source === 'none' ? [] : await readSeeds(seedFile);
  const queries = urlFile ? [] : seeds.length ? seedsToQueries(seeds) : await readJson(queryFile);
  const directUrls = urlFile ? await readLines(urlFile) : await readOptionalLines(DEFAULT_TARGET_URLS);

  const discovered = new Map();

  for (const rawUrl of directUrls) {
    const product = normalizeProductUrl(rawUrl);
    if (product) discovered.set(product.asin, product);
  }

  for (const query of queries) {
    const searchUrl = `${AMAZON}/s?k=${encodeURIComponent(query)}`;
    console.log(`search: ${query}`);
    try {
      const html = await fetchText(searchUrl);
      for (const product of extractProductLinks(html).slice(0, maxResultsPerQuery)) {
        if (!discovered.has(product.asin)) {
          discovered.set(product.asin, { ...product, query });
        }
      }
    } catch (error) {
      console.warn(`search skipped: ${query} (${error.message})`);
    }
    await sleep(delayMs);
  }

  const products = [...discovered.values()].slice(0, maxProductPages);
  const accepted = [];
  const rejected = [];

  for (const product of products) {
    console.log(`product: ${product.asin}`);
    try {
      const html = await fetchText(product.url);
      const extracted = extractPenFromProductPage(html, product);
      if (!extracted.type) {
        rejected.push({ ...product, reason: REJECT_REASONS.unsupportedType, title: extracted.model });
      } else if (!isTrustedPen(extracted)) {
        rejected.push({ ...product, reason: REJECT_REASONS.untrustedBrand, brand: extracted.brand, title: extracted.model });
      } else if (!extracted.length) {
        rejected.push({ ...product, reason: REJECT_REASONS.noLength, evidence: extracted.evidence });
      } else if (extracted.evidenceStrength !== 'strong') {
        rejected.push({ ...product, reason: REJECT_REASONS.weakEvidence, length: extracted.length, evidence: extracted.evidence });
      } else if (extracted.length > 130) {
        rejected.push({ ...product, reason: REJECT_REASONS.overLimit, length: extracted.length, evidence: extracted.evidence });
      } else {
        accepted.push({
          product,
          pen: {
            id: accepted.length + 1,
            type: extracted.type,
            brand: extracted.brand,
            model: extracted.model,
            length: extracted.length,
            diameter: extracted.diameter,
            imageUrl: extracted.imageUrl,
            amazonUrl: product.url,
            rakutenUrl: `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${extracted.brand} ${extracted.model}`)}/`,
          },
          evidence: extracted.evidence,
        });
      }
    } catch (error) {
      rejected.push({ ...product, reason: REJECT_REASONS.fetchFailed, error: error.message });
    }
    await sleep(delayMs);
  }

  if (accepted.length === 0) {
    console.warn('No rows were accepted. Existing output files were not overwritten.');
  } else {
    await fs.writeFile(outPath, `${JSON.stringify(accepted.map((row) => row.pen), null, 2)}\n`);
    await fs.writeFile(reportPath, `${JSON.stringify({ accepted, rejected }, null, 2)}\n`);
  }

  console.log(`accepted: ${accepted.length}`);
  console.log(`rejected: ${rejected.length}`);
  console.log(`wrote: ${outPath}`);
  console.log(`report: ${reportPath}`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith('--')) continue;
    const key = part.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

async function readJson(path) {
  return JSON.parse(await fs.readFile(path, 'utf8'));
}

async function readSeeds(path) {
  try {
    const rows = await readJson(path);
    return rows.filter((row) => isTrustedText(`${row.brand} ${row.model}`));
  } catch {
    return [];
  }
}

function seedsToQueries(seeds) {
  const seen = new Set();
  const queries = [];
  for (const seed of seeds) {
    const query = `${seed.brand} ${seed.model} 全長`;
    const normalized = query.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    queries.push(query);
  }
  return queries;
}

async function readLines(path) {
  const text = await fs.readFile(path, 'utf8');
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

async function readOptionalLines(path) {
  try {
    return await readLines(path);
  } catch {
    return [];
  }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.5,en;q=0.3',
      'cache-control': 'no-cache',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (/captcha|ロボットではありません|api-services-support@amazon/i.test(body)) {
    throw new Error('Amazon bot check or CAPTCHA');
  }
  return body;
}

function extractProductLinks(html) {
  const links = new Map();
  const patterns = [
    /href="([^"]*\/dp\/([A-Z0-9]{10})(?:[/?][^"]*)?)"/g,
    /href="([^"]*\/gp\/product\/([A-Z0-9]{10})(?:[/?][^"]*)?)"/g,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const asin = match[2];
      if (!links.has(asin)) links.set(asin, { asin, url: `${AMAZON}/dp/${asin}` });
    }
  }

  return [...links.values()];
}

function isTrustedPen(pen) {
  return isTrustedText(`${pen.brand} ${pen.model}`);
}

function isTrustedText(value) {
  const text = String(value || '').toLowerCase();
  return TRUSTED_BRANDS.some((brand) => text.includes(brand.toLowerCase()));
}

function normalizeProductUrl(rawUrl) {
  const match = rawUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  if (!match) return null;
  return { asin: match[1], url: `${AMAZON}/dp/${match[1]}` };
}

function extractPenFromProductPage(html, product) {
  const pageText = htmlToText(html);
  const productText = htmlToText(extractProductSections(html) || html);
  const title = extractTitle(html, pageText);
  const brand = cleanValue(extractBrand(html, productText, title));
  const model = cleanValue(stripBrand(title, brand));
  const imageUrl = extractImageUrl(html);
  const type = inferType(title, product.query);
  const lengthEvidence = extractLengthEvidence(productText);
  const diameter = extractDiameter(productText);

  return {
    type,
    brand: brand || 'Unknown',
    model: model || title || product.asin,
    length: lengthEvidence?.value ?? null,
    diameter,
    imageUrl,
    evidence: lengthEvidence?.evidence ?? null,
    evidenceStrength: lengthEvidence?.strength ?? 'none',
  };
}

function extractProductSections(html) {
  const sectionPatterns = [
    /id="productTitle"[\s\S]*?<\/span>/i,
    /id="feature-bullets"[\s\S]*?<\/ul>/i,
    /id="productOverview_feature_div"[\s\S]*?<\/table>/i,
    /id="detailBullets_feature_div"[\s\S]*?(?=<div id="|<hr|<\/body>)/i,
    /id="productDetails_techSpec_section_1"[\s\S]*?<\/table>/i,
    /id="productDetails_detailBullets_sections1"[\s\S]*?<\/table>/i,
    /id="prodDetails"[\s\S]*?(?=<div id="|<hr|<\/body>)/i,
  ];
  return sectionPatterns
    .map((pattern) => html.match(pattern)?.[0] || '')
    .filter(Boolean)
    .join('\n');
}

function htmlToText(html) {
  return decodeHtml(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(li|tr|td|th|p|div|span|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function extractTitle(html, text) {
  const productTitle = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/i)?.[1];
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1];
  return cleanValue(htmlToText(productTitle || ogTitle || text.split('\n')[0] || ''));
}

function extractImageUrl(html) {
  return html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]
    || html.match(/"large":"([^"]+)"/i)?.[1]?.replace(/\\\//g, '/')
    || '';
}

function extractBrand(html, text, title) {
  const known = KNOWN_BRANDS.find(([needle]) => title.toLowerCase().includes(needle.toLowerCase()));
  if (known) return known[1];

  const byline = html.match(/id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/i)?.[1];
  const bylineText = byline ? htmlToText(byline) : '';
  const bylineBrand = bylineText
    .replace(/^ブランド:\s*/i, '')
    .replace(/^Visit the\s+/i, '')
    .replace(/\s+Store$/i, '')
    .trim();
  if (bylineBrand && !looksLikeRating(bylineBrand)) return bylineBrand;

  const brandLine = text.match(/(?:ブランド|メーカー)\s*[:：]?\s*([^\n]{1,40})/);
  if (brandLine && !looksLikeRating(brandLine[1])) return brandLine[1].split(/\s{2,}| 商品| メーカー/)[0];

  return title.split(/[ 　]/)[0];
}

function stripBrand(title, brand) {
  if (!title) return '';
  if (!brand || brand === 'Unknown') return title;
  return title.replace(new RegExp(`^${escapeRegExp(brand)}[\\s　:：-]*`, 'i'), '');
}

function inferType(title = '', query = '') {
  const haystack = `${title} ${query || ''}`.toLowerCase();
  if (/シャープペン|シャーペン|mechanical pencil|替芯|リフィル|マーカー|蛍光ペン/.test(haystack)) return null;
  if (/万年筆|fountain/.test(haystack)) return '万年筆';
  return 'ボールペン';
}

function extractLengthEvidence(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const candidates = [];

  for (const line of lines) {
    if (!/(全長|本体サイズ|本体寸法|製品サイズ|商品サイズ|展開長さ|伸縮長さ)/.test(line)) continue;
    if (/(梱包|パッケージ|発送|荷物|外装|箱)/.test(line)) continue;

    const normalized = normalizeUnits(line);
    const mmValues = extractMillimeterNumbers(normalized);
    if (mmValues.length === 0) continue;

    const keywordScore = /(全長|展開長さ|伸縮長さ)/.test(line) ? 4
      : /(本体サイズ|本体寸法|製品サイズ|商品サイズ)/.test(line) ? 3
        : 1;
    const value = chooseLikelyLength(mmValues);
    if (value === null) continue;
    const strength = keywordScore >= 2 ? 'strong' : 'weak';
    candidates.push({ value, evidence: line, score: keywordScore, strength });
  }

  candidates.sort((a, b) => b.score - a.score || a.value - b.value);
  return candidates[0] || null;
}

function extractDiameter(text) {
  const line = text.split('\n').find((row) => /(軸径|直径|太さ|径)/.test(row) && !/(梱包|パッケージ|箱)/.test(row));
  if (!line) return null;
  const values = extractMillimeterNumbers(normalizeUnits(line));
  return values.find((value) => value > 2 && value < 30) ?? null;
}

function normalizeUnits(value) {
  return value
    .replace(/(\d+(?:\.\d+)?)\s*センチメートル/g, (_, n) => `${Number(n) * 10}mm`)
    .replace(/(\d+(?:\.\d+)?)\s*cm/gi, (_, n) => `${Number(n) * 10}mm`)
    .replace(/(\d+(?:\.\d+)?)\s*ミリメートル/g, '$1mm')
    .replace(/×/g, 'x');
}

function extractMillimeterNumbers(value) {
  const matches = [...value.matchAll(/(\d+(?:\.\d+)?)\s*mm/gi)].map((match) => Number(match[1]));
  return matches.filter((number) => Number.isFinite(number));
}

function chooseLikelyLength(values) {
  const penSized = values.filter((value) => value >= 60 && value <= 180);
  if (penSized.length === 0) return null;
  return Math.round(Math.max(...penSized) * 10) / 10;
}

function cleanValue(value = '') {
  return decodeHtml(String(value))
    .replace(/\s+/g, ' ')
    .replace(/[|｜].*$/, '')
    .trim();
}

function looksLikeRating(value) {
  return /星|レビュー|評価|^[0-9.]+\s*5つ星/.test(value);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
