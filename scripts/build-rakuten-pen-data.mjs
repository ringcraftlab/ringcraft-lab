import fs from 'node:fs/promises';

const SEARCH_BASE = 'https://search.rakuten.co.jp/search/mall/';
const DEFAULT_QUERY_FILE = 'scripts/rakuten-maker-searches.json';
const DEFAULT_OUT = 'public/data/pens.rakuten.generated.json';
const DEFAULT_REPORT = 'public/data/pens.rakuten-report.json';

const args = parseArgs(process.argv.slice(2));
const queryFile = args.queries || DEFAULT_QUERY_FILE;
const outPath = args.out || DEFAULT_OUT;
const reportPath = args.report || DEFAULT_REPORT;
const maxResultsPerQuery = Number(args.maxResults || 8);
const maxProductPages = Number(args.maxPages || 120);
const delayMs = Number(args.delay || 700);

const TRUSTED_BRANDS = [
  ['三菱鉛筆', '三菱鉛筆'],
  ['ユニボール', '三菱鉛筆'],
  ['uni-ball', '三菱鉛筆'],
  ['JETSTREAM', '三菱鉛筆'],
  ['ジェットストリーム', '三菱鉛筆'],
  ['パイロット', 'パイロット'],
  ['PILOT', 'PILOT'],
  ['ゼブラ', 'ゼブラ'],
  ['ZEBRA', 'ZEBRA'],
  ['トンボ鉛筆', 'トンボ鉛筆'],
  ['Tombow', 'Tombow'],
  ['ぺんてる', 'ぺんてる'],
  ['Pentel', 'Pentel'],
  ['オート', 'OHTO'],
  ['OHTO', 'OHTO'],
  ['LAMY', 'LAMY'],
  ['ラミー', 'LAMY'],
  ['Fisher', 'Fisher'],
  ['フィッシャー', 'Fisher'],
  ['Kaweco', 'Kaweco'],
  ['カヴェコ', 'Kaweco'],
  ['Penco', 'Penco'],
  ['Caran d', "Caran d'Ache"],
  ['カランダッシュ', "Caran d'Ache"],
  ['Parker', 'Parker'],
  ['パーカー', 'Parker'],
  ['Rotring', 'Rotring'],
  ['ロットリング', 'Rotring'],
];

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const queries = await readJson(queryFile);
  const discovered = new Map();

  for (const query of queries) {
    const searchUrl = `${SEARCH_BASE}${encodeURIComponent(query)}/`;
    console.log(`search: ${query}`);
    try {
      const html = await fetchText(searchUrl);
      for (const item of extractSearchItems(html, query).slice(0, maxResultsPerQuery)) {
        if (!discovered.has(item.url)) discovered.set(item.url, item);
      }
    } catch (error) {
      console.warn(`search skipped: ${query} (${error.message})`);
    }
    await sleep(delayMs);
  }

  const accepted = [];
  const rejected = [];
  const products = [...discovered.values()].slice(0, maxProductPages);

  for (const product of products) {
    console.log(`product: ${product.url}`);
    try {
      const html = await fetchText(product.url);
      const extracted = extractPenFromRakutenPage(html, product);
      if (!extracted.brand) {
        rejected.push({ ...product, reason: '信頼メーカー候補ではない', title: extracted.model });
      } else if (!extracted.type) {
        rejected.push({ ...product, reason: 'ボールペン/万年筆ではない', title: extracted.model });
      } else if (!extracted.length) {
        rejected.push({ ...product, reason: '商品ページから全長を確認できない', title: extracted.model });
      } else if (extracted.length > 130) {
        rejected.push({ ...product, reason: '全長が130mmを超える', length: extracted.length, evidence: extracted.evidence });
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
            amazonUrl: `https://www.amazon.co.jp/s?k=${encodeURIComponent(`${extracted.brand} ${extracted.model}`)}`,
            rakutenUrl: product.url,
          },
          evidence: extracted.evidence,
        });
      }
    } catch (error) {
      rejected.push({ ...product, reason: 'ページ取得に失敗', error: error.message });
    }
    await sleep(delayMs);
  }

  if (accepted.length === 0) {
    console.warn('No rows were accepted. Existing output files were not overwritten.');
    await fs.writeFile(`${reportPath}.failed.json`, `${JSON.stringify({ accepted, rejected }, null, 2)}\n`);
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

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.5,en;q=0.3',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const bytes = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || '';
  const charset = contentType.match(/charset=([^;]+)/i)?.[1]?.trim().toLowerCase();
  if (charset) return new TextDecoder(charset).decode(bytes);
  const utf8 = new TextDecoder('utf-8').decode(bytes);
  const htmlCharset = utf8.match(/charset=["']?([^"'\s>]+)/i)?.[1]?.trim().toLowerCase();
  if (htmlCharset && htmlCharset !== 'utf-8') {
    return new TextDecoder(htmlCharset).decode(bytes);
  }
  return utf8;
}

function extractSearchItems(html, query) {
  const items = [];
  const seen = new Set();
  const patterns = [
    /href="(https:\/\/item\.rakuten\.co\.jp\/[^"]+)"/g,
    /href="(https:\/\/hb\.afl\.rakuten\.co\.jp\/[^"]*pc=https%3A%2F%2Fitem\.rakuten\.co\.jp%2F[^"]+)"/g,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const url = normalizeRakutenUrl(match[1]);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      items.push({ url, query });
    }
  }
  return items;
}

