"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShieldCheckIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
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

function DefensibilityResultCard() {
  const painPills = [
    { label: "Avoid cargo delays & holds", icon: TruckIcon },
    { label: "Avoid CBP fines & penalties", icon: BanknotesIcon },
    { label: "Avoid overpaying tariffs", icon: ScaleIcon },
    { label: "Avoid audit headaches", icon: ClipboardDocumentCheckIcon },
    { label: "Avoid protest & litigation losses", icon: ShieldCheckIcon },
  ];
  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-base-content mb-5">
        Defensibility
      </h3>
      <div className="relative w-full max-w-3xl">
        {/* Glow */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 blur-xl" />

        <div className="relative rounded-2xl border border-primary/20 bg-base-100 overflow-hidden shadow-lg shadow-primary/[0.06]">
          <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary" />

          <div className="flex flex-col gap-5 sm:gap-6 px-6 py-6 sm:px-8 sm:py-7">
            {/* Pain block */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-error/10">
                <ExclamationTriangleIcon className="h-6 w-6 text-error" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-bold text-base-content leading-tight">
                  The cost of misclassification is real
                </h4>
                <p className="mt-1 text-sm text-base-content/60 leading-relaxed">
                  Cargo delays, CBP fines, overpaid tariffs, penalties, and costly audits. Your competitors face these risks every day. <span className="font-semibold text-primary">You don&apos;t have to.</span>
                </p>
              </div>
            </div>

            {/* Pain-avoidance pills */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/80 mb-2">
                What you avoid with HTS Hero
              </p>
              <div className="flex flex-wrap gap-1.5">
                {painPills.map(({ label, icon: Icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/[0.08] border border-primary/20 text-[11px] font-semibold text-primary"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
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
        </div>
      </div>
    </section>
  );
}
