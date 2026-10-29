import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { motion, useReducedMotion } from 'framer-motion';
import { motionTiming } from '@/lib/motion';
export function MainLayout() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const isWatchPage = pathname.startsWith('/watch/');
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <><a href="#main-content" className="sr-only fixed left-4 top-4 z-[60] rounded-button bg-text-primary p-3 text-background focus:not-sr-only">Chuyển đến nội dung</a>{!isWatchPage && <Navbar />}<main id="main-content" className={pathname === '/' || isWatchPage ? 'flex-1' : 'flex-1 pt-24'}><motion.div key={pathname} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : motionTiming.route }}><Outlet /></motion.div></main>{!isWatchPage && <Footer />}</>;
}
