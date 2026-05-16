import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const content = `import { Link } from 'react-router-dom';
import { SIZES } from '../config/sizes';
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

const OTHER_SIZES = SIZES.filter((s) => s.id !== 'microfive' && s.id !== 'custom');

const FRAGMENTS = [
  'M5は小さい。だから1mmが大事。',
  '切るの面倒だから、作った。',
  'あと2mm入らない。',
  'M5に収めたい。',
];

const TOOLS = [
  { hint: '紙が足りない。', label: 'リフィルを作る', to: '/refill-maker?size=microfive' },
  { hint: 'あと2mm入らない。', label: 'ペンを探す', to: '/pen-search' },
];

const linkStyle = {
  color: C.ink,
  textDecoration: 'none',
  borderBottom: \`1px solid \${C.border}\`,
  paddingBottom: 2,
};

export default function Home() {
  return (
    <motionWrap style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: C.ink, background: C.bg }}>

      <header style={{ padding: '16px clamp(20px,4vw,40px) 12px' }}>
        <motionWrap style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link to="/" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', color: C.ink, textDecoration: 'none' }}>
            RingCraft Lab
          </Link>
        </motionWrap>
      </header>

      <section
        style={{
          position: 'relative',
          minHeight: 'min(72vh, 640px)',
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
            objectPosition: '55% 45%',
          }}
        />
        <motionWrap
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(250,247,242,0.88) 0%, rgba(250,247,242,0.35) 28%, transparent 55%)',
          }}
        />
        <motionWrap
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 'clamp(28px,5vw,48px) clamp(20px,4vw,40px)',
          }}
        >
          <motionWrap style={{ maxWidth: 720, margin: '0 auto' }}>
            {FRAGMENTS.map((line) => (
              <p
                key={line}
                style={{
                  fontSize: 'clamp(15px,2.4vw,17px)',
                  lineHeight: 1.65,
                  margin: '0 0 6px',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                {line}
              </p>
            ))}
          </motionWrap>
        </motionWrap>
      </section>

      <main style={{ flex: 1, padding: 'clamp(40px,7vw,64px) clamp(20px,4vw,40px)' }}>
        <motionWrap style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 15, lineHeight: 1.85, color: C.muted, margin: '0 0 48px' }}>
            M5だけ、サイズも穴も書ける面も、少しずつシビア。
            <br />
            でも、毎日使っている。
            <br />
            <span style={{ color: C.ink }}>このサイトの話は、だいたいM5の話。</span>
          </p>

          <motionWrap
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(28px,5vw,48px)',
              paddingTop: 8,
              borderTop: bd,
            }}
          >
            {TOOLS.map((t) => (
              <motionWrap key={t.to}>
                <p style={{ fontSize: 14, color: C.muted, margin: '0 0 10px', lineHeight: 1.6 }}>{t.hint}</p>
                <Link to={t.to} style={{ ...linkStyle, fontSize: 15, fontWeight: 600 }}>
                  {t.label} →
                </Link>
              </motionWrap>
            ))}
          </motionWrap>

          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, margin: '56px 0 0', opacity: 0.9 }}>
            M6・バイブル・A5もある。
            {OTHER_SIZES.map((s, i) => (
              <span key={s.id}>
                {i === 0 ? ' ' : ' · '}
                <Link to={\`/refill-maker?size=\${s.id}\`} style={{ color: C.link, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  {s.name}
                </Link>
              </span>
            ))}
          </p>
        </motionWrap>
      </main>

      <footer style={{ padding: '32px 20px calc(28px + env(safe-area-inset-bottom, 0px))', borderTop: bd }}>
        <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', margin: 0, opacity: 0.75 }}>
          © 2025 RingCraft Lab
        </p>
      </footer>
    </motionWrap>
  );
}
`;

writeFileSync(join(root, 'src/pages/Home.jsx'), content.split('motionWrap').join('div'), 'utf8');
console.log('wrote Home.jsx');
