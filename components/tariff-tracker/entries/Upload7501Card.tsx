import { ArrowUpTrayIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";

// Coming soon: entries read straight from CBP Form 7501 entry summaries
export const Upload7501Card = () => (
  <section className={`${tt.panel} flex flex-col gap-3 border-dashed p-5 sm:flex-row sm:items-center`} aria-label="Upload entry summaries">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tt-soft text-base-content/60">
      <ArrowUpTrayIcon className="h-5 w-5" aria-hidden />
    </span>
    <div className="min-w-0 flex-1">
      <p className="m-0 text-sm font-semibold text-base-content">Upload your 7501s</p>
      <p className="m-0 mt-0.5 text-sm text-base-content/70">
        Drop in CBP Form 7501 entry summaries (PDF) and every line is logged and audited for you.
      </p>
    </div>
    <span className={tt.chip("warning")}>Coming soon</span>
  </section>
);
