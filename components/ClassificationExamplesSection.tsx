"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ScaleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/16/solid";
import { GRIDefenseHero } from "./GRIDefenseHero";
import { GRIDefenseHeroMarketing } from "./GRIDefenseHeroMarketing";

interface ClassificationExample {
  htsCode: string;
  description: string;
  defense?: string;
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
    htsCode: "6813.20.00.60",
    description:
      "Ceramic brake pads for passenger vehicles, semi-metallic compound with copper-free formulation",
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
    htsCode: "7323.93.00.85",
    description:
      "Stainless steel double-wall vacuum insulated water bottle, 32oz with leak-proof lid",
    defense: `Under GRI 1, heading 9617.00 (Vacuum flasks and other vacuum vessels, complete; parts thereof other than glass inners) appears to directly describe the essential nature of the article: a complete vacuum vessel designed to hold liquids, using a vacuum between walls for insulation. The legal notes to Chapter 96 do not exclude such vacuum vessels when made of base metal; rather, they confirm that Chapter 96 can cover certain specialized manufactured articles even when partly or wholly of metal, provided they are not parts of general use or otherwise excluded. None of the Chapter 96 exclusions apply to a finished vacuum-insulated bottle.

By contrast:
- Heading 7310 (“Tanks, casks, drums, cans, boxes and similar containers… of iron or steel”) generally covers non‑vacuum industrial or transport containers for materials, not consumer vacuum bottles.
- Heading 7323 (“Table, kitchen or other household articles, of iron or steel”) is broader household ware, but does not specifically address vacuum construction; it is less specific than a heading expressly for vacuum vessels.
- Heading 7326 (“Other articles of iron or steel”) is a residual heading for iron or steel articles not more specifically provided for elsewhere; it would only apply if no more specific heading existed.
- Heading 8309 covers stoppers, caps, lids and similar packing accessories of base metal, which would at most describe the lid component, not the complete bottle. Under Note 1 to Chapter 83, such parts are generally classified with their parent articles, so the complete article should not be classified as a mere stopper or lid.

Applying GRI 3(a), among the potentially relevant headings, heading 9617.00 is the most specific because it is limited to vacuum flasks and other vacuum vessels, which matches the double‑wall vacuum insulated design described. The other headings are more generic containers or household articles of metal.

Therefore, based on the available information and the applicable notes, the primary candidate that most specifically and accurately progresses the classification is heading 9617.00 for “Vacuum flasks and other vacuum vessels, complete; parts thereof other than glass inners.`,
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
    htsCode: "6110.12.20.40",
    description:
      "Women's 100% cashmere crew-neck pullover sweater, knitted, with ribbed cuffs and hem",
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
      {/* <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-secondary/15 via-primary/10 to-secondary/15 blur-xl transition-all duration-300 group-hover:from-secondary/25 group-hover:via-primary/20 group-hover:to-secondary/25 group-hover:-inset-1" /> */}

      {/* Card surface */}
      <div className="relative flex flex-col flex-1 rounded-2xl border-2 border-base-300 bg-base-100 overflow-hidden shadow-lg shadow/[0.08] transition-all duration-300 group-hover:shadow-xl group-hover:shadow/[0.12]">
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
          {/* <div className="flex flex-wrap items-center gap-1.5 mb-4">
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
          </div> */}

          {/* HTS Code */}
          <div className="mb-4">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-1">
              HTS Code
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-bold tracking-wider">
              {example.htsCode}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-base-300 mb-4" />

          {/* Feature badges */}
          {/* <div className="flex flex-wrap gap-2 mb-4">
            {FEATURE_BADGES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200/70 text-[11px] font-medium text-base-content/60"
              >
                <Icon className="w-3.5 h-3.5 text-secondary/70" />
                {label}
              </span>
            ))}
          </div> */}

          {/* Social proof stat + CTA -- pushed to bottom */}
          <div className="mt-auto flex items-center justify-center gap-3 pt-1">
            {/* <span className="text-[11px] text-base-content/45 leading-tight">
              {example.stats.levels}-level classification &middot;{" "}
              {example.stats.crossRulings} CROSS rulings reviewed
            </span> */}

            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary/10 text-xs md:text-base font-semibold text-primary whitespace-nowrap transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/25">
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
        {/* <div className="flex flex-col items-center mb-8">
          <h2 className="py-2 text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4">
            Not Just Codes, <span className="text-primary">Proof</span>
          </h2>

          <p className="text-base sm:text-lg text-base-content/50 max-w-3xl mx-auto leading-relaxed text-center mb-8">
            Each classification includes step-by-step GRI reasoning, legal note analysis, and CROSS ruling validation — so you can explain and defend every decision
          </p>

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
        </div> */}

        {/* GRI & Legal Notes Defense Hero */}
        {/* <GRIDefenseHero /> */}
        <GRIDefenseHeroMarketing />

        {/* Connector + Card grid */}
        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm md:text-lg font-medium text-base-content/50 mb-2">
            Examples
          </p>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30" />
            <svg className="w-4 h-4 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/30" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {EXAMPLES.map((example, i) => (
            <ExampleCard key={i} example={example} />
          ))}
        </div>

        {/* CTA */}
        {/* <div className="text-center mt-12">
          <button
            onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
            className="btn btn-primary btn-lg text-lg min-w-72 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
          >
            Try Now!
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-xs text-base-content/50 mt-4">
            100% Free. No Credit Card Required
          </p>
        </div> */}
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
