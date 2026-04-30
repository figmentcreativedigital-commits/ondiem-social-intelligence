"use client";

import type { ReactNode } from "react";
import { ICONS, type IconName } from "./Icons";

/**
 * Portal — a colored solid circle housing an icon or imagery.
 * ---------------------------------------------------------------------------
 * Brand element from page 12 of the guidelines. Used both standalone
 * (decoration) and grouped in clusters connected by line work.
 *
 * Usage:
 *   <Portal color="teal" size={48} icon="chat" />
 *   <Portal color="pink" size={64}><CustomSVG /></Portal>
 */

type PortalColor =
  | "teal"
  | "sage"
  | "pink"
  | "yellow"
  | "peach"
  | "purple"
  | "ink"
  | "paper";

export interface PortalProps {
  color?: PortalColor;
  size?: number; // px
  icon?: IconName;
  children?: ReactNode; // alternative to icon prop
  className?: string;
  style?: React.CSSProperties;
}

export function Portal({
  color = "teal",
  size = 56,
  icon,
  children,
  className,
  style,
}: PortalProps) {
  const cx = ["portal", `portal--${color}`, className].filter(Boolean).join(" ");
  const IconComponent = icon ? ICONS[icon] : null;
  return (
    <span
      className={cx}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      {IconComponent ? <IconComponent /> : children}
    </span>
  );
}
