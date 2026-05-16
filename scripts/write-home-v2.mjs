import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const content = `import { Link } from 'react-router-dom';
import { SIZES } from '../config/sizes';
import { T } from '../theme/appTheme';
import HomeToolCard from '../components/home/HomeToolCard';
import { RefillCutIllustration, PenSearchIllustration } from '../components/home/HomeIllustrations';

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

const TOOLS = [
  {
    to: '/refill-maker?size=microfive',
    title: 'リフィルを作る',
    description: 'M5（マイクロ5・62×105mm）用。写真を並べて印刷用のリフィルにします。',
    illustration: RefillCutIllustration,
  },
  {
    to: '/pen-search',
    title: 'ペンを探す',
    description: 'M5に入る短いペンを、全長・太さ・ブランドで絞り込みます。',
    illustration: PenSearchIllustration,
  },
];

export default function Home() {
  return (
    <motionWrap className="home-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: font, color: C.ink, background: C.bg }}>

      <header style={{ padding: '16px clamp(20px,4vw,40px) 12px' }}>
        <motionWrap style={{ maxWidth: 800, margin: '0 auto' }}>
          <Link to="/" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', color: C.ink, textDecoration: 'none' }}>
            RingCraft Lab
          </Link>
        </motionWrap>
      </header>

      <section className="home-hero" style={{ borderBottom: bd, overflow: 'hidden', background: C.bg }}>
        <motionWrap className="home-hero__text">
          <h1
            style={{
              fontSize: 'clamp(20px, 3.2vw, 26px)',
              fontWeight: 700,
              lineHeight: 1.35,
              margin: '0 0 14px',
              letterSpacing: '0.02em',
            }}
          >
            M5（マイクロ5）のリフィルと、入るペン
          </h1>
          <p className="home-m5-def">
            M5はマイクロ5のこと。62×105mm、いちばん小さいリフィル向けの道具です。
          </p>
          <p className="home-fragment">M5は小さい。だから1mmが大事。</p>
        </motionWrap>

        <motionWrap className="home-hero__photo">
          <img src={heroSrc} alt="机の上のマイクロ5手帳と文具" />
          <motionWrap className="home-hero__photo-fade" aria-hidden />
        </motionWrap>
      </section>

      <main style={{ flex: 1, padding: 'clamp(28px,5vw,40px) clamp(20px,4vw,40px) clamp(40px,7vw,64px)' }}>
        <motionWrap style={{ maxWidth: 800, margin: '0 auto' }}>
          <motionWrap className="home-intro">
            <p className="home-intro__lead">
              このサイトの話は、だいたいM5の話。切るの面倒だからリフィルを作る。あと2mm入らないからペンを探す。
            </p>
            <p className="home-intro__aside">M5って、なんか増える。M5の分はノーカン。</p>
          </motionWrap>

          <motionWrap className="home-tool-grid">
            {TOOLS.map((t) => (
              <HomeToolCard
                key={t.to}
                to={t.to}
                title={t.title}
                description={t.description}
                illustration={t.illustration}
              />
            ))}
          </motionWrap>

          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, margin: '40px 0 0', opacity: 0.9 }}>
            リフィルメーカーは M5（マイクロ5）が主。M6・バイブル・A5 などにも対応。
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
console.log('ok');
