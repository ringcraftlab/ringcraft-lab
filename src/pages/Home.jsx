import { Link } from 'react-router-dom';
import { T } from '../theme/appTheme';

const border = '#efefef';
const silver = '#c4c9d0';
const font = T.font;

const r = 9;
const bd = `0.5px solid ${border}`;

/** 手帳・リフィル用紙風（罫線＋左マージン） */
const refillPaperBg = {
  backgroundColor: '#faf7f1',
  backgroundImage: `
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 26px,
      rgba(91, 127, 166, 0.075) 26px,
      rgba(91, 127, 166, 0.075) 27px
    ),
    linear-gradient(
      90deg,
      transparent 0,
      transparent 32px,
      rgba(232, 120, 120, 0.13) 32px,
      rgba(232, 120, 120, 0.13) 33px,
      transparent 33px
    ),
    radial-gradient(ellipse 110% 55% at 50% 0%, rgba(91, 127, 166, 0.06), transparent 52%)
  `,
};

/** 4サイズ → リフィルメーカー preset id */
const SIZE_CARDS = [
  { routeId: 'microfive', title: 'M5', line: '62×105mm · 穴5', blurb: '最小リング用の定番サイズ。', ar: 62 / 105 },
  { routeId: 'mini6', title: 'M6', line: '80×126mm · 穴6', blurb: 'ミニ6穴。ポケット手帳向け。', ar: 80 / 126 },
  { routeId: 'bible', title: 'バイブル', line: '95×170mm · 穴6', blurb: 'バイブル変形。余白多め。', ar: 95 / 170 },
  { routeId: 'a5', title: 'A5', line: '148×210mm · 穴6', blurb: 'A5スリム系のリフィル幅。', ar: 148 / 210 },
];

function NavBar() {
  const link = (to, label, primary) => (
    <Link
      to={to}
      style={{
        fontSize: 13,
        fontWeight: primary ? 700 : 500,
        color: primary ? T.primary : T.ink,
        textDecoration: 'none',
        padding: '6px 10px',
        borderRadius: r,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        padding: '12px clamp(14px, 4vw, 28px)',
        background: 'rgba(250, 247, 241, 0.88)',
        backdropFilter: 'blur(10px)',
        borderBottom: bd,
      }}
    >
      <Link to="/" style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', color: T.ink, textDecoration: 'none' }}>
        RingCraft Lab
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {link('/', 'トップ', false)}
        {link('/refill-maker', 'リフィルメーカー', true)}
        {link('/pen-search', 'ペン検索', false)}
        <span style={{ fontSize: 12, color: T.muted, padding: '6px 8px', cursor: 'default' }} title="追加ツール予定">
          他ツール…
        </span>
      </div>
    </nav>
  );
}

function Silhouette({ ar }) {
  const h = 72;
  const w = Math.min(56, Math.round(h * ar));
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        border: `0.5px solid ${silver}`,
        background: 'linear-gradient(180deg, #fff 0%, #f0f1f3 100%)',
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.8)',
        margin: '0 auto 12px',
      }}
    />
  );
}

