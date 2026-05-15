import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ece9e4',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#1c1c1c' }}>
        RingCraft Lab
      </h1>
      <p style={{ color: '#888', marginBottom: 48, fontSize: 14 }}>
        システム手帳ツール集
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, width: '100%', maxWidth: 600, padding: '0 24px' }}>
        <Link to="/refill-maker" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            transition: 'transform 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗒️</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1c1c1c', marginBottom: 6 }}>
              リフィルメーカー
            </div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
              スクリーンショットをA4に並べて印刷・PDF出力
            </div>
          </div>
        </Link>

        <Link to="/pens" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            transition: 'transform 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🖊️</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1c1c1c', marginBottom: 6 }}>
              ペン検索
            </div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
              コンパクトペン100本を条件で絞り込み（データは pen-showcase 互換）
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 
