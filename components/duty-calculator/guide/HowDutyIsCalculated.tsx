import { DutyCalculatorContent } from "@/libs/duty-calculator-content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { STEPS } from "./content";
import { WorkedExample } from "./WorkedExample";

// The method, step by step, beside a worked example of it
export const HowDutyIsCalculated = ({ content }: { content: DutyCalculatorContent }) => {
  const { example, asOf } = content;
  if (!example) return null;
  return (
    <section
      id="how-duty-is-calculated"
      className={`${ui.card} scroll-mt-6 p-5 sm:p-8 lg:p-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12`}
    >
      <div className="flex flex-col gap-5">
        <SectionHeader kicker="The method" title="How US import duty is calculated" />
        <ol className="flex flex-col">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
              {/* The line joining the steps */}
              {i < STEPS.length - 1 && (
                <span className="absolute left-4 -ml-px top-9 bottom-0 w-px bg-base-300" aria-hidden />
              )}
              <span
                className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold tabular-nums text-primary-content"
                aria-hidden
              >
                {i + 1}
              </span>
              <p className={`${ui.body} pt-1`}>
                <strong className="font-semibold text-base-content">{step.title}</strong> {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <WorkedExample example={example} asOf={asOf} />
    </section>
  );
};
