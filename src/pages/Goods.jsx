import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { T } from '../theme/appTheme';

const CATEGORIES = [
  {
    id: 'm5-pens',
    title: 'M5ペン選び',
    desc: '長さ、太さ、ペンホルダーとの相性から探す。',
    status: '公開中',
    ready: true,
  },
  {
    id: 'm5-binders',
    title: 'M5手帳選び',
    desc: 'リング径、革、持ち歩きやすさで整理予定。',
    status: '準備中',
    ready: false,
  },
  {
    id: 'm5-refills',
    title: 'M5リフィル選び',
    desc: '紙質、罫線、印刷向きの使い分けを整理予定。',
    status: '準備中',
    ready: false,
  },
];

const FIT_RULES = [
  { key: 'under-110', range: '〜110mm', desc: '小さい手帳にも合わせやすい短さ。' },
  { key: '111-125', range: '111〜125mm', desc: '短さと持ちやすさのバランスがよい長さ。' },
  { key: '126-130', range: '126〜130mm', desc: '入ることは多いが、ホルダー位置で見え方が変わる長さ。' },
  { key: 'over-131', range: '131mm〜', desc: 'M5用としては大きめ。参考として確認したいもの。' },
];

const PEN_TYPES = new Set(['ボールペン', 'シャープペン', '万年筆', 'ローラーボール']);

export default function Goods() {
  const { category, section } = useParams();
  const isPenGuide = category === 'm5-pens';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.sidebar, color: T.ink, fontFamily: T.font }}>
      <AppHeader title="おすすめ手帳関連グッズ" subtitle="M5まわりの道具を、用途別に整理します。" />
      <main style={{ flex: 1, padding: 'clamp(32px, 8vw, 72px) 20px' }}>
        {isPenGuide ? <M5PenGuide section={section} /> : <GoodsIndex />}
      </main>
      <footer style={{ padding: '20px', borderTop: `0.5px solid ${T.border}`, color: T.hint, textAlign: 'center', fontSize: 12 }}>
        © RingCraft Lab
      </footer>
    </div>
  );
}

function GoodsIndex() {
  return (
    <section style={panelStyle}>
      <p style={eyebrowStyle}>GOODS GUIDE</p>
      <h1 style={titleStyle}>小さな手帳に、ちょうどいいものを。</h1>
      <p style={leadStyle}>
        M5で使いやすいペンやリフィルを、サイズ感や使い心地から少しずつまとめています。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginTop: 26 }}>
        {CATEGORIES.map((item) => {
          const content = (
            <>
              <span style={getBadgeStyle(item)}>{item.status}</span>
              <strong style={{ display: 'block', marginTop: item.ready ? 12 : 8, fontSize: item.ready ? 18 : 15 }}>{item.title}</strong>
              <span style={{ display: item.ready ? 'block' : 'none', marginTop: 8, color: T.muted, fontSize: 13, lineHeight: 1.6 }}>{item.desc}</span>
              {item.ready && <span style={cardHintStyle}>詳しく見る →</span>}
            </>
          );

          return item.ready ? (
            <Link key={item.id} to={`/goods/${item.id}`} style={getCategoryCardStyle(item)}>
              {content}
            </Link>
          ) : (
            <div key={item.id} style={getCategoryCardStyle(item)} aria-disabled="true">
              {content}
            </div>
          );
        })}
      </div>

      <Link to="/" style={backLinkStyle}>← トップへ戻る</Link>
    </section>
  );
}

