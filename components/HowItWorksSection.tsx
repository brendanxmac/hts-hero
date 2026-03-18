import {
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  CursorArrowRaysIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

const STEPS = [
  {
    icon: ChatBubbleLeftEllipsisIcon,
    title: "Describe",
    // subtitle: "Your Product",
    description: "Enter a plain-language description of your product",
  },
  {
    icon: MagnifyingGlassIcon,
    title: "Review",
    // subtitle: "AI Analysis",
    description:
      "Review our best-fit analysis of the relevant candidates",
  },
  {
    icon: CursorArrowRaysIcon,
    title: "Confirm",
    // subtitle: "Your Selection",
    description:
      "Select the best candidate and move on to the next level",
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  return (
    <div className="relative flex flex-col items-center text-center px-2">
      {/* Step number */}
      <span className="text-sm font-bold uppercase tracking-[0.2em] text-secondary/90 mb-4">
        Step {index + 1}
      </span>

      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-secondary/10 to-primary/10 blur-xl" />
        <div className="relative w-20 h-20 rounded-3xl bg-base-100 border border-secondary/20 shadow-lg flex items-center justify-center">
          <step.icon className="w-9 h-9 text-secondary" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-base-content leading-tight mb-3">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-base text-base-content/50 leading-relaxed max-w-[260px]">
        {step.description}
      </p>
    </div>
  );
}

function StepConnector() {
  return (
    <>
      {/* Desktop: horizontal arrow */}
      <div className="hidden lg:flex items-center justify-center self-center">
        <div className="w-8 h-px bg-gradient-to-r from-secondary/30 to-primary/20" />
        <ChevronRightIcon className="w-4 h-4 text-secondary/30 -ml-1" />
      </div>
      {/* Mobile / tablet: vertical arrow */}
      <div className="flex lg:hidden items-center justify-center py-2">
        <ChevronDownIcon className="w-5 h-5 text-secondary/30" />
      </div>
    </>
  );
}

function ResultCard() {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-secondary/15 via-primary/10 to-secondary/15 blur-xl" />

      <div className="relative rounded-2xl border border-secondary/20 bg-base-100 overflow-hidden shadow-lg shadow-secondary/[0.06]">
        <div className="h-1 bg-gradient-to-r from-secondary via-primary/70 to-secondary" />

        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 px-6 py-6 sm:px-8 sm:py-7">
          {/* Icon */}
          <div className="shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary shadow-lg shadow-secondary/20 flex items-center justify-center">
              <ShieldCheckIcon className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center sm:text-left">
            {/* <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Result
            </span> */}
            <h3 className="text-xl md:text-2xl font-bold text-base-content leading-tight mt-0.5">
              Audit-Ready Defense Report
            </h3>
            <p className="text-sm text-base-content/50 leading-relaxed mt-1">
              A branded, sharable classification report that defends your HTS code
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap sm:flex-col gap-1.5 shrink-0 justify-center">
            {["GRI Analysis", "CROSS Rulings", "Full Reasoning"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/[0.06] text-[11px] font-semibold text-primary/70"
              >
                <DocumentTextIcon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-secondary/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-base-content mb-4">
            3 <span className="text-secondary">Simple</span> Steps
          </h2>
          <p className="text-base sm:text-lg text-base-content/50 max-w-xl mx-auto leading-relaxed">
            Go from product description to audit-ready classification in minutes
          </p>
        </div>

        {/* Steps row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-y-2 lg:gap-x-0">
          {STEPS.map((step, i) => (
            <div key={step.title} className="contents">
              <StepCard step={step} index={i} />
              {i < STEPS.length - 1 && <StepConnector />}
            </div>
          ))}
        </div>


        {/* Transition to result */}
        <div className="flex flex-col items-center py-10 md:py-12 gap-3">
          {/* Gradient line funneling down */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-secondary/30 to-secondary/50" />

          {/* Bouncing result label + arrows */}
          <div className="hiw-bounce-arrow flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary/70 mb-2">
              Result
            </span>
            <svg
              className="w-5 h-5 text-secondary/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <svg
              className="w-5 h-5 text-secondary/30 -mt-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Result */}
        <ResultCard />
      </div>

      <style jsx>{`
        .hiw-bounce-arrow {
          animation: hiwBounce 2s ease-in-out infinite;
        }

        @keyframes hiwBounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(6px);
            opacity: 0.6;
          }
        }
      `}</style>
    </section>
  );
}
