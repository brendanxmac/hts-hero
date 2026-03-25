"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShieldCheckIcon,
  ScaleIcon,
  TruckIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface ComparisonBar {
  label: string;
  unit: string;
  manual: { value: number; label: string };
  htsHero: { value: number; label: string };
  higherIsBetter: boolean;
}

const COMPARISONS: ComparisonBar[] = [
  {
    label: "Speed",
    unit: " min",
    manual: { value: 45, label: "Status Quo" },
    htsHero: { value: 3, label: "HTS Hero" },
    higherIsBetter: false,
  },
  {
    label: "Cost",
    unit: "$",
    manual: { value: 100, label: "Status Quo" },
    htsHero: { value: 1, label: "HTS Hero" },
    higherIsBetter: false,
  },
];

function AnimatedBar({
  percentage,
  color,
  visible,
  delay,
}: {
  percentage: number;
  color: "manual" | "hero";
  visible: boolean;
  delay: number;
}) {
  const colorClasses =
    color === "hero"
      ? "bg-primary"
      : "bg-base-content/30";

  return (
    <div
      className={`h-full rounded-full transition-all ease-out ${colorClasses}`}
      style={{
        width: visible ? `${percentage}%` : "0%",
        transitionDuration: "1.2s",
        transitionDelay: `${delay}ms`,
      }}
    />
  );
}

function ComparisonRow({
  comparison,
  visible,
  index,
}: {
  comparison: ComparisonBar;
  visible: boolean;
  index: number;
}) {
  const maxValue = Math.max(comparison.manual.value, comparison.htsHero.value);
  const manualPct = (comparison.manual.value / maxValue) * 100;
  const heroPct = (comparison.htsHero.value / maxValue) * 100;

  const heroIsWinner = comparison.higherIsBetter
    ? comparison.htsHero.value > comparison.manual.value
    : comparison.htsHero.value < comparison.manual.value;

  const baseDelay = index * 200;

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-base-content mb-5">
        {comparison.label}
      </h3>

      <div className="space-y-4">
        {/* Manual bar */}
        <div className="flex items-center gap-4">
          <span className="w-28 sm:w-36 text-sm font-medium text-base-content/50 text-right shrink-0">
            {comparison.manual.label}
          </span>
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-10 sm:h-12 rounded-full bg-base-200/60 overflow-hidden">
              <AnimatedBar
                percentage={manualPct}
                color="manual"
                visible={visible}
                delay={baseDelay}
              />
            </div>
            <span
              className={`text-lg sm:text-xl font-bold tabular-nums min-w-[4rem] ${!heroIsWinner ? "text-primary" : "text-base-content/40"}`}
            >
              {comparison.manual.value}
              {comparison.unit}
            </span>
          </div>
        </div>

        {/* HTS Hero bar */}
        <div className="flex items-center gap-4">
          <span className="w-28 sm:w-36 text-sm font-semibold text-primary text-right shrink-0">
            {comparison.htsHero.label}
          </span>
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-10 sm:h-12 rounded-full bg-base-200/60 overflow-hidden">
              <AnimatedBar
                percentage={heroPct}
                color="hero"
                visible={visible}
                delay={baseDelay + 100}
              />
            </div>
            <span
              className={`text-lg sm:text-xl font-bold tabular-nums min-w-[4rem] ${heroIsWinner ? "text-primary" : "text-base-content/40"}`}
            >
              {comparison.htsHero.value}
              {comparison.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAIN_PILLS = [
  { label: "Cargo delays & holds", icon: TruckIcon },
  { label: "CBP fines & penalties", icon: BanknotesIcon },
  { label: "Overpaid tariffs", icon: ScaleIcon },
  { label: "Audit headaches", icon: ClipboardDocumentCheckIcon },
  { label: "Protest & litigation losses", icon: ShieldCheckIcon },
];

function DefensibilityResultCard() {
  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-base-content mb-5">
        Defensibility
      </h3>

      <div className="space-y-4">
        {/* Status Quo row */}
        <div className="flex items-start gap-4">
          <span className="w-28 sm:w-36 text-sm font-medium text-base-content/50 text-right shrink-0 pt-2.5">
            Status Quo
          </span>
          <div className="flex-1">
            <div className="flex-1 h-10 sm:h-12 rounded-full bg-base-200/60 flex items-center px-5 gap-2">
              <DocumentTextIcon className="w-4 h-4 text-base-content/30 shrink-0" />
              <span className="text-sm font-medium text-base-content/40">
                HTS Code Only...
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5 pl-1">
              {PAIN_PILLS.map(({ label }) => (
                <span
                  key={label}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-error/[0.06] text-[11px] font-medium text-error/60"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* HTS Hero row */}
        <div className="flex items-start gap-4">
          <span className="w-28 sm:w-36 text-sm font-semibold text-primary text-right shrink-0 pt-2.5">
            HTS Hero
          </span>
          <div className="flex-1">
            <div className="flex-1 h-10 sm:h-12 rounded-full bg-primary flex items-center px-5 gap-2.5">
              <ShieldCheckIcon className="w-4 h-4 text-white/80 shrink-0" />
              <span className="text-sm font-semibold text-white">
                Audit-Ready Defense Report
              </span>
            </div>
            <p className="text-xs text-base-content/40 mt-2 pl-1">
              GRI analysis, CROSS rulings, and full reasoning—all in one sharable report.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BenefitsComparisonSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-secondary/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-24 w-80 h-80 bg-primary/[0.06] rounded-full blur-3xl" />
      </div>

      <div ref={sectionRef} className="relative max-w-4xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-base-content mb-4">
            <span className="text-primary">Erase</span> Your Competition
          </h2>
          <p className="text-base sm:text-lg text-base-content/50 max-w-xl mx-auto leading-relaxed">
            Fast, cost-effective, and defensible HTS classification
          </p>
        </div>

        {/* Pain intro */}
        {/* <div className="mb-16 md:mb-20 max-w-2xl mx-auto text-center">
          <p className="text-lg sm:text-xl text-base-content/80 leading-relaxed mb-4">
            Misclassification isn&apos;t just wrong—it&apos;s expensive.
          </p>
          <p className="text-base text-base-content/60 leading-relaxed mb-6">
            Cargo delays at the border. CBP fines and penalties. Overpaid tariffs you&apos;ll never recover. Costly audits. Protest and litigation losses.
          </p>
          <p className="text-sm font-semibold text-primary tracking-wide">
            Here&apos;s how HTS Hero stacks up on speed, cost, and defensibility.
          </p>
        </div> */}

        {/* Comparison bars + Defensibility card */}
        <div className="space-y-12">
          {COMPARISONS.map((comparison, i) => (
            <ComparisonRow
              key={comparison.label}
              comparison={comparison}
              visible={visible}
              index={i}
            />
          ))}
          <DefensibilityResultCard />
          {/* <ResultCard /> */}
        </div>
      </div>
    </section>
  );
}
