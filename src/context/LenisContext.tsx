import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface LenisContextValue {
  velocityRef: React.MutableRefObject<number>;
  progressRef: React.MutableRefObject<number>;
  scrollYRef: React.MutableRefObject<number>;
  stop: () => void;
  start: () => void;
  scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
}

const LenisContext = createContext<LenisContextValue | null>(null);

export const LenisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const velocityRef = useRef(0);
  const progressRef = useRef(0);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.18,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ({ scroll, progress, velocity }: { scroll: number; progress: number; velocity: number }) => {
      scrollYRef.current = scroll;
      progressRef.current = progress;
      velocityRef.current = velocity;
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const stop = () => lenisRef.current?.stop();
  const start = () => lenisRef.current?.start();
  const scrollTo = (target: string | number | HTMLElement, offset = 0) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset });
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  };

  return (
    <LenisContext.Provider value={{ velocityRef, progressRef, scrollYRef, stop, start, scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
};

export function useLenis(): LenisContextValue {
  const ctx = useContext(LenisContext);
  if (!ctx) {
    throw new Error('useLenis must be used inside LenisProvider');
  }
  return ctx;
}
