import {
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import {
  CursorArrowRaysIcon,
  ChevronRightIcon,
  ChevronDownIcon,
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
    title: "Select",
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
      <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary/90 mb-4">
        Step {index + 1}
      </span>

      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/10 blur-xl" />
        <div className="relative md:w-20 md:h-20 w-14 h-14 rounded-2xl md:rounded-3xl bg-base-100 border border-primary/20 shadow-lg flex items-center justify-center">
          <step.icon className="md:w-9 md:h-9 w-6 h-6 text-primary" />
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
        <div className="w-8 h-px bg-gradient-to-r from-primary/30 to-primary/20" />
        <ChevronRightIcon className="w-4 h-4 text-primary/30 -ml-1" />
      </div>
      {/* Mobile / tablet: vertical arrow */}
      <div className="flex lg:hidden items-center justify-center py-2">
        <ChevronDownIcon className="w-5 h-5 text-primary/30" />
      </div>
    </>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="relative py-16 md:py-28">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-primary/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-base-content mb-4">
            3 <span className="text-primary">Simple</span> Steps
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-base-content/50 max-w-xl mx-auto leading-relaxed">
            From product description to defensible classification in minutes
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

        <div className="text-center mt-12 lg:mt-20">
          <button
            onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
            className="btn btn-primary btn-lg text-lg  min-w-72 md:min-w-96 font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
          >
            Try Now!
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-xs text-base-content/50 mt-4">
            100% Free. No Credit Card Required
          </p>
        </div>
      </div>
    </section>
  );
}
