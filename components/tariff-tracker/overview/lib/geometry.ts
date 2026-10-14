// Paths for the Overview's small charts, in a w × h box

// A straight-segment line through values, scaled to the box
export const sparkPath = (values: number[], w: number, h: number, pad = 2) => {
  if (values.length < 2) return `M${pad} ${h / 2}H${w - pad}`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join("");
};
