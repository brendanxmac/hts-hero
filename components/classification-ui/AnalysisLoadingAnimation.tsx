"use client";

import { SparklesIcon } from "@heroicons/react/16/solid";

interface Props {
  title?: string;
  subtitle?: string;
}

export function AnalysisLoadingAnimation({
  title = "Analyzing candidates",
  subtitle = "Evaluating options",
}: Props) {
  return (
    <div className="py-6 flex flex-col items-center gap-5">
      <div className="relative">
        <div
          className="absolute -inset-3 rounded-full bg-primary/20 blur-xl"
          style={{ animation: "analysisGlow 2.5s ease-in-out infinite" }}
        />
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
          <SparklesIcon
            className="w-5 h-5 text-primary"
            style={{ animation: "sparkleRotate 4s linear infinite" }}
          />
        </div>
        {[
          { left: "-4px", top: "2px", delay: "0s", size: "3px" },
          { right: "-6px", top: "10px", delay: "0.9s", size: "2px" },
          { left: "50%", top: "-5px", delay: "1.8s", size: "2.5px" },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/80"
            style={{
              left: p.left,
              right: p.right,
              top: p.top,
              width: p.size,
              height: p.size,
              animation: "particleFloat 2.8s ease-out infinite",
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-base-content/70">{title}</p>
        <p className="text-xs text-base-content/40 mt-1">{subtitle}</p>
      </div>

      <div className="w-48 h-0.5 rounded-full bg-base-300/50 overflow-hidden relative">
        <div
          className="absolute top-0 left-0 h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{ animation: "progressSlide 1.8s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}
