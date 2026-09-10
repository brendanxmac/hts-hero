"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  DocumentTextIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon, CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

const PRODUCTS = [
  {
    label: "Brake pads",
    description:
      "Ceramic brake pads for passenger vehicles, copper-free semi-metallic compound",
    selectedIndex: 1,
    candidates: [
      {
        code: "8113",
        title: "Cermets and articles thereof, including waste and scrap",
      },
      {
        code: "8708",
        title:
          "Parts and accessories of the motor vehicles of headings 8701 to 8705",
      },
      {
        code: "6914",
        title: "Other ceramic articles",
      },
    ],
    legalNotes: [
      { source: "Section XVII Note 3" },
      { source: "Section XVII Note 2" },
      { source: "Heading 8703" },
    ],
    crossRulings: [{ id: "NY N349345" }, { id: "NY N345796" }],
    notesWhy:
      "Section XVII Note 3 requires parts to be suitable solely with vehicles of chapters 86–88. These pads are made for passenger vehicles, provided for by heading 8703. Note 2 does not exclude ceramic brake pads as parts of general use.",
    rulingsWhy:
      "NY N349345 and NY N345796 classify comparable ceramic brake pads as motor-vehicle parts of heading 8708.",
    summary:
      "I selected 8708. These pads are made for passenger vehicles of heading 8703, so they satisfy Section XVII Note 3 (suitable solely or principally with chapter 87 vehicles). Note 2 does not treat ceramic brake pads as parts of general use or as another excluded class, so they remain vehicle parts. NY N349345 and NY N345796 classify comparable pads in 8708. 8113 and 6914 don’t match the use.",
  },
  {
    label: "Stainless Steel Bottle",
    description:
      "Stainless steel double-wall vacuum insulated water bottle, 32oz with leak-proof lid",
    selectedIndex: 0,
    candidates: [
      {
        code: "9617",
        title:
          "Vacuum flasks and other vacuum vessels, complete; parts thereof other than glass inners",
      },
      {
        code: "7310",
        title:
          "Tanks, casks, drums, cans, boxes and similar containers, for any material (other than compressed or liquefied gas), of iron or steel, of a capacity not exceeding 300 liters, whether or not lined or heat insulated, but not fitted with mechanical or thermal equipment",
      },
      {
        code: "7323",
        title:
          "Table, kitchen or other household articles and parts thereof, of iron or steel; iron or steel wool; pot scourers and scouring or polishing pads, gloves and the like, of iron or steel",
      },
      {
        code: "7326",
        title: "Other articles of iron or steel",
      },
    ],
    legalNotes: [
      { source: "Section XV Note 3" },
      { source: "Chapter 96 Note 1(d)" },
    ],
    crossRulings: [{ id: "NY N353266" }],
    notesWhy:
      "Section XV Note 3 and Chapter 96 Note 1(d) take complete vacuum vessels out of the iron and steel headings. A double-wall vacuum bottle belongs in 9617, not 7310, 7323, or 7326.",
    rulingsWhy:
      "NY N353266 classifies a similar vacuum-insulated steel bottle as a vacuum vessel of heading 9617.",
    summary:
      "This is a complete vacuum-insulated vessel, not a steel kitchen article or residual container. Chapter 96 Note 1(d) and Section XV Note 3 keep vacuum flasks out of the base-metal headings. NY N353266 supports 9617, so that’s the heading I’m taking.",
  },
  {
    label: "Cashmere sweater",
    description:
      "Women's 100% cashmere crew-neck pullover sweater, knitted, with ribbed cuffs and hem",
    selectedIndex: 0,
    candidates: [
      {
        code: "6110",
        title: "Sweaters, pullovers and similar articles, knitted",
      },
      {
        code: "6114",
        title: "Other garments, knitted or crocheted",
      },
      {
        code: "6206",
        title: "Women's or girls' blouses, shirts and shirt-blouses",
      },
    ],
    legalNotes: [
      { source: "Chapter 61 Note 1" },
      { source: "Chapter 51 Note 1(b)" },
    ],
    crossRulings: [
      { id: "NY E87476" },
      { id: "NY K85590" },
      { id: "NY E85451" },
    ],
    notesWhy:
      "Chapter 61 Note 1 keeps knitted garments in Chapter 61, so woven heading 6206 is out. Chapter 51 Note 1(b) treats cashmere as fine animal hair, which is why 6110 is the right knitted pullover heading.",
    rulingsWhy:
      "NY E87476, NY K85590, and NY E85451 all classify knitted cashmere pullovers in heading 6110.",
    summary:
      "The terms of this heading are nearly spot on for this article. The sweater is knitted not woven. Chapter 61 Note 1, helps rule out 6206 based on this. Cashmere is fine animal hair under Chapter 51 Note 1(b). NY E87476, NY K85590, and NY E85451 all point to 6110 as the best heading for this article.",
  },
] as const;

