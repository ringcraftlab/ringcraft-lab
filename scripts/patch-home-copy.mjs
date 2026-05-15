import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const jsx = `import { Link } from 'react-router-dom';
import { SIZES } from '../config/sizes';
import { T } from '../theme/appTheme';

const heroSrc = \`\${import.meta.env.BASE_URL}hero-desk.jpg\`;

const C = {
  bg: '#faf7f2',
  ink: '#2a2420',
  muted: '#6b635c',
  border: '#e8e2d9',
  link: '#4a5f78',
};

const font = T.font;
const bd = \`0.5px solid \${C.border}\`;

const OTHER_SIZES = SIZES.filter((s) => s.id !== 'microfive' && s.id !== 'custom');

const ACTIONS = [
  { to: '/refill-maker?size=microfive', label: '\u30ea\u30d5\u30a3\u30eb\u3092\u4f5c\u308b', primary: true },
  { to: '/pen-search', label: '\u30da\u30f3\u3092\u63a2\u3059', primary: false },
];

export default function Home() {
  return (
    <motionWrap className="home-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: C.ink, background: C.bg }}>

      <header style={{ padding: '16px clamp(20px,4vw,48px) 12px', borderBottom: bd }}>
        <motionWrap style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Link to="/" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', color: C.ink, textDecoration: 'none' }}>
            RingCraft Lab
          </Link>
        </motionWrap>
      </header>

      <section className="home-hero" style={{ flex: 1, background: C.bg }}>
        <motionWrap className="home-hero__visual">
          <h2 className="home-hero__photo-title">
            <span className="home-hero__photo-title-line">M5\u624b\u5e33\u3001\u5927\u597d\u304d\u3002</span>
            <span className="home-hero__photo-title-line home-hero__photo-title-line--sub">\u305d\u3093\u306a\u3042\u306a\u305f\u3078\u3002</span>
          </h2>
          <motionWrap className="home-hero__photo">
            <img src={heroSrc} alt="\u673a\u306e\u4e0a\u306eM5\u624b\u5e33\u3068\u6587\u5177" />
          </motionWrap>
        </motionWrap>

        <motionWrap className="home-hero__panel">
          <motionWrap className="home-copy">
            <p className="home-copy__stanza">
              \u5c0f\u3055\u304f\u3066\u3001\u304b\u308f\u3044\u3044\u76f8\u68d2\u3002
              <br />
              \u6c17\u3065\u304f\u3068\u3001\u3044\u3064\u3082\u305d\u3070\u306b\u3044\u308b\u3002
            </p>
            <p className="home-copy__stanza">
              \u304a\u6c17\u306b\u5165\u308a\u306e\u7d19\u3001\u304a\u6c17\u306b\u5165\u308a\u306e\u5199\u771f\u3001\u304a\u6c17\u306b\u5165\u308a\u306e\u30da\u30f3\u3002
              <br />
              \u597d\u304d\u306a\u3082\u306e\u3092\u3001\u305d\u3063\u3068\u6301\u3061\u6b69\u304f\u3002
            </p>
            <p className="home-copy__closing">
              \u305d\u306e\u3053\u3060\u308f\u308a\u306e\u3001\u52a9\u3051\u306b\u306a\u308c\u305f\u3089\u3046\u308c\u3057\u3044\u3002
            </p>
          </motionWrap>

          <motionWrap className="home-cta-grid">
            {ACTIONS.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className={a.primary ? 'home-cta-btn home-cta-btn--primary' : 'home-cta-btn'}
              >
                {a.label}
              </Link>
            ))}
          </motionWrap>

          <p className="home-other-sizes">
            \u30ea\u30d5\u30a3\u30eb\u306f M6\u30fb\u30d0\u30a4\u30d6\u30eb\u30fbA5 \u306b\u3082\u5bfe\u5fdc\u3002
            {OTHER_SIZES.map((s, i) => (
              <span key={s.id}>
                {i === 0 ? ' ' : ' \u00b7 '}
                <Link to={\`/refill-maker?size=\${s.id}\`}>{s.name}</Link>
              </span>
            ))}
          </p>
        </motionWrap>
      </section>

      <footer style={{ padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))', borderTop: bd }}>
        <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', margin: 0, opacity: 0.75 }}>
          \u00a9 2025 RingCraft Lab
        </p>
      </footer>
    </motionWrap>
  );
}
`;

writeFileSync(
  join(root, 'src/pages/Home.jsx'),
  jsx.replaceAll('motionWrap', 'div'),
  'utf8',
);
console.log('patched Home.jsx');
