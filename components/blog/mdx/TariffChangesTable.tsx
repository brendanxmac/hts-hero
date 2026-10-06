import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { getTariffChanges, type ChangeKind, type TariffChangeRow } from "@/libs/tariff-changes/changes";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatPostDate } from "../lib/format";

// Every 2026 change to a Chapter 99 tariff, generated from the calculator's own data when the
// site builds: upcoming changes first, then each month's changes, newest first. In MDX:
// <TariffChangesTable />

const OPEN_MONTHS = 2;

// A rate going up costs importers more (red); down or an exemption costs less (green)
const tone = (row: TariffChangeRow): Parameters<typeof ui.badge>[0] => {
  if (row.kind === "Rate change") {
    const [before, after] = row.detail.split("→").map((s) => parseFloat(s));
    if (!Number.isNaN(before) && !Number.isNaN(after)) return after > before ? "error" : "success";
  }
  if (row.kind === "New tariff") return row.detail.startsWith("Exemption") ? "success" : "error";
  if (row.kind === "Coverage change") return "warning";
  return "neutral";
};

const KIND_LABELS: Record<ChangeKind, string> = {
  "New tariff": "New",
  "Rate change": "Rate change",
  "Coverage change": "Coverage",
  "Terms updated": "Terms",
  Ended: "Ended",
};

const monthLabel = (yyyyMm: string) =>
  new Date(`${yyyyMm}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

function ChangesRows({ rows }: { rows: TariffChangeRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-base-200">
          <tr>
            <th scope="col" className={`${ui.label} px-4 py-3 pl-5 text-left`}>Date</th>
            <th scope="col" className={`${ui.label} px-4 py-3 text-left`}>Heading</th>
            <th scope="col" className={`${ui.label} px-4 py-3 text-left`}>Change</th>
            <th scope="col" className={`${ui.label} px-4 py-3 pr-5 text-left`}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const code = r.heading.split(" ")[0];
            return (
              <tr key={`${r.date}${r.heading}${r.kind}${r.detail}`} className="border-t border-base-300 hover:bg-base-200/60">
                <td className="whitespace-nowrap px-4 py-3 pl-5 align-top tabular-nums text-base-content/70">
                  {formatPostDate(r.date, "short")}
                </td>
                <th scope="row" className="min-w-56 px-4 py-3 text-left align-top font-normal">
                  <Link href={`/hts/${code}`} className={`${mono.className} text-xs font-medium text-primary hover:underline`}>
                    {r.heading}
                  </Link>
                  <span className="block text-base-content">{r.name}</span>
                  <span className={`${ui.caption} block`}>{r.program}</span>
                </th>
                <td className="px-4 py-3 align-top">
                  <span className={`${ui.badge(tone(r))} whitespace-nowrap`}>{KIND_LABELS[r.kind]}</span>
                </td>
                <td className="min-w-40 px-4 py-3 pr-5 align-top tabular-nums text-base-content/70">{r.detail}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TariffChangesTable() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = getTariffChanges();
  const upcoming = rows.filter((r) => r.date > today).reverse();
  const past = rows.filter((r) => r.date <= today);
  const months = Array.from(new Set(past.map((r) => r.date.slice(0, 7))));
  const stats = [
    { label: "Changes in 2026", value: past.length },
    { label: "New tariffs and exemptions", value: past.filter((r) => r.kind === "New tariff").length },
    { label: "Tariffs and exemptions ended", value: past.filter((r) => r.kind === "Ended").length },
    { label: "Scheduled ahead", value: upcoming.length },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className={ui.card}>
        <dl className="grid grid-cols-2 gap-px bg-base-300 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 bg-base-100 px-5 py-4">
              <dt className={ui.label}>{s.label}</dt>
              <dd className={ui.metric.secondary}>{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className={`${ui.cardFooter} ${ui.caption}`}>
          Generated from HTS Hero&apos;s tariff data on {formatPostDate(today)}, through{" "}
          {getLatestVerifiedRevision()?.title}. Each heading links to its page.
        </p>
      </div>

      {upcoming.length > 0 && (
        <section aria-label="Scheduled changes" className={ui.card}>
          <div className={ui.cardHeader}>
            <h3 className={ui.cardTitle}>Scheduled changes</h3>
            <span className={ui.caption}>Already in the HTS, taking effect later</span>
          </div>
          <ChangesRows rows={upcoming} />
        </section>
      )}

      {months.map((month, i) => {
        const monthRows = past.filter((r) => r.date.startsWith(month));
        return (
          <details key={month} open={i < OPEN_MONTHS} className={`${ui.card} group`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 hover:bg-base-200/50 [&::-webkit-details-marker]:hidden">
              <h3 className={ui.cardTitle}>{monthLabel(month)}</h3>
              <span className="flex items-center gap-2">
                <span className={`${ui.caption} tabular-nums`}>
                  {monthRows.length} change{monthRows.length === 1 ? "" : "s"}
                </span>
                <ChevronDownIcon className="h-5 w-5 text-base-content/60 transition-transform group-open:rotate-180" aria-hidden />
              </span>
            </summary>
            <div className="border-t border-base-300">
              <ChangesRows rows={monthRows} />
            </div>
          </details>
        );
      })}
    </div>
  );
}
