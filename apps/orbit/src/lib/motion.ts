// Motion tokens aligned with Apple-style micro-interactions
export const MotionTokens = {
  duration: {
    fast: 0.15,
    base: 0.25,
    slow: 0.35,
  },
  ease: {
    easeOut: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
    easeInOut: [0.4, 0.0, 0.2, 1.0] as [number, number, number, number],
  },
} as const;