const STEPS = [
  {
    title: "Enter Product Description",
    description: "Type a good description of the product you need to classify",
  },
  {
    title: "See Candidates & Evidence",
    description: "Get a list of headings and an analysis of related HTS notes and CROSS rulings",
  },
  {
    title: "Select",
    description: "You stay in full control of the decision, and get to document your reasoning",
  },
  {
    title: "Repeat",
    description: "Continue the same process until you reach 10 digits",
  },
] as const;

type Product = (typeof PRODUCTS)[number];

export default function HowItWorksSection() {
  const [productIndex, setProductIndex] = useState(0);
  const product = PRODUCTS[productIndex];
  const selectedCandidate = product.candidates[product.selectedIndex];

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-base-200/40 px-4 py-20 sm:px-6 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-primary">
            Four steps
          </p>
          <h2 className="text-4xl font-bold tracking-tight leading-[1.05] sm:text-5xl md:text-6xl">
            How It Works
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-base-content/80 sm:text-lg">
            From a product description to an evidence-backed classification in minutes.
          </p>
        </div>

        <ol className="relative space-y-16 md:space-y-24">
          <div
            className="pointer-events-none absolute left-5 top-3 bottom-20 hidden w-px bg-base-content/20 md:block"
            aria-hidden="true"
          />

          <StepFrame index={0} title={STEPS[0].title} description={STEPS[0].description}>
            <DescribeStep
              productIndex={productIndex}
              onSelectProduct={setProductIndex}
            />
          </StepFrame>

          <StepFrame index={1} title={STEPS[1].title} description={STEPS[1].description}>
            <CandidatesStep product={product} />
          </StepFrame>

          <StepFrame index={2} title={STEPS[2].title} description={STEPS[2].description}>
            <DocumentStep product={product} />
          </StepFrame>

          <StepFrame index={3} title={STEPS[3].title} description={STEPS[3].description}>
            <RepeatStep heading={selectedCandidate.code} />
          </StepFrame>
        </ol>

        <div className="mt-16 flex flex-col items-center text-center md:mt-20">
          <a
            href="#try-classify"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-10 py-4 text-base font-bold text-primary-content transition-colors duration-200 hover:bg-primary/90 sm:px-14 sm:text-lg"
          >
            Try it on your product
            <ArrowRightIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <p className="mt-3 text-sm font-medium text-base-content/70">
            Results in seconds · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}

function StepFrame({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <li className="relative md:grid md:grid-cols-[40px_minmax(0,1fr)] md:gap-10">
      <div className="relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content md:mb-0">
        {index + 1}
      </div>
      <div className="min-w-0">
        {/* <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
          Step {index + 1}
        </p> */}
        <h3 className="text-2xl font-bold tracking-tight text-base-content md:text-4xl">
          {title}
        </h3>
        <p className="mt-2 max-w-4xl text-base leading-relaxed text-base-content/80 md:text-lg">
          {description}
        </p>
        <div className="mt-7 rounded-3xl border border-base-content/15 bg-base-100 p-5 sm:p-8">
          {children}
        </div>
      </div>
    </li>
  );
}