function M5PenGuide({ section }) {
  const reviewUrl = `${import.meta.env.BASE_URL}data/pens.image-review.html`;
  const activeRule = FIT_RULES.find((rule) => rule.key === section);
  const [pens, setPens] = useState([]);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    fetch(`${import.meta.env.BASE_URL}data/pens.expanded-candidates.json`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setPens(Array.isArray(data) ? data : []);
        setLoadState('ready');
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activePens = useMemo(() => (
    pens
      .filter((pen) => pen.status === 'active' && PEN_TYPES.has(pen.type))
      .sort((a, b) => Number(a.length ?? 999) - Number(b.length ?? 999)
        || String(a.brand).localeCompare(String(b.brand), 'ja')
        || String(a.model).localeCompare(String(b.model), 'ja'))
  ), [pens]);

  const groupedPens = useMemo(() => {
    const groups = Object.fromEntries(FIT_RULES.map((rule) => [rule.key, []]));
    for (const pen of activePens) {
      groups[getFitKey(pen.length)].push(pen);
    }
    return groups;
  }, [activePens]);

  if (section && !activeRule) {
    return (
      <section style={{ ...panelStyle, maxWidth: 920 }}>
        <p style={eyebrowStyle}>M5 PEN GUIDE</p>
        <h1 style={titleStyle}>ページが見つかりません。</h1>
        <Link to="/goods/m5-pens" style={secondaryButtonStyle}>M5ペン選びへ戻る</Link>
      </section>
    );
  }

  if (activeRule) {
    const sectionPens = groupedPens[activeRule.key] || [];

    return (
      <section style={{ ...panelStyle, maxWidth: 920 }}>
        <p style={eyebrowStyle}>M5 PEN GUIDE</p>
        <h1 style={titleStyle}>{activeRule.range}のペン</h1>
        <p style={leadStyle}>{activeRule.desc}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
          <Link to="/goods/m5-pens" style={secondaryButtonStyle}>長さカテゴリへ戻る</Link>
          <a href={reviewUrl} style={secondaryButtonStyle}>確認用一覧を見る</a>
        </div>

        <section style={{ marginTop: 28 }}>
          {loadState === 'loading' && <p style={mutedTextStyle}>ペンデータを読み込み中です。</p>}
          {loadState === 'error' && <p style={mutedTextStyle}>ペンデータを読み込めませんでした。</p>}
          {loadState === 'ready' && (
            sectionPens.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {sectionPens.map((pen) => (
                  <PenDataCard key={`${pen.brand}-${pen.model}-${pen.type}`} pen={pen} />
                ))}
              </div>
            ) : (
              <p style={mutedTextStyle}>この長さ帯の候補はまだありません。</p>
            )
          )}
        </section>
      </section>
    );
  }

  return (
    <section style={{ ...panelStyle, maxWidth: 920 }}>
      <p style={eyebrowStyle}>M5 PEN GUIDE</p>
      <h1 style={titleStyle}>M5に合うペンを探す。</h1>
      <p style={leadStyle}>
        短いペンでも、太さやクリップ位置で収まり方は変わります。
        長さを目安にしながら、気になるペンを見つけてください。
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
        <a href={reviewUrl} style={primaryButtonStyle}>ペン一覧を見る</a>
        <Link to="/pen-search" style={secondaryButtonStyle}>ペン検索へ</Link>
        <Link to="/goods" style={secondaryButtonStyle}>グッズ一覧へ戻る</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginTop: 28 }}>
        {FIT_RULES.map((rule) => (
          <Link key={rule.key} to={`/goods/m5-pens/${rule.key}`} style={lengthCategoryStyle}>
            <h2 style={{ margin: 0, color: T.primary, fontSize: 22, fontWeight: 800 }}>{rule.range}</h2>
            <p style={{ margin: 0, color: T.muted, fontSize: 13, lineHeight: 1.7 }}>{rule.desc}</p>
            {loadState === 'ready' && (
              <p style={{ margin: '10px 0 0', color: T.hint, fontSize: 12, fontWeight: 700 }}>
                {groupedPens[rule.key]?.length || 0}本
              </p>
            )}
            <span style={cardHintStyle}>見る →</span>
          </Link>
        ))}
      </div>

      <div style={{ ...miniCardStyle, marginTop: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>ペンホルダー注意メモ</h2>
        <p style={{ margin: '10px 0 0', color: T.muted, fontSize: 14, lineHeight: 1.8 }}>
          ユニボールワンPのように、全長は短くてもクリップ位置の関係で上寄りのホルダーだと飛び出しやすいものがあります。
          ペンホルダーリフィルの向きを変えて下寄りに付けると収まりやすい場合があるため、注意タグとして残す方針です。
        </p>
      </div>
    </section>
  );
}

