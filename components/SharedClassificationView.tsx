"use client";

import Link from "next/link";
import { ClassificationRecord } from "../interfaces/hts";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { NUM_FREE_CLASSIFICATIONS } from "../constants/classification";

interface SharedClassificationViewProps {
  classification: ClassificationRecord;
}

export const SharedClassificationView = ({
  classification: record,
}: SharedClassificationViewProps) => {
  const { classification } = record;
  const finalLevel =
    classification.levels[classification.levels.length - 1]?.selection;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-base-content/15 bg-gradient-to-br from-base-200/80 via-base-100 to-base-200/60 p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            <CheckCircleIcon className="w-4 h-4" />
            Shared Classification
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-base-content mb-4">
            {classification.articleDescription}
          </h1>

          {finalLevel && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-sm font-semibold text-primary/70">
                HTS Code:
              </span>
              <span className="text-lg font-bold text-primary">
                {finalLevel.htsno}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Classification Breakdown */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <DocumentTextIcon className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
            Classification Path
          </h2>
        </div>

        {classification.levels.map((level, index) => {
          const selection = level.selection;
          if (!selection) return null;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl border border-base-content/10 bg-base-100 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold bg-primary/10 text-primary border border-primary/20">
                  {selection.htsno || `Level ${index + 1}`}
                </span>
                <p className="text-base font-medium text-base-content leading-relaxed">
                  {selection.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      {classification.notes && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-base-content/80">
              Classification Notes
            </h2>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-base leading-relaxed text-base-content whitespace-pre-line">
              {classification.notes}
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-xl font-bold text-base-content">
            Want to classify your own products?
          </h3>
          <p className="text-base-content/70 max-w-md">
            Get {NUM_FREE_CLASSIFICATIONS} free classifications with an audit-ready report. No credit
            card required.
          </p>
          <Link
            href="/classifications/new"
            className="btn btn-primary btn-lg font-bold shadow-lg shadow-primary/25"
          >
            Try It Free
          </Link>
        </div>
      </div>
    </div>
  );
};
