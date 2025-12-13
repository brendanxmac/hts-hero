import { useState, useEffect, useRef } from "react";

interface Props {
  label?: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  subtext?: string;
  prefix?: string;
  className?: string;
}

export const NumberInput = ({
  label,
  value,
  setValue,
  min,
  max,
  subtext,
  prefix,
  className,
}: Props) => {
  // Local state for display - preserves exactly what user types
  const [displayValue, setDisplayValue] = useState(String(value));
  const isFocused = useRef(false);

  // Sync display when value changes externally (but not while user is typing)
  useEffect(() => {
    if (!isFocused.current) {
      setDisplayValue(String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty string while typing
    if (rawValue === "") {
      setDisplayValue("");
      setValue(min !== undefined ? min : 0);
      return;
    }

    // Only allow valid numeric characters (digits, decimal point, minus sign)
    if (!/^-?\d*\.?\d*$/.test(rawValue)) return;

    // Update display immediately with exactly what user typed
    setDisplayValue(rawValue);

    // Parse and send numeric value to parent
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      // Apply min/max constraints to the value sent to parent
      if (min !== undefined && numValue < min) {
        setValue(min);
      } else if (max !== undefined && numValue > max) {
        setValue(max);
      } else {
        setValue(numValue);
      }
    }
  };

  const handleBlur = () => {
    isFocused.current = false;
    // Clean up display on blur (remove leading zeros, etc.)
    const numValue = parseFloat(displayValue);
    if (isNaN(numValue) || displayValue === "") {
      const fallback = min !== undefined ? min : 0;
      setDisplayValue(String(fallback));
      setValue(fallback);
    } else {
      setDisplayValue(String(numValue));
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
      {label && (
        <label className="text-sm font-medium text-base-content/70">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {prefix && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 font-semibold pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          className={`w-full h-[45px] bg-base-200/50 rounded-xl border border-base-content/10 transition-all duration-200 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 hover:bg-base-200/70 ${prefix ? "pl-7 pr-3 font-semibold" : "px-3"} ${subtext ? "pr-14" : ""}`}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => (isFocused.current = true)}
          onBlur={handleBlur}
        />
        {subtext && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-base-content/50 pointer-events-none bg-base-200/80 px-2 py-0.5 rounded-md">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
