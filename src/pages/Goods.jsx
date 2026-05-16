import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { T } from '../theme/appTheme';

const CATEGORIES = [
  ['pen', 'ペン'],
  ['notebook', 'システム手帳'],
  ['refill', 'リフィル'],
  ['fountain', '万年筆'],
];

export default function Goods() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.sidebar, color: T.ink, fontFamily: T.font }}>
      <AppHeader title="おすすめ手帳関連グッズ" subtitle="ペン、システム手帳、リフィル、万年筆など。準備中です。" />
      <main style={{ flex: 1, padding: 'clamp(32px, 8vw, 72px) 20px' }}>
        <section
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '28px 24px',
            borderRadius: 8,
            border: `0.5px solid ${T.border}`,
            background: '#fff',
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: T.hint, letterSpacing: '0.12em', fontWeight: 700 }}>COMING SOON</p>
          <h1 style={{ margin: '10px 0 12px', fontSize: 'clamp(24px, 5vw, 36px)', lineHeight: 1.35, color: T.ink }}>
            手帳まわりの道具も、少しずつ。
          </h1>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: T.muted }}>
            リフィルづくりと相性のよいペン、システム手帳、リフィル、万年筆などを整理していく予定です。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 24 }}>
            {CATEGORIES.map(([id, label]) => (
              <Link
                key={id}
                to={`/goods/${id}`}
                style={{
                  minHeight: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `0.5px solid ${T.borderStrong}`,
                  background: T.primaryLight,
                  color: T.ink,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {label}
              </Link>
            ))}
          </div>
          <Link to="/" style={{ display: 'inline-flex', marginTop: 28, color: T.muted, fontSize: 14, textDecoration: 'none' }}>
            ← トップへ戻る
          </Link>
        </section>
      </main>
      <footer style={{ padding: '20px', borderTop: `0.5px solid ${T.border}`, color: T.hint, textAlign: 'center', fontSize: 12 }}>
        © RingCraft Lab
      </footer>
    </div>
  );
}
