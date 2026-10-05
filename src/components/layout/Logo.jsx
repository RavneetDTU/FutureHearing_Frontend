export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M13 26c0-4 6-5 6-11a7 7 0 0 0-14 0" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M10 15a2 2 0 1 1 4 0c0 2-2 2.5-2 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M21 6a11 11 0 0 1 5 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity=".75" />
      <path d="M23.5 3a14 14 0 0 1 6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="sidebar-brand-logo">
      <LogoMark />
      <span>
        <strong>Future</strong> Hearing
      </span>
    </div>
  );
}
