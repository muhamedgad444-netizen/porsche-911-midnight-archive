import React, { useEffect, useRef } from 'react';
import { useLenis } from '../context/LenisContext';

interface VelocitySkewProps {
  children: React.ReactNode;
  maxSkew?: number;
  className?: string;
}

export const VelocitySkew: React.FC<VelocitySkewProps> = ({
  children,
  maxSkew = 2.8,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { velocityRef } = useLenis();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let currentSkew = 0;
    let rafId = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const raw = velocityRef.current * 0.045;
      const clamped = Math.max(-maxSkew, Math.min(maxSkew, raw));
      currentSkew += (clamped - currentSkew) * 0.12;

      if (ref.current) {
        if (Math.abs(currentSkew) < 0.015) {
          ref.current.style.transform = 'skewY(0deg)';
        } else {
          ref.current.style.transform = `skewY(${currentSkew.toFixed(3)}deg)`;
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [maxSkew, velocityRef]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};