function PenDataCard({ pen }) {
  const query = encodeURIComponent(`${pen.brand} ${pen.model}`);
  const imageSearchUrl = `https://www.google.com/search?tbm=isch&q=${query}`;
  const sourceUrl = pen.sourceUrl || pen.amazonUrl || pen.rakutenUrl || imageSearchUrl;

  return (
    <article style={penCardStyle}>
      <a
        href={pen.imageUrl || imageSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={penImageLinkStyle}
      >
        {pen.imageUrl ? (
          <img src={pen.imageUrl} alt={`${pen.brand} ${pen.model}`} style={penImageStyle} loading="lazy" />
        ) : (
          <span style={penImagePlaceholderStyle}>画像検索で確認</span>
        )}
      </a>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <p style={{ margin: 0, color: T.hint, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}>{pen.brand}</p>
          <h4 style={{ margin: '4px 0 0', fontSize: 14, lineHeight: 1.45 }}>{pen.canonicalModel || pen.model}</h4>
        </div>
        <span style={typePillStyle}>{pen.type}</span>
      </div>
      <p style={{ margin: '10px 0 0', color: T.muted, fontSize: 12, lineHeight: 1.6 }}>
        長さ {formatMm(pen.length)}
        {' / '}
        径 {formatMm(pen.diameter)}
      </p>
      {pen.note && (
        <p style={{ margin: '8px 0 0', color: T.hint, fontSize: 11, lineHeight: 1.5 }}>
          {pen.note}
        </p>
      )}
      <div style={penLinksStyle}>
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={smallLinkStyle}>根拠</a>
        <a href={pen.amazonUrl || imageSearchUrl} target="_blank" rel="noopener noreferrer" style={smallLinkStyle}>Amazon</a>
        <a href={pen.rakutenUrl || imageSearchUrl} target="_blank" rel="noopener noreferrer" style={smallLinkStyle}>楽天</a>
      </div>
    </article>
  );
}

function getFitKey(length) {
  if (typeof length !== 'number' || !Number.isFinite(length)) return 'over-131';
  if (length <= 110) return 'under-110';
  if (length <= 125) return '111-125';
  if (length <= 130) return '126-130';
  return 'over-131';
}

function formatMm(value) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value}mm` : '不明';
}

const panelStyle = {
  maxWidth: 760,
  margin: '0 auto',
  padding: '28px 24px',
  borderRadius: 8,
  border: `0.5px solid ${T.border}`,
  background: '#fff',
};

const eyebrowStyle = {
  margin: 0,
  fontSize: 12,
  color: T.hint,
  letterSpacing: '0.12em',
  fontWeight: 700,
};

const titleStyle = {
  margin: '10px 0 12px',
  fontSize: 'clamp(24px, 5vw, 36px)',
  lineHeight: 1.35,
  color: T.ink,
};

const leadStyle = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.8,
  color: T.muted,
};

function getCategoryCardStyle(item) {
  return {
  minHeight: item.ready ? 140 : 82,
  display: 'block',
  padding: item.ready ? 18 : 14,
  borderRadius: 12,
  border: item.ready ? `1px solid ${T.borderStrong}` : `1px dashed ${T.border}`,
  background: item.ready ? T.primaryLight : '#f3f0ea',
  color: T.ink,
  textDecoration: 'none',
  opacity: item.ready ? 1 : 0.72,
  cursor: item.ready ? 'pointer' : 'default',
  boxShadow: item.ready ? '0 12px 28px rgba(61, 47, 31, 0.06)' : 'none',
  position: 'relative',
  };
}

const miniCardStyle = {
  padding: 16,
  borderRadius: 12,
  border: `0.5px solid ${T.border}`,
  background: '#fffaf4',
};

const lengthCategoryStyle = {
  ...miniCardStyle,
  display: 'block',
  color: T.ink,
  textDecoration: 'none',
  border: `1px solid ${T.borderStrong}`,
  boxShadow: '0 12px 28px rgba(61, 47, 31, 0.05)',
};

const mutedTextStyle = {
  margin: 0,
  color: T.muted,
  fontSize: 14,
  lineHeight: 1.7,
};

const penCardStyle = {
  padding: 14,
  borderRadius: 12,
  border: `0.5px solid ${T.border}`,
  background: '#fff',
};

const penImageLinkStyle = {
  display: 'grid',
  placeItems: 'center',
  height: 128,
  margin: '-2px -2px 12px',
  borderRadius: 10,
  background: '#f5ede0',
  color: T.muted,
  textDecoration: 'none',
  overflow: 'hidden',
};

const penImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
};

const penImagePlaceholderStyle = {
  padding: 12,
  color: T.muted,
  fontSize: 12,
  fontWeight: 700,
};

const penLinksStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 6,
  marginTop: 12,
};

const smallLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 30,
  borderRadius: 8,
  border: `0.5px solid ${T.border}`,
  background: '#fffaf4',
  color: T.ink,
  textDecoration: 'none',
  fontSize: 11,
  fontWeight: 700,
};

const typePillStyle = {
  flex: '0 0 auto',
  padding: '4px 7px',
  borderRadius: 999,
  background: T.primaryLight,
  color: T.primary,
  fontSize: 10,
  fontWeight: 800,
};

function getBadgeStyle(item) {
  return {
  display: 'inline-flex',
  padding: '5px 8px',
  borderRadius: 999,
  background: item.ready ? '#fff' : '#e3ded5',
  color: item.ready ? T.primary : T.hint,
  fontSize: 11,
  fontWeight: 800,
  };
}

const cardHintStyle = {
  display: 'inline-flex',
  marginTop: 16,
  color: T.primary,
  fontSize: 13,
  fontWeight: 800,
};

const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 42,
  padding: '0 16px',
  borderRadius: 8,
  background: T.ink,
  color: '#fffaf4',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 700,
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  border: `0.5px solid ${T.borderStrong}`,
  background: T.primaryLight,
  color: T.ink,
};

const backLinkStyle = {
  display: 'inline-flex',
  marginTop: 28,
  color: T.muted,
  fontSize: 14,
  textDecoration: 'none',
};
