import { Link } from 'react-router-dom';
import { SIZES } from '../config/sizes';
import { T } from '../theme/appTheme';

const C = {
  bg: '#ffffff',
  bgSub: '#f7f7f7',
  accent: T.primary,
  accentLight: T.primaryLight,
  accentText: T.primaryText,
  text: T.ink,
  muted: T.muted,
  border: T.border,
};

const font = T.font;
const r = T.radiusMd;
const bd = `0.5px solid ${C.border}`;

const SIZE_CARDS = SIZES.filter((s) => s.id !== 'custom').map((s) => ({
  id: s.id,
  name: s.name,
  shortName: s.shortName,
  mm: `${s.w} × ${s.h} mm`,
  holes: s.holePosY.length,
  w: s.w,
  h: s.h,
}));

const STEPS = [
  { n: '01', title: 'サイズを選ぶ', desc: 'マイクロ5（M5）・ミニ6（M6）・バイブル・A5から選択。穴位置はプリセット済み。' },
  { n: '02', title: '画像をアップロード', desc: 'スクリーンショットや写真を枠に入れるだけ。' },
  { n: '03', title: '印刷する', desc: 'A4に並んだ状態でそのまま印刷、リングへ。' },
];

/* リフィルのシルエットSVG */
function RefillSilhouette({ w, h, scale = 1 }) {
  const sw = Math.round(w * scale);
  const sh = Math.round(h * scale);
  const holeCount = h === 105 ? 5 : 6;
  const holeXs = [6];
  const holeYs = Array.from({ length: holeCount }, (_, i) =>
    Math.round(sh * (0.15 + (i * 0.7) / (holeCount - 1)))
  );
  return (
    <svg width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`} aria-hidden style={{ display: 'block' }}>
      <rect x="0.5" y="0.5" width={sw - 1} height={sh - 1} rx="3"
        fill="#fff" stroke={C.border} strokeWidth="0.75" />
      {holeYs.map((cy, i) => (
        <circle key={i} cx={holeXs[0]} cy={cy} r="2.5"
          fill={C.accentLight} stroke={C.accent} strokeWidth="0.6" opacity="0.8" />
      ))}
      <rect x={sw * 0.18} y={sh * 0.12} width={sw * 0.72} height={sh * 0.22}
        rx="2" fill={C.accentLight} />
      <rect x={sw * 0.18} y={sh * 0.4} width={sw * 0.55} height={sh * 0.06}
        rx="1" fill={C.border} />
      <rect x={sw * 0.18} y={sh * 0.52} width={sw * 0.65} height={sh * 0.06}
        rx="1" fill={C.border} />
      <rect x={sw * 0.18} y={sh * 0.64} width={sw * 0.45} height={sh * 0.06}
        rx="1" fill={C.border} />
    </svg>
  );
}

/* ヒーローのA4イラスト */
function HeroIllustration() {
  const cells = [
    { x: 18, y: 22, w: 44, h: 71 },
    { x: 68, y: 22, w: 44, h: 71 },
    { x: 118, y: 22, w: 44, h: 71 },
    { x: 18, y: 101, w: 44, h: 71 },
    { x: 68, y: 101, w: 44, h: 71 },
    { x: 118, y: 101, w: 44, h: 71 },
  ];
  return (
    <svg viewBox="0 0 180 184" width="100%" style={{ maxWidth: 280, display: 'block' }} aria-hidden>
      <defs>
        <filter id="s">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.08" />
        </filter>
      </defs>
      {/* A4用紙 */}
      <rect x="8" y="8" width="164" height="168" rx="4"
        fill="#fff" stroke={C.border} strokeWidth="0.75" filter="url(#s)" />
      {/* ラベル */}
      <text x="90" y="18" textAnchor="middle" fill={C.muted} fontSize="6" fontFamily={font}>
        A4 印刷プレビュー
      </text>
      {/* リフィルセル */}
      {cells.map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="2"
            fill="#fafafa" stroke={C.border} strokeWidth="0.5" />
          {/* 穴ゾーン */}
          <rect x={c.x} y={c.y} width="8" height={c.h} rx="0" fill="#f5f5f5" />
          {[0.2, 0.5, 0.8].map((ratio, hi) => (
            <circle key={hi}
              cx={c.x + 4} cy={c.y + c.h * ratio} r="1.8"
              fill={C.accentLight} stroke={C.accent} strokeWidth="0.5" opacity="0.7" />
          ))}
          {/* 画像エリア */}
          <rect x={c.x + 10} y={c.y + 6} width={c.w - 14} height={c.h * 0.32}
            rx="1.5" fill={C.accentLight} opacity={i < 4 ? 1 : 0.4} />
          {i >= 4 && (
            <text x={c.x + c.w / 2 + 2} y={c.y + c.h / 2 + 2}
              textAnchor="middle" fill={C.border} fontSize="10" fontFamily={font}>
              +
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function cardHover(e, on) {
  e.currentTarget.style.transform = on ? 'translateY(-3px)' : 'translateY(0)';
  e.currentTarget.style.boxShadow = on
    ? '0 8px 24px rgba(0,0,0,0.08)'
    : '0 2px 8px rgba(0,0,0,0.04)';
}

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: C.text, background: C.bg }}>

      {/* NAV */}
      <header style={{ padding: '14px clamp(16px,4vw,40px)', borderBottom: bd, background: C.bg, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', color: C.text, textDecoration: 'none' }}>
            RingCraft Lab
          </Link>
          <nav style={{ display: 'flex', gap: 4 }}>
            {[
              ['/refill-maker', 'リフィルメーカー'],
              ['/pen-search', 'ペン検索'],
            ].map(([to, label]) => (
              <Link key={to} to={to} style={{ fontSize: 13, fontWeight: 600, color: C.muted, textDecoration: 'none', padding: '6px 10px', borderRadius: r }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: C.bg, borderBottom: bd }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,40px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(32px,5vw,64px)',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: C.accent, marginBottom: 16 }}>
              RINGCRAFT LAB
            </div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              好きな手帳に、<br />好きなリフィルを。
            </h1>
            <p style={{ fontSize: 'clamp(14px,2vw,16px)', color: C.muted, lineHeight: 1.7, margin: '0 0 32px', maxWidth: 440 }}>
              スクリーンショットや画像を選ぶだけで、リフィルが完成。
              マイクロ5（M5）・ミニ6（M6）・バイブル・A5に対応。印刷してすぐ使える。
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/refill-maker" style={{
                padding: '13px 28px', borderRadius: r + 2,
                background: C.accent, color: '#fff',
                fontSize: 15, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(91,127,166,0.3)',
              }}>
                リフィルを作る →
              </Link>
              <Link to="/pen-search" style={{
                padding: '13px 22px', borderRadius: r + 2,
                border: bd, background: C.bg,
                color: C.muted, fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                ペンを探す
              </Link>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* 3ステップ */}
      <section style={{ background: C.bgSub, borderBottom: bd }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(40px,6vw,56px) clamp(16px,4vw,40px)' }}>
          <h2 style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, margin: '0 0 28px', letterSpacing: '-0.01em' }}>
            3ステップで完成
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {STEPS.map((step) => (
              <div key={step.n} style={{ background: C.bg, border: bd, borderRadius: r, padding: '20px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: C.accent, marginBottom: 10 }}>
                  {step.n}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{step.title}</div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* サイズ選択 */}
      <section style={{ background: C.bg, borderBottom: bd }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(40px,6vw,56px) clamp(16px,4vw,40px)' }}>
          <h2 style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            使っている手帳サイズから始める
          </h2>
          <p style={{ fontSize: 13, color: C.muted, margin: '0 0 24px' }}>
            穴位置はプリセット済み。選ぶだけで正しい位置に並びます。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {SIZE_CARDS.map((s) => (
              <Link
                key={s.id}
                to={`/refill-maker?size=${s.id}`}
                style={{
                  textDecoration: 'none', color: 'inherit',
                  background: C.bg, border: bd, borderRadius: r,
                  padding: '20px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                }}
                onMouseEnter={(e) => cardHover(e, true)}
                onMouseLeave={(e) => cardHover(e, false)}
              >
                <RefillSilhouette w={s.w} h={s.h} scale={s.name === 'A5' ? 0.22 : s.name === 'バイブル' ? 0.26 : 0.32} />
                <div style={{ fontSize: 17, fontWeight: 800, marginTop: 14 }}>{s.name}</div>
                {s.shortName && (
                  <div style={{ fontSize: 12, color: C.accentText, fontWeight: 600, marginTop: 2 }}>{s.shortName}</div>
                )}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.mm}</div>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 3 }}>{s.holes}穴</div>
                <span style={{
                  marginTop: 14, fontSize: 12, fontWeight: 700,
                  color: C.accent, padding: '7px 14px',
                  border: `0.5px solid ${C.accent}`, borderRadius: r,
                }}>
                  作る →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ツール紹介 */}
      <section style={{ background: C.bgSub, borderBottom: bd }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(40px,6vw,56px) clamp(16px,4vw,40px)' }}>
          <h2 style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            RingCraft Lab でできること
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, alignItems: 'stretch' }}>

            {/* メイン：リフィルメーカー */}
            <Link to="/refill-maker" style={{
              textDecoration: 'none', color: 'inherit',
              background: C.bg, border: `1px solid ${C.accentLight}`,
              borderRadius: r, padding: '28px 24px',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 2px 12px rgba(91,127,166,0.08)',
              transition: 'transform 0.18s, box-shadow 0.18s',
            }}
              onMouseEnter={(e) => cardHover(e, true)}
              onMouseLeave={(e) => cardHover(e, false)}
            >
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: C.accent, marginBottom: 10 }}>MAIN TOOL</span>
              <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3 }}>リフィルメーカー</span>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: '12px 0 0', flex: 1 }}>
                売っていないデザインも、好きな画像でリフィルに。
                サイズと穴あけ位置を選び、A4に並べて印刷。PDFにも出力できます。
              </p>
              <span style={{
                marginTop: 20, alignSelf: 'flex-start',
                padding: '10px 20px', background: C.accent, color: '#fff',
                fontSize: 13, fontWeight: 700, borderRadius: r,
              }}>
                作り始める →
              </span>
            </Link>

            {/* サブ：ペン検索 */}
            <Link to="/pen-search" style={{
              textDecoration: 'none', color: 'inherit',
              background: C.bg, border: bd, borderRadius: r, padding: '24px 20px',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'transform 0.18s, box-shadow 0.18s',
            }}
              onMouseEnter={(e) => cardHover(e, true)}
              onMouseLeave={(e) => cardHover(e, false)}
            >
              <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 8, letterSpacing: '0.1em' }}>SUB TOOL</span>
              <span style={{ fontSize: 17, fontWeight: 800 }}>コンパクトペン検索</span>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '10px 0 0', flex: 1 }}>
                手帳に合う短いペンを、長さ・ブランド・軸径から探せます。100モデル以上収録。
              </p>
              <span style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: C.accent }}>
                ペンを探す →
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* フッター */}
      <footer style={{
        marginTop: 'auto', padding: '32px clamp(16px,4vw,40px) calc(28px + env(safe-area-inset-bottom, 0px))',
        background: C.bg, borderTop: bd, textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em' }}>RingCraft Lab</div>
        <p style={{ fontSize: 13, color: C.muted, margin: '8px 0 0' }}>好きな手帳に、好きなリフィルを。</p>
        <p style={{ fontSize: 11, color: C.muted, margin: '14px 0 0', opacity: 0.7 }}>© 2025 RingCraft Lab</p>
      </footer>

    </div>
  );
}
