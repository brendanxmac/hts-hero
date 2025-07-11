import SVG, { SVGProps } from "./SVG";

export default function SearchSVG({ color, size, viewBox }: SVGProps) {
  return (
    <SVG
      color={color}
      size={size}
      viewBox={viewBox}
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      }
    />
  );
}
