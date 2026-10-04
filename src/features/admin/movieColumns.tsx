import type { ColumnDef } from '@tanstack/react-table';
import { Eye, EyeOff, Pencil, Star, Trash2, Video, VideoOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Movie } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { formatDuration, getReleaseYear } from '@/lib/movie';

export interface AdminMovieActions {
  onToggleVisibility: (movie: Movie) => void;
  onToggleFeatured: (movie: Movie) => void;
  onDelete: (movie: Movie) => void;
  visibilityPendingId?: number;
  featuredPendingId?: number;
  deletePendingId?: number;
}

export function MovieActionButtons({ movie, actions }: { movie: Movie; actions: AdminMovieActions }) {
  const visibilityPending = actions.visibilityPendingId === movie.id;
  const featuredPending = actions.featuredPendingId === movie.id;
  const deletePending = actions.deletePendingId === movie.id;
  return <div className="flex flex-wrap items-center gap-1">
    <IconButton data-testid={`admin-toggle-visibility-${movie.id}`} ariaLabel={movie.isVisible ? `Ẩn ${movie.title}` : `Hiện ${movie.title}`} aria-busy={visibilityPending} disabled={visibilityPending} size="sm" variant="outline" onClick={() => actions.onToggleVisibility(movie)}>{movie.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}</IconButton>
    <IconButton data-testid={`admin-toggle-featured-${movie.id}`} ariaLabel={movie.isFeatured ? `Bỏ ${movie.title} khỏi mục nổi bật` : `Đặt ${movie.title} làm nổi bật`} aria-busy={featuredPending} disabled={featuredPending} size="sm" variant="outline" onClick={() => actions.onToggleFeatured(movie)}><Star size={16} fill={movie.isFeatured ? 'currentColor' : 'none'} /></IconButton>
    <Link data-testid={`admin-edit-${movie.id}`} to={`/admin/movies/${movie.id}`} aria-label={`Sửa ${movie.title}`} className="inline-flex rounded-full border border-text-primary/20 p-1.5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"><Pencil size={16} /></Link>
    <IconButton data-testid={`admin-delete-${movie.id}`} ariaLabel={`Xóa ${movie.title}`} aria-busy={deletePending} disabled={deletePending} size="sm" variant="outline" onClick={() => actions.onDelete(movie)}><Trash2 size={16} /></IconButton>
  </div>;
}

export function createMovieColumns(actions: AdminMovieActions): ColumnDef<Movie>[] {
  return [
    { id: 'poster', header: 'Áp phích', enableSorting: false, cell: ({ row }) => <SmartImage path={row.original.posterUrl} alt={row.original.title} className="h-14 w-10 rounded-button" /> },
    { accessorKey: 'title', header: 'Tên phim', cell: ({ row }) => <div><p className="max-w-64 font-semibold leading-snug">{row.original.title}</p><p className="text-caption text-text-muted">TMDB {row.original.tmdbId}</p></div> },
    { id: 'releaseDate', accessorFn: (movie) => movie.releaseDate ?? '', header: 'Năm', cell: ({ row }) => getReleaseYear(row.original.releaseDate) ?? '—' },
    { id: 'durationMinutes', accessorFn: (movie) => movie.durationMinutes ?? 0, header: 'Thời lượng', cell: ({ row }) => formatDuration(row.original.durationMinutes) ?? '—' },
    { id: 'isVisible', accessorFn: (movie) => Number(movie.isVisible), header: 'Trạng thái', cell: ({ row }) => <Badge className={row.original.isVisible ? 'text-status-success' : 'text-text-muted'}>{row.original.isVisible ? 'Hiển thị' : 'Đã ẩn'}</Badge> },
    { id: 'isFeatured', accessorFn: (movie) => Number(movie.isFeatured), header: 'Nổi bật', cell: ({ row }) => <Badge className={row.original.isFeatured ? 'text-status-warning' : 'text-text-muted'}>{row.original.isFeatured ? 'Nổi bật' : 'Không'}</Badge> },
    { id: 'trailer', accessorFn: (movie) => Number(Boolean(movie.trailerKey?.trim())), header: 'Trailer', cell: ({ row }) => row.original.trailerKey?.trim() ? <Video aria-label="Có trailer" size={18} className="text-status-success" /> : <VideoOff aria-label="Không có trailer" size={18} className="text-text-muted" /> },
    { accessorKey: 'createdAt', header: 'Ngày tạo', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('vi-VN') },
    { id: 'actions', header: 'Thao tác', enableSorting: false, cell: ({ row }) => <MovieActionButtons movie={row.original} actions={actions} /> },
  ];
}
