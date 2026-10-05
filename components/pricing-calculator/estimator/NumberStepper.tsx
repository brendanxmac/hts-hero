"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { NumberInput } from "./NumberInput";

// A whole number with − and + buttons either side, clamped to [min, max]
export const NumberStepper = ({
  id,
  value,
  onChange,
  min,
  max,
  unit,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string;
}) => {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={ui.button({ icon: true })}
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label={`Fewer ${unit}`}
      >
        <MinusIcon className="h-4 w-4" aria-hidden />
      </button>
      <NumberInput id={id} value={value} onChange={onChange} min={min} max={max} className="w-20 text-center" />
      <button
        type="button"
        className={ui.button({ icon: true })}
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`More ${unit}`}
      >
        <PlusIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};
