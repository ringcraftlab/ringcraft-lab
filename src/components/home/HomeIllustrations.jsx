const stroke = '#3d2f1f';
const muted = '#9c7d5e';
const desk = '#e0d9cf';
const paper = '#fffef9';
const metal = '#c8bfb3';

/** 大きな用紙をゲラ断裁機（ペーパーカッター）で切る */
export function RefillCutIllustration() {
  return (
    <svg viewBox="0 0 200 130" width="180" height="117" aria-hidden>
      {/* 台・ベース */}
      <rect x="14" y="102" width="172" height="12" rx="2" fill={desk} stroke={stroke} strokeWidth="1.2" />
      <rect x="18" y="94" width="164" height="10" rx="1" fill="#f5ede0" stroke={stroke} strokeWidth="1" />

      {/* 大きな用紙 */}
      <rect x="32" y="64" width="136" height="32" rx="1" fill={paper} stroke={stroke} strokeWidth="1.5" />
      <line x1="40" y1="74" x2="160" y2="74" stroke={muted} strokeWidth="0.7" opacity="0.4" />
      <line x1="40" y1="82" x2="160" y2="82" stroke={muted} strokeWidth="0.7" opacity="0.4" />
      <line x1="40" y1="90" x2="160" y2="90" stroke={muted} strokeWidth="0.7" opacity="0.4" />

      {/* 背尺（左の支柱） */}
      <rect x="22" y="36" width="12" height="60" rx="2" fill={metal} stroke={stroke} strokeWidth="1.2" />
      <circle cx="28" cy="42" r="3" fill={stroke} opacity="0.2" />

      {/* 刃を載せたアーム（下ろした状態） */}
      <path
        d="M34 44 L34 78 L162 78 L162 44 Z"
        fill="#e0d9cf"
        stroke={stroke}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <rect x="34" y="74" width="128" height="5" fill="#9c7d5e" stroke={stroke} strokeWidth="1" />
      <line x1="34" y1="76.5" x2="162" y2="76.5" stroke={stroke} strokeWidth="2" />

      {/* 取っ手（上の横棒） */}
      <rect x="68" y="24" width="64" height="11" rx="5.5" fill={metal} stroke={stroke} strokeWidth="1.2" />
      <rect x="92" y="35" width="16" height="12" rx="2" fill="#e0d9cf" stroke={stroke} strokeWidth="1" />

      {/* 切り落とし */}
      <rect x="34" y="106" width="24" height="5" rx="0.5" fill={paper} stroke={stroke} strokeWidth="0.8" opacity="0.75" />
    </svg>
  );
}

const tipMetal = '#9a9a9a';

/** 横から見た短いペン（軸・キャップ・先が分かる） */
function SidePen({ x, height, body, cap }) {
  const w = 11;
  const base = 100;
  const top = base - height;
  const mid = top + 14;
  return (
    <g transform={`translate(${x}, 0)`}>
      <path
        d={`M${w / 2 + 0.5} ${base + 1} L${w + 3} ${base - 10} L0 ${base - 10} Z`}
        fill={tipMetal}
        stroke={stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <rect x="1" y={mid} width={w} height={base - mid - 8} rx="2.5" fill={body} stroke={stroke} strokeWidth="1.1" />
      <rect x="0" y={top} width={w + 2} height="14" rx="3" fill={cap} stroke={stroke} strokeWidth="1.1" />
      <rect x={w + 1} y={top + 4} width="5" height="16" rx="1.5" fill={stroke} opacity="0.35" />
      <line x1="3" y1={mid + 4} x2={w - 1} y2={mid + 4} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    </g>
  );
}

/** 短いペンを並べて虫眼鏡で探す（横並び＋ルーペ） */
export function PenSearchIllustration() {
  const pens = [
    { x: 14, h: 42, body: '#3d2f1f', cap: '#3d2f1f' },
    { x: 36, h: 36, body: '#9c7d5e', cap: '#9c7d5e' },
    { x: 56, h: 46, body: '#a07850', cap: '#3d2f1f' },
    { x: 78, h: 34, body: '#c9a882', cap: '#c9a882' },
    { x: 98, h: 40, body: '#b0a898', cap: '#b0a898' },
  ];

  return (
    <svg viewBox="0 0 200 130" width="180" height="117" aria-hidden role="img">
      <title>短いペンを虫眼鏡で探す</title>
      <ellipse cx="72" cy="104" rx="58" ry="5" fill={desk} opacity="0.7" />

      {pens.map((p) => (
        <SidePen key={p.x} x={p.x} height={p.h} body={p.body} cap={p.cap} />
      ))}

      {/* 虫眼鏡（大きめ・手前） */}
      <g transform="translate(118, 28)">
        <circle cx="0" cy="0" r="34" fill={paper} fillOpacity="0.95" stroke={stroke} strokeWidth="2.5" />
        <circle cx="0" cy="0" r="24" fill="#faf7f2" stroke={stroke} strokeWidth="1" opacity="0.5" />
        {/* レンズ内：拡大したペン */}
        <g transform="translate(-8, -6) scale(1.2)">
          <path d="M8 28 L14 18 L2 18 Z" fill={tipMetal} stroke={stroke} strokeWidth="0.8" />
          <rect x="3" y="8" width="10" height="12" rx="2" fill="#a07850" stroke={stroke} strokeWidth="0.9" />
          <rect x="2" y="2" width="12" height="8" rx="2" fill="#a07850" stroke={stroke} strokeWidth="0.9" />
        </g>
        <line x1="24" y1="24" x2="42" y2="44" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
