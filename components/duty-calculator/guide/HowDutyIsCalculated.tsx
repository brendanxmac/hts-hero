import { DutyCalculatorContent } from "@/libs/duty-calculator-content";
import * as mk from "@/components/ui/marketing/styles";
import { STEPS } from "./content";
import { WorkedExample } from "./WorkedExample";

// The method, step by step, beside a worked example of it
export const HowDutyIsCalculated = ({ content }: { content: DutyCalculatorContent }) => {
  const { example, asOf } = content;
  if (!example) return null;
  return (
    <section
      id="how-duty-is-calculated"
      className="scroll-mt-6 grid gap-10 rounded-3xl border border-slate-200 skin:border-base-300 bg-white skin:bg-base-100 p-6 shadow-xs sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:p-12"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className={mk.eyebrow}>The method</span>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 skin:text-base-content sm:text-4xl sm:leading-10">
            How US import duty is calculated
          </h2>
        </div>
        <ol className="flex flex-col">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
              {/* The line joining the steps */}
              {i < STEPS.length - 1 && (
                <span className="absolute bottom-0 left-4 top-9 -ml-px w-px bg-slate-200 skin:bg-base-300" aria-hidden />
              )}
              <span
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold tabular-nums text-white"
                aria-hidden
              >
                {i + 1}
              </span>
              <p className={`${mk.body} pt-1`}>
                <strong className="font-semibold text-slate-900 skin:text-base-content">{step.title}</strong> {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <WorkedExample example={example} asOf={asOf} />
    </section>
  );
};
