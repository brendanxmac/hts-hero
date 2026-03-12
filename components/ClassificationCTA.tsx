"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/solid";

interface ClassificationCTAProps {
  title: string;
  subtitle?: string;
  ctaButtonText?: string;
  variant: "inline" | "sidebar";
}

export const ClassificationCTA = ({
  title,
  subtitle,
  ctaButtonText = "Classify My Product",
  variant,
}: ClassificationCTAProps) => {
  const [description, setDescription] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    if (!description.trim()) return;
    sessionStorage.setItem("cta_classification_description", description);
    router.push("/classifications");
  };

  if (variant === "sidebar") {
    return (
      <div className="sticky top-24 w-full">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-base-100 to-base-100">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/15 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-base-content">{title}</h3>
            </div>

            {subtitle && (
              <p className="text-sm text-base-content/60 leading-relaxed">
                {subtitle}
              </p>
            )}

            <textarea
              placeholder="e.g. Men's cotton denim jeans, dyed blue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && description.trim()) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={3}
              className={`w-full text-sm resize-none rounded-xl border px-3 py-2.5 bg-base-100 placeholder-base-content/40 focus:outline-none transition-all duration-200 ${
                isFocused
                  ? "ring-2 ring-primary/50 border-primary/30"
                  : "border-base-content/15 hover:border-primary/30"
              }`}
            />

            <button
              disabled={!description.trim()}
              onClick={handleSubmit}
              className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                description.trim()
                  ? "bg-primary text-primary-content hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]"
                  : "bg-base-content/10 text-base-content/40 cursor-not-allowed"
              }`}
            >
              {ctaButtonText}
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-base-100 to-secondary/5">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Text section */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Classification Assistant
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-base-content">
              {title}
            </h3>
            {subtitle && (
              <p className="text-base-content/60 text-sm md:text-base leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Input section */}
          <div className="w-full md:w-96 flex flex-col gap-3">
            <textarea
              placeholder="Describe your product (e.g. Men's 100% cotton denim jeans, dyed blue)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && description.trim()) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={3}
              className={`w-full text-sm resize-none rounded-xl border px-4 py-3 bg-base-100 placeholder-base-content/40 focus:outline-none transition-all duration-200 ${
                isFocused
                  ? "ring-2 ring-primary/50 border-primary/30"
                  : "border-base-content/15 hover:border-primary/30"
              }`}
            />

            <button
              disabled={!description.trim()}
              onClick={handleSubmit}
              className={`w-full px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                description.trim()
                  ? "bg-primary text-primary-content hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]"
                  : "bg-base-content/10 text-base-content/40 cursor-not-allowed"
              }`}
            >
              {ctaButtonText}
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
