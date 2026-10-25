"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";

// While a code's sources load (Census can take several seconds): what's being looked up, step by
// step, each ticked as it lands, over a progress bar, then the shapes of the page to come. Plain
// and obvious in both themes, so it never looks like nothing is happening.

export interface LoadingStep {
  label: string;
  done: boolean;
}

const Spinner = () => <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />;

export const SourcingLoading = ({ steps }: { steps: LoadingStep[] }) => {
  const done = steps.filter((s) => s.done).length;
  // Never empty: the bar starts a little way in, so it reads as working from the first moment
  const progress = Math.max(8, (done / steps.length) * 100);
  return (
    <div className="flex flex-col gap-module" aria-busy="true" aria-live="polite">
      <section className={`${tt.panel} flex flex-col gap-5 px-6 py-6 lg:px-7`}>
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className={`${tt.title} m-0`}>Ranking Every Country…</h2>
            <p className={`${tt.subtitle} m-0`}>Pulling the latest trade data for this code. This usually takes a few seconds.</p>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-tt-soft" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done} aria-label="Loading">
          <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <ol className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((s) => (
            <li key={s.label} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ${s.done ? "bg-success/10 text-base-content" : "bg-tt-soft font-medium text-base-content"}`}>
              {s.done ? (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success text-success-content">
                  <CheckIcon className="h-3 w-3" aria-hidden />
                </span>
              ) : (
                <Spinner />
              )}
              <span className={s.done ? "text-base-content/70" : ""}>{s.label}</span>
            </li>
          ))}
        </ol>
      </section>
      {/* The page to come */}
      <div className={`${ui.skeleton} h-28 w-full`} />
      <div className="grid grid-cols-1 gap-module sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${ui.skeleton} h-64`} />
        ))}
      </div>
    </div>
  );
};
