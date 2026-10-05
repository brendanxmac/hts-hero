// The line's chart color; lines without one keep the space, so the codes line up
export const Swatch = ({ color }: { color?: string }) => (
  <span
    className="inline-block h-2.5 w-2.5 shrink-0 rounded self-center"
    style={color ? { background: color } : undefined}
    aria-hidden
  />
);
