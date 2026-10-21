import { PRIMARY_MARK, MUTED_MARK } from "../theme";
import * as ui from "../styles";

// Made-up dots on a rate axis, drawn behind a LockedPreview's blur in place of the Analysis
const DOTS = Array.from({ length: 64 }, (_, i) => ({
  x: 4 + ((i * 37) % 92),
  y: 44 - ((i * 13) % 5) * 7,
}));

export const SwarmStandIn = () => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-3 gap-4">
      {["Your rank", "Cheaper origins", "Lowest rate"].map((label, i) => (
        <div key={label} className="flex flex-col gap-1">
          <span className={ui.label}>{label}</span>
          <span className={ui.metric.secondary}>{["#87", "41", "0.0%"][i]}</span>
        </div>
      ))}
    </div>
    <svg viewBox="0 0 100 50" className="h-56 w-full">
      <line x1="0" y1="48" x2="100" y2="48" stroke={MUTED_MARK} strokeWidth="0.4" />
      {DOTS.map((d, i) => (
        // Theme marks (DESIGN_SYSTEM §10)
        <circle key={i} cx={d.x} cy={d.y} r="2.2" fill={i === 20 ? PRIMARY_MARK : MUTED_MARK} />
      ))}
    </svg>
  </div>
);