function normalizeRakutenUrl(url) {
  const decoded = decodeURIComponent(url);
  const itemMatch = decoded.match(/https:\/\/item\.rakuten\.co\.jp\/[^/?#"]+\/[^/?#"]+/);
  return itemMatch?.[0] || null;
}

function extractPenFromRakutenPage(html, product) {
  const text = htmlToText(html);
  const title = extractTitle(html, text);
  const brand = inferBrand(title) || inferBrand(product.query);
  const lengthEvidence = extractLengthEvidence(text);
  const diameter = extractDiameter(text);
  return {
    type: inferType(`${title} ${product.query}`),
    brand,
    model: cleanTitle(title, brand),
    length: lengthEvidence?.value ?? null,
    diameter,
    imageUrl: extractImageUrl(html),
    evidence: lengthEvidence?.evidence ?? null,
  };
}

function extractTitle(html, text) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    || html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || text.split('\n')[0]
    || '';
  return cleanValue(htmlToText(title).replace(/【楽天市場】/g, '').replace(/:.*$/, ''));
}

function extractImageUrl(html) {
  return html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] || '';
}

function inferBrand(text) {
  const found = TRUSTED_BRANDS.find(([needle]) => text.toLowerCase().includes(needle.toLowerCase()));
  return found?.[1] || '';
}

function inferType(text) {
  if (/シャープペン|シャーペン|mechanical pencil|替芯|リフィル|マーカー|蛍光ペン|筆ペン/.test(text)) return null;
  if (/万年筆|fountain/i.test(text)) return '万年筆';
  if (/ユニボールワン|uni-ball one/i.test(text)) return 'ボールペン';
  if (/ボールペン|ballpoint|ゲルインク|水性|油性/i.test(text)) return 'ボールペン';
  return null;
}

function extractLengthEvidence(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const candidates = [];
  for (const line of lines) {
    if (!/(全長|本体サイズ|本体寸法|商品サイズ|製品サイズ|軸長|長さ|収納時|筆記時)/.test(line)) continue;
    if (/(梱包|パッケージ|発送|配送|箱|メール便|封筒)/.test(line)) continue;
    const values = extractMillimeterNumbers(normalizeUnits(line));
    const penValues = values.filter((value) => value >= 60 && value <= 180);
    if (penValues.length === 0) continue;
    const score = /全長|軸長/.test(line) ? 4 : /本体|商品|製品/.test(line) ? 3 : 1;
    candidates.push({
      value: Math.round(Math.max(...penValues) * 10) / 10,
      evidence: line,
      score,
    });
  }
  candidates.sort((a, b) => b.score - a.score || a.value - b.value);
  return candidates[0] || null;
}

function extractDiameter(text) {
  const line = text.split('\n').find((row) => /(軸径|直径|最大径|太さ|径)/.test(row) && !/(梱包|パッケージ|箱)/.test(row));
  if (!line) return null;
  return extractMillimeterNumbers(normalizeUnits(line)).find((value) => value > 2 && value < 30) ?? null;
}

function normalizeUnits(value) {
  return value
    .replace(/(\d+(?:\.\d+)?)\s*センチメートル/g, (_, n) => `${Number(n) * 10}mm`)
    .replace(/(\d+(?:\.\d+)?)\s*cm/gi, (_, n) => `${Number(n) * 10}mm`)
    .replace(/(\d+(?:\.\d+)?)\s*ミリメートル/g, '$1mm')
    .replace(/×/g, 'x');
}

function extractMillimeterNumbers(value) {
  return [...value.matchAll(/(\d+(?:\.\d+)?)\s*mm/gi)].map((match) => Number(match[1])).filter(Number.isFinite);
}

function htmlToText(html) {
  return decodeHtml(String(html))
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

function cleanTitle(title, brand) {
  return cleanValue(title)
    .replace(new RegExp(`^${escapeRegExp(brand)}[\\s　:：-]*`, 'i'), '')
    .replace(/\s*[\[【].*?[\]】]\s*/g, ' ')
    .replace(/[：:][^：:]*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanValue(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
