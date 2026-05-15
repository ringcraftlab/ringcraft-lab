import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { T } from '../theme/appTheme';
import { filterPens, getUniqueBrands, getMinMaxLength, getMinMaxDiameter } from '../utils/penFilters';

const TYPES = ['万年筆', 'ボールペン'];

const sec = { fontSize: 11, fontWeight: 700, color: T.inkSoft, marginBottom: 10, letterSpacing: '0.04em' };

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

  const resetFilters = useCallback(() => {
    setFilters({
      type: [],
      brand: [],
      lengthRange: [lenMin, lenMax],
      diameterRange: [diaMin, diaMax],
      searchQuery: '',
    });
  }, [lenMin, lenMax, diaMin, diaMax]);

  const shell = (child) => (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: T.font, color: T.ink, background: T.sidebar }}>
      <AppHeader title="ペン検索" />
      {child}
    </div>
  );

  if (loading) {
    return shell(
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <p style={{ color: T.muted }}>読み込み中…</p>
      </div>
    );
  }

  if (loadError) {
    return shell(
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 }}>
        <p style={{ color: '#a44' }}>{loadError}</p>
        <Link to="/" style={{ color: T.primary, fontWeight: 600 }}>← ホーム</Link>
      </div>
    );
  }

  return shell(
    <main style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 40px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, margin: '0 0 24px 0', maxWidth: 52 * 16 }}>
          Compact Pens 100 — 全長130mm以下のペンをブランド・長さ・種別から絞り込みできます。
        </p>

        <section
          style={{
            background: T.previewBg,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusLg,
            padding: '22px 22px 20px',
            marginBottom: 28,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ ...sec, marginBottom: 14 }}>フィルター</div>

          <div style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>ブランド</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {brands.map((b) => {
              const on = filters.brand.includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBrand(b)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: on ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                    background: on ? T.primary : '#fff',
                    color: on ? '#fff' : T.ink,
                    fontSize: 13,
                    fontWeight: on ? 600 : 500,
                    cursor: 'pointer',
                    fontFamily: T.font,
                  }}
                >
                  {b}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>全長（mm）</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', borderRadius: 8, background: `${T.primary}18`, color: T.primary, fontWeight: 700, fontSize: 14 }}>
              {Math.round(filters.lengthRange[0])}
            </span>
            <span style={{ color: T.muted }}>〜</span>
            <span style={{ padding: '4px 12px', borderRadius: 8, background: `${T.primary}18`, color: T.primary, fontWeight: 700, fontSize: 14 }}>
              {Math.round(filters.lengthRange[1])}
            </span>
          </div>
          <input type="range" min={lenMin} max={lenMax} value={filters.lengthRange[0]} onChange={(e) => setLengthLo(e.target.value)} style={{ width: '100%', maxWidth: 400, accentColor: T.primary, display: 'block', marginBottom: 6 }} />
          <input type="range" min={lenMin} max={lenMax} value={filters.lengthRange[1]} onChange={(e) => setLengthHi(e.target.value)} style={{ width: '100%', maxWidth: 400, accentColor: T.primary, display: 'block', marginBottom: 20 }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: T.muted }}>種別</span>
              {TYPES.map((t) => {
                const on = filters.type.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: on ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                      background: on ? T.primary : '#fff',
                      color: on ? '#fff' : T.ink,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: T.font,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: T.muted }}>軸径</span>
              <input type="number" value={filters.diameterRange[0]} min={diaMin} max={filters.diameterRange[1]} step={0.1} onChange={(e) => { const v = Number(e.target.value); setFilters((p) => ({ ...p, diameterRange: [Math.min(v, p.diameterRange[1]), p.diameterRange[1]] })); }} style={inp} />
              <span style={{ color: T.muted }}>〜</span>
              <input type="number" value={filters.diameterRange[1]} min={filters.diameterRange[0]} max={diaMax} step={0.1} onChange={(e) => { const v = Number(e.target.value); setFilters((p) => ({ ...p, diameterRange: [p.diameterRange[0], Math.max(v, p.diameterRange[0])] })); }} style={inp} />
            </div>
          </div>

          <input
            type="search"
            placeholder="モデル名で検索"
            value={filters.searchQuery}
            onChange={(e) => setFilters((p) => ({ ...p, searchQuery: e.target.value }))}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              borderRadius: T.radiusMd,
              border: `1px solid ${T.border}`,
              fontSize: 14,
              marginBottom: 12,
              fontFamily: T.font,
            }}
          />

          <button type="button" onClick={resetFilters} style={{ background: 'none', border: 'none', color: T.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: T.font }}>
            条件をリセット
          </button>
        </section>

        <p style={{ fontSize: 14, color: T.muted, marginBottom: 16 }}>
          <strong style={{ color: T.primary, fontSize: 17 }}>{filtered.length}</strong>
          <span style={{ marginLeft: 6 }}>件 / 全 {pens.length} 件</span>
        </p>

        {filtered.length === 0 ? (
          <p style={{ color: T.muted, fontSize: 14 }}>条件を変えてお試しください。</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {filtered.map((pen) => (
              <article
                key={pen.id}
                style={{
                  background: T.previewBg,
                  borderRadius: T.radiusMd,
                  border: `1px solid ${T.border}`,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: 128, background: T.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={pen.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 128, objectFit: 'contain' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
                <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{pen.brand}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.ink, lineHeight: 1.35 }}>{pen.model}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>
                    全長 {pen.length}mm · 軸径 {pen.diameter}mm
                  </div>
                  <div style={{ fontSize: 12, color: T.primary, fontWeight: 600 }}>{pen.type}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10 }}>
                    <a href={pen.amazonUrl} target="_blank" rel="noopener noreferrer" style={{ ...btn, flex: 1, textAlign: 'center' }}>Amazon</a>
                    <a href={pen.rakutenUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnO, flex: 1, textAlign: 'center' }}>楽天</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const inp = {
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 13,
  width: 76,
  fontFamily: T.font,
};

const btn = {
  display: 'block',
  padding: '8px 10px',
  borderRadius: 8,
  background: T.primary,
  color: '#fff',
  textDecoration: 'none',
  fontSize: 12,
  fontWeight: 600,
};

const btnO = {
  display: 'block',
  padding: '8px 10px',
  borderRadius: 8,
  background: '#fff',
  color: T.primary,
  border: `1px solid ${T.primary}`,
  textDecoration: 'none',
  fontSize: 12,
  fontWeight: 600,
};
