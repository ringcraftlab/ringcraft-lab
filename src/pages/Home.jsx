import { Link } from 'react-router-dom';

const C = {
  bg: '#ffffff',
  bgSub: '#f7f6f3',
  accent: '#5b7fa6',
  text: '#1c1c1c',
  muted: '#666666',
  border: '#efefef',
  silver: '#c4c9d0',
};

const font = 'system-ui, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif';
const r = 9;
const bd = `0.5px solid ${C.border}`;

const SIZE_CARDS = [
  { routeId: 'microfive', title: 'M5', mm: '62 × 105 mm', holes: '穴 5', ar: 62 / 105 },
  { routeId: 'mini6', title: 'M6', mm: '80 × 126 mm', holes: '穴 6', ar: 80 / 126 },
  { routeId: 'bible', title: 'バイブル', mm: '95 × 170 mm', holes: '穴 6', ar: 95 / 170 },
  { routeId: 'a5', title: 'A5', mm: '148 × 210 mm', holes: '穴 6', ar: 148 / 210 },
];

const STEPS = [
  {
    n: '01',
    title: 'サイズを選ぶ',
    desc: 'M5・M6・バイブル・A5から、使っている手帳に合わせる',
    Icon: IconStepSize,
  },
  {
    n: '02',
    title: '画像をアップロード',
    desc: '写真やスクショを枠に入れるだけ',
    Icon: IconStepUpload,
  },
  {
    n: '03',
    title: '印刷する',
    desc: 'A4に並んだ状態で印刷、すぐリングへ',
    Icon: IconStepPrint,
  },
];

const notebookBg = {
  backgroundColor: C.bg,
  backgroundImage: `
    linear-gradient(${C.border} 0.5px, transparent 0.5px),
    linear-gradient(90deg, ${C.border} 0.5px, transparent 0.5px),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 23px,
      rgba(91, 127, 166, 0.06) 23px,
      rgba(91, 127, 166, 0.06) 24px
    )
  `,
  backgroundSize: '24px 24px, 24px 24px, 100% 24px',
};

function NavBar() {
  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: C.text,
        textDecoration: 'none',
        padding: '8px 12px',
        borderRadius: r,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Link>
  );

  return (
    <header
      style={{
        padding: '14px clamp(16px, 4vw, 32px)',
        borderBottom: bd,
        background: C.bg,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: C.text,
            textDecoration: 'none',
          }}
        >
          RingCraft Lab
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLink('/refill-maker', 'リフィルメーカー')}
          {navLink('/pen-search', 'ペン検索')}
        </nav>
      </div>
    </header>
  );
}

function IconStepSize() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="4" width="14" height="16" rx="2" stroke={C.accent} strokeWidth="1.5" />
      <path d="M8 8h8M8 12h6" stroke={C.accent} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconStepUpload() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" stroke={C.accent} strokeWidth="1.5" />
      <path d="M12 15V9M9 11l3-3 3 3" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStepPrint() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9V5h12v4M6 15H4V9h16v6h-2" stroke={C.accent} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="6" y="15" width="12" height="4" rx="1" stroke={C.accent} strokeWidth="1.5" />
    </svg>
  );
}

function RefillSilhouette({ ar, w = 48 }) {
  const h = Math.round(w / ar);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ display: 'block', margin: '0 auto' }}>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx="3" fill="#fff" stroke={C.silver} strokeWidth="0.75" />
      <circle cx="5" cy={h * 0.22} r="1.8" fill={C.accent} opacity="0.55" />
      <circle cx="5" cy={h * 0.5} r="1.8" fill={C.accent} opacity="0.55" />
      <circle cx="5" cy={h * 0.78} r="1.8" fill={C.accent} opacity="0.55" />
      <rect x={w * 0.18} y={h * 0.15} width={w * 0.72} height={h * 0.28} rx="2" fill="rgba(91,127,166,0.08)" stroke="rgba(91,127,166,0.2)" strokeWidth="0.5" />
    </svg>
  );
}

