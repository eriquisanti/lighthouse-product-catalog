export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-brand" />
        <path d="M10 16 L26 9 V23 Z" fill="#FFFFFF" fillOpacity="0.35" />
        <circle cx="10" cy="16" r="3.5" fill="#FFFFFF" />
      </svg>
      <div className="leading-none">
        <p className="font-display text-base font-bold tracking-tight">Lighthouse</p>
        <p className="mt-1 text-xs text-muted">Catálogo de produtos</p>
      </div>
    </div>
  );
}
