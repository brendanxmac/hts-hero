import Image from "next/image";
import { CheckIcon, MinusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import logo from "@/app/logo.svg";

// HTS Hero next to the other ways to recover overpaid duty: a full-service recovery firm and doing it
// in-house, in one table with a line between each column, HTS Hero's column in the opposite theme. The fee range is PRICING.md's.

type Cell = string | boolean | null;

// HTS Hero, a full-service recovery firm, in-house. true ✓, false ✗, null "varies"
const ROWS: { label: string; cells: [Cell, Cell, Cell] }[] = [
  { label: "What you pay", cells: ["A flat monthly price", "15–30% of every refund", "Weeks of staff time"] },
  { label: "What you keep", cells: ["100%", "Typically 70–85%", "100%"] },
  { label: "Wait time", cells: ["Instant Results", "Days to Weeks", "Days to Weeks"] },
  { label: "Who files", cells: ["You or your broker", "The firm", "You or your broker"] },
  { label: "Requires Handoff", cells: [false, true, false] },
  { label: "Available to Smaller Importers", cells: [true, false, false] },
];

const RIVALS = ["Duty Recovery Firms", "In-house"];

const CellView = ({ value, ours }: { value: Cell; ours: boolean }) => {
  if (value === true) return <CheckIcon className="h-6 w-6 text-success" aria-label="Yes" />;
  if (value === false) return <XMarkIcon className="h-6 w-6 text-base-content/35" aria-label="No" />;
  if (value === null)
    return (
      <span className="flex items-center gap-1.5 text-base-content/60">
        <MinusIcon className="h-5 w-5" aria-hidden /> Varies
      </span>
    );
  return <span className={ours ? "font-semibold text-base-content" : "text-base-content/70"}>{value}</span>;
};

export const CompareSection = () => (
  <section id="compare" className={mk.band} aria-labelledby="compare-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="" title="How HTS Hero Compares" id="compare-title" center>
        The other ways to recover overpaid duty, side by side.
      </SectionIntro>

      {/* The comparison */}
      <div className={`${mk.card} mx-auto mt-14 max-w-5xl overflow-x-auto`}>
        <table className="w-full min-w-[640px] border-collapse text-left text-sm sm:text-base">
          <caption className="sr-only">HTS Hero compared with a full-service recovery firm and auditing in-house</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[28%] px-6 py-5" />
              <th scope="col" className="hts-tracker-inverse border-l border-base-300 bg-base-100 px-6 py-5 text-base-content">
                <span className="flex items-center gap-2 text-base font-semibold text-base-content [font-family:var(--font-tracker-display)]">
                  <Image src={logo} alt="" width={22} height={22} /> HTS Hero
                </span>
              </th>
              {RIVALS.map((c) => (
                <th key={c} scope="col" className="border-l border-base-300 px-6 py-5 text-base font-semibold text-base-content [font-family:var(--font-tracker-display)]">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ label, cells }) => (
              <tr key={label} className="border-t border-base-300">
                <th scope="row" className="px-6 py-4 font-semibold text-base-content">
                  {label}
                </th>
                {cells.map((v, i) => (
                  <td key={i} className={`border-l border-base-300 px-6 py-4 align-middle ${i === 0 ? "hts-tracker-inverse bg-base-100 text-base-content" : ""}`}>
                    <CellView value={v} ours={i === 0} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
