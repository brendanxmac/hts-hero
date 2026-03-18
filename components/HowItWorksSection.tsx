import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  CursorArrowRaysIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";

const STEPS = [
  {
    icon: ChatBubbleLeftEllipsisIcon,
    title: "Describe Your Product",
    description: "Enter a plain-language description of your product",
  },
  {
    icon: SparklesIcon,
    title: "Review Analysis",
    description:
      "Quickly review our best-fit analysis of the relevant candidates",
  },
  {
    icon: CursorArrowRaysIcon,
    title: "Confirm Selection",
    description: "Select the best candidate and move on to the next level",
  },
  // {
  //   icon: DocumentArrowDownIcon,
  //   title: "Download Report",
  //   description:
  //     "Get a sharable, branded report that defends your HTS code",
  // },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-secondary/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14 md:mb-18">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-base-content mb-4">
            Easy as 1, 2, 3
          </h2>
          <p className="text-base sm:text-lg text-base-content/50 max-w-xl mx-auto leading-relaxed">
            Go from product description to audit-ready classification in minutes
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line -- desktop only */}
          <div className="hidden lg:block absolute top-8 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-secondary/30 via-primary/20 to-secondary/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-6">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {/* Number + icon */}
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-base-100 border border-secondary/20 shadow-lg shadow-secondary/[0.06] flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-base font-bold text-base-content mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-base-content/50 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
