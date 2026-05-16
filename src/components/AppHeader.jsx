import { Link } from 'react-router-dom';
import { T } from '../theme/appTheme';

export default function AppHeader({ title, subtitle, showBack = true, variant = 'desk' }) {
  const desk = variant === 'desk';
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: '#fff',
        color: T.ink,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        borderBottom: `0.5px solid ${T.border}`,
        boxShadow: 'none',
      }}
    >
      {showBack ? (
        <>
          <Link
            to="/"
            style={{
              color: T.muted,
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 500,
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            ← ホーム
          </Link>
          <div style={{ width: 1, height: 24, background: T.border }} />
        </>
      ) : null}
      <span
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: T.ink,
          color: T.primaryLight,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M7 4h9.5A2.5 2.5 0 0 1 19 6.5v13A1.5 1.5 0 0 1 17.5 21H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.5 4v17M11 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        {desk ? null : (
          <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: '0.18em', fontWeight: 600 }}>RINGCRAFT LAB</div>
        )}
        <h1 style={{ fontSize: 15, fontWeight: 500, margin: 0, letterSpacing: '0.01em', color: T.ink }}>{title}</h1>
        {subtitle ? (
          <p
            style={{
              fontSize: 12,
              color: T.hint,
              opacity: 1,
              margin: '4px 0 0 0',
              fontWeight: 400,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
