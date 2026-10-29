// Seconds. Keep motion short enough that navigation never waits for it.
export const motionTiming = {
  fast: 0.16,
  enter: 0.32,
  route: 0.14,
  stagger: 0.035,
  ease: [0.22, 1, 0.36, 1] as const,
};
