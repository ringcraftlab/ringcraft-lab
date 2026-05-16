import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = execSync('git show 7bf836c:src/pages/Home.jsx', { cwd: root, encoding: 'utf8' });

const heroBlock = `      <section
        style={{
          position: 'relative',
          minHeight: 'clamp(420px, 72vh, 560px)',
          display: 'flex',
          alignItems: 'center',
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
            objectPosition: 'center 40%',
          }}
        />
        <motionWrap
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, rgba(250,247,242,0.94) 0%, rgba(250,247,242,0.78) 42%, rgba(250,247,242,0.2) 72%, transparent 100%)',
          }}
        />
        <motionWrap
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1040,
            margin: '0 auto',
            padding: 'clamp(48px,8vw,72px) clamp(20px,4vw,40px)',
            width: '100%',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', color: C.muted, margin: '0 0 14px' }}>
            FOR MICRO5 / M5
          </p>
          <h1 style={{ fontSize: 'clamp(28px,5.5vw,44px)', fontWeight: 800, lineHeight: 1.22, margin: 0, letterSpacing: '-0.02em', maxWidth: 520 }}>
            M5のための、
            <br />
            リフィルメーカー。
          </h1>
          <p style={{ fontSize: 'clamp(14px,2.2vw,16px)', color: C.muted, lineHeight: 1.75, margin: '20px 0 0', maxWidth: 460 }}>
            穴位置と書ける面を前提に、推しや手書きを62×105mmで印刷。
            デジタルは手段で、使うのはいつものアナログのM5。
          </p>
          <Link
            to="/refill-maker?size=microfive"
            style={{
              display: 'inline-flex',
              marginTop: 28,
              padding: '14px 28px',
              borderRadius: r,
              background: C.text,
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(42,36,32,0.15)',
            }}
          >
            M5で作る →
          </Link>
        </motionWrap>
      </section>`;

let out = base
  .replace("import { Link } from 'react-router-dom';", "import { useState } from 'react';\nimport { Link } from 'react-router-dom';")
  .replace(
    "import { T } from '../theme/appTheme';",
    "import { T } from '../theme/appTheme';\n\nconst heroSrc = `${import.meta.env.BASE_URL}hero-desk.jpg`;"
  )
  .replace("bg: '#ffffff'", "bg: '#faf7f2'")
  .replace("bgSub: '#f7f7f7'", "bgSub: '#f5ede0'")
  .replace(
    /const SIZE_CARDS[\s\S]*?const STEPS = \[[\s\S]*?\];/,
    `const M5 = SIZES.find((s) => s.id === 'microfive');
const OTHER_SIZES = SIZES.filter((s) => s.id !== 'microfive' && s.id !== 'custom');

const STEPS = [
  { n: '01', title: '画像を入れる', desc: '推しのスクショや手書き用の画像を、M5の枠に配置。' },
  { n: '02', title: '穴と書ける面を確認', desc: '穴5・左マージンはプリセット。1mm単位で運用を守る。' },
  { n: '03', title: '印刷してリングへ', desc: 'A4に並べて印刷。切って、いつものM5に入れる。' },
];`
  )
  .replace(
    'export default function Home() {\n  return (',
    'export default function Home() {\n  const [showOtherSizes, setShowOtherSizes] = useState(false);\n\n  return ('
  )
  .replace(
    /      <header[\s\S]*?      <\/header>/,
    `      <header style={{ padding: '14px clamp(16px,4vw,40px)', borderBottom: bd, background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link to="/" style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', color: C.text, textDecoration: 'none' }}>
            RingCraft Lab
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link to="/refill-maker?size=microfive" style={{ fontSize: 13, fontWeight: 600, color: C.text, textDecoration: 'none', padding: '6px 10px' }}>
              M5リフィルメーカー
            </Link>
            <Link to="/pen-search" style={{ fontSize: 12, fontWeight: 500, color: C.muted, textDecoration: 'none', padding: '6px 8px' }}>
              M5に合うペン
            </Link>
          </nav>
        </div>
      </header>`
  )
  .replace(/      \{\/\* HERO \*\/\}[\s\S]*?      <\/section>\n\n      \{\/\* 3ステップ \*\/\}/, `      ${heroBlock}\n\n      {/* M5で始める */}
      <section style={{ padding: 'clamp(40px,6vw,56px) clamp(16px,4vw,40px)', borderBottom: bd }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, margin: '0 0 10px' }}>まずはM5から</h2>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: '0 0 24px' }}>
            既製リフィルが少ない・穴で書ける面が減る・1mmが効く——このサービスは、その前提で作っています。
          </p>
          <Link
            to="/refill-maker?size=microfive"
            onMouseEnter={(e) => cardHover(e, true)}
            onMouseLeave={(e) => cardHover(e, false)}
            style={{
              textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 20,
              padding: '24px 22px', background: '#fff', border: bd, borderRadius: r,
              boxShadow: '0 1px 6px rgba(42,36,32,0.04)', transition: 'transform 0.18s, box-shadow 0.18s',
            }}
          >
            <RefillSilhouette w={62} h={105} scale={0.34} />
            <motionWrap style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>マイクロ5 <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>M5</span></div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>62 × 105 mm · 穴 5</div>
              <span style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 700, color: C.accent }}>このサイズで作る →</span>
            </motionWrap>
          </Link>
        </div>
      </section>

      {/* 3ステップ */}`)
  .replace(
    /      \{\/\* サイズ選択 \*\/\}[\s\S]*?      \{\/\* ツール紹介 \*\/\}[\s\S]*?      <\/section>\n\n      \{\/\* フッター \*\/\}/,
    `      <section style={{ padding: 'clamp(32px,5vw,44px) clamp(16px,4vw,40px)', borderBottom: bd }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => setShowOtherSizes((v) => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, padding: '14px 16px', background: 'transparent', border: bd, borderRadius: r,
              cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600, color: C.muted,
            }}
          >
            <span>M5以外をお使いの方（M6・バイブル・A5）</span>
            <span aria-hidden style={{ fontSize: 12 }}>{showOtherSizes ? '▲' : '▼'}</span>
          </button>
          {showOtherSizes && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginTop: 12 }}>
              {OTHER_SIZES.map((s) => (
                <Link key={s.id} to={\`/refill-maker?size=\${s.id}\`} style={{
                  textDecoration: 'none', color: 'inherit', textAlign: 'center', padding: '14px 10px',
                  background: '#fff', border: bd, borderRadius: r, fontSize: 13,
                }}>
                  <div style={{ fontWeight: 700 }}>{s.name}</motionWrap>
                  {s.shortName && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.shortName}</div>}
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.w}×{s.h}mm</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* フッター */}`
  )
  .replace(
    '<p style={{ fontSize: 13, color: C.muted, margin: \'8px 0 0\' }}>好きな手帳に、好きなリフィルを。</p>',
    `<p style={{ fontSize: 13, color: C.muted, margin: '8px 0 0' }}>M5のための、リフィルメーカー。</p>
        <p style={{ fontSize: 12, color: C.muted, margin: '12px 0 0' }}>
          <Link to="/pen-search" style={{ color: C.accent, textDecoration: 'none', fontWeight: 600 }}>M5に合うペンを探す</Link>
        </p>`
  );

out = out.split('motionWrap').join('div');

writeFileSync(join(root, 'src/pages/Home.jsx'), out, 'utf8');
console.log('patched Home.jsx');
