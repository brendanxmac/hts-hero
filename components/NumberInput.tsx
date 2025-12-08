interface Props {
  label?: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  subtext?: string;
}

// Helper to format number input value - removes leading zeros except for "0" itself
const formatNumberInputValue = (value: string): string => {
  // Allow empty string
  if (value === "" || value === "-") return value;
  // Remove leading zeros but keep at least one digit
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return "";
  return String(parsed);
};

export const NumberInput = ({
  label,
  value,
  setValue,
  min,
  max,
  subtext,
}: Props) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-base-content/70">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          type="text"
          inputMode="numeric"
          className="w-full h-[45px] px-3 bg-base-200/50 rounded-xl border border-base-content/10 transition-all duration-200 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] pr-14 placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 hover:bg-base-200/70"
          value={value}
          onChange={(e) => {
            const rawValue = e.target.value;
            // Only allow numeric characters and decimal point
            if (rawValue !== "" && !/^-?\d*\.?\d*$/.test(rawValue)) return;
            const formatted = formatNumberInputValue(rawValue);
            const numValue = formatted === "" ? 0 : Number(formatted);
            // Apply min/max constraints
            if (min !== undefined && numValue < min) {
              setValue(min);
            } else if (max !== undefined && numValue > max) {
              setValue(max);
            } else {
              setValue(numValue);
            }
          }}
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
