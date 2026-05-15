import { Link } from 'react-router-dom';
import { T } from '../theme/appTheme';

export default function AppHeader({ title, subtitle, showBack = true }) {
  return (
    <header
      style={{
        background: T.primary,
        color: '#fff',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(91, 127, 166, 0.25)',
      }}
    >
      {showBack ? (
        <>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.88)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            ← ホーム
          </Link>
          <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.25)' }} />
        </>
      ) : null}
      <div>
        <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: '0.18em', fontWeight: 600 }}>RINGCRAFT LAB</div>
        <h1 style={{ fontSize: 17, fontWeight: 600, margin: '2px 0 0 0', letterSpacing: '0.02em' }}>{title}</h1>
        {subtitle ? (
          <p style={{ fontSize: 12, opacity: 0.88, margin: '6px 0 0 0', fontWeight: 400 }}>{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
