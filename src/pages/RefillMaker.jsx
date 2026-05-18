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

const SIZE_QUERY_IDS = new Set(['microfive', 'm5square', 'mini6', 'bible']);

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
  const [imageRotations, setImageRotations] = useState({});
  const [imageAreaMode, setImageAreaMode] = useState('avoid');
  const [showBorder, setShowBorder] = useState(true);
  const [showHoles, setShowHoles] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeSlot, setActiveSlot] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [printBusy, setPrintBusy] = useState(false);
  const [printReady, setPrintReady] = useState(false);
  const [activeToolPanel, setActiveToolPanel] = useState('size');
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const fileInputRef = useRef();
  const fileInputMultiRef = useRef();
  const fileInputFillRef = useRef();
  const activeSlotRef = useRef(null);
  const sheetRef = useRef();
  const previewWrapRef = useRef();
  const preparedPrintRef = useRef(null);
  const sizeRowRefs = useRef({});

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
    setImageRotations({});
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
        const ah = previewWrapRef.current.clientHeight - 72;
        setScale(Math.min(aw / paperW_px, ah / paperH_px, 0.58));
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
    setImageRotations({});
    setOrientation('portrait');
    if (id === 'microfive' || id === 'm5square') setCustomHoleStandard('microfive');
    if (isNarrow) {
      window.setTimeout(() => {
        sizeRowRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
  };

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    const slot = activeSlotRef.current ?? activeSlot;
    if (!file || slot === null) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImages(prev => ({ ...prev, [slot]: ev.target.result }));
      setHolePositions(prev => ({ ...prev, [slot]: prev[slot] || 'left' }));
      setImageRotations(prev => ({ ...prev, [slot]: 0 }));
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
        setImageRotations(prev => ({ ...prev, [idx]: 0 }));
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
      setImageRotations({});
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

  const rotateSlot = (idx) => {
    setImageRotations(prev => ({ ...prev, [idx]: ((prev[idx] || 0) + 90) % 360 }));
  };

  const copySlotToAll = (idx) => {
    if (!images[idx]) return;
    const nextImages = {};
    const nextHoles = {};
    const nextFits = {};
    const nextRotations = {};
    for (let i = 0; i < total; i++) {
      nextImages[i] = images[idx];
      nextHoles[i] = holePositions[idx] || 'left';
      if (imageFitModes[idx]) nextFits[i] = imageFitModes[idx];
      if (imageRotations[idx]) nextRotations[i] = imageRotations[idx];
    }
    setImages(nextImages);
    setHolePositions(nextHoles);
    setImageFitModes(nextFits);
    setImageRotations(nextRotations);
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

  const cleanupPreparedPrint = useCallback(() => {
    const prepared = preparedPrintRef.current;
    preparedPrintRef.current = null;
    setPrintReady(false);
    if (!prepared) return;
    if (prepared.printUrl) URL.revokeObjectURL(prepared.printUrl);
  }, []);

  /**
   * PDF と同じキャプチャを A4 1枚に収めて印刷。
   * 自動印刷ブロックを避けるため、別タブに印刷用ページを開き、その中のボタンから印刷する。
   */
  const printSheet = useCallback(async () => {
    const prepared = preparedPrintRef.current;
    const pageWmm = orientation === 'portrait' ? 210 : 297;
    const pageHmm = orientation === 'portrait' ? 297 : 210;
    const docMarkup = (imgSrc, pxW, pxH) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>RingCraft Lab 印刷</title>
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
  .toolbar {
    position: fixed;
    inset: 16px 16px auto auto;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: 1px solid #e0d9cf;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 8px 24px rgba(61, 47, 31, 0.12);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Noto Sans JP", sans-serif;
  }
  button {
    min-height: 40px;
    padding: 0 16px;
    border: 0;
    border-radius: 8px;
    background: #a07850;
    color: #fdf6ec;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .note {
    color: #9c7d5e;
    font-size: 12px;
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
    .toolbar { display: none; }
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
<body>
  <div class="toolbar">
    <button type="button" onclick="window.print()">印刷する</button>
    <span class="note">向きはアプリ側の「印刷向き」で変更してください</span>
  </div>
  <div class="wrap"><img src="${imgSrc}" width="${pxW}" height="${pxH}" alt="" /></div>
</body></html>`;

    if (prepared?.dataUrl) {
      const printWin = window.open('', '_blank');
      if (!printWin) {
        setNotice('印刷用ページを開けませんでした。PDF保存をお試しください。');
        return;
      }
      const printUrl = URL.createObjectURL(new Blob(
        [docMarkup(prepared.dataUrl, prepared.pxW, prepared.pxH)],
        { type: 'text/html' }
      ));
      printWin.location.href = printUrl;
      preparedPrintRef.current = { ...prepared, win: printWin, printUrl };
      setPrintReady(false);
      setNotice('印刷用ページを開きました。ページ内の「印刷する」を押してください。');
      return;
    }

    if (prepared) cleanupPreparedPrint();

    setPrintBusy(true);
    setNotice('印刷用データを準備しています。');
    const shot = await captureSheetPng();
    if (!shot) {
      setPrintBusy(false);
      setNotice('印刷用データを作成できませんでした。');
      return;
    }

    preparedPrintRef.current = {
      dataUrl: shot.dataUrl,
      pxW: shot.pxW,
      pxH: shot.pxH,
      images,
      holePositions,
      imageFitModes,
      imageRotations,
      imageAreaMode,
      showBorder,
      showHoles,
      sizeId,
      customW,
      customH,
      customHoleStandard,
      orientation,
    };
    setPrintBusy(false);
    setPrintReady(true);
    setNotice('印刷用データの準備ができました。もう一度「印刷用ページを開く」を押してください。');
  }, [captureSheetPng, cleanupPreparedPrint, customH, customHoleStandard, customW, holePositions, imageAreaMode, imageFitModes, imageRotations, images, orientation, showBorder, showHoles, sizeId]);

  const clearAll = () => {
    if (!window.confirm('すべてクリアしますか？')) return;
    setImages({});
    setHolePositions({});
    setImageFitModes({});
    setImageRotations({});
    setNotice('');
  };

  const sizeLabel = sizePreset?.shortName || sizePreset?.name || 'カスタム';
  const statusPill = `${sizeLabel} / ${cols}列×${rows}行 / ${total}枚`;

  const IcoRuler = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 11h10M4 15h14M4 19h8" stroke={T.muted} strokeWidth="1.75" strokeLinecap="round" />
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
        {printBusy ? '印刷の準備中…' : printReady ? '印刷用ページを開く' : '印刷'}
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

  const fixedPresets = ['microfive', 'm5square', 'mini6', 'bible']
    .map((id) => SIZES.find((s) => s.id === id))
    .filter(Boolean);

  const sizeGridBtn = (s) => (
    <button
      key={s.id}
      type="button"
      onClick={() => changeSize(s.id)}
      style={{
        ...S.sizeGridButton,
        ...(sizeId === s.id ? S.sizeGridButtonActive : {}),
      }}
    >
      {sizeId === s.id ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: T.primary,
            color: T.primaryText,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            lineHeight: 1,
            fontWeight: 700,
          }}
        >
          ✓
        </span>
      ) : null}
      <span style={{ fontSize: isNarrow && s.id === 'm5square' ? 12 : 15, fontWeight: 600, lineHeight: 1.25, color: sizeId === s.id ? T.ink : 'inherit' }}>
        {s.shortName || s.name}
      </span>
      {!isNarrow ? (
        <span style={{ marginTop: 4, fontSize: 11, lineHeight: 1.35, color: sizeId === s.id ? T.muted : T.hint }}>
        {s.w}×{s.h}
      </span>
      ) : null}
    </button>
  );

  const renderLayoutIcon = (option) => {
    const kind = option.id;
    const isLandscape = kind !== 'portrait';
    const width = isLandscape ? 34 : 24;
    const height = isLandscape ? 24 : 34;
    const iconCols = Math.max(option.iconCols || (kind === 'fold3' ? 3 : 4), 1);
    const iconRows = Math.max(option.iconRows || 1, 1);
    const cellCount = iconCols * iconRows;
    return (
      <span
        aria-hidden
        style={{
          width,
          height,
          border: `0.5px solid ${T.borderStrong}`,
          borderRadius: 2,
          display: 'grid',
          gridTemplateColumns: `repeat(${iconCols}, 1fr)`,
          gridTemplateRows: `repeat(${iconRows}, 1fr)`,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#fff',
        }}
      >
        {Array.from({ length: cellCount }, (_, i) => {
          const col = i % iconCols;
          const row = Math.floor(i / iconCols);
          return (
          <span
            key={i}
            style={{
              borderLeft: col > 0 ? `0.5px ${kind.startsWith('fold') ? 'dashed' : 'solid'} ${kind.startsWith('fold') ? T.primary : T.borderStrong}` : 'none',
              borderTop: row > 0 ? `0.5px solid ${T.borderStrong}` : 'none',
            }}
          />
          );
        })}
      </span>
    );
  };

  const portraitLayout = calcLayout(refillW, refillH, 'portrait');
  const landscapeLayout = calcLayout(refillW, refillH, 'landscape');
  const foldedWidth = (foldCount) => HOLE_ZONE_MM + Math.max(refillW - HOLE_ZONE_MM, 0) * foldCount;
  const foldedBooks = Math.floor(210 / refillH);
  const foldOptions = [
    { id: 'fold3', title: '3つ折り', foldCount: 3 },
    { id: 'fold4', title: '4つ折り', foldCount: 4 },
  ].map((option) => ({
    ...option,
    supported: foldedWidth(option.foldCount) <= 297 && foldedBooks > 0,
    detail: foldedWidth(option.foldCount) <= 297 && foldedBooks > 0 ? `${foldedBooks}冊・A4横` : '非対応',
  }));

  const layoutOptions = [
    { id: 'portrait', title: 'A4縦', detail: `${portraitLayout.total}枚`, iconCols: portraitLayout.cols, iconRows: portraitLayout.rows, active: orientation === 'portrait', onClick: () => { setOrientation('portrait'); setImages({}); setHolePositions({}); setImageFitModes({}); setImageRotations({}); } },
    { id: 'landscape', title: 'A4横', detail: `${landscapeLayout.total}枚`, iconCols: landscapeLayout.cols, iconRows: landscapeLayout.rows, active: orientation === 'landscape', onClick: () => { setOrientation('landscape'); setImages({}); setHolePositions({}); setImageFitModes({}); setImageRotations({}); } },
    ...foldOptions.map((option) => ({
      id: option.id,
      title: option.title,
      detail: option.detail,
      active: false,
      disabled: !option.supported,
      onClick: () => setNotice(`${option.title}は仕様検討中です。`),
    })),
  ];

  const layoutPanel = (
    <div
      style={{
        marginTop: 12,
        marginBottom: 2,
        padding: 14,
        borderRadius: 14,
        background: T.previewBg,
        border: `0.5px solid ${T.border}`,
      }}
    >
      <div style={{ margin: '0 0 10px', fontSize: 13, color: T.muted }}>レイアウト</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {layoutOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={option.disabled}
            onClick={option.onClick}
            style={{
              ...S.layoutButton,
              ...(option.active ? S.layoutButtonActive : {}),
              ...(option.disabled ? S.layoutButtonDisabled : {}),
            }}
          >
            {renderLayoutIcon(option)}
            <span style={{ minWidth: 0, textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: isNarrow ? 16 : 15, fontWeight: 600, lineHeight: 1.25, color: T.ink }}>{option.title}</span>
                <span style={{ display: 'block', marginTop: 3, fontSize: isNarrow ? 13 : 12, lineHeight: 1.3, color: T.muted }}>{option.detail}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const sizeBlockInner = (
    <>
      <div style={{ margin: '0 0 10px', fontSize: 13, color: T.muted }}>リフィルサイズ</div>
      <div
        ref={(node) => {
          fixedPresets.forEach((s) => {
            if (node) sizeRowRefs.current[s.id] = node;
            else delete sizeRowRefs.current[s.id];
          });
        }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: isNarrow ? 8 : 12 }}
      >
        {fixedPresets.map(sizeGridBtn)}
      </div>
      {fixedPresets.some((s) => s.id === sizeId) ? layoutPanel : null}
      <button
        type="button"
        onClick={() => changeSize('custom')}
        style={{
          ...S.sizeRow,
          marginTop: 14,
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
            <input type="number" value={customW} onChange={(e) => { setCustomW(Number(e.target.value)); setImages({}); setImageFitModes({}); setImageRotations({}); }} style={S.numInput} />
          </div>
          <div style={S.ctrlRow}>
            <span style={{ fontSize: 13 }}>高さ (mm)</span>
            <input type="number" value={customH} onChange={(e) => { setCustomH(Number(e.target.value)); setImages({}); setImageFitModes({}); setImageRotations({}); }} style={S.numInput} />
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
      {sizeId === 'custom' ? layoutPanel : null}
    </>
  );

  const holesBlockInner = (
    <>
      <p style={{ fontSize: isNarrow ? 14 : 13, color: T.muted, margin: '0 0 14px', lineHeight: 1.7 }}>
        すべての枠の穴位置をまとめて変更できます。個別に変えたい場合は「画像追加」の各カードで調整できます。
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => setAllHoles('left')} style={{ ...S.pill, flex: 1, justifyContent: 'center' }}>
          すべて左
        </button>
        <button type="button" onClick={() => setAllHoles('right')} style={{ ...S.pill, flex: 1, justifyContent: 'center' }}>
          すべて右
        </button>
      </div>
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: `0.5px solid ${T.border}` }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: isNarrow ? 14 : 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showHoles} onChange={(e) => setShowHoles(e.target.checked)} />
          穴あけガイドを表示・印刷する
        </label>
        <p style={{ margin: '6px 0 0 26px', fontSize: isNarrow ? 13 : 12, color: T.hint, lineHeight: 1.6 }}>
          ONにすると、プレビューと印刷/PDFの両方に薄い丸印を入れます。プリンターやパンチにより位置がずれる場合があります。
        </p>
      </div>
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
      <div>
        <div style={{ margin: '4px 0 10px', fontSize: isNarrow ? 15 : 13, color: T.ink, fontWeight: 600 }}>画像範囲</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            {
              id: 'avoid',
              title: '穴を避ける',
              desc: '穴位置を空けて配置',
              icon: (
                <span aria-hidden style={{ width: 32, height: 42, border: `1px solid ${T.borderStrong}`, borderRadius: 3, display: 'flex', alignItems: 'stretch', overflow: 'hidden', background: '#fff' }}>
                  <span style={{ width: 8, borderRight: `1px dashed ${T.hole}`, background: T.previewBg }} />
                  <span style={{ flex: 1, margin: 4, border: `1px solid ${T.borderStrong}`, borderRadius: 2 }} />
                </span>
              ),
            },
            {
              id: 'full',
              title: '全面に印刷',
              desc: '穴位置まで画像を配置',
              icon: (
                <span aria-hidden style={{ width: 32, height: 42, border: `1px solid ${T.borderStrong}`, borderRadius: 3, position: 'relative', display: 'block', overflow: 'hidden', background: '#fff' }}>
                  <span style={{ position: 'absolute', inset: 4, border: `1px solid ${T.borderStrong}`, borderRadius: 2 }} />
                  <span style={{ position: 'absolute', left: 5, top: 8, width: 5, height: 5, borderRadius: '50%', border: `1px solid ${T.hole}`, background: '#fff' }} />
                  <span style={{ position: 'absolute', left: 5, top: 18, width: 5, height: 5, borderRadius: '50%', border: `1px solid ${T.hole}`, background: '#fff' }} />
                </span>
              ),
            },
          ].map((option) => {
            const active = imageAreaMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => { setImageAreaMode(option.id); cleanupPreparedPrint(); }}
                style={{
                  ...S.layoutButton,
                  minHeight: 88,
                  alignItems: 'center',
                  ...(active ? S.layoutButtonActive : {}),
                }}
              >
                {option.icon}
                <span style={{ textAlign: 'left', minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: isNarrow ? 15 : 14, fontWeight: 600, color: T.ink, lineHeight: 1.3 }}>{option.title}</span>
                  <span style={{ display: 'block', marginTop: 3, fontSize: isNarrow ? 12 : 11, color: T.muted, lineHeight: 1.45 }}>{option.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
        <input type="checkbox" checked={showBorder} onChange={(e) => setShowBorder(e.target.checked)} />
        カット線を表示
      </label>
    </div>
  );

  const rotatedImageStyle = (src, mode, rotation, boxW, boxH) => {
    const normalizedRotation = rotation || 0;
    const isQuarterTurn = normalizedRotation % 180 !== 0;
    const safeW = Math.max(boxW, 1);
    const safeH = Math.max(boxH, 1);
    return {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: isQuarterTurn ? `${(safeH / safeW) * 100}%` : '100%',
      height: isQuarterTurn ? `${(safeW / safeH) * 100}%` : '100%',
      transform: `translate(-50%, -50%) rotate(${normalizedRotation}deg)`,
      transformOrigin: 'center',
      backgroundImage: `url(${src})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: mode === 'cover' ? 'cover' : mode === 'contain' ? 'contain' : '100% 100%',
    };
  };

  const imagesBlockInner = (
    <>
      {notice && (
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 8, background: T.primaryLight, border: `0.5px solid ${T.border}`, fontSize: isNarrow ? 14 : 13, color: T.inkSoft, lineHeight: 1.65 }}>
          {notice}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <button type="button" onClick={() => fileInputMultiRef.current.click()} style={{ ...S.btn, ...S.btnGhostLine, margin: 0, fontSize: isNarrow ? 15 : 14 }}>
          まとめて選択
        </button>
        <button type="button" onClick={() => fileInputFillRef.current.click()} style={{ ...S.btn, ...S.btnGhostLine, margin: 0, fontSize: isNarrow ? 15 : 14 }}>
          1枚を全枠へ
        </button>
      </div>
      <p style={{ margin: '0 0 18px', fontSize: isNarrow ? 14 : 13, color: T.muted, lineHeight: 1.7 }}>
        まとめて選択は最大{total}枚まで使います。多く選んだ場合は先頭{total}枚だけ配置します。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : `repeat(${Math.min(cols, 3)}, minmax(0, 1fr))`, gap: 16 }}>
        {Array.from({ length: total }, (_, i) => {
          const slotFit = imageFitModes[i] || fitMode;
          const hole = holePositions[i] || 'left';
          const rotation = imageRotations[i] || 0;
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
                  <span
                    role="img"
                    aria-label={`枠 ${i + 1} の画像`}
                    style={rotatedImageStyle(images[i], slotFit, rotation, refillW, refillH)}
                  />
                ) : (
                  <span style={{ display: 'inline-flex', flexDirection: isNarrow ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: isNarrow ? 8 : 5, color: T.hole, lineHeight: 1 }}>
                    <span style={{ width: isNarrow ? 40 : 36, height: isNarrow ? 40 : 36, borderRadius: '50%', background: '#fff', border: `1px solid ${T.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: isNarrow ? 30 : 26, fontWeight: 500 }}>＋</span>
                    <span style={{ fontSize: isNarrow ? 16 : 10, color: T.hint, fontWeight: 700 }}>追加</span>
                  </span>
                )}
                <span style={{ position: 'absolute', left: 6, top: 6, padding: '2px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.9)', color: T.hint, fontSize: isNarrow ? 12 : 10, fontWeight: 700 }}>
                  {i + 1}
                </span>
              </button>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: isNarrow ? 15 : 13, color: T.ink, fontWeight: 600 }}>穴位置</span>
                  <span style={{ fontSize: isNarrow ? 14 : 12, color: T.muted }}>
                    現在: {hole === 'left' ? '左' : '右'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
                      穴を{pos === 'left' ? '左' : '右'}にする
                    </button>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 44, fontSize: isNarrow ? 15 : 13, color: T.muted }}>表示</span>
                  <select value={slotFit} onChange={(e) => setSlotFit(i, e.target.value)} style={{ ...S.select, flex: 1, fontSize: isNarrow ? 15 : 13 }}>
                    <option value="cover">トリミング</option>
                    <option value="contain">全体表示</option>
                    <option value="fill">引き伸ばし</option>
                  </select>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 44, fontSize: isNarrow ? 15 : 13, color: T.muted }}>回転</span>
                  <button
                    type="button"
                    disabled={!images[i]}
                    onClick={() => rotateSlot(i)}
                    style={{ ...S.smallAction, flex: 1, opacity: images[i] ? 1 : 0.45 }}
                  >
                    90°回転
                  </button>
                  <span style={{ minWidth: 42, fontSize: isNarrow ? 14 : 12, color: T.hint, textAlign: 'right' }}>
                    {rotation}°
                  </span>
                </div>
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
                      setImageRotations((prev) => { const n = { ...prev }; delete n[i]; return n; });
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
    </>
  );

  const imageFilledCount = Object.values(images).filter(Boolean).length;

  const TOOL_PANELS = [
    { id: 'size', title: 'サイズ', icon: IcoRuler },
    { id: 'holes', title: 'パンチ穴', icon: IcoHole },
    { id: 'images', title: '画像追加', icon: IcoImage },
    { id: 'display', title: '詳細', icon: IcoDisplay },
  ];

  const controlPanelContent = {
    size: <GroupCard title="サイズ" icon={IcoRuler}>{sizeBlockInner}</GroupCard>,
    holes: <GroupCard title="パンチ穴" icon={IcoHole}>{holesBlockInner}</GroupCard>,
    images: <GroupCard title={`画像追加（${imageFilledCount}／${total} 枠に画像あり）`} icon={IcoImage}>{imagesBlockInner}</GroupCard>,
    display: <GroupCard title="詳細" icon={IcoDisplay}>{displayBlockInner}</GroupCard>,
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
              fontSize: compact ? 14 : 13,
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
      ) : compact ? (
        <div
          style={{
            margin: '0 0 10px',
            display: 'inline-flex',
            alignSelf: 'center',
            padding: '7px 13px',
            borderRadius: 999,
            background: '#fff',
            border: `1px solid ${T.border}`,
            fontSize: isNarrow ? 13 : 11,
            lineHeight: 1.35,
            color: T.inkSoft,
            boxShadow: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {orientation === 'portrait' ? 'A4縦' : 'A4横'} · 表示{Math.round(scale * 100)}% · {statusPill}
        </div>
      ) : (
        <p style={{ fontSize: 11, color: T.hint, margin: '0 0 16px', textAlign: 'center', alignSelf: 'stretch', lineHeight: 1.6 }}>
          {orientation === 'portrait' ? 'A4縦' : 'A4横'} · 表示{Math.round(scale * 100)}% · {sizeLabel}サイズ
        </p>
      )}
      <div
        style={{
          width: paperW_px * scale,
          height: paperH_px * scale,
          flexShrink: 0,
          position: 'relative',
          margin: '0 auto',
          background: '#fff',
          border: `1px solid ${T.borderStrong}`,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.8)',
          boxSizing: 'content-box',
        }}
      >
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
            const rotation = imageRotations[i] || 0;
            const avoidsHole = imageAreaMode === 'avoid';
            const imageAreaW_px = avoidsHole ? refillW_px - imageStart_px : refillW_px;
            const imageAreaPreviewBg = 'rgba(245, 237, 224, 0.42)';
            const holeZonePreviewBg = avoidsHole ? '#fff' : 'transparent';
            const holeZoneBorder = avoidsHole
              ? `0.5px dashed ${T.borderStrong}`
              : `0.5px dashed rgba(224, 217, 207, 0.55)`;

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
                  background: avoidsHole ? '#fff' : imageAreaPreviewBg,
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  data-refill="hole-zone"
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    [hPos]: 0,
                    width: holeZone_px,
                    background: holeZonePreviewBg,
                    borderRight: hPos === 'left' ? holeZoneBorder : 'none',
                    borderLeft: hPos === 'right' ? holeZoneBorder : 'none',
                    zIndex: 2,
                  }}
                >
                  {showHoles && holePosArr.map((posY, hi) => (
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
                        border: `1px solid ${T.hole}`,
                        background: 'transparent',
                        boxSizing: 'border-box',
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: avoidsHole && hPos === 'left' ? imageStart_px : 0,
                    right: avoidsHole && hPos === 'right' ? imageStart_px : 0,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: imageAreaPreviewBg,
                  }}
                >
                  <div
                    className="refill-capture-hide"
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: `1px dashed ${avoidsHole ? T.borderStrong : T.border}`,
                      boxSizing: 'border-box',
                      pointerEvents: 'none',
                      zIndex: 4,
                    }}
                  />
                  {images[i] ? (
                    <div
                      role="img"
                      aria-label={`枠 ${i + 1} の画像`}
                      style={rotatedImageStyle(images[i], slotFit, rotation, imageAreaW_px, refillH_px)}
                    />
                  ) : (
                    <>
                      <span className="refill-capture-hide" style={{ position: 'absolute', left: 7, top: 5, fontFamily: 'system-ui, sans-serif', fontSize: isNarrow ? 12 : 10, color: T.hint, fontWeight: 600, zIndex: 3 }}>
                        {i + 1}
                      </span>
                      <span className="refill-capture-hide" style={{ display: 'inline-flex', flexDirection: isNarrow ? 'row' : 'column', alignItems: 'center', gap: isNarrow ? 8 : 4, fontFamily: 'system-ui, sans-serif', color: T.hole, lineHeight: 1 }}>
                        <span style={{ width: isNarrow ? 40 : 34, height: isNarrow ? 40 : 34, borderRadius: '50%', background: '#fff', border: `1px solid ${T.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: isNarrow ? 30 : 24, fontWeight: 500 }}>
                          ＋
                        </span>
                        <span style={{ fontSize: isNarrow ? 16 : 10, color: T.hint, fontWeight: 700 }}>追加</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {!compact ? (
        <div
          style={{
            marginTop: 24,
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
      ) : null}
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
      {!settingsSheetOpen && (
        <button
          type="button"
          onClick={() => setSettingsSheetOpen(true)}
          style={{
            display: 'block',
            width: '100%',
            border: 'none',
            background: 'transparent',
            padding: '0 0 10px',
            color: T.hint,
            fontFamily: T.font,
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          <span style={{ display: 'block', width: 42, height: 4, borderRadius: 999, background: T.borderStrong, margin: '0 auto 7px', opacity: 0.8 }} />
          設定からサイズ・画像・詳細を変更できます
        </button>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1fr 1fr', gap: 10 }}>
        <button
          type="button"
          onClick={() => setSettingsSheetOpen(true)}
          style={{ ...S.btn, ...S.btnGhostLine, margin: 0 }}
        >
          設定
        </button>
        <button
          type="button"
          disabled={printBusy}
          title="印刷用ページを開きます"
          onClick={() => printSheet()}
          style={{
            ...S.btn,
            ...S.btnPrimary,
            flex: 1,
            margin: 0,
            ...(printBusy ? { opacity: 0.85, cursor: 'wait' } : {}),
          }}
        >
          {printBusy ? '準備中…' : printReady ? '印刷用ページを開く' : '印刷'}
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
            style={{
              flex: 1,
              overflow: 'hidden',
              minHeight: 0,
              WebkitOverflowScrolling: 'touch',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              ref={previewWrapRef}
              style={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                background: T.previewBg,
                padding: '22px 10px 18px',
                borderBottom: `0.5px solid ${T.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ transform: 'translateY(8px)' }}>
                {renderPreviewPanel({ hideHeader: true, compact: true })}
              </div>
            </div>
          </div>
          {settingsSheetOpen && (
            <div
              role="presentation"
              onClick={() => setSettingsSheetOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 20,
                background: 'rgba(61, 47, 31, 0.24)',
              }}
            />
          )}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="設定"
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 21,
              height: 'min(72vh, 620px)',
              transform: settingsSheetOpen ? 'translateY(0)' : 'translateY(calc(100% + 16px))',
              transition: 'transform 0.22s ease',
              background: '#fff',
              borderTop: `1px solid ${T.border}`,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              boxShadow: '0 -12px 32px rgba(61, 47, 31, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <div style={{ flexShrink: 0, padding: '10px 16px 0' }}>
              <div style={{ width: 42, height: 4, borderRadius: 999, background: T.border, margin: '0 auto 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>設定</div>
                <button
                  type="button"
                  onClick={() => setSettingsSheetOpen(false)}
                  style={{
                    border: 'none',
                    background: T.primaryLight,
                    color: T.ink,
                    borderRadius: 999,
                    minHeight: 36,
                    padding: '0 14px',
                    fontFamily: T.font,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  閉じる
                </button>
              </div>
              {renderPanelNav(true)}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 16px 18px' }}>
              {controlPanelContent[activeToolPanel]}
            </div>
          </div>
          {mobileStickyBar}
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />
      <input ref={fileInputMultiRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleMultiInput} />
      <input ref={fileInputFillRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFillInput} />
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
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.01em', color: T.ink }}>{title}</span>
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
  sizeGridButtonActive: {
    background: T.primaryLight,
    color: T.ink,
    border: `2px solid ${T.primary}`,
    boxShadow: 'none',
  },
  sizeGridButton: {
    width: '100%',
    minHeight: 56,
    padding: '10px 4px',
    borderRadius: 8,
    border: '0.5px solid var(--brand-border-md)',
    background: '#fff',
    cursor: 'pointer',
    color: T.ink,
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: T.font,
  },
  layoutButton: {
    width: '100%',
    minHeight: 74,
    padding: '9px 8px',
    borderRadius: 8,
    border: '0.5px solid var(--brand-border-md)',
    background: '#fff',
    cursor: 'pointer',
    color: T.ink,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    fontFamily: T.font,
  },
  layoutButtonActive: {
    background: T.primaryLight,
    border: `2px solid ${T.primary}`,
  },
  layoutButtonDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
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
    minHeight: 46,
    padding: '8px 10px',
    borderRadius: 8,
    border: '0.5px solid var(--brand-border-md)',
    background: '#fff',
    color: T.muted,
    cursor: 'pointer',
    fontSize: 14,
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
    minHeight: 46,
    padding: '9px 10px',
    borderRadius: 8,
    border: '0.5px solid var(--brand-border-md)',
    background: '#fff',
    color: T.inkSoft,
    cursor: 'pointer',
    fontSize: 14,
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
    fontSize: 15,
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
