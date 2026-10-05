"use client";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { EXAMPLES, Example } from "../lib/useTariffFinder";

// Example products that fill in the calculator, before a code is chosen
export const ExampleButtons = ({ onExample }: { onExample: (e: Example) => void }) => (
  <div className="flex flex-col gap-2.5">
    {EXAMPLES.map((example) => (
      <button
        key={example.code}
        type="button"
        onClick={() => onExample(example)}
        className="group flex items-center justify-between gap-4 rounded-md border border-base-300 bg-base-200 px-4 py-3.5 text-left transition-colors hover:border-primary/30 hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span className="flex flex-col">
          <span className={ui.cardTitle}>
            {example.label} from {example.origin}
          </span>
          <span className={`${mono.className} text-sm text-base-content/70`}>{example.code}</span>
        </span>
        <ArrowRightIcon className="w-4 h-4 text-base-content/60 group-hover:text-primary" />
      </button>
    ))}
  </div>
);
