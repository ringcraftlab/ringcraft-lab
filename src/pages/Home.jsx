import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { T } from '../theme/appTheme';

const cardBase = {
  background: T.previewBg,
  border: `1px solid ${T.border}`,
  borderRadius: T.radiusMd,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  transition: 'box-shadow 0.18s ease',
};

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: T.font, background: T.sidebar, color: T.ink }}>
      <AppHeader title="RingCraft Lab" subtitle="システム手帳ツール集" showBack={false} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 22px 56px' }}>
          <section
            style={{
              background: T.previewBg,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusLg,
              padding: '26px 24px',
              marginBottom: 28,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.muted, margin: 0 }}>
              リフィルの並べ方や印刷、コンパクトペンの条件検索まで、手帳まわりで欲しくなりがちな処理をまとめました。余計な画面遷移や装飾は抑えています。
            </p>
          </section>

          <h2 style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, letterSpacing: '0.12em', margin: '0 0 12px 0' }}>ツール</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/refill-maker" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{ ...cardBase, padding: '22px 22px' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(91, 127, 166, 0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6, color: T.ink }}>リフィルメーカー</div>
                  <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>画像を A4 に配置し、印刷または PDF で出力</div>
                </div>
                <span style={{ color: T.primary, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>開く →</span>
              </div>
            </Link>

            <Link to="/pens" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{ ...cardBase, padding: '22px 22px' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(91, 127, 166, 0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6, color: T.ink }}>ペン検索</div>
                  <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>全長130mm以下のペンをブランドや長さから絞り込み</div>
                </div>
                <span style={{ color: T.primary, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>開く →</span>
              </div>
            </Link>
          </div>

          <p style={{ fontSize: 12, color: T.muted, marginTop: 32, textAlign: 'center' }}>
            RingCraft Lab · ローカルで動作するツール集
          </p>
        </div>
      </div>
    </div>
  );
}
