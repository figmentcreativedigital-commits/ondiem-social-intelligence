"use client";

import type { ReactNode } from "react";

/**
 * Pill — signature onDiem brand device.
 * ---------------------------------------------------------------------------
 * Inline highlight around a key word in a serif headline. Comes from the
 * brand guidelines treatment of "**New** Brand Guidelines",
 * "Carpe diem, meet **your** dental team", "Need help in **St. Louis** this week?"
 *
 * Usage:
 *   <h1 className="t-display-xl">
 *     This Week in <Pill color="teal">Social</Pill>
 *   </h1>
 *
 * The pill inherits the parent's font family + weight + size — it is purely a
 * background swatch around the text. Use box-decoration-break: clone via
 * the .pill class so that line-wrapped pills render correctly.
 */

type PillColor = "teal" | "sage" | "pink" | "yellow" | "peach" | "purple";

export interface PillProps {
  children: ReactNode;
  color?: PillColor;
  className?: string;
}

export function Pill({ children, color = "teal", className }: PillProps) {
  const cx = ["pill", `pill--${color}`, className].filter(Boolean).join(" ");
  return <span className={cx}>{children}</span>;
}

/** PillTag — the smaller, fully-rounded badge used for status / labels.
 *  This is distinct from the headline Pill above. */
export interface PillTagProps {
  children: ReactNode;
  variant?: "default" | "on-ink";
  withDot?: boolean;
  className?: string;
}

export function PillTag({
  children,
  variant = "default",
  withDot = false,
  className,
}: PillTagProps) {
  const cx = [
    "pill-tag",
    variant === "on-ink" && "pill-tag--on-ink",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cx}>
      {withDot && <span className="dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
