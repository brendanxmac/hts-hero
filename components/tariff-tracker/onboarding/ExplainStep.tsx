"use client";

import { ArrowRightIcon, CheckIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { ImportExplainer } from "./ImportExplainer";
import { delay, StepHeading } from "./parts";

// What counts as an import, before asking for them: an HTS code plus its country of origin. One
// note on the mistake that matters most: a 6-digit HS code isn't enough to find a duty rate.

export const ExplainStep = ({ onNext }: { onNext: () => void }) => {
  return (
    // Quick: the whole step is in within about a second (tt-ob-quick, and short delays)
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 text-center tt-ob-quick">
      <div className="flex flex-col items-center [&_p]:mx-auto">
        <StepHeading
          eyebrow="Step 2 · What's an import?"
          title="HTS Code + Country of Origin = Import"
          lead="That pair is what decides the duty, so it's all the Tracker needs to detect changes, alert you, discover savings, and audit entries."
          size="md"
        />
      </div>

      {/* The explainer and its note, close together: one idea */}
      <div className="flex w-full flex-col gap-4">
        <div className="tt-ob-rise w-full rounded-3xl border border-base-300 bg-base-100 px-6 py-10 shadow-[var(--tt-shadow)]" style={delay(50)}>
          <ImportExplainer />
        </div>

        {/* The one thing people get wrong: the code needs its US digits */}
        <aside
          aria-labelledby="tt-ob-digits"
          className={`${tt.panel} tt-ob-rise flex w-full flex-col items-start gap-5 p-6 text-left sm:flex-row sm:items-center`}
          style={delay(700)}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning" aria-hidden>
            <ExclamationTriangleIcon className="h-5 w-5" />
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <h2 id="tt-ob-digits" className="m-0 text-base font-semibold text-base-content">
              8 or 10-digit codes are required
            </h2>
            <p className="m-0 text-sm leading-relaxed text-base-content/75">
              We need at least 8 digits to find your right US duty rates. Dots are optional.
            </p>
          </div>
          <div className={`${mono.className} flex shrink-0 flex-col gap-1.5 text-sm font-semibold`} aria-hidden>
            <span className="flex items-center gap-2 text-error">
              <XMarkIcon className="h-4 w-4" /> 6109.10
            </span>
            <span className="flex items-center gap-2 text-success">
              <CheckIcon className="h-4 w-4" /> 6109.10.00.12
            </span>
          </div>
        </aside>
      </div>

      <div className="tt-ob-rise w-full max-w-xl" style={delay(800)}>
        <button
          type="button"
          className={`${ui.button({ variant: "primary", size: "lg" })} h-14 w-full text-lg shadow-[0_14px_30px_-14px_var(--tt-ob-glow)]`}
          onClick={onNext}
          autoFocus
        >
          Got it, add my imports
          <ArrowRightIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
};
