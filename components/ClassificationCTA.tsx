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

interface ClassificationCTAProps {
  title: string;
  subtitle?: string;
  ctaButtonText?: string;
  variant: "inline" | "sidebar";
  valueProps?: string[];
  examples?: string[];
  showWorkflowPreview?: boolean;
}

const DEFAULT_VALUE_PROPS = [
  "Candidate HTS codes instantly",
  "GRI rule reasoning",
  "CROSS ruling validation",
];

const WORKFLOW_STEPS = [
  {
    icon: MagnifyingGlassIcon,
    title: "Describe Your Product",
    description:
      "Enter a plain-language description of your product. Our AI parses material composition, function, and end-use automatically.",
  },
  {
    icon: SparklesIcon,
    title: "AI Identifies Candidate Headings",
    description:
      "The assistant analyzes all 99 chapters, narrows to the most relevant sections and chapters, and surfaces candidate HS headings you should consider.",
  },
  {
    icon: ScaleIcon,
    title: "GRI Analysis at Every Level",
    description:
      "At each classification level, a General Rules of Interpretation analysis explains which candidate best fits and why — so you understand the reasoning, not just the answer.",
  },
  {
    icon: DocumentCheckIcon,
    title: "CROSS Ruling Validation",
    description:
      "Search CBP's CROSS rulings database at any point during classification to see how similar products were ruled — giving you defensible, precedent-backed confidence.",
  },
  {
    icon: DocumentArrowDownIcon,
    title: "Audit-Ready Report",
    description:
      "Export a branded PDF with your classification path, GRI reasoning, and notes. Ready to file, share with a client, or defend in an audit.",
  },
];

export const ClassificationCTA = ({
  title,
  subtitle,
  ctaButtonText = "Classify My Product",
  variant,
  valueProps = DEFAULT_VALUE_PROPS,
  examples,
  showWorkflowPreview,
}: ClassificationCTAProps) => {
  const shouldShowWorkflow = showWorkflowPreview ?? variant === "inline";

  // ─── Sidebar variant ───────────────────────────────────────────────
  if (variant === "sidebar") {
    return (
      <div className="sticky top-24 w-full">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-base-100 to-base-100">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/15 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 p-5 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-base-content mb-1">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-base-content/60 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            <ClassifyInput
              buttonText={ctaButtonText}
              examples={examples}
              compact
            />

            {/* Value props */}
            <div className="flex flex-col gap-1.5">
              {valueProps.map((prop) => (
                <div
                  key={prop}
                  className="flex items-center gap-2 text-xs text-base-content/60"
                >
                  <CheckIcon className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Inline variant ────────────────────────────────────────────────
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-base-100 to-secondary/[0.04]">
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* ── Top section: headline + input ── */}
        <div className="p-6 md:p-10 pb-0 md:pb-0">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h3 className="text-2xl md:text-3xl font-extrabold text-base-content mb-2">
              {title}
            </h3>
            {subtitle && (
              <p className="text-base-content/60 text-sm md:text-base leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Input + Button — the dominant visual element */}
          <div className="max-w-2xl mx-auto">
            <ClassifyInput
              buttonText={ctaButtonText}
              examples={examples}
            />
          </div>

          {/* Value props */}
          <div className="max-w-2xl mx-auto mt-5">
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {valueProps.map((prop) => (
                <div
                  key={prop}
                  className="flex items-center gap-1.5 text-sm text-base-content/60"
                >
                  <CheckIcon className="w-4 h-4 text-success shrink-0" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Workflow preview section ── */}
        {shouldShowWorkflow && (
          <div className="mt-8 border-t border-base-content/10 bg-base-200/30">
            <div className="p-6 md:p-10 pt-6 md:pt-8">
              <div className="text-center mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                  How It Works
                </p>
                <h4 className="text-lg md:text-xl font-bold text-base-content">
                  From description to audit-ready classification in minutes
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-3">
                {WORKFLOW_STEPS.map((step, index) => (
                  <div key={step.title} className="relative flex flex-col">
                    {/* Connector line (desktop only, between steps) */}
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] right-0 h-px bg-gradient-to-r from-primary/20 to-primary/5 z-0" />
                    )}

                    <div className="relative z-10 flex flex-col items-center text-center gap-2">
                      {/* Step number + icon */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                          <step.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-base-content leading-tight">
                        {step.title}
                      </h5>
                      <p className="text-xs text-base-content/50 leading-relaxed">
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
