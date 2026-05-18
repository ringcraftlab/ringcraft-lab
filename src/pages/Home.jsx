import { Link } from 'react-router-dom';
import { T } from '../theme/appTheme';

const heroSrc = `${import.meta.env.BASE_URL}hero-desk.jpg`;

const C = {
  bg: '#faf7f2',
  ink: '#3d2f1f',
  muted: '#9c7d5e',
  border: '#e0d9cf',
  link: '#a07850',
};

const font = T.font;
const bd = `1px solid ${C.border}`;

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
    to: '/tool',
    title: 'リフィルコラージュ',
    desc: '画像をリフィルに並べて、A4で印刷。',
    primary: true,
    Icon: IcoCollage,
  },
  /*
  {
    to: '/pen-search',
    title: 'ペンを探す',
    desc: 'M5に合うコンパクトなペンを探す。',
    primary: false,
    Icon: IcoPen,
  },
  */
  {
    title: 'おすすめ手帳関連グッズ',
    desc: 'ペン、手帳、リフィル、万年筆など。',
    primary: false,
    comingSoon: true,
    Icon: IcoPen,
  },
];

export default function Home() {
  return (
    <div className="home-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: C.ink, background: C.bg }}>

      <header style={{ padding: '14px clamp(20px,4vw,48px)', borderBottom: bd, background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 500, color: C.ink, textDecoration: 'none' }}>
            <span
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.ink,
                color: '#f5ede0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7 4h9.5A2.5 2.5 0 0 1 19 6.5v13A1.5 1.5 0 0 1 17.5 21H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" />
                <path d="M8.5 4v17M11 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            RingCraft Lab
          </Link>
        </div>
      </header>

      <section className="home-hero" style={{ flex: 1, background: C.bg }}>
        <div className="home-hero__visual">
          <h2 className="home-hero__photo-title">
            <span className="home-hero__photo-title-line">手帳のリフィルを、</span>
            <span className="home-hero__photo-title-line home-hero__photo-title-line--sub">もっと簡単に。</span>
          </h2>
          <div className="home-hero__photo">
            <img src={heroSrc} alt="机の上の手帳と文具" />
          </div>
        </div>

        <div className="home-hero__panel">
          <div className="home-copy">
            <p className="home-copy__stanza">
              画像を並べて、A4で印刷。
              <br />
              M5・M5スクエア・M6・バイブルに対応。
            </p>
            <p className="home-copy__closing">
              手帳づくりの時間を、少しだけ心地よく。
            </p>
          </div>

          <div className="home-hero-tools">
            {TOOL_CARDS.map((t) => {
              const Icon = t.Icon;
              return (
                t.to ? (
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
                  <div className="home-hero-tool-card__body">
                    <h3 className="home-hero-tool-card__title">{t.title}</h3>
                    <p className="home-hero-tool-card__desc">{t.desc}</p>
                  </div>
                  <span className="home-hero-tool-card__hint">→</span>
                </Link>
                ) : (
                <div
                  key={t.title}
                  className="home-hero-tool-card home-hero-tool-card--disabled"
                  aria-disabled="true"
                >
                  <div className="home-hero-tool-card__icon-wrap">
                    <Icon className="home-hero-tool-card__icon" />
                  </div>
                  <div className="home-hero-tool-card__body">
                    <h3 className="home-hero-tool-card__title">{t.title}</h3>
                    <p className="home-hero-tool-card__desc">{t.desc}</p>
                  </div>
                  <span className="home-hero-tool-card__badge">準備中</span>
                </div>
                )
              );
            })}
          </div>
        </div>
      </section>

      <footer style={{ padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))', borderTop: bd }}>
        <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', margin: 0, opacity: 0.85 }}>
          © RingCraft Lab
        </p>
      </footer>
    </div>
  );
}
