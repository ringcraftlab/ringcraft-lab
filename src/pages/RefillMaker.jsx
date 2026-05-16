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
  const [orientation, setOrientation] = useState('portrait');
  const [images, setImages] = useState({});
  const [holePositions, setHolePositions] = useState({});
  const [fitMode, setFitMode] = useState('cover');
  const [imageFitModes, setImageFitModes] = useState({});
  const [showBorder, setShowBorder] = useState(true);
  const [showHoles, setShowHoles] = useState(true);
  const [notice, setNotice] = useState('');
  const [activeSlot, setActiveSlot] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [printBusy, setPrintBusy] = useState(false);
  const [activeToolPanel, setActiveToolPanel] = useState('size');
  const [isNarrow, setIsNarrow] = useState(false);
  const fileInputRef = useRef();
  const fileInputMultiRef = useRef();
  const fileInputFillRef = useRef();
  const activeSlotRef = useRef(null);
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
    setImageFitModes({});
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
      const aw = previewWrapRef.current.clientWidth - (isNarrow ? 20 : 48);
      if (isNarrow) {
        setScale(Math.min(aw / paperW_px, 0.55));
        return;
      }
      const ah = previewWrapRef.current.clientHeight - 100;
      setScale(Math.min(aw / paperW_px, ah / paperH_px, 1));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [paperW_px, paperH_px, isNarrow]);

  const changeSize = (id) => {
    setSizeId(id);
    setImages({});
    setHolePositions({});
    setImageFitModes({});
    setOrientation('portrait');
    if (id === 'microfive') setCustomHoleStandard('microfive');
  };

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    const slot = activeSlotRef.current ?? activeSlot;
    if (!file || slot === null) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImages(prev => ({ ...prev, [slot]: ev.target.result }));
      setHolePositions(prev => ({ ...prev, [slot]: prev[slot] || 'left' }));
      setNotice(`${slot + 1}番に画像を入れました。`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [activeSlot]);

  const openSlotImagePicker = (idx) => {
    activeSlotRef.current = idx;
    setActiveSlot(idx);
    setActiveToolPanel('images');
    fileInputRef.current?.click();
  };

  const handleMultiInput = useCallback((e) => {
    const selected = Array.from(e.target.files);
    const files = selected.slice(0, total);
    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImages(prev => ({ ...prev, [idx]: ev.target.result }));
        setHolePositions(prev => ({ ...prev, [idx]: prev[idx] || 'left' }));
      };
      reader.readAsDataURL(file);
    });
    if (selected.length > total) {
      setNotice(`${selected.length}枚選択されました。最大${total}枚なので先頭${total}枚を使いました。`);
    } else if (files.length) {
      setNotice(`${files.length}枚の画像を入れました。`);
    }
    e.target.value = '';
  }, [total]);

  const handleFillInput = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const nextImages = {};
      const nextHoles = {};
      for (let i = 0; i < total; i++) {
        nextImages[i] = ev.target.result;
        nextHoles[i] = holePositions[i] || 'left';
      }
      setImages(nextImages);
      setHolePositions(nextHoles);
      setNotice(`同じ画像を${total}枠に配置しました。`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [holePositions, total]);

  const setAllHoles = (pos) => {
    const newPos = {};
    for (let i = 0; i < total; i++) newPos[i] = pos;
    setHolePositions(newPos);
  };

  const setSlotHole = (idx, pos) => {
    setHolePositions(prev => ({ ...prev, [idx]: pos }));
  };

  const setSlotFit = (idx, mode) => {
    setImageFitModes(prev => ({ ...prev, [idx]: mode }));
  };

  const copySlotToAll = (idx) => {
    if (!images[idx]) return;
    const nextImages = {};
    const nextHoles = {};
    const nextFits = {};
    for (let i = 0; i < total; i++) {
      nextImages[i] = images[idx];
      nextHoles[i] = holePositions[idx] || 'left';
      if (imageFitModes[idx]) nextFits[i] = imageFitModes[idx];
    }
    setImages(nextImages);
    setHolePositions(nextHoles);
    setImageFitModes(nextFits);
    setNotice(`${idx + 1}番の画像を${total}枠にコピーしました。`);
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
              } catch {
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
        try { iframe.remove(); } catch { /* noop */ }
      });
    });
  }, [captureSheetPng, orientation]);

  const clearAll = () => {
    if (!window.confirm('すべてクリアしますか？')) return;
    setImages({});
    setHolePositions({});
    setImageFitModes({});
    setNotice('');
  };

  const statusPill = `${sizePreset?.name || 'カスタム'} / ${cols}列×${rows}行 / ${total}枚`;

  const IcoRuler = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 11h10M4 15h14M4 19h8" stroke={T.muted} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
  const IcoOrient = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="4" width="12" height="16" rx="2" stroke={T.muted} strokeWidth="1.75" />
      <path d="M9 8h6M9 12h4" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
  const IcoHole = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="7" cy="8" r="2" stroke={T.muted} strokeWidth="1.5" />
      <circle cx="7" cy="14" r="2" stroke={T.muted} strokeWidth="1.5" />
      <path d="M14 6h6v12h-6" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IcoImage = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" stroke={T.muted} strokeWidth="1.75" />
      <circle cx="9" cy="10" r="1.5" fill={T.muted} opacity="0.6" />
      <path d="M4 17l5-5 4 4 3-3 4 4" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
  const IcoDisplay = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 8h14M5 12h10M5 16h12" stroke={T.muted} strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="18" cy="8" r="1.5" fill={T.muted} />
      <circle cx="15" cy="12" r="1.5" fill={T.muted} />
      <circle cx="17" cy="16" r="1.5" fill={T.muted} />
    </svg>
  );
  const IcoPrint = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 8V5h10v3M7 16v3h10v-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <rect x="5" y="8" width="14" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
  const IcoPdf = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v5h4M9 15h6M9 18h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );

  const actionsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        type="button"
        disabled={printBusy}
        title="キャプチャのあと、ブラウザの印刷画面が開きます"
        onClick={() => printSheet()}
        style={{ ...S.btn, ...S.btnPrimary, ...(printBusy ? { opacity: 0.85, cursor: 'wait' } : {}) }}
      >
        <span style={{ display: 'inline-flex', marginRight: 8, verticalAlign: -2 }}>{IcoPrint}</span>
        {printBusy ? '印刷の準備中…' : '印刷'}
      </button>
      <button type="button" onClick={exportPDF} style={{ ...S.btn, ...S.btnGhostLine }}>
        <span style={{ display: 'inline-flex', marginRight: 8, verticalAlign: -2 }}>{IcoPdf}</span>
        PDF
      </button>
      <button type="button" onClick={clearAll} style={S.clearLink}>
        すべてクリア
      </button>
    </div>
  );

  const fixedPresets = ['microfive', 'mini6', 'bible', 'a5']
    .map((id) => SIZES.find((s) => s.id === id))
    .filter(Boolean);

  const sizeGridBtn = (s) => (
    <button
      key={s.id}
      type="button"
      onClick={() => changeSize(s.id)}
      style={{
        ...S.sizeGridButton,
        ...(sizeId === s.id ? S.sizeRowActive : {}),
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: sizeId === s.id ? T.ink : 'inherit' }}>
        {s.shortName || s.name}
      </span>
      <span style={{ marginTop: 4, fontSize: 11, lineHeight: 1.35, color: sizeId === s.id ? T.muted : T.hint }}>
        {s.w}×{s.h}
      </span>
    </button>
  );

  const sizeBlockInner = (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {fixedPresets.map(sizeGridBtn)}
      </div>
      <button
        type="button"
        onClick={() => changeSize('custom')}
        style={{
          ...S.sizeRow,
          marginTop: 12,
          justifyContent: 'center',
          ...(sizeId === 'custom' ? S.sizeRowActive : {}),
        }}
      >
        <span style={{ fontWeight: 700 }}>カスタム</span>
      </button>
      {sizeId === 'custom' && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14, padding: 16, background: T.sidebar, borderRadius: 8, border: `0.5px solid ${T.border}` }}>
          <div style={S.ctrlRow}>
            <span style={{ fontSize: 13 }}>幅 (mm)</span>
            <input type="number" value={customW} onChange={(e) => { setCustomW(Number(e.target.value)); setImages({}); setImageFitModes({}); }} style={S.numInput} />
          </div>
          <div style={S.ctrlRow}>
            <span style={{ fontSize: 13 }}>高さ (mm)</span>
            <input type="number" value={customH} onChange={(e) => { setCustomH(Number(e.target.value)); setImages({}); setImageFitModes({}); }} style={S.numInput} />
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
    <div style={{ display: 'flex', gap: 12 }}>
      {[
        ['portrait', `A4縦 · ${calcLayout(refillW, refillH, 'portrait').total}枚`],
        ['landscape', `A4横 · ${calcLayout(refillW, refillH, 'landscape').total}枚`],
      ].map(([val, label]) => (
        <button
          key={val}
          type="button"
          onClick={() => { setOrientation(val); setImages({}); setHolePositions({}); setImageFitModes({}); }}
          style={{ ...S.pill, flex: 1, justifyContent: 'center', ...(orientation === val ? S.pillActive : {}) }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const holesBlockInner = (
    <>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => setAllHoles('left')} style={{ ...S.pill, flex: 1, justifyContent: 'center' }}>
          すべて左
        </button>
        <button type="button" onClick={() => setAllHoles('right')} style={{ ...S.pill, flex: 1, justifyContent: 'center' }}>
          すべて右
        </button>
      </div>
      <p style={{ fontSize: 11, color: T.muted, margin: '8px 0 0', lineHeight: 1.4 }}>
        画像カードごとにも左右を変更できます。
      </p>
    </>
  );

  const displayBlockInner = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={S.ctrlRow}>
        <span style={{ fontSize: 13 }}>画像フィット初期値</span>
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
      {notice && (
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 8, background: T.primaryLight, border: `0.5px solid ${T.border}`, fontSize: 13, color: T.inkSoft, lineHeight: 1.65 }}>
          {notice}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <button type="button" onClick={() => fileInputMultiRef.current.click()} style={{ ...S.btn, ...S.btnGhostLine, margin: 0, fontSize: 14 }}>
          まとめて選択
        </button>
        <button type="button" onClick={() => fileInputFillRef.current.click()} style={{ ...S.btn, ...S.btnGhostLine, margin: 0, fontSize: 14 }}>
          1枚を全枠へ
        </button>
      </div>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: T.muted, lineHeight: 1.7 }}>
        まとめて選択は最大{total}枚まで使います。多く選んだ場合は先頭{total}枚だけ配置します。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : `repeat(${Math.min(cols, 3)}, minmax(0, 1fr))`, gap: 16 }}>
        {Array.from({ length: total }, (_, i) => {
          const slotFit = imageFitModes[i] || fitMode;
          const hole = holePositions[i] || 'left';
          return (
            <div
              key={i}
              style={{
                border: `0.5px solid ${images[i] ? T.borderStrong : T.border}`,
                borderRadius: 8,
                background: '#fff',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => openSlotImagePicker(i)}
                style={{
                  width: '100%',
                  aspectRatio: `${refillW}/${refillH}`,
                  border: 'none',
                  borderBottom: `0.5px solid ${T.border}`,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  background: images[i] ? '#fff' : T.sidebar,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                {images[i] ? (
                  <img src={images[i]} alt="" style={{ width: '100%', height: '100%', objectFit: slotFit === 'fill' ? 'fill' : slotFit }} />
                ) : (
                  <span style={{ fontSize: 28, color: T.hole, fontWeight: 300, lineHeight: 1 }}>+</span>
                )}
                <span style={{ position: 'absolute', left: 6, top: 6, padding: '2px 6px', borderRadius: 999, background: 'rgba(255,255,255,0.9)', color: T.hint, fontSize: 10, fontWeight: 700 }}>
                  {i + 1}
                </span>
              </button>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 34, fontSize: 13, color: T.muted }}>穴</span>
                  {['left', 'right'].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setSlotHole(i, pos)}
                      style={{
                        ...S.smallToggle,
                        ...(hole === pos ? S.smallToggleActive : {}),
                      }}
                    >
                      {pos === 'left' ? '左' : '右'}
                    </button>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 34, fontSize: 13, color: T.muted }}>表示</span>
                  <select value={slotFit} onChange={(e) => setSlotFit(i, e.target.value)} style={{ ...S.select, flex: 1, fontSize: 13 }}>
                    <option value="cover">トリミング</option>
                    <option value="contain">全体表示</option>
                    <option value="fill">引き伸ばし</option>
                  </select>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" disabled={!images[i]} onClick={() => copySlotToAll(i)} style={{ ...S.smallAction, opacity: images[i] ? 1 : 0.45 }}>
                    全枠へ
                  </button>
                  <button
                    type="button"
                    disabled={!images[i]}
                    onClick={() => {
                      setImages((prev) => { const n = { ...prev }; delete n[i]; return n; });
                      setImageFitModes((prev) => { const n = { ...prev }; delete n[i]; return n; });
                    }}
                    style={{ ...S.smallAction, opacity: images[i] ? 1 : 0.45 }}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />
      <input ref={fileInputMultiRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleMultiInput} />
      <input ref={fileInputFillRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFillInput} />
    </>
  );

  const imageFilledCount = Object.values(images).filter(Boolean).length;

  const TOOL_PANELS = [
    { id: 'size', title: 'リフィルサイズ', icon: IcoRuler },
    { id: 'orientation', title: '向き', icon: IcoOrient },
    { id: 'holes', title: '穴', icon: IcoHole },
    { id: 'images', title: '画像', icon: IcoImage },
    { id: 'display', title: 'プレビュー', icon: IcoDisplay },
  ];

  const controlPanelContent = {
    size: <GroupCard title="リフィルサイズ" icon={IcoRuler}>{sizeBlockInner}</GroupCard>,
    orientation: <GroupCard title="印刷向き" icon={IcoOrient}>{orientBlockInner}</GroupCard>,
    holes: <GroupCard title="穴の位置" icon={IcoHole}>{holesBlockInner}</GroupCard>,
    images: <GroupCard title={`${imageFilledCount}／${total} 枠に画像あり`} icon={IcoImage}>{imagesBlockInner}</GroupCard>,
    display: <GroupCard title="プレビュー" icon={IcoDisplay}>{displayBlockInner}</GroupCard>,
  };

  const renderPanelNav = (compact = false) => (
    <div
      role="tablist"
      aria-label="操作パネル"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${TOOL_PANELS.length}, minmax(0, 1fr))`,
        gap: compact ? 4 : 10,
        width: '100%',
        padding: 0,
        borderRadius: 0,
        background: 'transparent',
        borderBottom: `0.5px solid ${T.border}`,
        marginBottom: compact ? 16 : 20,
      }}
    >
      {TOOL_PANELS.map(({ id, title, icon }) => {
        const active = activeToolPanel === id;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => setActiveToolPanel(id)}
            style={{
              minWidth: 0,
              width: '100%',
              border: 'none',
              borderRadius: 0,
              minHeight: 44,
              padding: compact ? '10px 2px 9px' : '10px 2px 9px',
              cursor: 'pointer',
              fontFamily: T.font,
              textAlign: 'center',
              background: 'transparent',
              boxShadow: 'none',
              color: active ? T.ink : T.hint,
              fontSize: compact ? 12 : 13,
              fontWeight: active ? 500 : 400,
              borderBottom: active ? `2px solid ${T.primary}` : '2px solid transparent',
            }}
          >
            <span style={{ display: compact ? 'none' : 'inline-flex', marginRight: 5, verticalAlign: -2 }}>{icon}</span>
            {title}
          </button>
        );
      })}
    </div>
  );

  const renderPreviewPanel = ({ hideHeader = false, compact = false } = {}) => (
    <>
      {!hideHeader ? (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.ink, margin: '0 0 6px 0' }}>プレビュー</h2>
          <p style={{ fontSize: 11, color: T.hint, margin: '0 0 24px 0', lineHeight: 1.6, textAlign: 'center' }}>
            {orientation === 'portrait' ? 'A4縦' : 'A4横'} · 表示{Math.round(scale * 100)}% · {sizePreset?.shortName || sizePreset?.name || 'カスタム'}サイズ
          </p>
        </>
      ) : (
        <p style={{ fontSize: 11, color: T.hint, margin: compact ? '0 0 10px' : '0 0 16px', textAlign: 'center', alignSelf: 'stretch', lineHeight: 1.6 }}>
          {orientation === 'portrait' ? 'A4縦' : 'A4横'} · 表示{Math.round(scale * 100)}% · {sizePreset?.shortName || sizePreset?.name || 'カスタム'}サイズ
        </p>
      )}
      <div style={{ width: paperW_px * scale, height: paperH_px * scale, flexShrink: 0, position: 'relative', margin: '0 auto' }}>
        <div
          ref={sheetRef}
          id="print-sheet"
          style={{
            width: paperW_px,
            height: paperH_px,
            background: '#fff',
            boxShadow: 'none',
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
            const slotFit = imageFitModes[i] || fitMode;

            return (
              <div
                key={i}
                data-refill="sheet-cell"
                onClick={() => openSlotImagePicker(i)}
                title="画像を選択"
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: refillW_px,
                  height: refillH_px,
                  border: showBorder ? `0.5px solid ${T.border}` : '0.5px solid transparent',
                  overflow: 'hidden',
                  background: T.sidebar,
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
                      background: T.sidebar,
                      borderRight: hPos === 'left' ? `0.5px dashed ${T.hole}` : 'none',
                      borderLeft: hPos === 'right' ? `0.5px dashed ${T.hole}` : 'none',
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
                          border: `0.5px solid ${T.hole}`,
                          background: T.sidebar,
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
                    <div
                      role="img"
                      aria-label={`枠 ${i + 1} の画像`}
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${images[i]})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize:
                          slotFit === 'cover' ? 'cover' : slotFit === 'contain' ? 'contain' : '100% 100%',
                      }}
                    />
                  ) : (
                    <>
                      <span className="refill-capture-hide" style={{ position: 'absolute', left: 7, top: 5, fontFamily: 'system-ui, sans-serif', fontSize: 10, color: T.hint, fontWeight: 500, zIndex: 3 }}>
                        {i + 1}
                      </span>
                      <span className="refill-capture-hide" style={{ fontFamily: 'system-ui, sans-serif', fontSize: 28, color: T.hole, fontWeight: 300, lineHeight: 1 }}>
                        +
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          marginTop: compact ? 14 : 24,
          display: 'inline-flex',
          alignSelf: 'center',
          padding: '7px 16px',
          borderRadius: 999,
          background: '#fff',
          border: `1px solid ${T.border}`,
          fontSize: 12,
          color: T.inkSoft,
          boxShadow: 'none',
        }}
      >
        {statusPill}
      </div>
    </>
  );

  const mobileStickyBar = (
    <div
      style={{
        flexShrink: 0,
        background: '#fff',
        borderTop: `1px solid ${T.border}`,
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        boxShadow: 'none',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          disabled={printBusy}
          title="プレビューと同じ内容を印刷します"
          onClick={() => printSheet()}
          style={{
            ...S.btn,
            ...S.btnPrimary,
            flex: 1,
            margin: 0,
            ...(printBusy ? { opacity: 0.85, cursor: 'wait' } : {}),
          }}
        >
          {printBusy ? '準備中…' : '印刷'}
        </button>
        <button
          type="button"
          onClick={exportPDF}
          style={{ ...S.btn, ...S.btnGhostLine, flex: 1, margin: 0 }}
        >
          PDF
        </button>
      </div>
      <button
        type="button"
        onClick={clearAll}
        style={{
          ...S.clearLink,
          marginTop: 10,
        }}
      >
        すべてクリア
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: T.font, background: T.sidebar, color: T.ink, lineHeight: 1.6 }}>
      <AppHeader title="リフィルコラージュ" subtitle="写真をリフィルに並べてA4印刷" />

      {!isNarrow ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <aside
            style={{
              width: 384,
              flexShrink: 0,
              background: T.sidebar,
              borderRight: `0.5px solid ${T.border}`,
              overflowY: 'auto',
              padding: '24px 20px 32px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {renderPanelNav(false)}
            <div>{controlPanelContent[activeToolPanel]}</div>
            <GroupCard title="アクション" icon={IcoPrint}>{actionsBlock}</GroupCard>
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
              padding: '40px 32px 48px',
            }}
          >
            {renderPreviewPanel()}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div
            ref={previewWrapRef}
            style={{
              flexShrink: 0,
              height: '40vh',
              minHeight: 250,
              maxHeight: 360,
              overflow: 'auto',
              background: T.previewBg,
              padding: '14px 12px 18px',
              borderBottom: `0.5px solid ${T.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {renderPreviewPanel({ hideHeader: true, compact: true })}
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 'calc(136px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div style={{ padding: '16px 16px 8px', maxWidth: 560, margin: '0 auto' }}>
              {renderPanelNav(true)}
              {controlPanelContent[activeToolPanel]}
            </div>
          </div>
          {mobileStickyBar}
        </div>
      )}
    </div>
  );
}

