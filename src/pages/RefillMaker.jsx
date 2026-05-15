import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { T } from '../theme/appTheme';
import { SIZES, HOLE_STANDARDS, getHolePositions } from '../config/sizes';
import { calcLayout, mmToPx } from '../utils/layout';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const HOLE_ZONE_MM = 6.5;
const IMAGE_START_MM = 6.7;

const SIZE_QUERY_IDS = new Set(['microfive', 'mini6', 'bible', 'a5']);

function initialSizeFromSearch() {
  if (typeof window === 'undefined') return 'microfive';
  const q = new URLSearchParams(window.location.search).get('size');
  return q && SIZE_QUERY_IDS.has(q) ? q : 'microfive';
}

export default function RefillMaker() {
  const [searchParams] = useSearchParams();
  const [sizeId, setSizeId] = useState(initialSizeFromSearch);
  const [customW, setCustomW] = useState(62);
  const [customH, setCustomH] = useState(105);
  const [customHoleStandard, setCustomHoleStandard] = useState('microfive');
  const [showOtherSizes, setShowOtherSizes] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [images, setImages] = useState({});
  const [holePositions, setHolePositions] = useState({});
  const [fitMode, setFitMode] = useState('cover');
  const [showBorder, setShowBorder] = useState(true);
  const [showHoles, setShowHoles] = useState(true);
  const [activeSlot, setActiveSlot] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [printBusy, setPrintBusy] = useState(false);
  const [mobileTab, setMobileTab] = useState('settings');
  const [isNarrow, setIsNarrow] = useState(false);
  const fileInputRef = useRef();
  const fileInputMultiRef = useRef();
  const sheetRef = useRef();
  const previewWrapRef = useRef();

  const sizePreset = SIZES.find(s => s.id === sizeId);
  const refillW = sizeId === 'custom' ? customW : sizePreset.w;
  const refillH = sizeId === 'custom' ? customH : sizePreset.h;
  const holePosArr = getHolePositions(sizePreset, customHoleStandard);

  const layout = calcLayout(refillW, refillH, orientation);
  const { cols, rows, total, marginX, marginY } = layout;

  const PX = mmToPx(1);
  const paperW_px = (orientation === 'portrait' ? 210 : 297) * PX;
  const paperH_px = (orientation === 'portrait' ? 297 : 210) * PX;
  const refillW_px = refillW * PX;
  const refillH_px = refillH * PX;
  const marginX_px = marginX * PX;
  const marginY_px = marginY * PX;
  const holeZone_px = HOLE_ZONE_MM * PX;
  const imageStart_px = IMAGE_START_MM * PX;

  const sizeQueryParam = searchParams.get('size');
  const appliedSizeFromUrl = useRef(null);

  useEffect(() => {
    const raw = sizeQueryParam;
    if (!raw || !SIZE_QUERY_IDS.has(raw)) {
      appliedSizeFromUrl.current = null;
      return;
    }
    if (appliedSizeFromUrl.current === raw) return;
    appliedSizeFromUrl.current = raw;
    setSizeId(raw);
    setImages({});
    setHolePositions({});
    setOrientation('portrait');
  }, [sizeQueryParam]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const syncNarrow = () => setIsNarrow(mq.matches);
    syncNarrow();
    mq.addEventListener('change', syncNarrow);
    return () => mq.removeEventListener('change', syncNarrow);
  }, []);

  useEffect(() => {
    function updateScale() {
      if (!previewWrapRef.current) return;
      const aw = previewWrapRef.current.clientWidth - 48;
      const ah = previewWrapRef.current.clientHeight - 100;
      setScale(Math.min(aw / paperW_px, ah / paperH_px, 1));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [paperW_px, paperH_px, isNarrow, mobileTab]);

  const changeSize = (id) => {
    setSizeId(id);
    setImages({});
    setHolePositions({});
    setOrientation('portrait');
    if (id === 'microfive') setCustomHoleStandard('microfive');
  };

  useEffect(() => {
    if (sizeId !== 'microfive') setShowOtherSizes(true);
  }, [sizeId]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (!file || activeSlot === null) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImages(prev => ({ ...prev, [activeSlot]: ev.target.result }));
      setHolePositions(prev => ({ ...prev, [activeSlot]: prev[activeSlot] || 'left' }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [activeSlot]);

  const handleMultiInput = useCallback((e) => {
    const files = Array.from(e.target.files).slice(0, total);
    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImages(prev => ({ ...prev, [idx]: ev.target.result }));
        setHolePositions(prev => ({ ...prev, [idx]: prev[idx] || 'left' }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, [total]);

  const toggleHole = (idx) => {
    setHolePositions(prev => ({
      ...prev,
      [idx]: (prev[idx] || 'left') === 'left' ? 'right' : 'left',
    }));
  };

  const setAllHoles = (pos) => {
    const newPos = {};
    for (let i = 0; i < total; i++) newPos[i] = pos;
    setHolePositions(newPos);
  };

  const captureSheetPng = useCallback(async () => {
    const el = sheetRef.current;
    if (!el) return null;
    const prevTransform = el.style.transform;
    el.style.transform = 'scale(1)';

    const restore = [];
    const pushStyle = (node, prop, value) => {
      const prev = node.style.getPropertyValue(prop);
      const prio = node.style.getPropertyPriority(prop);
      node.style.setProperty(prop, value, 'important');
      restore.push(() => {
        if (prev) node.style.setProperty(prop, prev, prio);
        else node.style.removeProperty(prop);
      });
    };

    el.querySelectorAll('.refill-capture-hide').forEach((node) => {
      pushStyle(node, 'display', 'none');
    });
    el.querySelectorAll('[data-refill="hole-zone"]').forEach((node) => {
      pushStyle(node, 'background', '#fff');
    });
    el.querySelectorAll('[data-refill="sheet-cell"]').forEach((node) => {
      pushStyle(node, 'background', '#fff');
    });

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      return {
        dataUrl: canvas.toDataURL('image/png'),
        pxW: canvas.width,
        pxH: canvas.height,
      };
    } finally {
      for (let i = restore.length - 1; i >= 0; i--) restore[i]();
      el.style.transform = prevTransform;
    }
  }, []);

  const exportPDF = useCallback(async () => {
    const shot = await captureSheetPng();
    if (!shot) return;
    const pdf = new jsPDF(orientation === 'landscape' ? 'l' : 'p', 'mm', 'a4');
    pdf.addImage(shot.dataUrl, 'PNG', 0, 0,
      orientation === 'landscape' ? 297 : 210,
      orientation === 'landscape' ? 210 : 297
    );
    pdf.save('ringcraft-refill.pdf');
  }, [captureSheetPng, orientation]);

  /**
   * PDF と同じキャプチャを A4 1枚に収めて印刷。
   * ポップアップは Edge で開閉ちらつきが出やすいので使わず、画面外の大きい iframe のみにする。
   */
  const printSheet = useCallback(async () => {
    setPrintBusy(true);
    const shot = await captureSheetPng();
    if (!shot) {
      setPrintBusy(false);
      return;
    }

    const pageWmm = orientation === 'portrait' ? 210 : 297;
    const pageHmm = orientation === 'portrait' ? 297 : 210;
    const blob = await (await fetch(shot.dataUrl)).blob();
    const blobUrl = URL.createObjectURL(blob);

    const docMarkup = (imgSrc) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  @page { margin: 0; size: ${pageWmm}mm ${pageHmm}mm; }
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    box-sizing: border-box;
  }
  .wrap {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }
  @media print {
    html, body { overflow: hidden; }
    .wrap { width: 100%; height: 100%; }
    img {
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      object-fit: fill;
    }
  }
</style></head>
<body><div class="wrap"><img src="${imgSrc}" width="${shot.pxW}" height="${shot.pxH}" alt="" /></div></body></html>`;

    await new Promise((resolve) => {
      let settled = false;
      let fallbackTimer;

      const finish = () => {
        if (settled) return;
        settled = true;
        setPrintBusy(false);
        if (fallbackTimer) clearTimeout(fallbackTimer);
        URL.revokeObjectURL(blobUrl);
        resolve();
      };

      const attachPrint = (win, cleanup) => {
        if (!win) {
          cleanup();
          finish();
          return;
        }
        let started = false;
        const runPrint = () => {
          if (started) return;
          started = true;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              try {
                setPrintBusy(false);
                win.print();
              } catch (_) {
                win.removeEventListener('afterprint', onAfterPrint);
                if (fallbackTimer) clearTimeout(fallbackTimer);
                cleanup();
                finish();
              }
            });
          });
        };

        const onAfterPrint = () => {
          win.removeEventListener('afterprint', onAfterPrint);
          if (fallbackTimer) clearTimeout(fallbackTimer);
          fallbackTimer = undefined;
          cleanup();
          finish();
        };
        win.addEventListener('afterprint', onAfterPrint);
        fallbackTimer = setTimeout(() => {
          win.removeEventListener('afterprint', onAfterPrint);
          cleanup();
          finish();
        }, 180000);

        const doc = win.document;
        const img = doc.querySelector('img');
        if (!img) {
          cleanup();
          finish();
          return;
        }
        img.onload = () => runPrint();
        img.onerror = () => {
          cleanup();
          finish();
        };
        if (img.complete && img.naturalWidth > 0) runPrint();
      };

      const iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      Object.assign(iframe.style, {
        position: 'fixed',
        left: '-100vw',
        top: '0',
        width: '100vw',
        height: '100vh',
        opacity: '0',
        border: '0',
        margin: '0',
        padding: '0',
        pointerEvents: 'none',
        zIndex: '2147483646',
      });
      document.body.appendChild(iframe);
      const win = iframe.contentWindow;
      if (!win) {
        iframe.remove();
        finish();
        return;
      }
      win.document.open();
      win.document.write(docMarkup(blobUrl));
      win.document.close();
      attachPrint(win, () => {
        try { iframe.remove(); } catch (_) { /* noop */ }
      });
    });
  }, [captureSheetPng, orientation]);

  const clearAll = () => {
    if (!window.confirm('すべてクリアしますか？')) return;
    setImages({});
    setHolePositions({});
  };

  const statusPill = `${sizePreset?.name || 'カスタム'} / ${cols}列×${rows}行 / ${total}枚`;

  function GroupCard({ title, icon, children }) {
    return (
      <section
        style={{
          border: '0.5px solid #efefef',
          borderRadius: 9,
          padding: '14px 14px 16px',
          marginBottom: 12,
          background: '#fff',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(91, 127, 166, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: T.inkSoft }}>{title}</span>
        </div>
        {children}
      </section>
    );
  }

  const IcoRuler = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 11h10M4 15h14M4 19h8" stroke="#5b7fa6" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
  const IcoOrient = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="4" width="12" height="16" rx="2" stroke="#5b7fa6" strokeWidth="1.75" />
      <path d="M9 8h6M9 12h4" stroke="#5b7fa6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
  const IcoHole = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="7" cy="8" r="2" stroke="#5b7fa6" strokeWidth="1.5" />
      <circle cx="7" cy="14" r="2" stroke="#5b7fa6" strokeWidth="1.5" />
      <path d="M14 6h6v12h-6" stroke="#5b7fa6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IcoImage = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="#5b7fa6" strokeWidth="1.75" />
      <circle cx="9" cy="10" r="1.5" fill="#5b7fa6" opacity="0.6" />
      <path d="M4 17l5-5 4 4 3-3 4 4" stroke="#5b7fa6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
  const IcoDisplay = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 8h14M5 12h10M5 16h12" stroke="#5b7fa6" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="18" cy="8" r="1.5" fill="#5b7fa6" />
      <circle cx="15" cy="12" r="1.5" fill="#5b7fa6" />
      <circle cx="17" cy="16" r="1.5" fill="#5b7fa6" />
    </svg>
  );
  const IcoPrint = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 8V5h10v3M7 16v3h10v-3" stroke="#5b7fa6" strokeWidth="1.75" strokeLinecap="round" />
      <rect x="5" y="8" width="14" height="8" rx="1.5" stroke="#5b7fa6" strokeWidth="1.75" />
    </svg>
  );

  const actionsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        type="button"
        disabled={printBusy}
        title="キャプチャのあと、ブラウザの印刷画面が開きます"
        onClick={() => printSheet()}
        style={{ ...S.btn, ...S.btnPrimary, ...(printBusy ? { opacity: 0.85, cursor: 'wait' } : {}) }}
      >
        {printBusy ? '印刷の準備中…' : '印刷'}
      </button>
      <button type="button" onClick={exportPDF} style={{ ...S.btn, ...S.btnGhostLine }}>
        PDF
      </button>
      <button type="button" onClick={clearAll} style={{ ...S.btn, ...S.btnGhostMuted }}>
        すべてクリア
      </button>
    </div>
  );

  const m5Preset = SIZES.find((s) => s.id === 'microfive');
  const otherPresets = SIZES.filter((s) => s.id !== 'microfive' && s.id !== 'custom');

  const sizeRowBtn = (s, emphasize) => (
    <button
      key={s.id}
      type="button"
      onClick={() => changeSize(s.id)}
      style={{
        ...S.sizeRow,
        ...(sizeId === s.id ? S.sizeRowActive : {}),
        ...(emphasize ? { padding: '12px 14px' } : {}),
      }}
    >
      <span style={{ fontWeight: emphasize ? 700 : 600 }}>
        {s.name}
        {s.shortName && (
          <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 6, opacity: sizeId === s.id ? 0.85 : 0.55 }}>
            {s.shortName}
          </span>
        )}
      </span>
      {s.w && (
        <span style={{ fontSize: 12, opacity: sizeId === s.id ? 0.95 : 0.55 }}>
          {s.w}×{s.h}mm · 穴{s.holePosY?.length ?? ''}
        </span>
      )}
    </button>
  );

  const sizeBlockInner = (
    <>
      <p style={{ fontSize: 12, color: T.muted, margin: '0 0 10px', lineHeight: 1.5 }}>
        このツールはM5（マイクロ5）向けに最適化されています。
      </p>
      {m5Preset && sizeRowBtn(m5Preset, true)}
      <button
        type="button"
        onClick={() => setShowOtherSizes((v) => !v)}
        style={{
          marginTop: 8,
          width: '100%',
          padding: '10px 12px',
          border: '0.5px solid #efefef',
          borderRadius: 8,
          background: '#fff',
          fontSize: 12,
          fontWeight: 600,
          color: T.muted,
          cursor: 'pointer',
          fontFamily: T.font,
          textAlign: 'left',
        }}
      >
        他のサイズ（M6・バイブル・A5・カスタム） {showOtherSizes ? '▲' : '▼'}
      </button>
      {showOtherSizes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {otherPresets.map((s) => sizeRowBtn(s, false))}
          <button
            type="button"
            onClick={() => changeSize('custom')}
            style={{
              ...S.sizeRow,
              ...(sizeId === 'custom' ? S.sizeRowActive : {}),
            }}
          >
            <span style={{ fontWeight: 600 }}>カスタム</span>
          </button>
        </div>
      )}
      {sizeId === 'custom' && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, padding: 12, background: '#fafafa', borderRadius: 9, border: '0.5px solid #efefef' }}>
          <div style={S.ctrlRow}>
            <span style={{ fontSize: 13 }}>幅 (mm)</span>
            <input type="number" value={customW} onChange={(e) => { setCustomW(Number(e.target.value)); setImages({}); }} style={S.numInput} />
          </div>
          <div style={S.ctrlRow}>
            <span style={{ fontSize: 13 }}>高さ (mm)</span>
            <input type="number" value={customH} onChange={(e) => { setCustomH(Number(e.target.value)); setImages({}); }} style={S.numInput} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>穴の規格</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {HOLE_STANDARDS.map((hs) => (
                <button
                  key={hs.id}
                  type="button"
                  onClick={() => setCustomHoleStandard(hs.id)}
                  style={{ ...S.pill, ...(customHoleStandard === hs.id ? S.pillActive : {}) }}
                >
                  {hs.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  const orientBlockInner = (
    <div style={{ display: 'flex', gap: 8 }}>
      {[
        ['portrait', `A4縦 · ${calcLayout(refillW, refillH, 'portrait').total}枚`],
        ['landscape', `A4横 · ${calcLayout(refillW, refillH, 'landscape').total}枚`],
      ].map(([val, label]) => (
        <button
          key={val}
          type="button"
          onClick={() => { setOrientation(val); setImages({}); setHolePositions({}); }}
          style={{ ...S.pill, flex: 1, justifyContent: 'center', ...(orientation === val ? S.pillActive : {}) }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const holesBlockInner = (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setAllHoles('left')} style={{ ...S.pill, flex: 1, justifyContent: 'center' }}>
          すべて左
        </button>
        <button type="button" onClick={() => setAllHoles('right')} style={{ ...S.pill, flex: 1, justifyContent: 'center' }}>
          すべて右
        </button>
      </div>
      <p style={{ fontSize: 11, color: T.muted, margin: '10px 0 0 0', lineHeight: 1.45 }}>
        プレビュー上の各リフィルをタップすると、左右を個別に切り替えられます。
      </p>
    </>
  );

  const displayBlockInner = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={S.ctrlRow}>
        <span style={{ fontSize: 13 }}>画像フィット</span>
        <select value={fitMode} onChange={(e) => setFitMode(e.target.value)} style={S.select}>
          <option value="cover">トリミング</option>
          <option value="contain">全体表示</option>
          <option value="fill">引き伸ばし</option>
        </select>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
        <input type="checkbox" checked={showBorder} onChange={(e) => setShowBorder(e.target.checked)} />
        カット線を表示
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
        <input type="checkbox" checked={showHoles} onChange={(e) => setShowHoles(e.target.checked)} />
        穴あけガイドを表示
      </label>
    </div>
  );

  const imagesBlockInner = (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)`, gap: 10 }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => { setActiveSlot(i); fileInputRef.current.click(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveSlot(i); fileInputRef.current.click(); } }}
            style={{
              aspectRatio: `${refillW}/${refillH}`,
              border: images[i] ? `2px solid ${T.primary}` : `2px dashed ${T.borderStrong}`,
              borderRadius: 9,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              background: images[i] ? '#fff' : '#faf9f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {images[i] ? (
              <img src={images[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 28, color: T.borderStrong, fontWeight: 300, lineHeight: 1 }}>+</span>
            )}
            {images[i] && (
              <button
                type="button"
                aria-label="画像を削除"
                onClick={(e) => {
                  e.stopPropagation();
                  setImages((prev) => { const n = { ...prev }; delete n[i]; return n; });
                }}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 22,
                  height: 22,
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />
      <input ref={fileInputMultiRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleMultiInput} />
      <button type="button" onClick={() => fileInputMultiRef.current.click()} style={{ ...S.btn, ...S.btnGhostLine, marginTop: 12 }}>
        まとめて選択（最大{total}枚）
      </button>
    </>
  );

  const desktopAsideContent = (
    <>
      <GroupCard title="M5リフィルサイズ" icon={IcoRuler}>{sizeBlockInner}</GroupCard>
      <GroupCard title="印刷向き" icon={IcoOrient}>{orientBlockInner}</GroupCard>
      <GroupCard title="穴の位置" icon={IcoHole}>{holesBlockInner}</GroupCard>
      <GroupCard title="画像" icon={IcoImage}>{imagesBlockInner}</GroupCard>
      <GroupCard title="表示設定" icon={IcoDisplay}>{displayBlockInner}</GroupCard>
      <GroupCard title="アクション" icon={IcoPrint}>{actionsBlock}</GroupCard>
    </>
  );

  const mobileSettingsContent = (
    <>
      <GroupCard title="M5リフィルサイズ" icon={IcoRuler}>{sizeBlockInner}</GroupCard>
      <GroupCard title="印刷向き" icon={IcoOrient}>{orientBlockInner}</GroupCard>
      <GroupCard title="穴の位置" icon={IcoHole}>{holesBlockInner}</GroupCard>
      <GroupCard title="表示設定" icon={IcoDisplay}>{displayBlockInner}</GroupCard>
      <GroupCard title="アクション" icon={IcoPrint}>{actionsBlock}</GroupCard>
    </>
  );

  const imageFilledCount = Object.values(images).filter(Boolean).length;

  const mobileImagesContent = (
    <>
      <div
        style={{
          marginBottom: 14,
          padding: '12px 14px',
          borderRadius: 9,
          background: 'rgba(91, 127, 166, 0.1)',
          border: '0.5px solid #e2ddd4',
          fontSize: 13,
          lineHeight: 1.55,
          color: T.ink,
        }}
      >
        <span style={{ fontWeight: 700, color: T.primary }}>このタブ＝写真・スクショの追加だけ。</span>
        {' '}
        枠をタップして1枚ずつ選ぶか、下の「まとめて選択」で複数枚まとめて入れられます。
        <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: T.muted }}>いま {imageFilledCount} / {total} 枠に画像あり</span>
      </div>
      <GroupCard title={`${total}枠に写真を配置`} icon={IcoImage}>{imagesBlockInner}</GroupCard>
    </>
  );

  const previewPanelInner = (
    <>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: T.ink, margin: '0 0 4px 0' }}>プレビュー</h2>
      <p style={{ fontSize: 11, color: T.muted, margin: '0 0 16px 0' }}>
        {orientation === 'portrait' ? 'A4縦' : 'A4横'} · 表示 {Math.round(scale * 100)}%
      </p>
      <div style={{ width: paperW_px * scale, height: paperH_px * scale, flexShrink: 0, position: 'relative', margin: '0 auto' }}>
        <div
          ref={sheetRef}
          id="print-sheet"
          style={{
            width: paperW_px,
            height: paperH_px,
            background: '#fff',
            boxShadow: '0 8px 32px rgba(91, 122, 166, 0.12)',
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            borderRadius: 4,
          }}
        >
          {Array.from({ length: total }, (_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = marginX_px + col * refillW_px;
            const y = marginY_px + row * refillH_px;
            const hPos = holePositions[i] || 'left';

            return (
              <div
                key={i}
                data-refill="sheet-cell"
                onClick={() => toggleHole(i)}
                title="クリックで穴の位置を左右切替"
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: refillW_px,
                  height: refillH_px,
                  border: showBorder ? '1px solid #d8d4ce' : '1px solid transparent',
                  overflow: 'hidden',
                  background: '#f8f8f8',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                {showHoles && (
                  <div
                    data-refill="hole-zone"
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      [hPos]: 0,
                      width: holeZone_px,
                      background: '#efefef',
                      borderRight: hPos === 'left' ? '1px dashed #c4c0ba' : 'none',
                      borderLeft: hPos === 'right' ? '1px dashed #c4c0ba' : 'none',
                      zIndex: 2,
                    }}
                  >
                    {holePosArr.map((posY, hi) => (
                      <div
                        key={hi}
                        style={{
                          position: 'absolute',
                          top: posY * PX - 6,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          border: '1px solid #b8b4ae',
                          background: '#fff',
                        }}
                      />
                    ))}
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: hPos === 'left' ? imageStart_px : 0,
                    right: hPos === 'right' ? imageStart_px : 0,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {images[i] ? (
                    <img src={images[i]} alt="" style={{ width: '100%', height: '100%', objectFit: fitMode }} />
                  ) : (
                    <span className="refill-capture-hide" style={{ fontFamily: 'system-ui, sans-serif', fontSize: 22, color: '#d0ccc6', fontWeight: 500 }}>
                      {i + 1}
                    </span>
                  )}
                </div>
                <div
                  className="refill-capture-hide"
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 9,
                    color: 'rgba(0,0,0,0.22)',
                    zIndex: 3,
                    pointerEvents: 'none',
                    fontFamily: 'monospace',
                  }}
                >
                  {hPos === 'left' ? '←穴' : '穴→'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          marginTop: 20,
          display: 'inline-flex',
          alignSelf: 'center',
          padding: '8px 18px',
          borderRadius: 999,
          background: '#fff',
          border: `1px solid ${T.border}`,
          fontSize: 12,
          color: T.inkSoft,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {statusPill}
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: T.font, background: T.sidebar, color: T.ink }}>
      <AppHeader title="M5リフィルメーカー" subtitle="62×105mm · 穴5 · マイクロ5" />

      {!isNarrow ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <aside
            style={{
              width: 320,
              flexShrink: 0,
              background: T.sidebar,
              borderRight: `1px solid ${T.border}`,
              overflowY: 'auto',
              padding: '18px 16px 28px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {desktopAsideContent}
          </aside>
          <div
            ref={previewWrapRef}
            style={{
              flex: 1,
              overflow: 'auto',
              background: T.previewBg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '28px 24px 40px',
            }}
          >
            {previewPanelInner}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              borderBottom: `1px solid ${T.border}`,
              background: T.sidebar,
              padding: '0 6px',
            }}
          >
            {[
              { id: 'settings', l1: '設定', l2: 'サイズなど' },
              { id: 'images', l1: '写真', l2: `${imageFilledCount}/${total}枚` },
              { id: 'preview', l1: 'プレビュー', l2: '印刷前確認' },
            ].map(({ id, l1, l2 }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMobileTab(id)}
                style={{
                  flex: 1,
                  padding: '10px 4px 12px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderBottom: mobileTab === id ? `2px solid ${T.ink}` : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: mobileTab === id ? 700 : 600,
                      color: mobileTab === id ? T.ink : T.muted,
                    }}
                  >
                    {l1}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: mobileTab === id ? T.inkSoft : T.muted,
                      letterSpacing: id === 'images' ? '0.02em' : '0',
                    }}
                  >
                    {l2}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div
            style={{
              padding: '8px 12px 10px',
              background: '#fff',
              borderBottom: `1px solid ${T.border}`,
              fontSize: 12,
              color: T.muted,
              lineHeight: 1.45,
            }}
          >
            {mobileTab === 'settings' && 'リフィルサイズ・印刷向き・穴の位置・表示・印刷はこのタブで。'}
            {mobileTab === 'images' && '＋の枠をタップ → 写真を選ぶ。まとめて入れる場合は一番下のボタン。'}
            {mobileTab === 'preview' && 'A4に並んだ状態を確認。穴の左右は枠をタップで切り替え。'}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '16px 14px 32px' }}>
            {mobileTab === 'settings' && mobileSettingsContent}
            {mobileTab === 'images' && mobileImagesContent}
            {mobileTab === 'preview' && (
              <div ref={previewWrapRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {previewPanelInner}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  sizeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 14px',
    borderRadius: 9,
    border: '0.5px solid #efefef',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    textAlign: 'left',
    color: T.ink,
    boxSizing: 'border-box',
  },
  sizeRowActive: {
    background: T.ink,
    color: '#faf7f2',
    borderColor: T.ink,
    boxShadow: 'none',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: 9,
    border: '0.5px solid #efefef',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    color: T.ink,
    boxSizing: 'border-box',
  },
  pillActive: {
    background: T.primaryLight,
    color: T.ink,
    borderColor: T.ink,
    fontWeight: 600,
  },
  ctrlRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  numInput: { border: '0.5px solid #efefef', borderRadius: 8, padding: '6px 10px', fontSize: 13, width: 76, background: '#fff' },
  select: { border: '0.5px solid #efefef', borderRadius: 8, padding: '6px 10px', fontSize: 13, background: '#fff', color: T.ink },
  btn: {
    width: '100%',
    padding: '12px 14px',
    border: 'none',
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: T.font,
    boxSizing: 'border-box',
  },
  btnPrimary: { background: T.ink, color: '#faf7f2', boxShadow: 'none' },
  btnGhostLine: {
    background: '#fff',
    color: T.primary,
    border: '0.5px solid #efefef',
    fontWeight: 600,
  },
  btnGhostMuted: {
    background: 'transparent',
    color: T.muted,
    border: '0.5px solid #efefef',
    fontWeight: 500,
  },
};
