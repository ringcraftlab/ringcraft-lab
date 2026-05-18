import fs from 'node:fs/promises';

const input = process.argv[2] || 'public/data/pens.official-report.json';
const output = process.argv[3] || 'public/data/pens.official-report.csv';

const report = JSON.parse(await fs.readFile(input, 'utf8'));
const rows = [
  ['status', 'brand', 'model', 'type', 'length', 'diameter', 'officialUrl', 'evidence', 'note'],
];

for (const row of report.accepted || []) {
  rows.push([
    'accepted',
    row.brand,
    row.model,
    row.type,
    row.length,
    row.diameter ?? '',
    row.officialUrl,
    row.evidence,
    row.note,
  ]);
}

for (const row of report.needsReview || []) {
  rows.push([
    'needsReview',
    row.brand,
    row.model,
    '',
    row.candidateLength ?? '',
    '',
    row.officialUrl,
    '',
    row.reason,
  ]);
}

await fs.writeFile(output, `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`, 'utf8');
console.log(`wrote ${output}`);

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
