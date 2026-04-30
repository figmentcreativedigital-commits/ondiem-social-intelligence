"use client";

/**
 * OnDiem Logo
 * ---------------------------------------------------------------------------
 * The mark is two opposing half-discs facing each other with a thin gap —
 * read as the night/day pivot suggested by "OnDiem" (carpe diem).
 *
 * Variants:
 *   • "full"          → mark + ONDIEM wordmark on light surface (default)
 *   • "full-inverse"  → mark + wordmark on dark/navy surface
 *   • "mark"          → just the mark (light surface)
 *   • "mark-circle"   → mark inside a navy circle (favicon-style)
 *
 * Sized via the `height` prop in pixels; everything scales proportionally.
 */

type LogoVariant = "full" | "full-inverse" | "mark" | "mark-circle";

export interface LogoProps {
  variant?: LogoVariant;
  height?: number;
  className?: string;
  title?: string;
}

const INK = "#2A3B58";
const CANVAS = "#FFFAF5";

export function Logo({
  variant = "full",
  height = 28,
  className,
  title = "OnDiem",
}: LogoProps) {
  if (variant === "mark") {
    return <Mark color={INK} size={height} className={className} title={title} />;
  }
  if (variant === "mark-circle") {
    return <MarkInCircle size={height} className={className} title={title} />;
  }

  const isInverse = variant === "full-inverse";
  const fg = isInverse ? CANVAS : INK;

  // Wordmark proportions: ~5.4× the mark's width
  // height = mark height; total width ≈ 6.4× height
  const markWidth = height;
  const totalWidth = height * 6.4;

  return (
    <svg
      role="img"
      aria-label={title}
      className={className}
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* Mark */}
      <MarkPaths color={fg} size={markWidth} x={0} y={0} />
      {/* Wordmark — ONDIEM in Montserrat-style sans */}
      <text
        x={markWidth + height * 0.45}
        y={height * 0.72}
        fontFamily="var(--font-body), Montserrat, system-ui, sans-serif"
        fontWeight={700}
        fontSize={height * 0.72}
        letterSpacing={height * 0.08}
        fill={fg}
      >
        ONDIEM
      </text>
    </svg>
  );
}

/** Just the two opposing half-discs. */
function Mark({ color, size, className, title }: { color: string; size: number; className?: string; title?: string }) {
  return (
    <svg
      role="img"
      aria-label={title}
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}
      <MarkPaths color={color} size={size} x={0} y={0} />
    </svg>
  );
}

/** Mark inside a filled navy circle — for use as a stand-alone icon. */
function MarkInCircle({ size, className, title }: { size: number; className?: string; title?: string }) {
  return (
    <svg
      role="img"
      aria-label={title}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}
      <circle cx="30" cy="30" r="30" fill={INK} />
      {/* Inner mark — both half-discs in cream, scaled inside the circle */}
      <path d="M28 8 A22 22 0 0 0 28 52 Z" fill={CANVAS} />
      <path d="M32 8 A22 22 0 0 1 32 52 Z" fill={CANVAS} />
    </svg>
  );
}

/**
 * Two opposing half-discs with a thin gap between them.
 * The left half-disc has its curve on the left, flat edge on the right.
 * The right half-disc has its flat edge on the left, curve on the right.
 */
function MarkPaths({ color, size, x, y }: { color: string; size: number; x: number; y: number }) {
  // Drawn within an internal coordinate space of [0, 60] then scaled to size.
  const s = size / 60;
  const tx = (n: number) => x + n * s;
  const ty = (n: number) => y + n * s;

  return (
    <g>
      {/* Left half-disc: arcs from top (28,2) DOWN through left edge to bottom (28,58) */}
      <path
        d={`M ${tx(28)} ${ty(2)} A ${26 * s} ${28 * s} 0 0 0 ${tx(28)} ${ty(58)} Z`}
        fill={color}
      />
      {/* Right half-disc: arcs from top (32,2) DOWN through right edge to bottom (32,58) */}
      <path
        d={`M ${tx(32)} ${ty(2)} A ${26 * s} ${28 * s} 0 0 1 ${tx(32)} ${ty(58)} Z`}
        fill={color}
      />
    </g>
  );
}
