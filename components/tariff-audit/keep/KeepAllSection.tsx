import { CheckIcon, MinusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { DocumentMagnifyingGlassIcon, DocumentTextIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

// "We flag, you file, you keep 100%": HTS Hero finds and documents, instantly, so the importer can
// decide whether a claim is worth filing at all; their own team or their broker files it (we never
// file: unlicensed-find-flag-explain), and there's no cut of the refund. Then how that compares with
// a full-service recovery firm and doing it in-house. The fee range is PRICING.md's.

const STEPS = [
  { Icon: DocumentMagnifyingGlassIcon, title: "We Flag", text: "Every potential overpayment, line by line, with the reason and the amount." },
  { Icon: DocumentTextIcon, title: "You Decide & File", text: "See right away if a claim is worth it. Not every one is. If it is, your team or your broker files it." },
  { Icon: BanknotesIcon, title: "You Keep 100%", text: "No contingency fee. Every dollar refunded is yours." },
];

type Cell = string | boolean | null;

// HTS Hero, a full-service recovery firm, in-house. true ✓, false ✗, null "varies"
const ROWS: { label: string; cells: [Cell, Cell, Cell] }[] = [
  { label: "What you pay", cells: ["A flat monthly price", "A cut of every refund, typically 15–30%", "Weeks of staff time"] },
  { label: "What you keep", cells: ["100%", "Typically 70–85%", "100%"] },
  { label: "Know if a claim is worth filing", cells: ["Instantly, before you spend a minute on it", "Weeks in, after their review", "Only after the work is done"] },
  { label: "Who files", cells: ["You or your broker, if you decide to", "The firm", "Your team or broker"] },
  { label: "Every line checked at its entry date's rates", cells: [true, null, false] },
  { label: "Time to Audit", cells: ["Instant, for every entry", "Days to Weeks", "Days to Weeks"] },
  { label: "Requires Handoff / Onboarding", cells: [false, true, false] },
  { label: "New entries checked as they come in", cells: [true, false, false] },
];

const COLUMNS = ["HTS Hero", "Full-service recovery firm", "In-house"];

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

export const KeepAllSection = () => (
  <section id="keep-100" className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="keep-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="" title={<>You Keep 100%</>} id="keep-title" center>
        HTS Hero flags the entries you may have overpaid on, so you can determine if a claim is worth filing. If it is, and your claim gets you a refund, you keep 100%.
      </SectionIntro>

      <ol className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
        {STEPS.map(({ Icon, title, text }, i) => (
          <li key={title} className={`${mk.card} flex flex-col items-center gap-3 p-7 text-center ${i === 2 ? "ring-2 ring-success/50" : ""}`}>
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${i === 2 ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h3 className={mk.h3}>{title}</h3>
            <p className={mk.body}>{text}</p>
          </li>
        ))}
      </ol>

      {/* The comparison */}
      <div className={`${mk.card} mx-auto mt-10 max-w-5xl overflow-x-auto`}>
        <table className="w-full min-w-[640px] border-collapse text-left text-sm sm:text-base">
          <caption className="sr-only">HTS Hero compared with a full-service recovery firm and auditing in-house</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[28%] px-6 py-5" />
              {COLUMNS.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className={`px-6 py-5 text-base font-semibold [font-family:var(--font-tracker-display)] ${i === 0 ? "bg-primary/10 text-primary" : "text-base-content"}`}
                >
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
                  <td key={i} className={`px-6 py-4 align-middle ${i === 0 ? "bg-primary/10" : ""}`}>
                    <CellView value={v} ours={i === 0} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`${mk.small} mx-auto mt-5 max-w-3xl text-center`}>
        On a $50,000 refund, a 25% contingency fee is $12,500 you never see. We flag possible issues, you file and keep 100%.
      </p>
    </div>
  </section>
);
