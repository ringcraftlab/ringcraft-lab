import { Link } from 'react-router-dom';
import { SIZES } from '../config/sizes';
import { T } from '../theme/appTheme';

const heroSrc = `${import.meta.env.BASE_URL}hero-desk.jpg`;

const C = {
  bg: '#faf7f2',
  ink: '#2a2420',
  muted: '#6b635c',
  border: '#e8e2d9',
  link: '#4a5f78',
};

const font = T.font;
const bd = `0.5px solid ${C.border}`;

const OTHER_SIZES = SIZES.filter((s) => s.id !== 'microfive' && s.id !== 'custom');

/** 写真を並べるイメージ（2×2グリッド） */
function IcoCollage({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="2.5" width="9" height="9" rx="1.75" />
        <rect x="12.5" y="2.5" width="9" height="9" rx="1.75" />
        <rect x="2.5" y="12.5" width="9" height="9" rx="1.75" />
        <rect x="12.5" y="12.5" width="9" height="9" rx="1.75" />
      </g>
    </svg>
  );
}

function IcoPen({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.8 4.2L19.8 9.2c.6.6.6 1.5 0 2.1L10.5 20.6H5.3v-5.2L14.8 4.2z" />
        <path d="M12.5 6.5l5 5" opacity="0.9" />
      </g>
    </svg>
  );
}

const TOOL_CARDS = [
  {
    to: '/refill-maker?size=microfive',
    title: 'リフィルコラージュ',
    desc: '写真やスクショをリフィルに並べ、A4で印刷。',
    primary: true,
    Icon: IcoCollage,
  },
  {
    to: '/pen-search',
    title: 'ペンを探す',
    desc: 'M5に合うコンパクトなペンを探す。',
    primary: false,
    Icon: IcoPen,
  },
];

export default function Home() {
  return (
    <div className="home-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: C.ink, background: C.bg }}>

      <header style={{ padding: '16px clamp(20px,4vw,48px) 12px', borderBottom: bd }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Link to="/" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', color: C.ink, textDecoration: 'none' }}>
            RingCraft Lab
          </Link>
        </div>
      </header>

      <section className="home-hero" style={{ flex: 1, background: C.bg }}>
        <div className="home-hero__visual">
          <h2 className="home-hero__photo-title">
            <span className="home-hero__photo-title-line">M5手帳、大好き。</span>
            <span className="home-hero__photo-title-line home-hero__photo-title-line--sub">そんなあなたへ。</span>
          </h2>
          <div className="home-hero__photo">
            <img src={heroSrc} alt="机の上のM5手帳と文具" />
          </div>
        </div>

        <div className="home-hero__panel">
          <div className="home-copy">
            <p className="home-copy__stanza">
              小さくて、かわいい相棒。
              <br />
              気づくと、いつもそばにいる。
            </p>
            <p className="home-copy__stanza">
              お気に入りの紙、お気に入りの写真、お気に入りのペン。
              <br />
              好きなものを、そっと持ち歩く。
            </p>
            <p className="home-copy__closing">
              そのこだわりの、助けになれたらうれしい。
            </p>
          </div>

          <div className="home-hero-tools">
            {TOOL_CARDS.map((t) => {
              const Icon = t.Icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={t.primary ? 'home-hero-tool-card home-hero-tool-card--primary' : 'home-hero-tool-card'}
                >
                  <div
                    className={
                      t.primary
                        ? 'home-hero-tool-card__icon-wrap home-hero-tool-card__icon-wrap--primary'
                        : 'home-hero-tool-card__icon-wrap'
                    }
                  >
                    <Icon className="home-hero-tool-card__icon" />
                  </div>
                  <h3 className="home-hero-tool-card__title">{t.title}</h3>
                  <p className="home-hero-tool-card__desc">{t.desc}</p>
                  <span className="home-hero-tool-card__hint">開く</span>
                </Link>
              );
            })}
          </div>

          <p className="home-other-sizes">
            リフィルは M6・バイブル・A5 にも対応。
            {OTHER_SIZES.map((s, i) => (
              <span key={s.id}>
                {i === 0 ? ' ' : ' · '}
                <Link to={`/refill-maker?size=${s.id}`}>{s.name}</Link>
              </span>
            ))}
          </p>
        </div>
      </section>

      <footer style={{ padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))', borderTop: bd }}>
        <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', margin: 0, opacity: 0.75 }}>
          © 2025 RingCraft Lab
        </p>
      </footer>
    </div>
  );
}
