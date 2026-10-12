import * as ui from "@/components/ui/styles";

// A row of headline numbers in one card, divided by 1px rules (DESIGN_SYSTEM "Stat row")
export interface Stat {
  label: string;
  value: string;
  note?: string;
  tone?: "primary" | "success" | "error";
}

const TONES = { primary: "text-primary", success: "text-success", error: "text-error" };

export const StatRow = ({ stats }: { stats: Stat[] }) => (
  <div className={ui.card}>
    <dl className={`grid grid-cols-2 gap-px bg-base-300 ${stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {stats.map((s) => (
        <div key={s.label} className="bg-base-100 p-5">
          <dt className={ui.label}>{s.label}</dt>
          <dd className={`mt-2 text-2xl font-semibold leading-none tracking-tight tabular-nums ${s.tone ? TONES[s.tone] : "text-base-content"}`}>{s.value}</dd>
          {s.note && (
            <dd className="mt-2 truncate text-xs text-base-content/60" title={s.note}>
              {s.note}
            </dd>
          )}
        </div>
      ))}
    </dl>
  </div>
);
