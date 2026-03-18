"use client";

import { useEffect, useRef, useState } from "react";

interface ComparisonBar {
  label: string;
  unit: string;
  manual: { value: number; label: string };
  htsHero: { value: number; label: string };
  higherIsBetter: boolean;
}

const COMPARISONS: ComparisonBar[] = [
  {
    label: "Accuracy",
    unit: "%",
    manual: { value: 62, label: "Manual" },
    htsHero: { value: 95, label: "HTS Hero" },
    higherIsBetter: true,
  },
  {
    label: "Speed",
    unit: " min",
    manual: { value: 35, label: "Manual" },
    htsHero: { value: 3, label: "HTS Hero" },
    higherIsBetter: false,
  },
  {
    label: "Cost",
    unit: "$",
    manual: { value: 100, label: "Manual" },
    htsHero: { value: 3, label: "HTS Hero" },
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
      : "bg-base-content/15";

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
          <span className="w-28 sm:w-36 text-sm font-semibold text-secondary text-right shrink-0">
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-base-content mb-4">
            Your Strategic <span className="text-primary">Advantage</span>
          </h2>
          <p className="text-base sm:text-lg text-base-content/50 max-w-xl mx-auto leading-relaxed">
            See how HTS Hero compares to manual classification research
          </p>
        </div>

        {/* Comparison bars */}
        <div className="space-y-12">
          {COMPARISONS.map((comparison, i) => (
            <ComparisonRow
              key={comparison.label}
              comparison={comparison}
              visible={visible}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
