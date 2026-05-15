import { Link } from 'react-router-dom';

const accent = '#5b7fa6';
const ink = '#2c2925';
const inkMuted = '#6b6560';
const paper = '#fffefb';
const cream = '#f7f4ee';
const font = 'system-ui, "Segoe UI", Roboto, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif';

/** 手帳罫線風ヒーロー背景（インラインのみ） */
const heroBg = {
  backgroundColor: '#faf7f1',
  backgroundImage: `
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 26px,
      rgba(91, 127, 166, 0.07) 26px,
      rgba(91, 127, 166, 0.07) 27px
    ),
    linear-gradient(
      90deg,
      transparent 0,
      transparent 32px,
      rgba(232, 120, 120, 0.14) 32px,
      rgba(232, 120, 120, 0.14) 33px,
      transparent 33px
    ),
    radial-gradient(ellipse 120% 80% at 100% 0%, rgba(91, 127, 166, 0.08), transparent 55%),
    radial-gradient(ellipse 100% 60% at 0% 100%, rgba(255, 200, 160, 0.12), transparent 50%)
  `,
  backgroundBlendMode: 'normal, normal, soft-light, soft-light',
};

const cardLift = {
  transition: 'transform 0.22s ease, box-shadow 0.22s ease',
};

function IconRefill() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <rect x="10" y="8" width="28" height="32" rx="3" stroke={accent} strokeWidth="1.5" fill={paper} />
      <path d="M16 16h16M16 22h12M16 28h14" stroke={accent} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
      <circle cx="34" cy="14" r="3" fill={accent} opacity="0.25" />
    </svg>
  );
}

function IconPenSearch() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M14 32l16-16 6 6-16 16H14v-6z" stroke={accent} strokeWidth="1.5" fill={paper} />
      <path d="M28 18l4 4" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="19" cy="19" r="6" stroke={accent} strokeWidth="1.2" opacity="0.35" />
    </svg>
  );
}

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: font,
        color: ink,
        background: cream,
      }}
    >
      {/* ヒーロー */}
      <header style={{ ...heroBg, padding: 'clamp(40px, 8vw, 72px) clamp(20px, 5vw, 48px) clamp(36px, 6vw, 56px)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.28em',
              color: accent,
              margin: '0 0 14px 0',
              textTransform: 'uppercase',
            }}
          >
            RingCraft Lab
          </p>
          <h1
            style={{
              fontSize: 'clamp(26px, 5vw, 38px)',
              fontWeight: 700,
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: '0.02em',
            }}
          >
            手帳沼、もっと楽しく。
          </h1>
          <p
            style={{
              fontSize: 'clamp(15px, 2.4vw, 17px)',
              color: inkMuted,
              marginTop: 16,
              lineHeight: 1.75,
              fontWeight: 500,
            }}
          >
            システム手帳好きのためのツール集
          </p>
        </div>
      </header>

      {/* ツールカード */}
      <main style={{ flex: 1, padding: '0 clamp(18px, 4vw, 32px) 48px' }}>
        <div
          style={{
            maxWidth: 920,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 22,
          }}
        >
          {/* リフィルメーカー */}
          <article
            style={{
              background: paper,
              borderRadius: 18,
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 24px rgba(45, 55, 72, 0.06)',
              padding: '28px 24px 26px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              ...cardLift,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(91, 127, 166, 0.14)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(45, 55, 72, 0.06)';
            }}
          >
            <IconRefill />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '18px 0 8px 0', letterSpacing: '0.02em' }}>リフィルメーカー</h2>
            <p style={{ fontSize: 14, color: inkMuted, lineHeight: 1.7, margin: 0, flex: 1 }}>
              スクリーンショットや画像を並べて、A4に収まる形で印刷。リフィルサイズや穴の位置も整えられます。
            </p>
            <Link
              to="/refill-maker"
              style={{
                marginTop: 22,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 22px',
                borderRadius: 999,
                background: accent,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(91, 127, 166, 0.35)',
                ...cardLift,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.05)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              はじめる
            </Link>
          </article>

          {/* ペン検索 */}
          <article
            style={{
              background: paper,
              borderRadius: 18,
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 24px rgba(45, 55, 72, 0.06)',
              padding: '28px 24px 26px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              ...cardLift,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(91, 127, 166, 0.14)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(45, 55, 72, 0.06)';
            }}
          >
            <IconPenSearch />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '18px 0 8px 0', letterSpacing: '0.02em' }}>ペン検索</h2>
            <p style={{ fontSize: 14, color: inkMuted, lineHeight: 1.7, margin: 0, flex: 1 }}>
              全長130mm以下のコンパクトペンを、ブランドや長さなどの条件からさっと絞り込み。
            </p>
            <Link
              to="/pens"
              style={{
                marginTop: 22,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 22px',
                borderRadius: 999,
                background: accent,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(91, 127, 166, 0.35)',
                ...cardLift,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.05)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              はじめる
            </Link>
          </article>
        </div>
      </main>

      <footer
        style={{
          padding: '24px 20px calc(28px + env(safe-area-inset-bottom, 0px))',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: '#a39e96',
        }}
      >
        RingCraft Lab
      </footer>
    </div>
  );
}
