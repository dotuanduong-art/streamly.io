import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
export function MainLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <><a href="#main-content" className="sr-only fixed left-4 top-4 z-[60] rounded-button bg-text-primary p-3 text-background focus:not-sr-only">Skip to content</a><Navbar /><main id="main-content" className={pathname === '/' ? 'flex-1' : 'flex-1 pt-24'}><Outlet /></main><Footer /></>;
}
