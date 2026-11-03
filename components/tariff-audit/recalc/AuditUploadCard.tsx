import Image from "next/image";
import { ArrowUturnLeftIcon, DocumentPlusIcon, DocumentTextIcon, MagnifyingGlassIcon, PaperAirplaneIcon } from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import { mono } from "@/components/ui/font";
import type { AuditScan } from "@/libs/tariff-audit-example";

// "How the audit works" in one window, like the hero: an entry goes in, it's checked, and one plain
// answer comes back (the engine-checked overpaid example: getAuditScans). Plays on a loop in pure
// CSS; for people who turn motion off it shows the answer. Minimal on purpose: the verdict, the
// amount, the reason, and the one thing to do next.

const LOOP = "7s";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const day = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export const AuditUploadCard = ({ scan }: { scan: AuditScan }) => (
  <figure
    className="hts-tracker-inverse w-full overflow-hidden rounded-[28px] bg-base-100 text-base-content shadow-2xl shadow-black/30 ring-1 ring-base-300"
    aria-label="An entry added, checked, and its audit result"
  >
    <style>{`
      .au-check, .au-result { opacity: 0; }
      @media (prefers-reduced-motion: no-preference) {
        .au-chip { animation: au-chip ${LOOP} cubic-bezier(.2,.9,.3,1) infinite; }
        .au-check { animation: au-check ${LOOP} ease-in-out infinite; }
        .au-bar { animation: au-bar ${LOOP} ease-out infinite; }
        .au-result { animation: au-result ${LOOP} cubic-bezier(.2,1.3,.4,1) infinite; }
      }
      @media (prefers-reduced-motion: reduce) { .au-result { opacity: 1; } }
      /* The entry drops in, it's checked, the answer pops in, rests, then it starts over */
      @keyframes au-chip {
        0% { opacity: 0; transform: translateY(-24px) scale(.96); }
        8%, 94% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(0) scale(1); }
      }
      @keyframes au-check { 0%, 12% { opacity: 0; } 15%, 33% { opacity: 1; } 36%, 100% { opacity: 0; } }
      @keyframes au-bar { 0%, 15% { width: 4%; } 33%, 100% { width: 100%; } }
      @keyframes au-result {
        0%, 35% { opacity: 0; transform: scale(.92); }
        40% { opacity: 1; transform: scale(1.02); }
        43%, 92% { opacity: 1; transform: scale(1); }
        97%, 100% { opacity: 0; transform: scale(1); }
      }
    `}</style>

    {/* Who's checking */}
    <div className="flex items-center gap-3 border-b border-base-300 px-6 py-4">
      <Image src={logo} alt="HTS Hero" width={30} height={30} />
      <p className="flex-1 font-semibold">Entry Audit</p>
    </div>

    <div className="flex flex-col gap-5 p-6">
      {/* What you add */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-5 py-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-base-content/60">
          <DocumentPlusIcon className="h-4 w-4 text-primary" aria-hidden /> Add your entry
        </p>
        <div className="au-chip flex w-full max-w-sm items-center gap-3 rounded-xl bg-base-100 px-4 py-3 shadow-lg shadow-base-content/10 ring-1 ring-base-300">
          <DocumentTextIcon className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{scan.product}</p>
            <p className={`${mono.className} truncate text-[11px] text-base-content/55`}>
              {scan.htsno} · {scan.countryName} · {day(scan.entryDate)}
            </p>
          </div>
        </div>
      </div>

      {/* What comes back */}
      <div className="relative h-[184px]">
        <div className="au-check absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-base-300">
            <div className="au-bar h-full rounded-full bg-primary" />
          </div>
          <p className="text-sm font-semibold text-base-content/60">Checking against the rates on {day(scan.entryDate)}…</p>
        </div>

        <div className="au-result absolute inset-0 flex flex-col justify-between rounded-2xl bg-success p-5 text-success-content">
          <div className="flex items-start gap-3">
            <ArrowUturnLeftIcon className="mt-1 h-7 w-7 shrink-0" aria-hidden />
            <div>
              <p className="text-3xl font-bold leading-tight [font-family:var(--font-tracker-display)]">Overpaid {usd(scan.paid - scan.owed)}</p>
              <p className="mt-1 text-sm opacity-85">{scan.reason}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold ring-1 ring-success-content/50">
              <MagnifyingGlassIcon className="h-4 w-4" aria-hidden /> See Details
            </span>
            <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-success-content text-sm font-semibold text-success">
              <PaperAirplaneIcon className="h-4 w-4" aria-hidden /> Send to Your Broker
            </span>
          </div>
        </div>
      </div>
    </div>
  </figure>
);
