import Link from "next/link";

const STUDY_URL =
  process.env.NEXT_PUBLIC_STUDY_URL ??
  "https://shreyankkadadi.com/studio/hanga";

export function PaperTexture() {
  return <div className="paper-texture" aria-hidden="true" />;
}

export function HankoSeal() {
  return (
    <Link
      href={STUDY_URL}
      className="seal-hover block"
      aria-label="hanga study — shreyank kadadi"
    >
      <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 44 44" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="38"
          height="38"
          rx="1"
          fill="none"
          stroke="var(--vermillion)"
          strokeWidth="2"
          opacity="0.85"
        />
        <g transform="translate(22, 22)">
          <circle cx="0" cy="-5" r="4" fill="var(--vermillion)" opacity="0.8" />
          <circle cx="-5" cy="3" r="4" fill="var(--vermillion)" opacity="0.8" />
          <circle cx="5" cy="3" r="4" fill="var(--vermillion)" opacity="0.8" />
          <circle cx="0" cy="0" r="2.5" fill="var(--washi)" />
        </g>
      </svg>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="mb-10 sm:mb-14 seal-reveal delay-0">
      <HankoSeal />
    </header>
  );
}

export function BrushDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-24 sm:w-32 h-3 brush-stroke-reveal delay-2 ${className}`}
      viewBox="0 0 100 8"
      aria-hidden="true"
    >
      <path
        d="M0,4 Q5,2 15,4 T35,3 T55,5 T75,3 T95,4 L100,4"
        stroke="var(--brush-gray)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

export function PlumBlossom() {
  return (
    <svg
      className="fixed bottom-12 left-8 sm:bottom-20 sm:left-16 w-16 sm:w-20 h-auto pointer-events-none ink-wash-reveal delay-very-late"
      style={{ "--wash-opacity": "0.18" } as React.CSSProperties}
      viewBox="0 0 60 60"
      aria-hidden="true"
    >
      <circle cx="30" cy="30" r="3" fill="var(--umber)" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="30"
          cy="15"
          rx="8"
          ry="12"
          fill="var(--ink)"
          opacity="0.5"
          transform={`rotate(${deg} 30 30)`}
        />
      ))}
    </svg>
  );
}

export function InkWash() {
  return (
    <svg
      className="fixed top-8 right-8 sm:top-16 sm:right-16 w-48 sm:w-64 h-auto ink-wash-reveal delay-late pointer-events-none"
      style={{ "--wash-opacity": "0.12" } as React.CSSProperties}
      viewBox="0 0 200 80"
      aria-hidden="true"
    >
      <ellipse cx="60" cy="40" rx="52" ry="28" fill="var(--ink)" opacity="0.25" />
      <ellipse cx="120" cy="35" rx="62" ry="32" fill="var(--ink)" opacity="0.2" />
      <ellipse cx="155" cy="42" rx="38" ry="22" fill="var(--ink)" opacity="0.15" />
    </svg>
  );
}
