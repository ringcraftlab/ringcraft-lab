import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { filterPens, getUniqueBrands, getMinMaxLength, getMinMaxDiameter } from '../utils/penFilters';

const TYPES = ['万年筆', 'ボールペン'];

export default function PenSearch() {
  const [pens, setPens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filters, setFilters] = useState({
    type: [],
    brand: [],
    lengthRange: [80, 130],
    diameterRange: [3, 20],
    searchQuery: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/data/pens.json');
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (cancelled) return;
        setPens(data);
        if (data.length > 0) {
          const [minL, maxL] = getMinMaxLength(data);
          const [minD, maxD] = getMinMaxDiameter(data);
          setFilters((prev) => ({
            ...prev,
            lengthRange: [minL, maxL],
            diameterRange: [minD, maxD],
          }));
        }
      } catch (e) {
        if (!cancelled) setLoadError(e?.message || '読み込みに失敗しました');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pensForBrandList = useMemo(() => {
    if (filters.type.length === 0) return pens;
    return pens.filter((p) => filters.type.includes(p.type));
  }, [pens, filters.type]);

  const brands = useMemo(() => getUniqueBrands(pensForBrandList), [pensForBrandList]);

  const [lenMin, lenMax] = useMemo(() => (pens.length ? getMinMaxLength(pens) : [80, 130]), [pens]);
  const [diaMin, diaMax] = useMemo(() => (pens.length ? getMinMaxDiameter(pens) : [3, 20]), [pens]);

  const filtered = useMemo(() => filterPens(pens, filters), [pens, filters]);

  const toggleType = useCallback((t) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type.includes(t) ? prev.type.filter((x) => x !== t) : [...prev.type, t],
    }));
  }, []);

  const toggleBrand = useCallback((b) => {
    setFilters((prev) => ({
      ...prev,
      brand: prev.brand.includes(b) ? prev.brand.filter((x) => x !== b) : [...prev.brand, b],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      type: [],
      brand: [],
      lengthRange: [lenMin, lenMax],
      diameterRange: [diaMin, diaMax],
      searchQuery: '',
    });
  }, [lenMin, lenMax, diaMin, diaMax]);

  if (loading) {
    return (
      <div style={S.page}>
        <p style={{ color: '#666' }}>ペンデータを読み込み中…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={S.page}>
        <p style={{ color: '#c0392b' }}>{loadError}</p>
        <Link to="/" style={{ color: '#2c5282' }}>← ホーム</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif', background: '#ece9e4' }}>
      <header style={{ background: '#2c5282', color: '#fff', padding: '11px 22px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 13 }}>← ホーム</Link>
        <span style={{ opacity: 0.4 }}>|</span>
        <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>ペン検索（Compact Pens 100）</h1>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <aside style={{
          width: 280,
          flexShrink: 0,
          background: '#fff',
          borderRight: '1px solid #d4d0ca',
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={S.secLabel}>検索</div>
          <input
            type="search"
            placeholder="ブランド・モデル名"
            value={filters.searchQuery}
            onChange={(e) => setFilters((p) => ({ ...p, searchQuery: e.target.value }))}
            style={S.input}
          />

          <div style={S.secLabel}>種別（未選択＝すべて）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TYPES.map((t) => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={filters.type.includes(t)} onChange={() => toggleType(t)} />
                {t}
              </label>
            ))}
          </div>

          <div style={S.secLabel}>ブランド</div>
          <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #d4d0ca', borderRadius: 6, padding: 8 }}>
            {brands.map((b) => (
              <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', padding: '3px 0' }}>
                <input type="checkbox" checked={filters.brand.includes(b)} onChange={() => toggleBrand(b)} />
                {b}
              </label>
            ))}
          </div>

          <div style={S.secLabel}>全長 mm</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              style={S.num}
              value={Math.round(filters.lengthRange[0])}
              min={lenMin}
              max={filters.lengthRange[1]}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFilters((p) => ({ ...p, lengthRange: [Math.min(v, p.lengthRange[1]), p.lengthRange[1]] }));
              }}
            />
            <span style={{ color: '#999' }}>〜</span>
            <input
              type="number"
              style={S.num}
              value={Math.round(filters.lengthRange[1])}
              min={filters.lengthRange[0]}
              max={lenMax}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFilters((p) => ({ ...p, lengthRange: [p.lengthRange[0], Math.max(v, p.lengthRange[0])] }));
              }}
            />
          </div>

          <div style={S.secLabel}>軸径 mm</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              style={S.num}
              value={filters.diameterRange[0]}
              min={diaMin}
              max={filters.diameterRange[1]}
              step={0.1}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFilters((p) => ({ ...p, diameterRange: [Math.min(v, p.diameterRange[1]), p.diameterRange[1]] }));
              }}
            />
            <span style={{ color: '#999' }}>〜</span>
            <input
              type="number"
              style={S.num}
              value={filters.diameterRange[1]}
              min={filters.diameterRange[0]}
              max={diaMax}
              step={0.1}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFilters((p) => ({ ...p, diameterRange: [p.diameterRange[0], Math.max(v, p.diameterRange[0])] }));
              }}
            />
          </div>

          <button type="button" onClick={resetFilters} style={{ ...S.btn, background: '#ece9e4', border: '1px solid #d4d0ca' }}>
            条件リセット
          </button>
        </aside>

        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 18px' }}>
          <p style={{ fontSize: 14, color: '#444', marginBottom: 16 }}>
            該当 <strong style={{ color: '#2c5282' }}>{filtered.length}</strong> 件 / 全 {pens.length} 件
          </p>
          {filtered.length === 0 ? (
            <p style={{ color: '#888' }}>条件を変えてお試しください。</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16,
            }}>
              {filtered.map((pen) => (
                <article
                  key={pen.id}
                  style={{
                    background: '#fff',
                    borderRadius: 10,
                    border: '1px solid #d4d0ca',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: 140, background: '#f5f3f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={pen.imageUrl}
                      alt=""
                      style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain' }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{pen.brand}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1c1c1c', lineHeight: 1.3 }}>{pen.model}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <span style={{ marginRight: 12 }}>全長 {pen.length}mm</span>
                      <span>軸径 {pen.diameter}mm</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#2c5282', fontWeight: 600 }}>{pen.type}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                      <a href={pen.amazonUrl} target="_blank" rel="noopener noreferrer" style={{ ...S.linkBtn, flex: 1, textAlign: 'center' }}>Amazon</a>
                      <a href={pen.rakutenUrl} target="_blank" rel="noopener noreferrer" style={{ ...S.linkBtnO, flex: 1, textAlign: 'center' }}>楽天</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ece9e4',
    fontFamily: 'sans-serif',
  },
  secLabel: { fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase', marginBottom: 4 },
  input: { border: '1px solid #d4d0ca', borderRadius: 6, padding: '8px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' },
  num: { border: '1px solid #d4d0ca', borderRadius: 6, padding: '6px 8px', fontSize: 13, width: 72, boxSizing: 'border-box' },
  btn: { padding: '10px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'sans-serif' },
  linkBtn: {
    display: 'block',
    padding: '8px 10px',
    borderRadius: 6,
    background: '#2c5282',
    color: '#fff',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
  },
  linkBtnO: {
    display: 'block',
    padding: '8px 10px',
    borderRadius: 6,
    background: '#fff',
    color: '#2c5282',
    border: '1px solid #2c5282',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
  },
};
