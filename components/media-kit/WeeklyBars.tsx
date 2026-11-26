import { atLeast, exact } from "./format";

// A week-by-week bar chart, drawn in HTML so it renders on the server at any width. Each bar has
// its value above it; a week still in progress is drawn lighter and labelled. A table carries the
// same numbers for screen readers.

export interface Bar {
  label: string;
  value: number;
  partial?: boolean;
}

export const WeeklyBars = ({ bars, name, height = 220 }: { bars: Bar[]; name: string; height?: number }) => {
  const max = Math.max(1, ...bars.map((b) => b.value));
  // Every other label when there are many weeks, so they don't collide
  const step = bars.length > 9 ? 2 : 1;
  return (
    <figure className="m-0">
      <div className="flex items-end gap-1.5 sm:gap-2.5" style={{ height }} aria-hidden>
        {bars.map((b) => (
          <div key={b.label} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <span className="mb-1.5 text-center text-[11px] font-semibold tabular-nums text-slate-500 skin:text-base-content/60">
              {b.value > 0 ? atLeast(b.value).replace("+", "") : ""}
            </span>
            <div
              className={`w-full rounded-t-md ${b.partial ? "bg-teal-500/35 skin:bg-primary/35" : "bg-teal-500 skin:bg-primary"}`}
              style={{ height: `${Math.max((b.value / max) * 100, b.value > 0 ? 1.5 : 0)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 border-t border-slate-200 pt-2 sm:gap-2.5 skin:border-base-300" aria-hidden>
        {bars.map((b, i) => (
          <span key={b.label} className="min-w-0 flex-1 truncate text-center text-[11px] text-slate-500 skin:text-base-content/60">
            {i % step === (bars.length - 1) % step ? (b.partial ? `${b.label}*` : b.label) : ""}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{name}</caption>
        <thead>
          <tr>
            <th scope="col">Week of</th>
            <th scope="col">{name}</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((b) => (
            <tr key={b.label}>
              <td>{b.partial ? `${b.label} (in progress)` : b.label}</td>
              <td>{exact(b.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};
