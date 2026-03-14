"use client";

import {
  CheckIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ScaleIcon,
  DocumentCheckIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";
import { ClassifyInput } from "./ClassifyInput";
import { BoltIcon, CursorArrowRaysIcon } from "@heroicons/react/16/solid";

interface ClassificationCTAProps {
  title: string;
  subtitle?: string;
  ctaButtonText?: string;
  valueProps?: string[];
  examples?: string[];
  showWorkflowPreview?: boolean;
}

const DEFAULT_VALUE_PROPS = [
  "Finds Candidates",
  "Applies GRI's & Legal Notes",
  "Checks CROSS Rulings",
  "Generates Report",
];

const WORKFLOW_STEPS = [
  {
    icon: MagnifyingGlassIcon,
    title: "Describe Your Product",
    description:
      "Enter a plain-language description of your product."
    // Our AI parses material composition, function, and end-use automatically.",
  },
  {
    icon: SparklesIcon,
    title: "Review Analysis",
    description:
      "Quickly review our best-fit analysis of the relevant candidates",
    // "The assistant analyzes all 99 chapters, narrows to the most relevant sections and chapters, and surfaces candidate HS headings you should consider.",
  },
  // {
  //   icon: SparklesIcon,
  //   title: "See Candidates",
  //   description:
  //     "Instantly see every relevant candidate you should consider",
  //   // "The assistant analyzes all 99 chapters, narrows to the most relevant sections and chapters, and surfaces candidate HS headings you should consider.",
  // },
  // {
  //   icon: ScaleIcon,
  //   title: "Review Evidence",
  //   description:
  //     "Review our GRI, Legal Note, & CROSS rulings analysis of each candidate",
  //   // "At each classification level, a General Rules of Interpretation analysis explains which candidate best fits and why — so you understand the reasoning, not just the answer.",
  // },
  // {
  //   icon: DocumentCheckIcon,
  //   title: "Check CROSS",
  //   description:
  //     "Quickly see how similar products were classified",
  //   // "Search CBP's CROSS rulings database at any point during classification to see how similar products were ruled — giving you defensible, precedent-backed confidence.",
  // },
  {
    icon: CursorArrowRaysIcon,
    title: "Confirm Selection",
    description:
      "Select the best candidate and move on to the next level",
    // "Search CBP's CROSS rulings database at any point during classification to see how similar products were ruled — giving you defensible, precedent-backed confidence.",
  },
  {
    icon: DocumentArrowDownIcon,
    // title: "Audit-Ready Report",
    title: "Get Report",
    description:
      "Get a sharable, branded classification report that defends your HTS code",
  },
];

export const ClassificationCTA = ({
  title,
  subtitle,
  ctaButtonText = "Classify My Product",
  valueProps = DEFAULT_VALUE_PROPS,
  examples,
  showWorkflowPreview,
}: ClassificationCTAProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-base-100 to-secondary/[0.04]">
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Top section: headline + input */}
        <div className="px-4 pt-6 pb-2 sm:px-6 sm:pt-8 sm:pb-3 md:px-10 md:pt-10 md:pb-4">
          <div className="text-center max-w-4xl mx-auto mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-base-content mb-1.5 sm:mb-2">
              {title}
            </h3>
            {subtitle && (
              <p className="text-base-content/60 text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          <div className="max-w-3xl mx-auto">
            <ClassifyInput
              buttonText={ctaButtonText}
              examples={examples}
            />
          </div>

          {/* Value props */}
          <div className="max-w-4xl mx-auto my-4 sm:my-5">
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 sm:gap-x-5 justify-center">
              {valueProps.map((prop) => (
                <div
                  key={prop}
                  className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-base-content/60"
                >
                  <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success shrink-0" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workflow preview section */}
        {showWorkflowPreview && (
          <div className="border-t border-base-content/10 bg-base-200/30">
            <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 md:mb-4">
                  How It Works
                </p>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-base-content max-w-xl mx-auto">
                  Go from description to audit-ready classification in minutes
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-5 lg:gap-3 max-w-5xl mx-auto">
                {WORKFLOW_STEPS.map((step, index) => (
                  <div key={step.title} className="relative flex flex-col">
                    {/* Connector line (4-col layout only) */}
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <div className="hidden lg:block absolute top-5 left-[calc(50%+24px)] right-0 h-px bg-gradient-to-r from-primary/20 to-primary/5 z-0" />
                    )}

                    <div className="relative z-10 flex flex-col items-center text-center gap-2">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                          <step.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>

                      <h5 className="font-bold text-sm sm:text-base text-base-content leading-tight">
                        {step.title}
                      </h5>
                      <p className="text-xs text-base-content/60 leading-relaxed max-w-[240px]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