/** A4上に実寸比で6〜8枚のリフィルが並ぶイメージ */
function HeroSheetIllustration() {
  const refills = [
    { x: 28, y: 36, w: 22, h: 37, holes: 2 },
    { x: 56, y: 36, w: 26, h: 41, holes: 2 },
    { x: 88, y: 36, w: 28, h: 50, holes: 2 },
    { x: 122, y: 36, w: 30, h: 53, holes: 2 },
    { x: 28, y: 88, w: 22, h: 37, holes: 2 },
    { x: 56, y: 88, w: 26, h: 41, holes: 2 },
    { x: 88, y: 88, w: 34, h: 48, holes: 2 },
    { x: 128, y: 88, w: 38, h: 54, holes: 2 },
  ];

  return (
    <svg
      viewBox="0 0 200 260"
      width="100%"
      style={{ maxWidth: 320, display: 'block' }}
      aria-hidden
    >
      <defs>
        <filter id="sheetShadow" x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.08" />
        </filter>
      </defs>
      <rect x="16" y="12" width="168" height="236" rx="6" fill="#fff" stroke={C.border} strokeWidth="1" filter="url(#sheetShadow)" />
      <text x="100" y="28" textAnchor="middle" fill={C.muted} fontSize="7" fontFamily={font}>
        A4 · 印刷プレビュー
      </text>
      {refills.map((item, i) => (
        <g key={i}>
          <rect
            x={item.x}
            y={item.y}
            width={item.w}
            height={item.h}
            rx="2"
            fill="#fafafa"
            stroke={C.silver}
            strokeWidth="0.75"
          />
          {Array.from({ length: item.holes }).map((_, hi) => (
            <circle
              key={hi}
              cx={item.x + 4}
              cy={item.y + item.h * (0.25 + hi * 0.5)}
              r="1.2"
              fill={C.accent}
              opacity="0.45"
            />
          ))}
          <rect
            x={item.x + 7}
            y={item.y + 5}
            width={item.w - 10}
            height={item.h * 0.35}
            rx="1"
            fill="rgba(91,127,166,0.1)"
          />
        </g>
      ))}
    </svg>
  );
}

