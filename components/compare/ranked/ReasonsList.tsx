import * as ui from "@/components/ui/styles";

// Numbered reasons, each on its own row of one card
export function ReasonsList({ reasons }: { reasons: string[] }) {
  return (
    <ol className={`${ui.card} divide-y divide-base-300`}>
      {reasons.map((reason, i) => (
        <li key={reason} className="flex items-start gap-4 px-5 py-4">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-base-200 text-xs font-semibold tabular-nums text-base-content">
            {i + 1}
          </span>
          <span className={ui.body}>{reason}</span>
        </li>
      ))}
    </ol>
  );
}
