"use client";

import Link from "next/link";
import { ProductSectionData } from "./ProductSection";

interface ProductStepsVisualProps {
  products: ProductSectionData[];
}

export default function ProductStepsVisual({
  products,
}: ProductStepsVisualProps) {
  const accentColorClasses = {
    primary: {
      bg: "bg-primary/10",
      border: "border-primary/20",
      text: "text-primary",
      hover: "hover:bg-primary/15 hover:border-primary/30",
    },
    secondary: {
      bg: "bg-secondary/10",
      border: "border-secondary/20",
      text: "text-secondary",
      hover: "hover:bg-secondary/15 hover:border-secondary/30",
    },
    accent: {
      bg: "bg-accent/10",
      border: "border-accent/20",
      text: "text-accent",
      hover: "hover:bg-accent/15 hover:border-accent/30",
    },
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 md:mt-12 px-4">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
        {products.map((product, index) => {
          const colors = accentColorClasses[product.accentColor];
          const stepNumber = index + 1;

          return (
            <div
              key={product.title}
              className="flex items-center w-full md:w-auto"
            >
              {/* Step Card */}
              <Link
                href={product.appUrl}
                className={`group relative flex flex-col items-center gap-3 p-6 md:p-7 rounded-2xl border-2 ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-300 w-full md:w-64 flex-shrink-0 shadow-sm hover:shadow-md`}
              >
                {/* Step Number Badge */}
                <div
                  className={`absolute -top-3 -left-3 w-11 h-11 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center font-extrabold ${colors.text} text-base shadow-lg backdrop-blur-sm`}
                >
                  {stepNumber}
                </div>

                {/* Emoji */}
                <div className="text-5xl mb-1 group-hover:scale-110 transition-transform duration-300">
                  {product.emoji}
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-center text-base-content group-hover:text-base-content/90 transition-colors">
                  {product.title}
                </h3>

                {/* Tagline */}
                <p className="text-sm text-center text-base-content/60 leading-relaxed min-h-[2.5rem]">
                  {product.tagline}
                </p>

                {/* Arrow indicator */}
                <div
                  className={`mt-1 ${colors.text} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}
                >
                  <svg
                    className="w-5 h-5"
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
                </div>
              </Link>

              {/* Arrow Connector (only show between steps, not after last) */}
              {index < products.length - 1 && (
                <div className="hidden md:flex items-center justify-center mx-1 flex-shrink-0">
                  <svg
                    className="w-10 h-10 text-base-content/15"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}








