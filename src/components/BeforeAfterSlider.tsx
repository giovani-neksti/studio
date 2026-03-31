'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  alt?: string;
}

export function BeforeAfterSlider({ before, after, alt = 'Comparação' }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  }, [isDragging, updatePosition]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Animate the slider on mount to hint interactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setPosition(35);
      setTimeout(() => setPosition(65), 400);
      setTimeout(() => setPosition(50), 800);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/5] rounded-2xl md:rounded-[var(--shape-extra-large)] overflow-hidden cursor-col-resize select-none touch-none elevation-2 group"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After (full background) */}
      <img
        src={after}
        alt={`${alt} — depois`}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={before}
          alt={`${alt} — antes`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth || '100%' }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow-lg z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/95 shadow-xl flex items-center justify-center backdrop-blur-sm transition-transform duration-150 group-hover:scale-110">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" className="text-[var(--on-surface)] md:w-[18px] md:h-[18px]">
            <path d="M5 9L2 6M5 9L2 12M5 9H2M13 9L16 6M13 9L16 12M13 9H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 md:top-3 md:left-3 z-20 px-2 py-0.5 md:px-2.5 md:py-1 rounded-[var(--shape-small)] bg-black/60 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium pointer-events-none">
        Antes
      </div>
      <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20 px-2 py-0.5 md:px-2.5 md:py-1 rounded-[var(--shape-small)] bg-black/60 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium pointer-events-none">
        Depois
      </div>
    </div>
  );
}
