import fs from 'node:fs/promises';

const input = process.argv[2] || 'public/data/pens.json';
const output = process.argv[3] || 'public/data/pens.trusted-models.csv';

const trustedBrands = [
  'Kaweco',
  'Pilot',
  'PILOT',
  'Sailor',
  'Platinum',
  'Pelikan',
  'Montblanc',
  'Lamy',
  'LAMY',
  'TWSBI',
  'Opus 88',
  'Ohto',
  "Traveler's Company",
  'Fisher',
  'Zebra',
  'Tombow',
  'Caran d\'Ache',
  'Parker',
  'Cross',
  'Rotring',
  'Pentel',
  'Mitsubishi Uni',
  'Penco',
];

const pens = JSON.parse(await fs.readFile(input, 'utf8'));
const trusted = pens
  .filter((pen) => trustedBrands.some((brand) => sameBrand(pen.brand, brand)))
  .sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));

const rows = [
  ['check', 'brand', 'model', 'type', 'currentLength', 'currentDiameter', 'amazonSearchUrl', 'note'],
  ...trusted.map((pen) => [
    '',
    pen.brand,
    pen.model,
    pen.type,
    pen.length,
    pen.diameter ?? '',
    buildAmazonSearchUrl(pen),
    '',
  ]),
];

await fs.writeFile(output, `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`, 'utf8');
console.log(`trusted models: ${trusted.length}`);
console.log(`wrote ${output}`);

function sameBrand(left, right) {
  return String(left).toLowerCase() === String(right).toLowerCase();
}

function buildAmazonSearchUrl(pen) {
  const query = `${pen.brand} ${pen.model} 全長`;
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}`;
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
