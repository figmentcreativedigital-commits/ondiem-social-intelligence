"use client";

import type { CSSProperties } from "react";
import { ICONS, type IconName } from "./Icons";

/**
 * PortalCluster — decorative SVG composition of portals + connector lines.
 * ---------------------------------------------------------------------------
 * Recreates the brand's signature "thread of thought" — colored circular
 * portals (with icons inside) connected by curving navy line work, often
 * with a small arrow or paper-plane gesture at one end.
 *
 * The cluster is rendered as a single inline SVG so it can be sized and
 * positioned freely (e.g., absolute-positioned in a header corner).
 *
 * Two layout variants:
 *   • "horizontal"  → for headers / banners (wide and shallow)
 *   • "compact"     → for cards / sidebars (square-ish)
 *   • "vertical"    → for narrow side rails (tall and slim)
 */

type ClusterVariant = "horizontal" | "compact" | "vertical";
type LineColor = "ink" | "ink-soft" | "ink-strong";

export interface PortalClusterProps {
  variant?: ClusterVariant;
  /** Override the line color. "ink-soft" works well on the navy header. */
  line?: LineColor;
  className?: string;
  style?: CSSProperties;
  /** Optionally invert for use on dark backgrounds. */
  invert?: boolean;
}

interface NodeSpec {
  cx: number;
  cy: number;
  r: number;
  color: string;
  icon?: IconName;
}

const COLORS = {
  teal:   "#7FCFD1",
  sage:   "#7FC9A8",
  pink:   "#F189B5",
  yellow: "#F2D97D",
  peach:  "#F9B78E",
  purple: "#D08CE3",
  ink:    "#2A3B58",
  paper:  "#FFFAF5",
};

const LAYOUTS: Record<ClusterVariant, { width: number; height: number; nodes: NodeSpec[]; path: string; arrowAt?: { x: number; y: number; angle: number } }> = {
  /* ───── HORIZONTAL: 5 portals strung across, line meanders through ───── */
  horizontal: {
    width: 360,
    height: 110,
    nodes: [
      { cx: 30,  cy: 55, r: 22, color: COLORS.teal,   icon: "chat" },
      { cx: 95,  cy: 30, r: 18, color: COLORS.peach,  icon: "speech" },
      { cx: 165, cy: 70, r: 22, color: COLORS.yellow, icon: "bulb" },
      { cx: 240, cy: 35, r: 20, color: COLORS.pink,   icon: "heartChat" },
      { cx: 320, cy: 65, r: 22, color: COLORS.sage,   icon: "rocket" },
    ],
    /* Curve threads BETWEEN portals — ends near the rocket */
    path: "M 52 55 Q 70 40, 78 30 T 130 35 Q 150 60, 145 70 T 220 35 Q 245 30, 260 35 T 295 65",
    arrowAt: { x: 295, y: 65, angle: 8 },
  },
  /* ───── COMPACT: 4 portals in a loose diamond ───── */
  compact: {
    width: 200,
    height: 200,
    nodes: [
      { cx: 100, cy: 30,  r: 22, color: COLORS.teal,   icon: "speech" },
      { cx: 160, cy: 100, r: 20, color: COLORS.pink,   icon: "heartChat" },
      { cx: 100, cy: 170, r: 22, color: COLORS.yellow, icon: "bulb" },
      { cx: 40,  cy: 100, r: 22, color: COLORS.peach,  icon: "rocket" },
    ],
    path: "M 100 55 Q 130 65, 140 95 T 100 145 Q 70 140, 60 105 T 100 55",
  },
  /* ───── VERTICAL: 4 portals stacked, line cascades down-right ───── */
  vertical: {
    width: 110,
    height: 360,
    nodes: [
      { cx: 55, cy: 30,  r: 22, color: COLORS.teal,   icon: "speech" },
      { cx: 80, cy: 110, r: 18, color: COLORS.peach,  icon: "bulb" },
      { cx: 35, cy: 195, r: 22, color: COLORS.pink,   icon: "heartChat" },
      { cx: 65, cy: 295, r: 22, color: COLORS.sage,   icon: "rocket" },
    ],
    path: "M 55 55 Q 80 75, 75 100 T 50 165 Q 30 185, 35 220 T 65 270",
    arrowAt: { x: 65, y: 270, angle: 80 },
  },
};

/* Inline icon paths — tiny copies of Icons.tsx so we can render them inside
   an SVG element directly. We re-render them at the cluster scale. */
function IconPath({ name, cx, cy, size, stroke }: { name: IconName; cx: number; cy: number; size: number; stroke: string }) {
  const Comp = ICONS[name];
  // Each icon is in 24x24 viewBox; we transform-translate it into place.
  return (
    <g
      transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 24})`}
      stroke={stroke}
      fill="none"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Comp />
    </g>
  );
}

export function PortalCluster({
  variant = "horizontal",
  line = "ink",
  className,
  style,
  invert = false,
}: PortalClusterProps) {
  const layout = LAYOUTS[variant];
  const lineColor = invert
    ? "rgba(255,250,245,0.55)"
    : line === "ink-soft"
    ? "rgba(42,59,88,0.35)"
    : line === "ink-strong"
    ? COLORS.ink
    : COLORS.ink;
  const iconStroke = invert ? COLORS.paper : COLORS.ink;

  return (
    <svg
      role="img"
      aria-hidden="true"
      className={className}
      style={style}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Connector path — drawn FIRST so portals sit on top */}
      <path
        d={layout.path}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Optional small arrowhead at line end */}
      {layout.arrowAt && (
        <g
          transform={`translate(${layout.arrowAt.x} ${layout.arrowAt.y}) rotate(${layout.arrowAt.angle})`}
          stroke={lineColor}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M -8 -4 L 0 0 L -8 4" />
        </g>
      )}
      {/* Portals */}
      {layout.nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r={n.r} fill={n.color} />
          {n.icon && (
            <IconPath
              name={n.icon}
              cx={n.cx}
              cy={n.cy}
              size={n.r * 1.05}
              stroke={iconStroke}
            />
          )}
        </g>
      ))}
    </svg>
  );
}
