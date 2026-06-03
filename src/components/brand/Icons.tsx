"use client";

import type { SVGProps, ReactElement, ComponentType } from "react";

export type IconName =
  | "chat"
  | "speech"
  | "bulb"
  | "rocket"
  | "plane"
  | "puzzle"
  | "tooth"
  | "heartChat";

const PATHS: Record<IconName, string[]> = {
  chat: [
    "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2z",
    "M5 8h14M5 12h10M5 16h7",
  ],
  speech: ["M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2z"],
  bulb: ["M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11.4 4 4 0 0 1 1 2.6h4a4 4 0 0 1 1-2.6A6 6 0 0 0 12 3z"],
  rocket: ["M5 13a8 8 0 0 1 14-7 8 8 0 0 1-7 14l-1 4-3-2-2-3 4-1zM12 9.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"],
  plane: ["M3 18l6-3 6-9 4 1-3 6 3 6-1 4-9-6-3 6-3-1z"],
  puzzle: ["M5 4h5v3a2 2 0 1 0 4 0V4h5v5h-3a2 2 0 1 0 0 4h3v5h-5v-3a2 2 0 1 0-4 0v3H5v-5h3a2 2 0 1 0 0-4H5z"],
  tooth: ["M8 3h8a3 3 0 0 1 3 3c0 2-1 3-1 5l-1 6a2 2 0 0 1-4 0l-1-3-1 3a2 2 0 0 1-4 0l-1-6c0-2-1-3-1-5a3 3 0 0 1 3-3z"],
  heartChat: [
    "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2z",
    "M12 9.5l-1.5-1.5a2 2 0 0 0-3 3l4.5 4.5 4.5-4.5a2 2 0 0 0-3-3z",
  ],
};

type IconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  size?: number | string;
};

function makeIcon(name: IconName): ComponentType<IconProps> {
  const Component = ({ size = 24, ...rest }: IconProps): ReactElement => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {PATHS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
  Component.displayName = `Icon.${name}`;
  return Component;
}

export const chat = makeIcon("chat");
export const speech = makeIcon("speech");
export const bulb = makeIcon("bulb");
export const rocket = makeIcon("rocket");
export const plane = makeIcon("plane");
export const puzzle = makeIcon("puzzle");
export const tooth = makeIcon("tooth");
export const heartChat = makeIcon("heartChat");

export const ICONS: Record<IconName, ComponentType<IconProps>> = {
  chat,
  speech,
  bulb,
  rocket,
  plane,
  puzzle,
  tooth,
  heartChat,
};