/** 虫眼鏡＋ペンシルで「検索できそう」なアイコン */
function IconPenSearch() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.25" stroke={T.primary} strokeWidth="2" />
      <path d="M15.2 15.2L20 20" stroke={T.primary} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7 17l3-8 5 5-8 3z" fill="rgba(91,127,166,0.2)" stroke={T.primary} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9.5 14.5l2 2" stroke={T.primary} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function PenSearchCircleLink({ emphasize }) {
  const dim = emphasize ? 62 : 54;
  return (
    <Link
      to="/pen-search"
      aria-label="コンパクトペンを条件検索"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        textDecoration: 'none',
        color: 'inherit',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: dim,
          height: dim,
          borderRadius: '50%',
          border: emphasize ? `2.5px solid ${T.primary}` : `2px solid ${T.primary}`,
          background: emphasize ? 'rgba(91, 127, 166, 0.14)' : 'rgba(91, 127, 166, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: emphasize ? '0 6px 22px rgba(91, 127, 166, 0.35)' : '0 3px 14px rgba(91, 127, 166, 0.2)',
        }}
      >
        <IconPenSearch />
      </span>
      <span style={{ fontSize: emphasize ? 12 : 11, fontWeight: 700, color: T.primary, letterSpacing: '0.02em' }}>ペンを探す</span>
    </Link>
  );
}

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: T.ink, ...refillPaperBg }}>
      <NavBar />

      {/* 1. ヒーロー */}
      <section
        style={{
          padding: 'clamp(28px, 6vw, 56px) clamp(16px, 4vw, 32px) clamp(32px, 6vw, 48px)',
          borderBottom: bd,
        }}
      >
        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
          }}
        >
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: T.primary, margin: '0 0 12px 0' }}>SYSTEM REFILL</p>
            <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 800, lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em' }}>
              手帳沼、もっと楽しく。
            </h1>
            <p style={{ fontSize: 'clamp(15px, 2.4vw, 17px)', color: T.muted, marginTop: 16, lineHeight: 1.65, fontWeight: 500, maxWidth: 480 }}>
              スクリーンショットを選ぶだけで、リフィルが完成。印刷してすぐ使える。
            </p>
            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
              <Link
                to="/refill-maker"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 28px',
                  borderRadius: r,
                  background: T.ink,
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
                  border: bd,
                }}
              >
                リフィルを作る →
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px 22px' }}>
                <a href="#sizes" style={{ fontSize: 13, color: T.primary, fontWeight: 600, textDecoration: 'none', borderBottom: `1px solid ${T.primary}` }}>
                  サイズから選ぶ
                </a>
                <PenSearchCircleLink emphasize />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. サイズ選択 */}
      <section id="sizes" style={{ padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, margin: '0 0 8px 0' }}>サイズを選んで、すぐ作れる</h2>
          <p style={{ fontSize: 14, color: T.muted, margin: '0 0 24px 0', maxWidth: 480 }}>M5〜A5の主要穴をプリセット済み。カードからそのまま編集画面へ。</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            {SIZE_CARDS.map((s) => (
              <Link
                key={s.routeId}
                to={`/refill-maker?size=${s.routeId}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: r,
                  border: bd,
                  background: '#fff',
                  padding: '18px 14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                }}
              >
                <Silhouette ar={s.ar} />
                <div style={{ fontSize: 16, fontWeight: 800 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 6, textAlign: 'center', lineHeight: 1.35 }}>{s.line}</div>
                <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 8, textAlign: 'center', lineHeight: 1.4, minHeight: '2.8em' }}>{s.blurb}</div>
                <span
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#fff',
                    background: T.primary,
                    padding: '8px 18px',
                    borderRadius: r,
                  }}
                >
                  作る
                </span>
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 20 }}>
            <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.55, flex: '1 1 200px' }}>
              コンパクトなペンを長さやブランドから探す
            </p>
            <PenSearchCircleLink emphasize={false} />
          </div>
        </div>
      </section>
      {/* 3. 流れ（説明のみ） */}
      <section style={{ padding: '0 clamp(16px, 4vw, 32px) clamp(48px, 8vw, 72px)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0' }}>作るまでの流れ</h2>
          <p style={{ fontSize: 13, color: T.muted, margin: '0 0 18px 0', lineHeight: 1.5 }}>
            リフィルメーカーで行う作業の流れの目安です。
          </p>
          <div style={{ maxWidth: 520, borderLeft: `3px solid ${T.primary}`, paddingLeft: 16 }}>
            {[
              { t: 'サイズを選ぶ', d: '上のサイズカード、または上部ナビ・ヒーローの「リフィルメーカー」から開き、M5〜A5のプリセットを選びます。' },
              { t: '画像を入れる', d: '枠をタップして写真やスクショを配置します。' },
              { t: '印刷またはPDF', d: '並びを確認してから、印刷またはPDFで保存します。' },
            ].map((x, i) => (
              <div key={x.t} style={{ marginBottom: i < 2 ? 16 : 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>
                  {i + 1}. {x.t}
                </div>
                <p style={{ fontSize: 13, color: T.muted, margin: '6px 0 0 0', lineHeight: 1.55 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '28px clamp(16px, 4vw, 32px) calc(24px + env(safe-area-inset-bottom, 0px))',
          borderTop: bd,
          background: '#fff',
        }}
      >
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.12em', color: T.ink }}>RingCraft Lab</div>
          <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>© {year} RingCraft Lab</p>
        </div>
      </footer>
    </div>
  );
}
