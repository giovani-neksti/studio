'use client';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  alt?: string;
}

export function BeforeAfterSlider({ before, after, alt = 'Comparação' }: BeforeAfterSliderProps) {
  return (
    <div className="w-full flex gap-2 md:gap-3">
      {/* Before */}
      <div className="flex-1 relative rounded-xl md:rounded-2xl overflow-hidden elevation-1">
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-[var(--shape-small)] bg-black/60 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium pointer-events-none">
          Antes
        </div>
        <img
          src={before}
          alt={`${alt} — antes`}
          className="w-full aspect-[3/4] object-cover"
          draggable={false}
        />
      </div>

      {/* After */}
      <div className="flex-1 relative rounded-xl md:rounded-2xl overflow-hidden elevation-1">
        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-[var(--shape-small)] bg-black/60 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium pointer-events-none">
          Depois
        </div>
        <img
          src={after}
          alt={`${alt} — depois`}
          className="w-full aspect-[3/4] object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
}
