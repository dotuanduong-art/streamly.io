import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/movie/SearchBar';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/Avatar';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(window.scrollY > 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => { setMobileOpen(false); setAccountOpen(false); setSearchOpen(false); }, [location]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  const signOut = () => {
    const leaveProtectedPage = /^\/(my-list|history|profile|admin)(\/|$)/.test(location.pathname);
    logout();
    queryClient.removeQueries({ queryKey: ['my-list'] });
    queryClient.removeQueries({ queryKey: ['history'] });
    queryClient.removeQueries({ queryKey: ['profile'] });
    if (leaveProtectedPage) window.setTimeout(() => navigate('/', { replace: true }), 0);
    setAccountOpen(false);
    setMobileOpen(false);
  };
  const accountLinks = <><Link to="/profile">Hồ sơ</Link><Link to="/history">Lịch sử xem</Link>{user?.role === 'Admin' && <Link to="/admin">Quản trị</Link>}<button className="text-left" onClick={signOut}>Đăng xuất</button></>;
  return <header className={`page-gutter fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || mobileOpen || searchOpen || location.pathname !== '/' ? 'bg-background shadow-nav' : 'bg-transparent'}`}
    onKeyDown={(event) => {
      if (event.key === 'Escape') { setAccountOpen(false); setMobileOpen(false); setSearchOpen(false); }
    }}>
    <nav aria-label="Điều hướng chính" className="flex h-20 items-center gap-6 md:gap-10">
      <Link to="/" aria-label="Trang chủ Streamly" className="text-2xl font-extrabold tracking-tight text-brand">Streamly<span className="text-text-primary">.</span></Link>
      <div className="hidden items-center gap-7 text-sm md:flex"><NavLink to="/" end className={({ isActive }) => isActive ? 'font-semibold text-text-primary' : 'text-text-secondary'}>Trang chủ</NavLink>{isAuthenticated && <NavLink to="/my-list">Danh sách của tôi</NavLink>}</div>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <IconButton data-testid="search-toggle" ariaLabel={searchOpen ? 'Đóng tìm kiếm' : 'Mở tìm kiếm'} aria-expanded={searchOpen} aria-controls="navbar-search" onClick={() => setSearchOpen(!searchOpen)}>{searchOpen ? <X size={20} /> : <Search size={20} />}</IconButton>
        {!isAuthenticated ? <Link to="/login" className="whitespace-nowrap rounded-button bg-brand px-4 py-2 text-sm font-semibold leading-snug hover:bg-brand-hover">Đăng nhập</Link> : <div ref={accountRef} className="relative hidden md:block">
          <button aria-label="Trình đơn tài khoản" aria-expanded={accountOpen} aria-controls="account-links" className="flex items-center gap-2 rounded-button" onClick={() => setAccountOpen(!accountOpen)}><Avatar name={user?.displayName ?? 'Người dùng'} avatarUrl={user?.avatarUrl} className="h-9 w-9" /><ChevronDown size={16} /></button>
          {accountOpen && <div id="account-links" className="nav-links absolute right-0 top-full mt-3 flex w-44 flex-col gap-4 rounded-card border border-text-primary/10 bg-surface p-5 shadow-card">{accountLinks}</div>}
        </div>}
        <IconButton ariaLabel={mobileOpen ? 'Đóng trình đơn' : 'Mở trình đơn'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</IconButton>
      </div>
    </nav>
    {searchOpen && <div id="navbar-search" className="pb-4"><SearchBar autoFocus compact onSubmit={(nextQuery) => { navigate(`/search?q=${encodeURIComponent(nextQuery)}`); setSearchOpen(false); }} /></div>}
    {mobileOpen && <div id="mobile-navigation" className="nav-links flex flex-col gap-5 border-t border-text-primary/10 py-6 md:hidden"><Link to="/">Trang chủ</Link>{isAuthenticated && <><Link to="/my-list">Danh sách của tôi</Link>{accountLinks}</>}</div>}
  </header>;
}
