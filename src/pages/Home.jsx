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

const FRAGMENTS = [
  'M5は小さい。だから1mmが大事。',
  '切るの面倒だから、作った。',
  'あと2mm入らない。',
  'このサイズに収めたい。',
];

const TOOLS = [
  { hint: '紙が足りない。', label: 'リフィルを作る', to: '/refill-maker?size=microfive' },
  { hint: 'あと2mm入らない。', label: 'ペンを探す', to: '/pen-search' },
];

export default function Home() {
  return (
    <div className="home-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: C.ink, background: C.bg }}>

      <header style={{ padding: '16px clamp(20px,4vw,40px) 12px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link to="/" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', color: C.ink, textDecoration: 'none' }}>
            RingCraft Lab
          </Link>
        </div>
      </header>

      <section className="home-hero" style={{ borderBottom: bd, overflow: 'hidden', background: C.bg }}>
        <div className="home-hero__text">
          {FRAGMENTS.map((line) => (
            <p
              key={line}
              style={{
                fontSize: 'clamp(15px,2.2vw,17px)',
                lineHeight: 1.65,
                margin: '0 0 6px',
                fontWeight: 500,
                letterSpacing: '0.02em',
                color: C.ink,
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="home-hero__photo">
          <img src={heroSrc} alt="机の上の手帳と文具" />
          <div className="home-hero__photo-fade" aria-hidden />
        </div>
      </section>

      <main style={{ flex: 1, padding: 'clamp(32px,5vw,48px) clamp(20px,4vw,40px) clamp(40px,7vw,64px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: C.muted, margin: '0 0 12px' }}>
            サイズも穴も書ける面も、少しずつシビア。
            <br />
            でも、毎日使っている。
            <br />
            <span style={{ color: C.ink }}>このサイトの話は、だいたいM5の話。</span>
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: C.muted, margin: '0 0 40px', fontStyle: 'italic' }}>
            M5って、なんか増える。M5の分はノーカン。
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'clamp(20px,4vw,28px)',
              paddingTop: 8,
              borderTop: bd,
            }}
          >
            {TOOLS.map((t) => (
              <div key={t.to}>
                <p style={{ fontSize: 14, color: C.muted, margin: '0 0 12px', lineHeight: 1.6 }}>{t.hint}</p>
                <Link to={t.to} className="home-tool-btn">
                  {t.label}
                </Link>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, margin: '56px 0 0', opacity: 0.9 }}>
            M6・バイブル・A5もある。
            {OTHER_SIZES.map((s, i) => (
              <span key={s.id}>
                {i === 0 ? ' ' : ' · '}
                <Link to={`/refill-maker?size=${s.id}`} style={{ color: C.link, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  {s.name}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </main>

      <footer style={{ padding: '32px 20px calc(28px + env(safe-area-inset-bottom, 0px))', borderTop: bd }}>
        <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', margin: 0, opacity: 0.75 }}>
          © 2025 RingCraft Lab
        </p>
      </footer>
    </div>
  );
}
