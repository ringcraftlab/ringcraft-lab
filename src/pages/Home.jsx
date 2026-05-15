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

const ACTIONS = [
  { to: '/refill-maker?size=microfive', label: 'リフィルを作る', primary: true },
  { to: '/pen-search', label: 'ペンを探す', primary: false },
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

          <div className="home-cta-grid">
            {ACTIONS.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className={a.primary ? 'home-cta-btn home-cta-btn--primary' : 'home-cta-btn'}
              >
                {a.label}
              </Link>
            ))}
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
