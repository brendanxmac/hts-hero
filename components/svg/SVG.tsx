import type { JSX } from "react";

export interface SVGBaseProps extends SVGProps {
  path: JSX.Element;
}

export interface SVGProps {
  color?: string;
  size?: number;
  viewBox: string;
  fill?: boolean;
}

export default function SVG({
  color,
  size,
  path,
  viewBox,
  fill = false,
}: SVGBaseProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill={"none"}
      strokeWidth="1.5"
      stroke={color ? color : "currentColor"}
      className={`h-${size || 5} w-${
        size || 5
      } inline shrink-0 opacity-80 text-${color || "white"}`}
    >
      {path}
    </svg>
  );
}
