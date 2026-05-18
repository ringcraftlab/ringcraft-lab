import fs from 'node:fs/promises';

const input = process.argv[2] || 'public/data/pens.json';
const output = process.argv[3] || 'public/data/pens.csv';

const pens = JSON.parse(await fs.readFile(input, 'utf8'));
const rows = [
  ['id', 'brand', 'model', 'type', 'length', 'diameter', 'amazonUrl', 'rakutenUrl', 'imageUrl'],
  ...pens.map((pen) => [
    pen.id,
    pen.brand,
    pen.model,
    pen.type,
    pen.length,
    pen.diameter ?? '',
    pen.amazonUrl || '',
    pen.rakutenUrl || '',
    pen.imageUrl || '',
  ]),
];

await fs.writeFile(output, `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`, 'utf8');
console.log(`wrote ${output}`);

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