function EvidenceTray({
  label,
  items,
  variant,
  why,
}: {
  label: string;
  items: string[];
  variant: "notes" | "cross";
  why: string;
}) {
  const Icon = variant === "notes" ? DocumentTextIcon : ScaleIcon;

  return (
    <div className="rounded-2xl border border-base-content/15 bg-base-100 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-base-content">
          {label}
        </p>
        <span className="text-sm font-semibold tabular-nums text-base-content/70">
          {items.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-lg border border-base-content/15 bg-base-200 px-3 py-1.5 text-sm font-semibold text-base-content"
          >
            <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className={variant === "cross" ? "font-mono tracking-wide" : undefined}>
              {item}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm font-bold text-primary">Analysis</p>
      <p className="mt-1 text-sm leading-relaxed text-base-content/80">
        {why}
      </p>
    </div>
  );
}

function DescribeStep({
  productIndex,
  onSelectProduct,
}: {
  productIndex: number;
  onSelectProduct: (index: number) => void;
}) {
  const product = PRODUCTS[productIndex];

  return (
    <div>
      <div className="rounded-2xl border border-base-content/20 bg-base-200/50 px-5 py-6 sm:px-7 sm:py-8">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-base-content/70">
          Product description
        </p>
        <p className="mt-3 text-xl font-bold leading-snug tracking-tight text-base-content sm:text-2xl">
          {product.description}
        </p>
      </div>
      <div className="mt-5 flex gap-2 items-center">
        <p className="text-xs font-bold text-primary uppercase">Examples:</p>
        <div className="inline-flex max-w-full flex-wrap rounded-full border border-base-content/20 bg-base-100 p-1">
          {PRODUCTS.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectProduct(index)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors duration-150 ${productIndex === index
                ? "bg-primary text-primary-content"
                : "text-base-content/80 hover:text-base-content"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CandidatesStep({ product }: { product: Product }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
      <div>
        <p className="mb-3 text-base font-bold">
          Candidates
        </p>
        <div className="space-y-2">
          {product.candidates.map((candidate, index) => {
            const isSelected = index === product.selectedIndex;
            return (
              <div
                key={candidate.code}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3.5 ${isSelected
                  ? "border-primary bg-primary/10"
                  : "border-base-content/15"
                  }`}
              >
                <span className="font-mono text-lg font-bold tracking-wide text-base-content">
                  {candidate.code}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-base-content/80">
                  {candidate.title}
                </span>
                {isSelected && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="mb-3 text-base font-bold">
          Supporting Evidence
        </p>
        <EvidenceTray
          label="Legal notes"
          variant="notes"
          items={product.legalNotes.map((note) => note.source)}
          why={product.notesWhy}
        />
        {product.crossRulings.length > 0 && (
          <EvidenceTray
            label="CROSS rulings"
            variant="cross"
            items={product.crossRulings.map((ruling) => ruling.id)}
            why={product.rulingsWhy}
          />
        )}
      </div>
    </div>
  );
}

function DocumentStep({ product }: { product: Product }) {
  const candidate = product.candidates[product.selectedIndex];
  const [notes, setNotes] = useState<string>(String(product.summary));

  useEffect(() => {
    setNotes(String(product.summary));
  }, [product.summary]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
          Selected heading
        </p>
        <p className="mt-2 font-mono text-4xl font-bold tracking-tight text-base-content sm:text-5xl">
          {candidate.code}
        </p>
        <p className="mt-2 text-base font-medium text-base-content/80 sm:text-lg">
          {candidate.title}
        </p>
      </div>

      <label
        htmlFor="classifier-reasoning"
        className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-primary"
      >
        Classifier reasoning
      </label>
      <textarea
        id="classifier-reasoning"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={7}
        className="w-full resize-y rounded-xl border-2 border-base-content/20 bg-base-100 px-4 py-3.5 text-base leading-relaxed text-base-content outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}

function RepeatStep({ heading }: { heading: string }) {
  const levels = [
    { label: "4-digit", value: heading, done: true },
    { label: "6-digit", value: "?", done: false },
    { label: "8-digit", value: "?", done: false },
    { label: "10-digit", value: "🎉", done: false },
  ];

  return (
    <div>
      <p className="mb-8 max-w-3xl text-base leading-relaxed text-base-content/80">
        Repeat the at the next level with fresh legal notes and CROSS
        ruling research
      </p>

      <div className="flex flex-col items-stretch sm:flex-row sm:items-center">
        {levels.map((level, index) => (
          <div key={level.label} className="flex flex-col items-center sm:min-w-0 sm:flex-1 sm:flex-row">
            <div className="flex flex-col items-center">
              <p
                className={`text-sm font-bold uppercase tracking-[0.12em] ${level.done ? "text-success" : "text-base-content/70"
                  }`}
              >
                {level.label + 's'}
              </p>
              <div
                className={`mt-2 flex min-w-[5.75rem] items-center justify-center rounded-2xl border-2 px-4 py-3.5 ${level.done
                  ? "border-success bg-success/15"
                  : "border-base-content/20 bg-base-200"
                  }`}
              >
                <span
                  className={`font-mono text-3xl font-bold tracking-tight sm:text-4xl ${level.done ? "text-success" : "text-base-content/70"
                    }`}
                >
                  {level.value}
                </span>
              </div>
            </div>

            {index < levels.length - 1 && (
              <div
                className="flex flex-col items-center py-2 sm:min-w-[2.5rem] sm:flex-1 sm:flex-row sm:px-3 sm:py-0"
                aria-hidden="true"
              >
                <ChevronDownIcon className="h-5 w-5 text-base-content/50 sm:hidden" />
                <div className="hidden h-0.5 flex-1 bg-base-content/25 sm:block" />
                <ArrowRightIcon className="hidden h-5 w-4 shrink-0 text-base-content/50 sm:block" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
