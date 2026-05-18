import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const content = `import { Link } from 'react-router-dom';

const C = {
  bg: '#ffffff',
  bgSub: '#f7f7f5',
  accent: '#5b7fa6',
  accentLight: '#e8eef5',
  text: '#1c1c1c',
  muted: '#888',
  mutedLight: '#bbb',
  border: '#efefef',
};

const font = 'system-ui, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif';

function RefillSVG({ holes = 5, scale = 1 }) {
  const w = Math.round(52 * scale);
  const h = Math.round(88 * scale);
  const holeY =
    holes <= 1
      ? [Math.round(h * 0.5)]
      : Array.from({ length: holes }, (_, i) => Math.round(h * (0.12 + (i * 0.76) / (holes - 1))));
  return (
    <svg width={w} height={h} viewBox={\`0 0 \${w} \${h}\`} style={{ display: 'block', flexShrink: 0 }}>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx="2" fill="#fff" stroke={C.border} strokeWidth="1" />
      <rect x="0.5" y="0.5" width={w * 0.16} height={h - 1} rx="0" fill="#f5f5f5" stroke="none" />
      {holeY.map((cy, i) => (
        <circle key={i} cx={w * 0.08} cy={cy} r={w * 0.055} fill={C.accentLight} stroke={C.accent} strokeWidth="0.5" />
      ))}
      <rect x={w * 0.22} y={h * 0.12} width={w * 0.68} height={h * 0.18} rx="1.5" fill={C.accentLight} />
      <rect x={w * 0.22} y={h * 0.38} width={w * 0.55} height={h * 0.05} rx="1" fill={C.border} />
      <rect x={w * 0.22} y={h * 0.48} width={w * 0.65} height={h * 0.05} rx="1" fill={C.border} />
      <rect x={w * 0.22} y={h * 0.58} width={w * 0.45} height={h * 0.05} rx="1" fill={C.border} />
    </svg>
  );
}

const TOOLS = [
  {
    to: '/refill-maker?size=microfive',
    tag: 'リフィルメーカー',
    title: 'スクショや画像をリフィルサイズに並べて印刷',
    desc: 'M5・M5スクエア・M6・バイブルに対応。穴位置はプリセット済み。A4に並べてそのまま印刷、PDFにも出力できます。',
    cta: '作りはじめる',
    main: true,
  },
  {
    to: '/pen-search',
    tag: 'コンパクトペン検索',
    title: 'M5に入るペンを、ブランドや長さで絞り込む',
    desc: '全長130mm以下のペンを100モデル以上収録。ブランド・軸径・種別から条件を絞って比較できます。',
    cta: '探しはじめる',
    main: false,
  },
];

const SIZES = [
  { id: 'microfive', label: 'M5', mm: '62 × 105', holes: 5 },
  { id: 'm5square', label: 'M5 Square', mm: '105 × 105', holes: 5 },
  { id: 'mini6', label: 'M6', mm: '80 × 126', holes: 6 },
  { id: 'bible', label: 'Bible', mm: '95 × 170', holes: 6 },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: font, color: C.text, background: C.bg, display: 'flex', flexDirection: 'column' }}>

      <header
        style={{
          padding: '0 clamp(16px,4vw,48px)',
          borderBottom: \`0.5px solid \${C.border}\`,
          background: C.bg,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', color: C.text, textDecoration: 'none' }}>
          RingCraft Lab
        </Link>
        <nav style={{ display: 'flex', gap: 2 }}>
          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              style={{ fontSize: 12, fontWeight: 500, color: C.muted, textDecoration: 'none', padding: '6px 10px', borderRadius: 7 }}
            >
              {t.tag}
            </Link>
          ))}
        </nav>
      </header>

      <section style={{ padding: 'clamp(56px,10vw,96px) clamp(16px,4vw,48px) clamp(40px,6vw,64px)', borderBottom: \`0.5px solid \${C.border}\` }}>
        <motionWrap style={{ maxWidth: 640 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: C.accent, margin: '0 0 20px' }}>M5 / M5 SQUARE / M6 / BIBLE</p>
          <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            M5リフィルを、
            <br />
            自分で作る。
          </h1>
          <p style={{ fontSize: 'clamp(13px,2vw,15px)', color: C.muted, lineHeight: 1.75, margin: '0 0 32px', maxWidth: 480 }}>
            特殊なサイズだから、売ってるものが合わない。
            <br />
            だから、自分で作れるようにした。
          </p>
          <Link
            to="/refill-maker?size=microfive"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: 9,
              background: C.accent,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(91,127,166,0.25)',
            }}
          >
            リフィルを作る →
          </Link>
        </motionWrap>
      </section>

      <section
        style={{
          padding: 'clamp(40px,6vw,64px) clamp(16px,4vw,48px)',
          borderBottom: \`0.5px solid \${C.border}\`,
          background: C.bgSub,
        }}
      >
        <motionWrap
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                background: C.bg,
                border: t.main ? \`1px solid \${C.accentLight}\` : \`0.5px solid \${C.border}\`,
                borderRadius: 12,
                padding: 'clamp(20px,3vw,28px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                boxShadow: t.main ? '0 2px 16px rgba(91,127,166,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = t.main ? '0 2px 16px rgba(91,127,166,0.08)' : '0 1px 4px rgba(0,0,0,0.04)';
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: t.main ? C.accent : C.muted }}>{t.tag.toUpperCase()}</span>
              <span style={{ fontSize: 'clamp(14px,2vw,17px)', fontWeight: 700, lineHeight: 1.4 }}>{t.title}</span>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0, flex: 1 }}>{t.desc}</p>
              <span
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  color: t.main ? '#fff' : C.accent,
                  background: t.main ? C.accent : 'transparent',
                  padding: t.main ? '9px 18px' : '0',
                  borderRadius: t.main ? 8 : 0,
                }}
              >
                {t.cta} →
              </span>
            </Link>
          ))}
        </motionWrap>
      </section>

      <section style={{ padding: 'clamp(40px,6vw,64px) clamp(16px,4vw,48px)', borderBottom: \`0.5px solid \${C.border}\` }}>
        <motionWrap style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, margin: '0 0 20px', letterSpacing: '0.06em' }}>対応サイズ</p>
          <motionWrap style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {SIZES.map((s) => (
              <Link
                key={s.id}
                to={\`/refill-maker?size=\${s.id}\`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  border: \`0.5px solid \${C.border}\`,
                  borderRadius: 10,
                  padding: '18px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  background: C.bg,
                  transition: 'border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <RefillSVG holes={s.holes} scale={s.label === 'Bible' ? 0.62 : 0.72} />
                <motionWrap style={{ textAlign: 'center' }}>
                  <motionWrap style={{ fontSize: 16, fontWeight: 800 }}>{s.label}</motionWrap>
                  <motionWrap style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s.mm} mm</motionWrap>
                  <motionWrap style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 2 }}>{s.holes}穴</motionWrap>
                </motionWrap>
              </Link>
            ))}
          </motionWrap>
        </motionWrap>
      </section>

      <footer
        style={{
          marginTop: 'auto',
          padding: 'clamp(28px,4vw,40px) clamp(16px,4vw,48px)',
          background: C.bg,
          borderTop: \`0.5px solid \${C.border}\`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em' }}>RingCraft Lab</span>
        <span style={{ fontSize: 11, color: C.mutedLight }}>© 2025 RingCraft Lab</span>
      </footer>
    </div>
  );
}
`;

writeFileSync(join(root, 'src/pages/Home.jsx'), content.split('motionWrap').join('div'), 'utf8');
console.log('ok');
