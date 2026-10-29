import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { motionTiming } from '@/lib/motion';

export function Reveal({ children, className, delay = 0, onMount = false }: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onMount?: boolean;
}) {
  const reduced = useReducedMotion();
  return <motion.div className={className}
    initial={reduced ? false : { opacity: 0, y: 12 }}
    animate={onMount ? { opacity: 1, y: 0 } : undefined}
    whileInView={onMount ? undefined : { opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.08 }}
    transition={{ duration: reduced ? 0 : motionTiming.enter, delay: reduced ? 0 : delay, ease: motionTiming.ease }}
  >{children}</motion.div>;
}
