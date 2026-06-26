export function Logo({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 19 19" fill="none">
      <rect x="2" y="2" width="6.5" height="6.5" rx="1.8" fill="white" opacity="0.9" />
      <rect x="10.5" y="2" width="6.5" height="6.5" rx="1.8" fill="white" opacity="0.55" />
      <rect x="2" y="10.5" width="6.5" height="6.5" rx="1.8" fill="white" opacity="0.55" />
      <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.8" fill="white" opacity="0.9" />
    </svg>
  );
}

export function LogoLarge() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="3" width="9.5" height="9.5" rx="2.5" fill="white" opacity="0.9" />
      <rect x="15.5" y="3" width="9.5" height="9.5" rx="2.5" fill="white" opacity="0.55" />
      <rect x="3" y="15.5" width="9.5" height="9.5" rx="2.5" fill="white" opacity="0.55" />
      <rect x="15.5" y="15.5" width="9.5" height="9.5" rx="2.5" fill="white" opacity="0.9" />
    </svg>
  );
}

export function CheckIcon({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" fill="none">
      <path
        d="M1 4.5l2.5 2.5 4.5-4.5"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <path
        d="M6.5 1.5v10M1.5 6.5h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="4.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M1 12c0-2 1.6-3.5 3.5-3.5S8 10 8 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9.5 8.5c1.2.4 2.1 1.6 2.1 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FileIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M7.5 1.5H3a1 1 0 00-1 1v9a1 1 0 001 1h7a1 1 0 001-1V5L7.5 1.5z"
        stroke="#8FAE94"
        strokeWidth="1.3"
      />
      <path d="M7.5 1.5V5H11" stroke="#8FAE94" strokeWidth="1.3" />
    </svg>
  );
}
