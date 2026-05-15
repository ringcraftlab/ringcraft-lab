import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { T } from '../theme/appTheme';
import { filterPens, getUniqueBrands, getMinMaxLength, getMinMaxDiameter } from '../utils/penFilters';

const TYPES = ['万年筆', 'ボールペン'];

const card = {
  background: '#fff',
  border: '0.5px solid #efefef',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(45, 55, 72, 0.05)',
};

const chipOff = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '0.5px solid #e8e6e1',
  background: '#f7f5f2',
  color: T.ink,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: T.font,
  textAlign: 'center',
  boxSizing: 'border-box',
};

export default function PenSearch() {
  const [pens, setPens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [filters, setFilters] = useState({
    type: [],
    brand: [],
    lengthRange: [80, 130],
    diameterRange: [3, 20],
    searchQuery: '',
  });
  const resultsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/pens.json`);
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

  const brands = useMemo(() => getUniqueBrands(pens), [pens]);
  const popularBrands = useMemo(() => {
    if (!pens.length) return [];
    const counts = new Map();
    for (const p of pens) counts.set(p.brand, (counts.get(p.brand) || 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([name]) => name);
  }, [pens]);

  const [lenMin, lenMax] = useMemo(() => (pens.length ? getMinMaxLength(pens) : [80, 130]), [pens]);
  const [diaMin, diaMax] = useMemo(() => (pens.length ? getMinMaxDiameter(pens) : [3, 20]), [pens]);
  const filtered = useMemo(() => filterPens(pens, filters), [pens, filters]);
  const sortedRows = useMemo(
    () => [...filtered].sort((a, b) => a.length - b.length || a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)),
    [filtered],
  );

  const brandChips = showAllBrands ? brands : popularBrands;

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

  const setLengthLo = useCallback((v) => {
    setFilters((p) => {
      let lo = Math.round(Number(v));
      lo = Math.max(lenMin, Math.min(lo, lenMax));
      let hi = p.lengthRange[1];
      if (lo > hi) hi = lo;
      return { ...p, lengthRange: [lo, hi] };
    });
  }, [lenMin, lenMax]);

  const setLengthHi = useCallback((v) => {
    setFilters((p) => {
      let hi = Math.round(Number(v));
      hi = Math.max(lenMin, Math.min(hi, lenMax));
      let lo = p.lengthRange[0];
      if (hi < lo) lo = hi;
      return { ...p, lengthRange: [lo, hi] };
    });
  }, [lenMin, lenMax]);

  const setDiameterLo = useCallback((v) => {
    setFilters((p) => {
      let lo = Math.round(Number(v) * 10) / 10;
      lo = Math.max(diaMin, Math.min(lo, diaMax));
      let hi = p.diameterRange[1];
      if (lo > hi) hi = lo;
      return { ...p, diameterRange: [lo, hi] };
    });
  }, [diaMin, diaMax]);

  const setDiameterHi = useCallback((v) => {
    setFilters((p) => {
      let hi = Math.round(Number(v) * 10) / 10;
      hi = Math.max(diaMin, Math.min(hi, diaMax));
      let lo = p.diameterRange[0];
      if (hi < lo) lo = hi;
      return { ...p, diameterRange: [lo, hi] };
    });
  }, [diaMin, diaMax]);

  const resetFilters = useCallback(() => {
    setFilters({
      type: [],
      brand: [],
      lengthRange: [lenMin, lenMax],
      diameterRange: [diaMin, diaMax],
      searchQuery: '',
    });
  }, [lenMin, lenMax, diaMin, diaMax]);

  const applyPresetShortFp = useCallback(() => {
    setFilters((p) => ({
      ...p,
      type: ['万年筆'],
      brand: [],
      lengthRange: [lenMin, Math.min(100, lenMax)],
    }));
  }, [lenMin, lenMax]);

  const applyPresetShortBp = useCallback(() => {
    setFilters((p) => ({
      ...p,
      type: ['ボールペン'],
      brand: [],
      lengthRange: [lenMin, Math.min(100, lenMax)],
    }));
  }, [lenMin, lenMax]);

  const applyPresetSlim = useCallback(() => {
    setFilters((p) => ({
      ...p,
      diameterRange: [diaMin, Math.min(10, diaMax)],
    }));
  }, [diaMin, diaMax]);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const rangeStyle = { width: '100%', accentColor: T.primary, display: 'block', marginBottom: 8 };

  const shell = (child) => (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: T.font, color: T.ink, background: T.sidebar }}>
      {child}
    </div>
  );

  if (loading) {
    return shell(
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <p style={{ color: T.muted }}>読み込み中…</p>
      </div>,
    );
  }

  if (loadError) {
    return shell(
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 }}>
        <p style={{ color: '#a44' }}>{loadError}</p>
        <Link to="/" style={{ color: T.primary, fontWeight: 600 }}>← ホーム</Link>
      </div>,
    );
  }

  return shell(
    <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(14px, 4vw, 24px) clamp(14px, 4vw, 22px) 40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 12 }}>
          <Link to="/" style={{ fontSize: 13, color: T.muted, textDecoration: 'none', fontWeight: 500 }}>
            ← ホーム
          </Link>
        </div>

        <header style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, margin: 0 }}>コンパクトペン検索</h1>
          <p style={{ fontSize: 14, color: T.muted, margin: '8px 0 0 0', lineHeight: 1.5 }}>
            全長130mm以下を、種別・ブランド・文字で絞り込み。下の表が結果です。
          </p>
        </header>

        {/* 条件はこの1枚に集約 */}
        <section style={{ ...card, padding: '18px 16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: T.ink }}>条件</h2>
            <button
              type="button"
              onClick={resetFilters}
              style={{
                border: 'none',
                background: 'none',
                color: T.primary,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                fontFamily: T.font,
              }}
            >
              リセット
            </button>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft, marginBottom: 8 }}>種別</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {TYPES.map((t) => {
              const on = filters.type.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  style={{
                    ...chipOff,
                    padding: '11px 20px',
                    borderRadius: 9,
                    border: on ? `1.5px solid ${T.primary}` : chipOff.border,
                    background: on ? T.primary : chipOff.background,
                    color: on ? '#fff' : T.ink,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft, marginBottom: 8 }}>名前で検索</div>
          <input
            type="search"
            placeholder="例：Kaweco / スポーツ"
            value={filters.searchQuery}
            onChange={(e) => setFilters((p) => ({ ...p, searchQuery: e.target.value }))}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 12px',
              borderRadius: 9,
              border: '0.5px solid #efefef',
              fontSize: 14,
              marginBottom: 12,
              fontFamily: T.font,
              background: '#fafaf8',
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {[
              ['fp', '最短の万年筆', applyPresetShortFp],
              ['bp', '最短のボールペン', applyPresetShortBp],
              ['slim', '細い軸（10mm以下）', applyPresetSlim],
            ].map(([key, label, fn]) => (
              <button
                key={key}
                type="button"
                onClick={() => { fn(); scrollToResults(); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: `0.5px solid ${T.border}`,
                  background: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.primary,
                  cursor: 'pointer',
                  fontFamily: T.font,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.inkSoft }}>ブランド</span>
            {brands.length > popularBrands.length && (
              <button
                type="button"
                onClick={() => setShowAllBrands((v) => !v)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: T.primary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: T.font,
                }}
              >
                {showAllBrands ? 'よく使うブランドだけ' : `すべて表示（${brands.length}）`}
              </button>
            )}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
              gap: 8,
              marginBottom: 8,
            }}
          >
            {brandChips.map((b) => {
              const on = filters.brand.includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBrand(b)}
                  style={{
                    ...chipOff,
                    padding: '8px 8px',
                    fontSize: 12,
                    border: on ? `1.5px solid ${T.primary}` : chipOff.border,
                    background: on ? 'rgba(91, 127, 166, 0.12)' : chipOff.background,
                    color: on ? T.primary : T.ink,
                    fontWeight: on ? 700 : 500,
                  }}
                >
                  {b}
                </button>
              );
            })}
          </div>

          <details style={{ marginTop: 4, borderTop: '0.5px solid #efefef', paddingTop: 12 }}>
            <summary
              style={{
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: T.ink,
                listStyle: 'none',
              }}
            >
              長さ・軸径でもっと絞る（任意）
            </summary>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>全長（mm）</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(91, 127, 166, 0.12)', color: T.primary, fontWeight: 700, fontSize: 13 }}>
                  {Math.round(filters.lengthRange[0])}〜{Math.round(filters.lengthRange[1])}
                </span>
              </div>
              <input type="range" min={lenMin} max={lenMax} value={filters.lengthRange[0]} onChange={(e) => setLengthLo(e.target.value)} style={rangeStyle} />
              <input type="range" min={lenMin} max={lenMax} value={filters.lengthRange[1]} onChange={(e) => setLengthHi(e.target.value)} style={{ ...rangeStyle, marginBottom: 14 }} />

              <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>軸径（mm）</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(91, 127, 166, 0.12)', color: T.primary, fontWeight: 700, fontSize: 13 }}>
                  {filters.diameterRange[0]}〜{filters.diameterRange[1]}
                </span>
              </div>
              <input type="range" min={diaMin} max={diaMax} step={0.1} value={filters.diameterRange[0]} onChange={(e) => setDiameterLo(e.target.value)} style={rangeStyle} />
              <input type="range" min={diaMin} max={diaMax} step={0.1} value={filters.diameterRange[1]} onChange={(e) => setDiameterHi(e.target.value)} style={rangeStyle} />
            </div>
          </details>

          <p style={{ fontSize: 13, fontWeight: 700, color: T.primary, margin: '14px 0 0 0' }}>
            該当 {filtered.length} 件
          </p>
        </section>

        <section ref={resultsRef} id="pen-results" style={{ scrollMarginTop: 12 }}>
          {sortedRows.length === 0 ? (
            <p style={{ color: T.muted, fontSize: 14, padding: '12px 0' }}>該当なし。条件を変えてみてください。</p>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 10, border: '0.5px solid #efefef', background: '#fff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
                <thead>
                  <tr style={{ background: '#f7f5f2', textAlign: 'left' }}>
                    {['ブランド', 'モデル', '種別', '全長', '軸径', '購入'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', fontWeight: 700, color: T.inkSoft, fontSize: 11, borderBottom: '0.5px solid #efefef', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((pen) => (
                    <tr key={pen.id} style={{ borderBottom: '0.5px solid #f0eeeb' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: T.ink, whiteSpace: 'nowrap' }}>{pen.brand}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: T.ink }}>{pen.model}</td>
                      <td style={{ padding: '10px 12px', color: T.primary, fontWeight: 600, whiteSpace: 'nowrap' }}>{pen.type}</td>
                      <td style={{ padding: '10px 12px', color: T.muted, whiteSpace: 'nowrap' }}>{pen.length}mm</td>
                      <td style={{ padding: '10px 12px', color: T.muted, whiteSpace: 'nowrap' }}>{pen.diameter}mm</td>
                      <td style={{ padding: '10px 12px' }}>
                        <a href={pen.amazonUrl} target="_blank" rel="noopener noreferrer" style={{ color: T.primary, fontWeight: 600, textDecoration: 'none', marginRight: 10 }}>
                          Amazon
                        </a>
                        <a href={pen.rakutenUrl} target="_blank" rel="noopener noreferrer" style={{ color: T.primary, fontWeight: 600, textDecoration: 'none' }}>
                          楽天
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>,
  );
}
