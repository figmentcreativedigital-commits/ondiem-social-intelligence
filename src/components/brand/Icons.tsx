"use client";

/**
 * Brand icons — single-line hand-drawn style per onDiem guidelines.
 * ---------------------------------------------------------------------------
 * These are drawn to live INSIDE portals (colored circles), so they assume a
 * 24×24 viewBox and inherit `stroke` from the parent .portal selector.
 * No fills; stroke-only with rounded caps to match the brand line-work feel.
 */

import type { SVGProps } from "react";

type Icon = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  // stroke comes from CSS .portal > svg
};

export const ChatIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M5 9.5c0-2.5 2.4-4.5 5.4-4.5h2.7c3 0 5.4 2 5.4 4.5s-2.4 4.5-5.4 4.5h-1.6L7.4 17l.6-3.4C6 13 5 11.4 5 9.5z" />
  </svg>
);

export const SpeechIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 8.5c0-2 1.7-3.5 3.8-3.5h7.4c2.1 0 3.8 1.5 3.8 3.5v3c0 2-1.7 3.5-3.8 3.5h-4l-3.7 3 .4-3c-2 0-3.9-1.5-3.9-3.5v-3z" />
    <circle cx="9.5" cy="10" r=".6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r=".6" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="10" r=".6" fill="currentColor" stroke="none" />
  </svg>
);

export const LightbulbIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.5a5 5 0 0 0-3 9c.6.5 1 1.2 1 2v1h4v-1c0-.8.4-1.5 1-2a5 5 0 0 0-3-9z" />
    <path d="M10 18.5h4M10.5 21h3" />
  </svg>
);

export const RocketIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M14 4c3 0 6 3 6 6l-7 7-3-3 7-7c-2-1-3-1.5-3-3z" />
    <path d="M9 14l-3 3M7 12l-3 3M11 16l-2 2M5 19l-1 1" />
  </svg>
);

export const PaperPlaneIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M20.5 4.5L3.5 11l6 2.5M20.5 4.5l-9 15-2-6.5M20.5 4.5l-11 9" />
  </svg>
);

export const PuzzleIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M9 4h6v2.5a1.5 1.5 0 1 0 3 0V6h2v6h-1.5a1.5 1.5 0 1 0 0 3H20v5h-5v-1.5a1.5 1.5 0 1 0-3 0V20H7v-6h.5a1.5 1.5 0 1 0 0-3H7V4h2z" />
  </svg>
);

export const ToothIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 4c-2.5 0-4 1-5.5 1S4 4.5 4 7c0 2 1 4 1.5 6S6 17 6.5 19s1 1.5 1.5 1c.7-.7.5-3 1-4.5s.5-2.5 3-2.5 2.5 1 3 2.5.3 3.8 1 4.5c.5.5 1 1 1.5-1s.5-4 1-6S20 9 20 7c0-2.5-1-2-2.5-2S14.5 4 12 4z" />
  </svg>
);

export const HeartChatIcon: Icon = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 9c0-2 1.6-3.5 3.5-3.5H16c2 0 3.5 1.5 3.5 3.5v3c0 2-1.5 3.5-3.5 3.5h-3.5L8 19l.4-3.5c-2 0-3.9-1.5-3.9-3.5V9z" />
    <path d="M9.5 10.5c0-.8.7-1.5 1.5-1.5.7 0 1 .4 1 .8.1-.4.4-.8 1.1-.8.8 0 1.5.7 1.5 1.5 0 1.7-2.6 3-2.6 3s-2.5-1.3-2.5-3z" />
  </svg>
);

/** Icon name → component map, useful for data-driven layouts. */
export const ICONS = {
  chat: ChatIcon,
  speech: SpeechIcon,
  bulb: LightbulbIcon,
  rocket: RocketIcon,
  plane: PaperPlaneIcon,
  puzzle: PuzzleIcon,
  tooth: ToothIcon,
  heartChat: HeartChatIcon,
} as const;

export type IconName = keyof typeof ICONS;
