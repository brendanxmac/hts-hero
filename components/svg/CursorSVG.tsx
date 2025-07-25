import SVG, { SVGProps } from "./SVG";

export default function CursorSVG({ color, size, viewBox }: SVGProps) {
  return (
    <SVG
      color={color}
      size={size}
      viewBox={viewBox}
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
        />
      }
    />
  );
}
