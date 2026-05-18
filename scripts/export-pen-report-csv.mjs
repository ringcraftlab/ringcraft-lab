import fs from 'node:fs/promises';

const input = process.argv[2] || 'public/data/pens.amazon-report.json';
const output = process.argv[3] || 'public/data/pens.amazon-report.csv';

const report = JSON.parse(await fs.readFile(input, 'utf8'));
const rows = [
  ['status', 'brand', 'model', 'type', 'length', 'diameter', 'amazonUrl', 'evidence', 'rejectReason'],
];

for (const row of report.accepted || []) {
  rows.push([
    'accepted',
    row.pen?.brand || '',
    row.pen?.model || '',
    row.pen?.type || '',
    row.pen?.length ?? '',
    row.pen?.diameter ?? '',
    row.pen?.amazonUrl || row.product?.url || '',
    row.evidence || '',
    '',
  ]);
}

for (const row of report.rejected || []) {
  rows.push([
    'rejected',
    row.brand || '',
    row.title || '',
    '',
    row.length ?? '',
    '',
    row.url || row.product?.url || '',
    row.evidence || '',
    row.reason || row.error || '',
  ]);
}

await fs.writeFile(output, `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`, 'utf8');
console.log(`wrote ${output}`);

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
