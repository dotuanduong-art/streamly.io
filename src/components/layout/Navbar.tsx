import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { IconButton } from '@/components/ui/IconButton';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(window.scrollY > 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => { setMobileOpen(false); setAccountOpen(false); setSearchOpen(false); }, [location]);
  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  const signOut = () => { logout(); navigate('/'); setAccountOpen(false); setMobileOpen(false); };
  const accountLinks = <><Link to="/profile">Profile</Link><Link to="/history">History</Link>{user?.role === 'Admin' && <Link to="/admin">Admin</Link>}<button className="text-left" onClick={signOut}>Sign out</button></>;
  return <header className={`page-gutter fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || mobileOpen || searchOpen || location.pathname !== '/' ? 'bg-background shadow-nav' : 'bg-transparent'}`}
    onKeyDown={(event) => {
      if (event.key === 'Escape') { setAccountOpen(false); setMobileOpen(false); setSearchOpen(false); }
    }}>
    <nav aria-label="Main navigation" className="flex h-20 items-center gap-6 md:gap-10">
      <Link to="/" aria-label="Streamly home" className="text-2xl font-extrabold tracking-tight text-brand">Streamly<span className="text-text-primary">.</span></Link>
      <div className="hidden items-center gap-7 text-sm md:flex"><NavLink to="/" end className={({ isActive }) => isActive ? 'font-semibold text-text-primary' : 'text-text-secondary'}>Home</NavLink>{isAuthenticated && <NavLink to="/my-list">My List</NavLink>}</div>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <IconButton ariaLabel={searchOpen ? 'Close search' : 'Open search'} aria-expanded={searchOpen} aria-controls="navbar-search" onClick={() => setSearchOpen(!searchOpen)}>{searchOpen ? <X size={20} /> : <Search size={20} />}</IconButton>
        {!isAuthenticated ? <Link to="/login" className="whitespace-nowrap rounded-button bg-brand px-4 py-2 text-sm font-semibold hover:bg-brand-hover">Sign In</Link> : <div ref={accountRef} className="relative hidden md:block">
          <button aria-label="Account menu" aria-expanded={accountOpen} aria-controls="account-links" className="flex items-center gap-2 rounded-button" onClick={() => setAccountOpen(!accountOpen)}><span className="flex h-9 w-9 items-center justify-center rounded-button bg-surface-elevated font-bold">{user?.displayName.charAt(0).toUpperCase()}</span><ChevronDown size={16} /></button>
          {accountOpen && <div id="account-links" className="nav-links absolute right-0 top-full mt-3 flex w-44 flex-col gap-4 rounded-card border border-text-primary/10 bg-surface p-5 shadow-card">{accountLinks}</div>}
        </div>}
        <IconButton ariaLabel={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</IconButton>
      </div>
    </nav>
    {searchOpen && <form id="navbar-search" onSubmit={submit} role="search" className="flex gap-3 pb-4">
      <label htmlFor="search-input" className="sr-only">Search movies</label><input id="search-input" ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titles, genres, a new favorite..." className="min-w-0 flex-1 rounded-button border border-text-secondary/50 bg-surface px-4 py-3 text-body placeholder:text-text-secondary" /><button type="submit" className="rounded-button bg-text-primary px-4 text-sm font-semibold text-background">Search</button>
    </form>}
    {mobileOpen && <div id="mobile-navigation" className="nav-links flex flex-col gap-5 border-t border-text-primary/10 py-6 md:hidden"><Link to="/">Home</Link>{isAuthenticated && <><Link to="/my-list">My List</Link>{accountLinks}</>}</div>}
  </header>;
}