function GroupCard({ title, icon, children }) {
  return (
    <section
      style={{
        border: '0.5px solid var(--brand-border)',
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
        background: '#fff',
        boxSizing: 'border-box',
        lineHeight: 1.65,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--brand-surface)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.01em', color: T.ink }}>{title}</span>
      </div>
      {children}
    </section>
  );
}

const S = {
  sizeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 44,
    padding: '14px 16px',
    borderRadius: 8,
    border: '0.5px solid var(--brand-border-md)',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1.6,
    textAlign: 'left',
    color: T.ink,
    boxSizing: 'border-box',
  },
  sizeRowActive: {
    background: T.primaryLight,
    color: T.ink,
    borderColor: T.borderStrong,
    boxShadow: 'none',
  },
  sizeGridButton: {
    width: '100%',
    minHeight: 76,
    padding: '14px 8px',
    borderRadius: 8,
    border: '0.5px solid var(--brand-border-md)',
    background: '#fff',
    cursor: 'pointer',
    color: T.ink,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: T.font,
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 44,
    padding: '10px 14px',
    borderRadius: 8,
    border: '0.5px solid var(--brand-border-md)',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1.6,
    color: T.ink,
    boxSizing: 'border-box',
  },
  pillActive: {
    background: T.primaryLight,
    color: T.ink,
    borderColor: T.ink,
    fontWeight: 600,
  },
  smallToggle: {
    flex: 1,
    minHeight: 44,
    padding: '8px 10px',
    borderRadius: 8,
    border: '0.5px solid var(--brand-border-md)',
    background: '#fff',
    color: T.muted,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: T.font,
  },
  smallToggleActive: {
    background: T.primaryLight,
    color: T.ink,
    borderColor: T.borderStrong,
  },
  smallAction: {
    flex: 1,
    minHeight: 44,
    padding: '9px 10px',
    borderRadius: 8,
    border: '0.5px solid var(--brand-border-md)',
    background: '#fff',
    color: T.inkSoft,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: T.font,
  },
  ctrlRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, lineHeight: 1.6 },
  numInput: { minHeight: 44, border: '0.5px solid var(--brand-border-md)', borderRadius: 8, padding: '8px 12px', fontSize: 14, width: 84, background: '#fff', boxSizing: 'border-box' },
  select: { minHeight: 44, border: '0.5px solid var(--brand-border-md)', borderRadius: 8, padding: '8px 12px', fontSize: 14, background: '#fff', color: T.ink, boxSizing: 'border-box' },
  btn: {
    width: '100%',
    minHeight: 44,
    padding: 13,
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: T.font,
    boxSizing: 'border-box',
  },
  btnPrimary: { background: T.primary, color: T.primaryText, boxShadow: 'none' },
  btnGhostLine: {
    background: T.primaryLight,
    color: T.ink,
    border: `0.5px solid ${T.borderStrong}`,
    fontWeight: 500,
  },
  clearLink: {
    width: '100%',
    padding: '8px 0',
    background: 'transparent',
    color: T.hint,
    border: 'none',
    fontSize: 12,
    fontWeight: 400,
    cursor: 'pointer',
    fontFamily: T.font,
    boxSizing: 'border-box',
  },
};
