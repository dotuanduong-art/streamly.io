import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useGenres } from '@/features/movies/hooks';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { motion, useReducedMotion } from 'framer-motion';
import { motionTiming } from '@/lib/motion';
import { NavIndicator } from '@/components/layout/NavItem';

export function GenreMenu({ mobile = false }: { mobile?: boolean }) {
  const genres = useGenres();
  const reduced = useReducedMotion();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const active = location.pathname.startsWith('/genre/');
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return <div ref={root} className="relative" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={(event) => {
    if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
  }}>
    <button ref={trigger} type="button" data-testid={mobile ? 'genre-menu-toggle-mobile' : 'genre-menu-toggle'} className={`nav-item relative flex w-fit items-center gap-1 rounded-button ${active ? 'font-semibold text-text-primary' : 'text-text-secondary'}`} aria-expanded={open} aria-haspopup="true" aria-controls={id} onClick={() => setOpen(!open)}>
      Thể loại <ChevronDown size={15} aria-hidden="true" />{active && <NavIndicator mobile={mobile} />}
    </button>
    {open && <motion.div id={id} role="menu" aria-label="Thể loại phim" initial={reduced ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : motionTiming.fast, ease: motionTiming.ease }} data-testid={mobile ? 'genre-menu-mobile' : 'genre-menu'} className={mobile ? 'mt-4 max-h-[45svh] overflow-y-auto rounded-card border border-white/10 bg-surface p-4' : 'absolute left-0 top-full mt-5 max-h-[60svh] w-96 overflow-y-auto rounded-card border border-white/10 bg-surface p-5 shadow-card'} onKeyDown={(event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a, button'));
      if (!links.length) return;
      event.preventDefault();
      const current = links.indexOf(document.activeElement as HTMLElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : (current + (event.key === 'ArrowUp' ? -1 : 1) + links.length) % links.length;
      links[next]?.focus();
    }}>
      {genres.isLoading ? <div role="status" aria-label="Đang tải thể loại" className="grid grid-cols-2 gap-3">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-8" />)}</div>
        : genres.isError ? <ErrorState title="Không thể tải thể loại" error={genres.error} onRetry={() => void genres.refetch()} />
        : !genres.data?.length ? <EmptyState title="Chưa có thể loại" description="Hãy quay lại sau để khám phá phim." />
        : <nav aria-label="Chọn thể loại" className="grid grid-cols-2 gap-2">{genres.data.map((genre) => <Link role="menuitem" key={genre.id} to={`/genre/${genre.id}`} aria-current={location.pathname === `/genre/${genre.id}` ? 'page' : undefined} className="genre-chip rounded-button px-3 py-2 text-sm hover:bg-surface-elevated aria-[current=page]:bg-brand">{genre.name}</Link>)}</nav>}
    </motion.div>}
  </div>;
}
