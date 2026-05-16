import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const jsx = `import { Link } from 'react-router-dom';
import { T } from '../theme/appTheme';

const heroSrc = \`\${import.meta.env.BASE_URL}hero-desk.jpg\`;

const C = {
  bg: '#faf7f2',
  ink: '#3d2f1f',
  muted: '#9c7d5e',
  border: '#e0d9cf',
  link: '#a07850',
};

const font = T.font;
const bd = \`1px solid \${C.border}\`;

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
    title: '\u30ea\u30d5\u30a3\u30eb\u30b3\u30e9\u30fc\u30b8\u30e5',
    desc: '\u753b\u50cf\u3092\u30ea\u30d5\u30a3\u30eb\u306b\u4e26\u3079\u3066\u3001A4\u3067\u5370\u5237\u3002',
    primary: true,
    Icon: IcoCollage,
  },
  /*
  {
    to: '/pen-search',
    title: '\u30da\u30f3\u3092\u63a2\u3059',
    desc: 'M5\u306b\u5408\u3046\u30b3\u30f3\u30d1\u30af\u30c8\u306a\u30da\u30f3\u3092\u63a2\u3059\u3002',
    primary: false,
    Icon: IcoPen,
  },
  */
  {
    title: '\u304a\u3059\u3059\u3081\u624b\u5e33\u95a2\u9023\u30b0\u30c3\u30ba',
    desc: '\u30da\u30f3\u3001\u624b\u5e33\u3001\u30ea\u30d5\u30a3\u30eb\u3001\u4e07\u5e74\u7b46\u306a\u3069\u3002',
    primary: false,
    comingSoon: true,
    Icon: IcoPen,
  },
];

export default function Home() {
  return (
    <motionWrap className="home-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: C.ink, background: C.bg }}>

      <header style={{ padding: '14px clamp(20px,4vw,48px)', borderBottom: bd, background: '#fff' }}>
        <motionWrap style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
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
        </motionWrap>
      </header>

      <section className="home-hero" style={{ flex: 1, background: C.bg }}>
        <motionWrap className="home-hero__visual">
          <h2 className="home-hero__photo-title">
            <span className="home-hero__photo-title-line">\u624b\u5e33\u306e\u30ea\u30d5\u30a3\u30eb\u3092\u3001</span>
            <span className="home-hero__photo-title-line home-hero__photo-title-line--sub">\u3082\u3063\u3068\u7c21\u5358\u306b\u3002</span>
          </h2>
          <motionWrap className="home-hero__photo">
            <img src={heroSrc} alt="\u673a\u306e\u4e0a\u306e\u624b\u5e33\u3068\u6587\u5177" />
          </motionWrap>
        </motionWrap>

        <motionWrap className="home-hero__panel">
          <motionWrap className="home-copy">
            <p className="home-copy__stanza">
              \u753b\u50cf\u3092\u4e26\u3079\u3066\u3001A4\u3067\u5370\u5237\u3002
              <br />
              M5\u30fbM6\u30fb\u30d0\u30a4\u30d6\u30eb\u30fbA5\u306b\u5bfe\u5fdc\u3002
            </p>
            <p className="home-copy__closing">
              \u624b\u5e33\u3065\u304f\u308a\u306e\u6642\u9593\u3092\u3001\u5c11\u3057\u3060\u3051\u5fc3\u5730\u3088\u304f\u3002
            </p>
          </motionWrap>

          <motionWrap className="home-hero-tools">
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
                  <motionWrap className="home-hero-tool-card__body">
                    <h3 className="home-hero-tool-card__title">{t.title}</h3>
                    <p className="home-hero-tool-card__desc">{t.desc}</p>
                  </motionWrap>
                  <span className="home-hero-tool-card__hint">\u2192</span>
                </Link>
                ) : (
                <motionWrap
                  key={t.title}
                  className="home-hero-tool-card home-hero-tool-card--disabled"
                  aria-disabled="true"
                >
                  <motionWrap className="home-hero-tool-card__icon-wrap">
                    <Icon className="home-hero-tool-card__icon" />
                  </motionWrap>
                  <motionWrap className="home-hero-tool-card__body">
                    <h3 className="home-hero-tool-card__title">{t.title}</h3>
                    <p className="home-hero-tool-card__desc">{t.desc}</p>
                  </motionWrap>
                  <span className="home-hero-tool-card__badge">\u6e96\u5099\u4e2d</span>
                </motionWrap>
                )
              );
            })}
          </motionWrap>
        </motionWrap>
      </section>

      <footer style={{ padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))', borderTop: bd }}>
        <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', margin: 0, opacity: 0.85 }}>
          \u00a9 RingCraft Lab
          <span style={{ margin: '0 8px' }}>\u00b7</span>
          <Link to="/tool" style={{ color: C.muted, textDecoration: 'none' }}>\u30ea\u30d5\u30a3\u30eb\u30b3\u30e9\u30fc\u30b8\u30e5</Link>
          <span style={{ margin: '0 8px' }}>\u00b7</span>
          <Link to="/goods" style={{ color: C.muted, textDecoration: 'none' }}>\u30b0\u30c3\u30ba\uff08\u6e96\u5099\u4e2d\uff09</Link>
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
