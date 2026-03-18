import Image from "next/image";
import Link from "next/link";
import {
  ScaleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/16/solid";

interface ClassificationExample {
  description: string;
  htsCode: string;
  shareToken: string;
  image: string;
  classificationPath: string[];
  stats: {
    levels: number;
    crossRulings: number;
  };
}

const EXAMPLES: ClassificationExample[] = [
  {
    description:
      "Ceramic brake pads for passenger vehicles, semi-metallic compound with copper-free formulation",
    htsCode: "6813.20.00.60",
    shareToken: "nPP4hl_4vxY",
    image: '/brakes.png',
    classificationPath: [
      "Section XIII",
      "Chapter 68",
      "Heading 6813",
      "6813.20.00.60",
    ],
    stats: { levels: 4, crossRulings: 3 },
  },
  {
    description:
      "Stainless steel double-wall vacuum insulated water bottle, 32oz with leak-proof lid",
    htsCode: "7323.93.00.85",
    shareToken: "b9aETKwzNn4",
    image: '/bottle.png',
    classificationPath: [
      "Section XV",
      "Chapter 73",
      "Heading 7323",
      "7323.93.00.85",
    ],
    stats: { levels: 3, crossRulings: 5 },
  },
  {
    description:
      "Women's 100% cashmere crew-neck pullover sweater, knitted, with ribbed cuffs and hem",
    htsCode: "6110.12.20.40",
    shareToken: "x1XcVsWHIbQ",
    image: '/sweater.png',
    classificationPath: [
      "Section XI",
      "Chapter 61",
      "Heading 6110",
      "6110.12.20.40",
    ],
    stats: { levels: 6, crossRulings: 4 },
  },
];

const FEATURE_BADGES = [
  { icon: ShieldCheckIcon, label: "GRI Analysis" },
  { icon: ScaleIcon, label: "CROSS Rulings" },
  { icon: DocumentTextIcon, label: "Defense Report" },
];

function ExampleCard({ example }: { example: ClassificationExample }) {
  return (
    <Link
      href={`/c/${example.shareToken}`}
      className="group relative flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-secondary/15 via-primary/10 to-secondary/15 blur-xl transition-all duration-300 group-hover:from-secondary/25 group-hover:via-primary/20 group-hover:to-secondary/25 group-hover:-inset-1" />

      {/* Card surface */}
      <div className="relative flex flex-col flex-1 rounded-2xl border border-secondary/20 bg-base-100 overflow-hidden shadow-lg shadow-secondary/[0.08] transition-all duration-300 group-hover:shadow-xl group-hover:shadow-secondary/[0.12] group-hover:border-secondary/35">
        {/* Product image */}
        <div className="relative w-full overflow-hidden bg-base-200/50">
          <div className="flex items-center justify-center h-48 sm:h-56 p-4">
            <Image
              src={example.image}
              alt={example.description}
              width={600}
              height={400}
              className="max-h-full w-auto rounded-lg object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-base-100 to-transparent" />
        </div>

        <div className="flex flex-col flex-1 px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
          {/* Product description */}
          <p className="text-sm font-medium leading-relaxed text-base-content mb-4">
            {example.description}
          </p>

          {/* Classification path */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {example.classificationPath.map((step, i) => (
              <span key={i} className="contents">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/[0.07] text-[11px] font-semibold text-primary/80">
                  <CheckCircleIcon className="w-3 h-3 text-success shrink-0" />
                  {step}
                </span>
                {i < example.classificationPath.length - 1 && (
                  <svg
                    className="w-3 h-3 text-base-content/20 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                )}
              </span>
            ))}
          </div>

          {/* HTS Code */}
          <div className="mb-4">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary/70 mb-1">
              HTS Code
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-primary transition-colors duration-300 group-hover:text-secondary">
              {example.htsCode}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-secondary/15 to-transparent mb-4" />

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {FEATURE_BADGES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200/70 text-[11px] font-medium text-base-content/60"
              >
                <Icon className="w-3.5 h-3.5 text-secondary/70" />
                {label}
              </span>
            ))}
          </div>

          {/* Social proof stat + CTA -- pushed to bottom */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-base-content/45 leading-tight">
              {example.stats.levels}-level classification &middot;{" "}
              {example.stats.crossRulings} CROSS rulings reviewed
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-xs font-semibold text-secondary whitespace-nowrap transition-all duration-300 group-hover:bg-secondary group-hover:text-white group-hover:shadow-md group-hover:shadow-secondary/25">
              View Full Analysis
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ClassificationExamplesSection() {
  return (
    <section className="relative pb-20 md:pb-28 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/[0.08] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/[0.08] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6">
        {/* Section header */}
        <div className="flex flex-col items-center mb-12 md:mb-16">
          <h2 className="py-2 text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4">
            Codes You Can <span className="text-primary">Defend</span>
          </h2>

          <p className="text-base sm:text-lg text-base-content/50 max-w-3xl mx-auto leading-relaxed text-center mb-8">
            Classify complex items quickly and accurately
            with GRI + Legal Note analysis, CROSS ruling validation, and a full defense
            report. See real examples below
          </p>

          {/* Animated bouncing arrow */}
          <div className="examples-bounce-arrow flex flex-col items-center gap-1">
            <svg
              className="w-6 h-6 text-secondary/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <svg
              className="w-6 h-6 text-secondary/40 -mt-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {EXAMPLES.map((example, i) => (
            <ExampleCard key={i} example={example} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .examples-bounce-arrow {
          animation: bounceDown 2s ease-in-out infinite;
        }

        @keyframes bounceDown {
          0%,
          100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(8px);
            opacity: 0.6;
          }
        }
      `}</style>
    </section>
  );
}
