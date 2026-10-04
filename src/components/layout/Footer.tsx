import { Link } from 'react-router-dom';
export function Footer() {
  return <footer className="page-gutter mt-10 border-t border-text-primary/10 py-10 text-caption text-text-secondary">
    <div className="mb-6 flex items-center justify-between gap-4"><Link to="/" className="text-xl font-bold tracking-tight text-text-primary">Streamly.</Link><Link to="/">Về trang chủ</Link></div>
    <p className="mb-2">Khám phá một chút. Gặp một câu chuyện hay.</p>
    <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </footer>;
}
