import React, { useEffect, useRef, useState } from 'react';

export const CyberCursor: React.FC = () => {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState<string>('');
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!finePointer) return;

    setEnabled(true);
    document.body.classList.add('cyber-cursor-active');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        if (outerRef.current) outerRef.current.style.opacity = '1';
        if (dotRef.current) dotRef.current.style.opacity = '1';
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const labelled = target.closest<HTMLElement>('[data-cursor]');
      if (labelled) {
        setLabel(labelled.dataset.cursor || '');
        setActive(true);
        return;
      }
      const interactive = target.closest('a, button, input, select, textarea, [role="button"]');
      if (interactive) {
        setLabel('');
        setActive(true);
      } else {
        setLabel('');
        setActive(false);
      }
    };

    const onLeave = () => {
      visible = false;
      setLabel('');
      setActive(false);
      if (outerRef.current) outerRef.current.style.opacity = '0';
      if (dotRef.current) dotRef.current.style.opacity = '0';
    };

    const onResetBadge = () => {
      setLabel('');
      setActive(false);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onResetBadge, { passive: true });
    window.addEventListener('resize', onLeave);
    window.addEventListener('blur', onLeave);
    document.addEventListener('pointerdown', onResetBadge, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    let rafId = 0;
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      document.body.classList.remove('cyber-cursor-active');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onResetBadge);
      window.removeEventListener('resize', onLeave);
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('pointerdown', onResetBadge);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Expanding Tactical HUD Reticle */}
      <div
        ref={outerRef}
        style={{ opacity: 0 }}
        className={`pointer-events-none fixed top-0 left-0 z-[9998] flex items-center justify-center transition-[width,height,border-color,background-color] duration-200 will-change-transform ${
          label
            ? 'h-9 min-w-[78px] px-2.5 border border-cyanHud/85 bg-[#030406]/85 shadow-cyan'
            : active
              ? 'h-10 w-10 border border-cyanHud/80 bg-shark/15'
              : 'h-7 w-7 border border-shark/70 bg-transparent'
        }`}
      >
        {/* Corner tactical ticks */}
        <span className="absolute -top-[1px] -left-[1px] h-1.5 w-1.5 border-t border-l border-cyanHud" />
        <span className="absolute -top-[1px] -right-[1px] h-1.5 w-1.5 border-t border-r border-cyanHud" />
        <span className="absolute -bottom-[1px] -left-[1px] h-1.5 w-1.5 border-b border-l border-cyanHud" />
        <span className="absolute -bottom-[1px] -right-[1px] h-1.5 w-1.5 border-b border-r border-cyanHud" />
        {label && (
          <span className="font-mono text-[9px] font-bold tracking-[0.24em] text-cyanHud whitespace-nowrap">
            {label}
          </span>
        )}
      </div>

      {/* Zero-Lag Center Laser Dot */}
      <div
        ref={dotRef}
        style={{ opacity: 0 }}
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-1.5 w-1.5 rounded-full bg-cyanHud shadow-[0_0_10px_#00E5FF] will-change-transform"
      />
    </>
  );
};
