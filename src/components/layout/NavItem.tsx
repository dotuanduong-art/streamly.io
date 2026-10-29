import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { motionTiming } from '@/lib/motion';

export function NavIndicator({ mobile = false }: { mobile?: boolean }) {
  const reduced = useReducedMotion();
  return <motion.span aria-hidden="true" layoutId={mobile ? 'mobile-nav-indicator' : 'nav-indicator'} className="absolute inset-x-0 -bottom-2 h-0.5 rounded-full bg-brand" transition={{ duration: reduced ? 0 : motionTiming.fast, ease: motionTiming.ease }} />;
}

export function NavItem({ to, end, mobile, children }: { to: string; end?: boolean; mobile?: boolean; children: ReactNode }) {
  return <NavLink to={to} end={end} className="nav-item relative w-fit rounded-button">{({ isActive }) => <>{children}{isActive && <NavIndicator mobile={mobile} />}</>}</NavLink>;
}
