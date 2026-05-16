import { Link } from 'react-router-dom';

export default function HomeToolCard({ to, title, description, illustration: Illustration }) {
  return (
    <Link to={to} className="home-tool-card">
      <div className="home-tool-card__illus">
        <Illustration />
      </div>
      <h2 className="home-tool-card__title">{title}</h2>
      <p className="home-tool-card__desc">{description}</p>
    </Link>
  );
}
