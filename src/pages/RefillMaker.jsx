import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SIZES, HOLE_STANDARDS, getHolePositions } from '../config/sizes';
import { calcLayout, mmToPx } from '../utils/layout';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const HOLE_ZONE_MM = 6.5;
const IMAGE_START_MM = 6.7;

export default function RefillMaker() {
  const [sizeId, setSizeId] = useState('microfive');
  const [customW, setCustomW] = useState(80);
  const [customH, setCustomH] = useState(126);
  const [customHoleStandard, setCustomHoleStandard] = useState('mini6');
  const [orientation, setOrientation] = useState('portrait');
  const [images, setImages] = useState({});
  const [holePositions, setHolePositions] = useState({});
  const [fitMode, setFitMode] = useState('cover');
  const [showBorder, setShowBorder] = useState(true);
  const [showHoles, setShowHoles] = useState(true);
  const [activeSlot, setActiveSlot] = useState(null);
  const [scale, setScale] = useState(0.5);
  const [printBusy, setPrintBusy] = useState(false);
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

  useEffect(() => {
    function updateScale() {
      if (!previewWrapRef.current) return;
      const aw = previewWrapRef.current.clientWidth - 40;
      const ah = previewWrapRef.current.clientHeight - 60;
      setScale(Math.min(aw / paperW_px, ah / paperH_px, 1));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [paperW_px, paperH_px]);

  const changeSize = (id) => {
    setSizeId(id);
    setImages({});
    setHolePositions({});
    setOrientation('portrait');
  };

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', background: '#ece9e4' }}>

      {/* HEADER */}
      <header style={{ background: '#2c5282', color: '#fff', padding: '11px 22px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', flexShrink: 0 }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>← ホーム</Link>
        <span style={{ opacity: 0.4 }}>|</span>
        <div>
          <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.15em', fontFamily: 'monospace' }}>RINGCRAFT LAB</div>
          <h1 style={{ fontSize: 15, fontWeight: 500 }}>リフィルメーカー</h1>
        </div>
        <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', fontSize: 10, padding: '3px 10px', borderRadius: 20, fontFamily: 'monospace' }}>
          {sizePreset?.name || 'カスタム'} / {cols}列×{rows}行 / {total}枚
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <aside style={{ width: 270, flexShrink: 0, background: '#fff', borderRight: '1px solid #d4d0ca', overflowY: 'auto', padding: '16px 13px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* サイズ選択 */}
          <div>
            <div style={S.secLabel}>📐 リフィルサイズ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SIZES.map(s => (
                <button key={s.id} onClick={() => changeSize(s.id)}
                  style={{ ...S.modeBtn, ...(sizeId === s.id ? S.modeBtnActive : {}) }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  {s.w && (
                    <span style={{ fontSize: 10, color: sizeId === s.id ? '#4a7fc1' : '#999', marginLeft: 8 }}>
                      {s.w}×{s.h}mm
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* カスタム設定 */}
            {sizeId === 'custom' && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, padding: '10px', background: '#f5f3f0', borderRadius: 6 }}>
                <div style={S.ctrlRow}>
                  <span style={{ fontSize: 12 }}>幅 (mm)</span>
                  <input type="number" value={customW} onChange={e => { setCustomW(Number(e.target.value)); setImages({}); }} style={S.numInput} />
                </div>
                <div style={S.ctrlRow}>
                  <span style={{ fontSize: 12 }}>高さ (mm)</span>
                  <input type="number" value={customH} onChange={e => { setCustomH(Number(e.target.value)); setImages({}); }} style={S.numInput} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 5 }}>穴の規格</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {HOLE_STANDARDS.map(hs => (
                      <button key={hs.id} onClick={() => setCustomHoleStandard(hs.id)}
                        style={{ ...S.modeBtn, padding: '5px 8px', ...(customHoleStandard === hs.id ? S.modeBtnActive : {}) }}>
                        {hs.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr style={S.hr} />

          {/* 印刷向き */}
          <div>
            <div style={S.secLabel}>📄 印刷向き</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {[
                ['portrait',  `A4縦 ${calcLayout(refillW, refillH, 'portrait').total}枚`],
                ['landscape', `A4横 ${calcLayout(refillW, refillH, 'landscape').total}枚`],
              ].map(([val, label]) => (
                <button key={val} onClick={() => { setOrientation(val); setImages({}); setHolePositions({}); }}
                  style={{ ...S.modeBtn, ...(orientation === val ? S.modeBtnActive : {}) }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <hr style={S.hr} />

          {/* 穴位置 */}
          <div>
            <div style={S.secLabel}>⭕ 穴の位置</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              <button onClick={() => setAllHoles('left')} style={S.modeBtn}>← 全て左</button>
              <button onClick={() => setAllHoles('right')} style={S.modeBtn}>全て右 →</button>
            </div>
            <p style={{ fontSize: 10, color: '#999', marginTop: 6 }}>各リフィルをクリックで個別切替</p>
          </div>

          <hr style={S.hr} />

          {/* 画像アップロード */}
          <div>
            <div style={S.secLabel}>📷 画像（{total}枚）</div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)`, gap: 4 }}>
              {Array.from({ length: total }, (_, i) => (
                <div key={i} onClick={() => { setActiveSlot(i); fileInputRef.current.click(); }}
                  style={{ aspectRatio: `${refillW}/${refillH}`, border: images[i] ? '1.5px solid #4a7fc1' : '1.5px dashed #d4d0ca', borderRadius: 3, cursor: 'pointer', position: 'relative', overflow: 'hidden', background: '#ece9e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {images[i]
                    ? <img src={images[i]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>{i + 1}</span>
                  }
                  {images[i] && (
                    <button onClick={e => { e.stopPropagation(); setImages(prev => { const n = { ...prev }; delete n[i]; return n; }); }}
                      style={{ position: 'absolute', top: 2, right: 2, width: 14, height: 14, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', fontSize: 8, cursor: 'pointer' }}>×</button>
                  )}
                </div>
              ))}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />
            <input ref={fileInputMultiRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleMultiInput} />
            <button onClick={() => fileInputMultiRef.current.click()} style={{ ...S.btn, ...S.btnGhost, marginTop: 8 }}>
              📂 まとめて選択（最大{total}枚）
            </button>
          </div>

          <hr style={S.hr} />

          {/* 設定 */}
          <div>
            <div style={S.secLabel}>⚙️ 設定</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={S.ctrlRow}>
                <span style={{ fontSize: 12 }}>画像フィット</span>
                <select value={fitMode} onChange={e => setFitMode(e.target.value)} style={S.select}>
                  <option value="cover">トリミング</option>
                  <option value="contain">全体表示</option>
                  <option value="fill">引き伸ばし</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={showBorder} onChange={e => setShowBorder(e.target.checked)} />カット線を表示
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={showHoles} onChange={e => setShowHoles(e.target.checked)} />穴あけガイドを表示
              </label>
            </div>
          </div>

          <hr style={S.hr} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              type="button"
              disabled={printBusy}
              title="キャプチャのあと、ブラウザの印刷画面が開きます"
              onClick={() => printSheet()}
              style={{
                ...S.btn,
                ...S.btnPrimary,
                ...(printBusy ? { opacity: 0.75, cursor: 'wait' } : {}),
              }}
            >
              {printBusy ? '印刷の準備中…' : '🖨️ 印刷する'}
            </button>
            <button onClick={exportPDF} style={{ ...S.btn, ...S.btnGhost }}>📄 PDFダウンロード</button>
            <button onClick={clearAll} style={{ ...S.btn, ...S.btnGhost }}>🗑️ すべてクリア</button>
          </div>

        </aside>

        {/* PREVIEW */}
        <div ref={previewWrapRef} style={{ flex: 1, overflow: 'auto', background: '#c8c4be', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px', gap: 10 }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#666' }}>
            {orientation === 'portrait' ? 'A4縦' : 'A4横'} / {cols}列×{rows}行 / {total}枚 / 表示{Math.round(scale * 100)}%
          </div>

          <div style={{ width: paperW_px * scale, height: paperH_px * scale, flexShrink: 0, position: 'relative' }}>
           <div ref={sheetRef} id="print-sheet" style={{
  width: paperW_px,
  height: paperH_px,
  background: '#fff',
  boxShadow: '0 6px 40px rgba(0,0,0,0.25)',
  position: 'absolute',
  top: 0, left: 0,
  transformOrigin: 'top left',
  transform: `scale(${scale})`,
}}>
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
                      left: x, top: y,
                      width: refillW_px,
                      height: refillH_px,
                      border: showBorder ? '1px solid #ccc' : '1px solid transparent',
                      overflow: 'hidden',
                      background: '#f8f8f8',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}>

                    {/* 穴ゾーン（印刷・PDF では白に差し替え） */}
                    {showHoles && (
                      <div
                        data-refill="hole-zone"
                        style={{
                        position: 'absolute', top: 0, bottom: 0,
                        [hPos]: 0,
                        width: holeZone_px,
                        background: '#efefef',
                        borderRight: hPos === 'left' ? '1px dashed #bbb' : 'none',
                        borderLeft: hPos === 'right' ? '1px dashed #bbb' : 'none',
                        zIndex: 2,
                      }}>
                        {holePosArr.map((posY, hi) => (
                          <div key={hi} style={{
                            position: 'absolute',
                            top: posY * PX - 6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            border: '1px solid #bbb',
                            background: '#fff',
                          }} />
                        ))}
                      </div>
                    )}

                    {/* 画像ゾーン */}
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0,
                      left: hPos === 'left' ? imageStart_px : 0,
                      right: hPos === 'right' ? imageStart_px : 0,
                      overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {images[i]
                        ? <img src={images[i]} style={{ width: '100%', height: '100%', objectFit: fitMode }} />
                        : (
                          <span className="refill-capture-hide" style={{ fontFamily: 'monospace', fontSize: 20, color: '#ddd' }}>
                            {i + 1}
                          </span>
                        )
                      }
                    </div>

                    <div
                      className="refill-capture-hide"
                      style={{
                        position: 'absolute',
                        bottom: 3,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 9,
                        color: 'rgba(0,0,0,0.25)',
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
        </div>
      </div>

    </div>
  );
}

const S = {
  secLabel: { fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.16em', color: '#999', textTransform: 'uppercase', marginBottom: 8 },
  modeBtn: { border: '1.5px solid #d4d0ca', borderRadius: 6, padding: '7px 10px', background: '#ece9e4', cursor: 'pointer', fontSize: 12, fontFamily: 'sans-serif', textAlign: 'left', width: '100%' },
  modeBtnActive: { borderColor: '#2c5282', background: '#ebf0f8', color: '#2c5282' },
  ctrlRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  numInput: { border: '1px solid #d4d0ca', borderRadius: 4, padding: '4px 7px', fontSize: 12, width: 70, background: '#ece9e4' },
  select: { border: '1px solid #d4d0ca', borderRadius: 4, padding: '4px 7px', fontSize: 12, background: '#ece9e4' },
  hr: { border: 'none', borderTop: '1px solid #d4d0ca' },
  btn: { width: '100%', padding: 10, border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'sans-serif' },
  btnPrimary: { background: '#2c5282', color: '#fff' },
  btnGhost: { background: '#ece9e4', color: '#1c1c1c', border: '1px solid #d4d0ca' },
};
