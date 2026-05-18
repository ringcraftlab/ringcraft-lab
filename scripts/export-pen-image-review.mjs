import fs from 'node:fs/promises';

const inputPath = 'public/data/pens.expanded-candidates.json';
const outputPath = 'public/data/pens.image-review.html';

const rows = JSON.parse(await fs.readFile(inputPath, 'utf8'));

const visibleRows = rows
  .filter((row) => row.status !== 'duplicate')
  .sort((a, b) => statusRank(a.status) - statusRank(b.status)
    || String(a.brand).localeCompare(String(b.brand), 'ja')
    || String(a.model).localeCompare(String(b.model), 'ja'));

await fs.writeFile(outputPath, renderPage(visibleRows), 'utf8');

console.log(`wrote ${outputPath}`);
console.log(`cards: ${visibleRows.length}`);
console.log(`with images: ${visibleRows.filter((row) => row.imageUrl).length}`);

function statusRank(status) {
  return {
    active: 1,
    review: 2,
    discontinued: 3,
    exclude: 4,
    duplicate: 5,
  }[status] || 9;
}

function renderPage(items) {
  const cards = items.map(renderCard).join('\n');
  const activeCount = items.filter((row) => row.status === 'active').length;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pen Image Review</title>
  <style>
    :root {
      color-scheme: light;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #2d261f;
      background: #f7f1e8;
    }
    body {
      margin: 0;
      padding: 24px;
    }
    header {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: end;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      font-size: clamp(24px, 4vw, 40px);
      letter-spacing: -0.04em;
    }
    .summary {
      margin: 6px 0 0;
      color: #6b5f53;
      font-size: 14px;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin: 0 0 18px;
      padding: 12px;
      border: 1px solid rgba(91, 73, 51, 0.16);
      border-radius: 18px;
      background: rgba(247, 241, 232, 0.94);
      backdrop-filter: blur(10px);
      box-shadow: 0 12px 32px rgba(62, 45, 24, 0.08);
    }
    label {
      display: grid;
      gap: 4px;
      color: #6b5f53;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    select,
    input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid rgba(91, 73, 51, 0.18);
      border-radius: 12px;
      padding: 9px 10px;
      background: #fffaf3;
      color: #2d261f;
      font: inherit;
      font-size: 13px;
    }
    .count {
      display: flex;
      align-items: end;
      color: #5d4e3e;
      font-size: 13px;
      font-weight: 800;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 14px;
    }
    .card {
      overflow: hidden;
      border: 1px solid rgba(91, 73, 51, 0.16);
      border-radius: 18px;
      background: rgba(255, 252, 247, 0.92);
      box-shadow: 0 14px 36px rgba(62, 45, 24, 0.08);
    }
    .image {
      display: grid;
      place-items: center;
      height: 160px;
      background: #efe3d3;
    }
    .image img {
      max-width: 100%;
      max-height: 160px;
      object-fit: contain;
      display: block;
    }
    .placeholder {
      padding: 18px;
      color: #8a7762;
      text-align: center;
      font-size: 13px;
      line-height: 1.6;
    }
    .body {
      padding: 14px;
    }
    .brand {
      color: #8a7762;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .model {
      margin: 4px 0 10px;
      font-size: 16px;
      font-weight: 800;
      line-height: 1.35;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }
    .pill {
      border-radius: 999px;
      padding: 4px 8px;
      background: #f2e6d5;
      color: #5d4e3e;
      font-size: 12px;
      font-weight: 700;
    }
    .pill.active { background: #dff1df; color: #245b31; }
    .pill.review { background: #fff0c6; color: #72540b; }
    .pill.discontinued { background: #eadfea; color: #68466b; }
    .pill.exclude { background: #f5d8d3; color: #7b332a; }
    .pill.fit-compact { background: #dff1df; color: #245b31; }
    .pill.fit-comfortable { background: #e6f0d6; color: #435c20; }
    .pill.fit-tight { background: #fff0c6; color: #72540b; }
    .pill.fit-over { background: #f5d8d3; color: #7b332a; }
    .links {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    a {
      color: inherit;
    }
    .link {
      border: 1px solid rgba(91, 73, 51, 0.16);
      border-radius: 10px;
      padding: 8px 10px;
      background: #fffaf3;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
    }
    .note {
      margin-top: 10px;
      color: #756857;
      font-size: 12px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Pen Image Review</h1>
      <p class="summary">${items.length} cards / active ${activeCount} / ${items.filter((row) => row.imageUrl).length} direct thumbnails. Duplicate rows are hidden.</p>
    </div>
  </header>
  <section class="toolbar" aria-label="review filters">
    <label>
      status
      <select id="statusFilter">
        <option value="active" selected>activeだけ</option>
        <option value="">全部</option>
        <option value="review">review</option>
        <option value="discontinued">discontinued</option>
        <option value="exclude">exclude</option>
      </select>
    </label>
    <label>
      type
      <select id="typeFilter">
        <option value="">全部</option>
        <option value="ボールペン">ボールペン</option>
        <option value="シャープペン">シャープペン</option>
        <option value="万年筆">万年筆</option>
        <option value="ローラーボール">ローラーボール</option>
      </select>
    </label>
    <label>
      fit
      <select id="fitFilter">
        <option value="">全部</option>
        <option value="compact">はみ出しにくい -110mm</option>
        <option value="comfortable">だいたい収まる 111-125mm</option>
        <option value="tight">少し大きめ 126-130mm</option>
        <option value="over">はみ出し注意 131mm-</option>
      </select>
    </label>
    <label>
      image
      <select id="imageFilter">
        <option value="">全部</option>
        <option value="yes">画像あり</option>
        <option value="no">画像なし</option>
      </select>
    </label>
    <label>
      search
      <input id="searchFilter" type="search" placeholder="ブランド・モデル・メモ">
    </label>
    <div class="count" id="visibleCount"></div>
  </section>
  <main class="grid">
${cards}
  </main>
  <script>
    const cards = [...document.querySelectorAll('.card')];
    const controls = {
      status: document.querySelector('#statusFilter'),
      type: document.querySelector('#typeFilter'),
      fit: document.querySelector('#fitFilter'),
      image: document.querySelector('#imageFilter'),
      search: document.querySelector('#searchFilter'),
      count: document.querySelector('#visibleCount'),
    };

    function applyFilters() {
      const query = controls.search.value.trim().toLowerCase();
      let visible = 0;

      for (const card of cards) {
        const matchesStatus = !controls.status.value || card.dataset.status === controls.status.value;
        const matchesType = !controls.type.value || card.dataset.type === controls.type.value;
        const matchesFit = !controls.fit.value || card.dataset.fit === controls.fit.value;
        const matchesImage = !controls.image.value || card.dataset.image === controls.image.value;
        const matchesSearch = !query || card.dataset.search.includes(query);
        const show = matchesStatus && matchesType && matchesFit && matchesImage && matchesSearch;

        card.hidden = !show;
        if (show) visible += 1;
      }

      controls.count.textContent = visible + ' / ' + cards.length + ' 件表示';
    }

    for (const control of Object.values(controls)) {
      if (control && control !== controls.count) control.addEventListener('input', applyFilters);
    }

    applyFilters();
  </script>
</body>
</html>
`;
}

function renderCard(row) {
  const query = encodeURIComponent(`${row.brand} ${row.model}`);
  const imageSearchUrl = `https://www.google.com/search?tbm=isch&q=${query}`;
  const sourceUrl = row.sourceUrl || row.amazonUrl || row.rakutenUrl || imageSearchUrl;

  const fit = fitBucket(row.length);
  const searchText = [
    row.brand,
    row.model,
    row.canonicalModel,
    row.type,
    row.status,
    row.evidence,
    row.note,
  ].join(' ').toLowerCase();

  return `    <article class="card" data-status="${escapeAttr(row.status)}" data-type="${escapeAttr(row.type || '')}" data-fit="${escapeAttr(fit.key)}" data-image="${row.imageUrl ? 'yes' : 'no'}" data-search="${escapeAttr(searchText)}">
      <div class="image">
        ${row.imageUrl
    ? `<img src="${escapeAttr(row.imageUrl)}" alt="${escapeAttr(`${row.brand} ${row.model}`)}" loading="lazy">`
    : `<div class="placeholder">画像URLなし<br>画像検索リンクから確認</div>`}
      </div>
      <div class="body">
        <div class="brand">${escapeHtml(row.brand)}</div>
        <div class="model">${escapeHtml(row.model)}</div>
        <div class="meta">
          <span class="pill ${escapeAttr(row.status)}">${escapeHtml(row.status)}</span>
          <span class="pill">${escapeHtml(row.type || 'type不明')}</span>
          <span class="pill fit-${escapeAttr(fit.key)}">${escapeHtml(fit.label)}</span>
          <span class="pill">${formatSize(row)}</span>
        </div>
        <div class="links">
          <a class="link" href="${escapeAttr(imageSearchUrl)}" target="_blank" rel="noreferrer">画像検索</a>
          <a class="link" href="${escapeAttr(sourceUrl)}" target="_blank" rel="noreferrer">根拠/販売元</a>
          <a class="link" href="${escapeAttr(row.amazonUrl || imageSearchUrl)}" target="_blank" rel="noreferrer">Amazon</a>
          <a class="link" href="${escapeAttr(row.rakutenUrl || imageSearchUrl)}" target="_blank" rel="noreferrer">楽天</a>
        </div>
        ${row.note ? `<div class="note">${escapeHtml(row.note)}</div>` : ''}
      </div>
    </article>`;
}

function formatSize(row) {
  const length = row.length == null ? '長さ不明' : `${row.length}mm`;
  const diameter = row.diameter == null ? '径不明' : `径${row.diameter}mm`;
  return `${escapeHtml(length)} / ${escapeHtml(diameter)}`;
}

function fitBucket(length) {
  if (typeof length !== 'number' || !Number.isFinite(length)) return { key: 'over', label: 'サイズ要確認' };
  if (length <= 110) return { key: 'compact', label: 'はみ出しにくい' };
  if (length <= 125) return { key: 'comfortable', label: 'だいたい収まる' };
  if (length <= 130) return { key: 'tight', label: '少し大きめ' };
  return { key: 'over', label: 'はみ出し注意' };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}
