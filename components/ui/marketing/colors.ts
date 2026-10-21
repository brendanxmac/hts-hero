// The marketing layer's data colors: one per tariff program, the same in every visual (alerts,
// heat map, map lanes, engine diagram), so a program reads the same everywhere. Hex because they go
// into SVG and inline styles; an accepted exception (DESIGN_SYSTEM.md §14).

export const PROGRAM = {
  "Section 232": "#0ea5e9",
  "Section 301": "#f59e0b",
  "Section 338": "#f97316",
  "Section 201": "#65a30d",
  "Section 122": "#78716c",
  IEEPA: "#e11d48",
  Exemption: "#10b981",
  Base: "#0c2a5c",
} as const;

export type ProgramName = keyof typeof PROGRAM;

export const TEAL = "#0d9488";
export const NAVY = "#0c2a5c";
export const INCREASE = "#e11d48";
export const DECREASE = "#059669";

// Duty heat, light teal (0%) to deep navy (80% and up)
export const heat = (pct: number) => {
  const t = Math.min(1, Math.max(0, pct) / 80);
  const from = [204, 251, 241];
  const to = [12, 42, 92];
  return `rgb(${from.map((f, i) => Math.round(f + (to[i] - f) * t)).join(",")})`;
};
