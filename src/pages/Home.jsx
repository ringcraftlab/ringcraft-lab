import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SIZES } from '../config/sizes';
import { T } from '../theme/appTheme';

const heroSrc = `${import.meta.env.BASE_URL}hero-desk.jpg`;

const C = {
  bg: '#faf7f2',
  bgSub: '#f3efe8',
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

const M5 = SIZES.find((s) => s.id === 'microfive');
const OTHER_SIZES = SIZES.filter((s) => s.id !== 'microfive' && s.id !== 'custom');

const STEPS = [
  { n: '01', title: '画像を入れる', desc: '推しのスクショや手書き用の画像を、M5の枠に配置。' },
  { n: '02', title: '穴と書ける面を確認', desc: '穴5・左マージンはプリセット。1mm単位で運用を守る。' },
  { n: '03', title: '印刷してリングへ', desc: 'A4に並べて印刷。切って、いつものM5に入れる。' },
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
  const [showOtherSizes, setShowOtherSizes] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: C.text, background: C.bg }}>

      {/* NAV */}
      <header style={{ padding: '14px clamp(16px,4vw,40px)', borderBottom: bd, background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link to="/" style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', color: C.text, textDecoration: 'none' }}>
            RingCraft Lab
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link to="/refill-maker?size=microfive" style={{ fontSize: 13, fontWeight: 600, color: C.text, textDecoration: 'none', padding: '6px 10px' }}>
              M5リフィルメーカー
            </Link>
            <Link to="/pen-search" style={{ fontSize: 12, fontWeight: 500, color: C.muted, textDecoration: 'none', padding: '6px 8px' }}>
              M5に合うペン
            </Link>
          </nav>
        </div>
      </header>

            <section
        style={{
          position: 'relative',
          minHeight: 'clamp(420px, 72vh, 560px)',
          display: 'flex',
          alignItems: 'center',
          borderBottom: bd,
          overflow: 'hidden',
        }}
      >
        <img
          src={heroSrc}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, rgba(250,247,242,0.94) 0%, rgba(250,247,242,0.78) 42%, rgba(250,247,242,0.2) 72%, transparent 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1040,
            margin: '0 auto',
            padding: 'clamp(48px,8vw,72px) clamp(20px,4vw,40px)',
            width: '100%',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', color: C.muted, margin: '0 0 14px' }}>
            FOR MICRO5 / M5
          </p>
          <h1 style={{ fontSize: 'clamp(28px,5.5vw,44px)', fontWeight: 800, lineHeight: 1.22, margin: 0, letterSpacing: '-0.02em', maxWidth: 520 }}>
            M5のための、
            <br />
            リフィルメーカー。
          </h1>
          <p style={{ fontSize: 'clamp(14px,2.2vw,16px)', color: C.muted, lineHeight: 1.75, margin: '20px 0 0', maxWidth: 460 }}>
            穴位置と書ける面を前提に、推しや手書きを62×105mmで印刷。
            デジタルは手段で、使うのはいつものアナログのM5。
          </p>
          <Link
            to="/refill-maker?size=microfive"
            style={{
              display: 'inline-flex',
              marginTop: 28,
              padding: '14px 28px',
              borderRadius: r,
              background: C.text,
              color: '#faf7f2',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(42,36,32,0.15)',
            }}
          >
            M5で作る →
          </Link>
        </div>
      </section>

      {/* M5で始める */}
      <section style={{ padding: 'clamp(40px,6vw,56px) clamp(16px,4vw,40px)', borderBottom: bd }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, margin: '0 0 10px' }}>まずはM5から</h2>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: '0 0 24px' }}>
            既製リフィルが少ない・穴で書ける面が減る・1mmが効く——このサービスは、その前提で作っています。
          </p>
          <Link
            to="/refill-maker?size=microfive"
            onMouseEnter={(e) => cardHover(e, true)}
            onMouseLeave={(e) => cardHover(e, false)}
            style={{
              textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 20,
              padding: '24px 22px', background: '#fff', border: bd, borderRadius: r,
              boxShadow: '0 1px 6px rgba(42,36,32,0.04)', transition: 'transform 0.18s, box-shadow 0.18s',
            }}
          >
            <RefillSilhouette w={62} h={105} scale={0.34} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>マイクロ5 <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>M5</span></div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>62 × 105 mm · 穴 5</div>
              <span style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 700, color: C.accent }}>このサイズで作る →</span>
            </div>
          </Link>
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

      <section style={{ padding: 'clamp(32px,5vw,44px) clamp(16px,4vw,40px)', borderBottom: bd }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => setShowOtherSizes((v) => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, padding: '14px 16px', background: 'transparent', border: bd, borderRadius: r,
              cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600, color: C.muted,
            }}
          >
            <span>M5以外をお使いの方（M6・バイブル・A5）</span>
            <span aria-hidden style={{ fontSize: 12 }}>{showOtherSizes ? '▲' : '▼'}</span>
          </button>
          {showOtherSizes && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginTop: 12 }}>
              {OTHER_SIZES.map((s) => (
                <Link key={s.id} to={`/refill-maker?size=${s.id}`} style={{
                  textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: '14px 10px',
                  background: '#fff', border: bd, borderRadius: r, fontSize: 13,
                }}>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  {s.shortName && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.shortName}</div>}
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.w}×{s.h}mm</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* フッター */}
      <footer style={{
        marginTop: 'auto', padding: '32px clamp(16px,4vw,40px) calc(28px + env(safe-area-inset-bottom, 0px))',
        background: C.bg, borderTop: bd, textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em' }}>RingCraft Lab</div>
        <p style={{ fontSize: 13, color: C.muted, margin: '8px 0 0' }}>M5のための、リフィルメーカー。</p>
        <p style={{ fontSize: 12, color: C.muted, margin: '12px 0 0' }}>
          <Link to="/pen-search" style={{ color: C.accent, textDecoration: 'none', fontWeight: 600 }}>M5に合うペンを探す</Link>
        </p>
        <p style={{ fontSize: 11, color: C.muted, margin: '14px 0 0', opacity: 0.7 }}>© 2025 RingCraft Lab</p>
      </footer>

    </div>
  );
}
