import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { T } from '../theme/appTheme';
import { filterPens, getUniqueBrands, getMinMaxLength, getMinMaxDiameter } from '../utils/penFilters';

const TYPES = ['万年筆', 'ボールペン'];

const card = {
  background: '#fff',
  border: '0.5px solid #efefef',
  borderRadius: 14,
  boxShadow: '0 2px 16px rgba(45, 55, 72, 0.06)',
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
  const typeCount = useMemo(() => new Set(pens.map((p) => p.type)).size, [pens]);
  const [lenMin, lenMax] = useMemo(() => (pens.length ? getMinMaxLength(pens) : [80, 130]), [pens]);
  const [diaMin, diaMax] = useMemo(() => (pens.length ? getMinMaxDiameter(pens) : [3, 20]), [pens]);
  const filtered = useMemo(() => filterPens(pens, filters), [pens, filters]);
  const sortedRows = useMemo(
    () => [...filtered].sort((a, b) => a.length - b.length || a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)),
    [filtered],
  );

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
    <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 4vw, 28px) clamp(14px, 4vw, 24px) 48px' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Link to="/" style={{ fontSize: 13, color: T.muted, textDecoration: 'none', fontWeight: 500 }}>
            ← ホーム
          </Link>
        </div>

        {/* ヒーロー */}
        <header style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: T.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 6px 20px rgba(91, 127, 166, 0.35)',
            }}
            aria-hidden
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M14 3l7 7-9 9H5v-7L14 3z" stroke="#fff" strokeWidth="1.75" strokeLinejoin="round" />
              <path d="M13 4l6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, margin: 0, letterSpacing: '0.02em' }}>
              コンパクトペン検索
            </h1>
            <p style={{ fontSize: 15, color: T.muted, margin: '8px 0 0 0', fontWeight: 500 }}>
              全長130mm以下のペンをラインナップ
            </p>
            <p style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.75, margin: '14px 0 0 0', maxWidth: 560 }}>
              M5やミニ6に合うコンパクトペンを、ブランド・種別・長さ・軸径から絞り込み。画像一覧は出さず、条件に合うモデルをテーブルで比較できます。
            </p>
          </div>
        </header>

        {/* 統計バー */}
        <section
          style={{
            ...card,
            padding: '20px 24px',
            marginBottom: 22,
            background: 'rgba(91, 127, 166, 0.08)',
            border: 'none',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          {[
            [String(pens.length), 'ペンモデル'],
            [String(brands.length), 'ブランド'],
            [String(typeCount), '種別'],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center', minWidth: 88 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: T.primary, lineHeight: 1.1 }}>{num}</div>
              <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </section>

        {/* クイックフィルタ */}
        <section style={{ ...card, padding: '22px 22px 24px', marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 18px 0', color: T.ink }}>クイックフィルタ</h2>

          <div style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, marginBottom: 10, letterSpacing: '0.06em' }}>ブランドを選ぶ</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
              gap: 8,
              marginBottom: 22,
            }}
          >
            {brands.map((b) => {
              const on = filters.brand.includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBrand(b)}
                  style={{
                    ...chipOff,
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

          <div style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, marginBottom: 10, letterSpacing: '0.06em' }}>長さ（mm）</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(91, 127, 166, 0.15)', color: T.primary, fontWeight: 700, fontSize: 14 }}>
              {Math.round(filters.lengthRange[0])}mm
            </span>
            <span style={{ color: T.muted }}>〜</span>
            <span style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(91, 127, 166, 0.15)', color: T.primary, fontWeight: 700, fontSize: 14 }}>
              {Math.round(filters.lengthRange[1])}mm
            </span>
          </div>
          <input type="range" min={lenMin} max={lenMax} value={filters.lengthRange[0]} onChange={(e) => setLengthLo(e.target.value)} style={rangeStyle} />
          <input type="range" min={lenMin} max={lenMax} value={filters.lengthRange[1]} onChange={(e) => setLengthHi(e.target.value)} style={{ ...rangeStyle, marginBottom: 22 }} />

          <div style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, marginBottom: 10, letterSpacing: '0.06em' }}>軸径（mm）</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(91, 127, 166, 0.15)', color: T.primary, fontWeight: 700, fontSize: 14 }}>
              {filters.diameterRange[0]}mm
            </span>
            <span style={{ color: T.muted }}>〜</span>
            <span style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(91, 127, 166, 0.15)', color: T.primary, fontWeight: 700, fontSize: 14 }}>
              {filters.diameterRange[1]}mm
            </span>
          </div>
          <input type="range" min={diaMin} max={diaMax} step={0.1} value={filters.diameterRange[0]} onChange={(e) => setDiameterLo(e.target.value)} style={rangeStyle} />
          <input type="range" min={diaMin} max={diaMax} step={0.1} value={filters.diameterRange[1]} onChange={(e) => setDiameterHi(e.target.value)} style={{ ...rangeStyle, marginBottom: 18 }} />

          <div style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, marginBottom: 10 }}>種別</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {TYPES.map((t) => {
              const on = filters.type.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  style={{
                    ...chipOff,
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: on ? `1.5px solid ${T.primary}` : chipOff.border,
                    background: on ? T.primary : chipOff.background,
                    color: on ? '#fff' : T.ink,
                    fontWeight: 600,
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, marginBottom: 8 }}>モデル名</div>
          <input
            type="search"
            placeholder="ブランド名・モデル名の一部で検索"
            value={filters.searchQuery}
            onChange={(e) => setFilters((p) => ({ ...p, searchQuery: e.target.value }))}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 14px',
              borderRadius: 10,
              border: '0.5px solid #efefef',
              fontSize: 14,
              marginBottom: 18,
              fontFamily: T.font,
              background: '#fafaf8',
            }}
          />

          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={scrollToResults}
              style={{
                flex: '1 1 220px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '14px 20px',
                borderRadius: 10,
                border: 'none',
                background: T.primary,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: T.font,
                boxShadow: '0 4px 18px rgba(91, 127, 166, 0.35)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path d="M15 15l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {filtered.length}本を見る
            </button>
            <button
              type="button"
              title="条件をリセット"
              onClick={resetFilters}
              style={{
                width: 48,
                minHeight: 48,
                borderRadius: 10,
                border: '0.5px solid #efefef',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 18,
                color: T.muted,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        </section>

        {/* ショートカットカード */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
            marginBottom: 22,
          }}
        >
          {[
            { title: '最短の万年筆を見る', desc: '100mm以下のコンパクト万年筆', onClick: applyPresetShortFp },
            { title: '最短のボールペンを見る', desc: '100mm以下のコンパクトボールペン', onClick: applyPresetShortBp },
            { title: '軸径10mm以下で探す', desc: '細身で握りやすいペン', onClick: applyPresetSlim },
          ].map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => { c.onClick(); scrollToResults(); }}
              style={{
                ...card,
                padding: '18px 18px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: T.font,
                border: '0.5px solid #efefef',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(91, 127, 166, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = card.boxShadow;
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(91, 127, 166, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }} aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3a6 6 0 016 6c0 2.5-1.5 4.5-3 5.5V17H9v-2.5C7.5 13.5 6 11.5 6 9a6 6 0 016-6z" stroke={T.primary} strokeWidth="1.75" strokeLinejoin="round" />
                  <path d="M9 19h6" stroke={T.primary} strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55, marginBottom: 12 }}>{c.desc}</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>探索を開始 →</span>
            </button>
          ))}
        </div>

        {/* 特徴（テキストのみ） */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {[
            { t: '高度なフィルタリング', d: 'ブランド・種別・長さ・軸径から、条件に合うペンを素早く絞り込めます。' },
            { t: '一覧で比較', d: '画像は出さずスペック中心の表なので、長さや径の違いを横並びで確認しやすいです。' },
            { t: 'システム手帳向け', d: 'コンパクトサイズ中心のデータを、リフィル選びの参考にどうぞ。' },
          ].map((x) => (
            <div key={x.t} style={{ ...card, padding: '18px 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{x.t}</div>
              <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, margin: 0 }}>{x.d}</p>
            </div>
          ))}
        </div>

        {/* 結果：画像なしテーブル */}
        <section ref={resultsRef} id="pen-results" style={{ scrollMarginTop: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px 0' }}>検索結果</h2>
          {sortedRows.length === 0 ? (
            <p style={{ color: T.muted, fontSize: 14, padding: '20px 0' }}>条件に合うペンがありません。フィルタを緩めてお試しください。</p>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 12, border: '0.5px solid #efefef', background: '#fff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
                <thead>
                  <tr style={{ background: '#f7f5f2', textAlign: 'left' }}>
                    {['ブランド', 'モデル', '種別', '全長', '軸径', '購入'].map((h) => (
                      <th key={h} style={{ padding: '12px 14px', fontWeight: 700, color: T.inkSoft, fontSize: 11, letterSpacing: '0.04em', borderBottom: '0.5px solid #efefef', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((pen) => (
                    <tr key={pen.id} style={{ borderBottom: '0.5px solid #f0eeeb' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: T.ink, whiteSpace: 'nowrap' }}>{pen.brand}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: T.ink }}>{pen.model}</td>
                      <td style={{ padding: '12px 14px', color: T.primary, fontWeight: 600, whiteSpace: 'nowrap' }}>{pen.type}</td>
                      <td style={{ padding: '12px 14px', color: T.muted, whiteSpace: 'nowrap' }}>{pen.length}mm</td>
                      <td style={{ padding: '12px 14px', color: T.muted, whiteSpace: 'nowrap' }}>{pen.diameter}mm</td>
                      <td style={{ padding: '12px 14px' }}>
                        <a href={pen.amazonUrl} target="_blank" rel="noopener noreferrer" style={{ color: T.primary, fontWeight: 600, textDecoration: 'none', marginRight: 12 }}>
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
