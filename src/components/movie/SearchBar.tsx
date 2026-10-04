import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { SmartImage } from '@/components/ui/SmartImage';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchMovies } from '@/features/movies/hooks';
import { getReleaseYear } from '@/lib/movie';
import { getErrorMessage } from '@/lib/error';

export interface SearchBarProps {
  initialValue?: string;
  autoFocus?: boolean;
  compact?: boolean;
  onSubmit?: (query: string) => void;
}

export function SearchBar({ initialValue = '', autoFocus = false, compact = false, onSubmit }: SearchBarProps) {
  const navigate = useNavigate();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(value.trim(), 300);
  const search = useSearchMovies(debouncedQuery, 1, 6, 6);
  const suggestions = search.data?.items ?? [];

  useEffect(() => setValue(initialValue), [initialValue]);
  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);
  useEffect(() => setActiveIndex(-1), [debouncedQuery]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const submitQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    onSubmit?.(trimmed);
    if (!onSubmit) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const selected = suggestions[activeIndex];
    if (selected && open) navigate(`/movie/${selected.id}`);
    else submitQuery(value);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (!open) setOpen(true);
    if (!suggestions.length) return;
    setActiveIndex((current) => event.key === 'ArrowDown'
      ? (current + 1) % suggestions.length
      : (current <= 0 ? suggestions.length - 1 : current - 1));
  };

  const showDropdown = open && value.trim().length > 0;
  return <form ref={rootRef} role="search" onSubmit={submit} className="relative w-full">
    <div className="flex gap-2 sm:gap-3">
      <label htmlFor={`${listboxId}-input`} className="sr-only">Search movies</label>
      <div className="relative min-w-0 flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
        <input
          ref={inputRef}
          id={`${listboxId}-input`}
          data-testid="search-input"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showDropdown}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          autoComplete="off"
          value={value}
          onChange={(event) => { setValue(event.target.value); setOpen(true); }}
          onFocus={() => { if (value.trim()) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search movies..."
          className={`w-full rounded-button border border-text-primary/15 bg-surface/95 pl-11 pr-4 text-text-primary placeholder:text-text-secondary ${compact ? 'py-3' : 'py-4 text-lg'}`}
        />
      </div>
      <button data-testid="search-button" type="submit" disabled={!value.trim()} className="inline-flex shrink-0 items-center justify-center rounded-button bg-text-primary px-4 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-50 sm:px-6">
        {value.trim() ? 'Search' : 'Enter a title'}
      </button>
    </div>
    {showDropdown && <div id={listboxId} role="listbox" aria-label="Movie suggestions" className="absolute inset-x-0 top-full z-[70] mt-2 max-h-96 overflow-auto rounded-card border border-text-primary/10 bg-surface p-2 shadow-card">
      {search.isLoading && <div className="flex items-center gap-2 p-4 text-sm text-text-secondary"><Loader2 className="animate-spin" size={16} />Searching...</div>}
      {search.isError && <div className="p-4 text-sm text-status-error">{getErrorMessage(search.error)}</div>}
      {!search.isLoading && !search.isError && debouncedQuery && !suggestions.length && <div className="p-4 text-sm text-text-secondary">No suggestions found.</div>}
      {suggestions.map((movie, index) => {
        const year = getReleaseYear(movie.releaseDate);
        return <button
          key={movie.id}
          id={`${listboxId}-option-${index}`}
          data-testid={`search-suggestion-${movie.id}`}
          type="button"
          role="option"
          aria-selected={activeIndex === index}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => navigate(`/movie/${movie.id}`)}
          className={`flex w-full items-center gap-3 rounded-button p-2 text-left ${activeIndex === index ? 'bg-surface-elevated' : 'hover:bg-surface-elevated'}`}
        >
          <SmartImage path={movie.posterUrl} alt="" className="h-14 w-10 shrink-0 rounded-button" />
          <span className="min-w-0"><span className="block truncate font-semibold">{movie.title}</span>{year && <span className="text-caption text-text-secondary">{year}</span>}</span>
        </button>;
      })}
    </div>}
  </form>;
}