function cardHoverHandlers(e, on) {
  const el = e.currentTarget;
  el.style.transform = on ? 'translateY(-2px)' : 'translateY(0)';
  el.style.boxShadow = on ? '0 12px 32px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)';
}

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: font,
        color: C.text,
        background: C.bg,
      }}
    >
      <NavBar />

      {/* ヒーロー */}
      <section style={{ ...notebookBg, borderBottom: bd }}>
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            padding: 'clamp(32px, 7vw, 64px) clamp(16px, 4vw, 32px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(28px, 5vw, 48px)',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'clamp(28px, 6vw, 42px)',
                fontWeight: 800,
                lineHeight: 1.25,
                margin: 0,
                letterSpacing: '-0.02em',
                maxWidth: 440,
              }}
            >
              好きな手帳に、
              <br />
              好きなリフィルを。
            </h1>
            <p
              style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                color: C.muted,
                lineHeight: 1.75,
                margin: '18px 0 0',
                maxWidth: 420,
              }}
            >
              スクリーンショットを選ぶだけで、リフィルが完成。印刷してすぐ使える。
            </p>
            <p
              style={{
                fontSize: 13,
                color: C.muted,
                lineHeight: 1.65,
                margin: '12px 0 0',
                maxWidth: 420,
                opacity: 0.9,
              }}
            >
              リフィルを自分で作って、合うペンを見つける。手帳沼の困りごとを、ここで解決。
            </p>
            <Link
              to="/refill-maker"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 28,
                padding: '16px 32px',
                borderRadius: r,
                background: C.accent,
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(91, 127, 166, 0.35)',
                border: bd,
              }}
            >
              リフィルを作る →
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <HeroSheetIllustration />
          </div>
        </div>
      </section>

      {/* 3ステップ */}
      <section style={{ background: C.bgSub, borderBottom: bd }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(40px, 7vw, 56px) clamp(16px, 4vw, 32px)' }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, margin: '0 0 28px', textAlign: 'center' }}>
            3ステップで完成
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20,
            }}
          >
            {STEPS.map((step) => (
              <div
                key={step.n}
                style={{
                  background: C.bg,
                  border: bd,
                  borderRadius: r,
                  padding: '22px 18px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'rgba(91, 127, 166, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  <step.Icon />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '0.12em' }}>{step.n}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>{step.title}</div>
                <p style={{ fontSize: 13, color: C.muted, margin: '8px 0 0', lineHeight: 1.55 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* サイズ選択 */}
      <section id="sizes" style={{ padding: 'clamp(40px, 7vw, 56px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, margin: '0 0 8px' }}>
            使っている手帳サイズから始める
          </h2>
          <p style={{ fontSize: 14, color: C.muted, margin: '0 0 24px', lineHeight: 1.5 }}>
            M5・M6・バイブル・A5 — 穴位置はプリセット済みです。
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))',
              gap: 14,
            }}
          >
            {SIZE_CARDS.map((s) => (
              <Link
                key={s.routeId}
                to={`/refill-maker?size=${s.routeId}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  background: C.bg,
                  border: bd,
                  borderRadius: r,
                  padding: '20px 16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => cardHoverHandlers(e, true)}
                onMouseLeave={(e) => cardHoverHandlers(e, false)}
              >
                <RefillSilhouette ar={s.ar} w={s.title === 'A5' ? 40 : s.title === 'バイブル' ? 36 : 44} />
                <div style={{ fontSize: 17, fontWeight: 800, marginTop: 14 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{s.mm}</div>
                <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginTop: 4 }}>{s.holes}</div>
                <span
                  style={{
                    marginTop: 16,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.accent,
                    border: `0.5px solid ${C.accent}`,
                    padding: '8px 14px',
                    borderRadius: r,
                  }}
                >
                  このサイズで作る →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ツール紹介 */}
      <section style={{ background: C.bgSub, borderTop: bd, borderBottom: bd, padding: 'clamp(40px, 7vw, 56px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, margin: '0 0 24px' }}>
            RingCraft Labでできること
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
              alignItems: 'stretch',
            }}
          >
            <Link
              to="/refill-maker"
              style={{
                gridColumn: 'span 1',
                textDecoration: 'none',
                color: 'inherit',
                background: C.bg,
                border: bd,
                borderRadius: r,
                padding: '28px 24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 200,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => cardHoverHandlers(e, true)}
              onMouseLeave={(e) => cardHoverHandlers(e, false)}
            >
              <motionWrap
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: C.accent,
                  marginBottom: 10,
                }}
              >
                MAIN
              </motionWrap>
              <motionWrap style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>リフィルメーカー</motionWrap>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: '12px 0 0', flex: 1 }}>
                売っていないデザインも、好きな画像でリフィルに。サイズと穴あけ位置を選び、A4に並べて印刷できます。
              </p>
              <span
                style={{
                  marginTop: 20,
                  display: 'inline-flex',
                  alignSelf: 'flex-start',
                  padding: '12px 22px',
                  background: C.accent,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: r,
                }}
              >
                作り始める →
              </span>
            </Link>

            <Link
              to="/pen-search"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                background: C.bg,
                border: bd,
                borderRadius: r,
                padding: '22px 20px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => cardHoverHandlers(e, true)}
              onMouseLeave={(e) => cardHoverHandlers(e, false)}
            >
              <motionWrap style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8 }}>SUB</motionWrap>
              <motionWrap style={{ fontSize: 17, fontWeight: 800 }}>コンパクトペン検索</motionWrap>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '10px 0 0', flex: 1 }}>
                手帳に合う短いペンを、長さ・ブランドから探せます。
              </p>
              <span style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: C.accent }}>
                ペンを探す →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '36px clamp(16px, 4vw, 32px) calc(28px + env(safe-area-inset-bottom, 0px))',
          background: C.bg,
          borderTop: bd,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.06em' }}>RingCraft Lab</div>
        <p style={{ fontSize: 14, color: C.muted, margin: '10px 0 0', fontWeight: 500 }}>
          好きな手帳に、好きなリフィルを。
        </p>
        <p style={{ fontSize: 12, color: C.muted, margin: '16px 0 0', opacity: 0.85 }}>
          © 2025 RingCraft Lab
        </p>
      </footer>
    </div>
  );
}
