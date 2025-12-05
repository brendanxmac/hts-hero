interface PercentageInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const PercentageInput = ({
  value,
  onChange,
  min = 0,
  max = 100,
  className = "",
}: PercentageInputProps) => {
  const clamp = (val: number) => Math.min(max, Math.max(min, val));

  const parseValue = (raw: string): number => {
    const cleaned = raw.replace(/[^0-9]/g, "");
    return cleaned === "" ? min : clamp(parseInt(cleaned));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseValue(e.target.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onChange(clamp(value + 1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onChange(clamp(value - 1));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onChange(parseValue(e.target.value));
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        className="input input-bordered w-full pr-10 text-right tabular-nums"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <span className="absolute right-4 text-base-content/50 font-medium pointer-events-none">
        %
      </span>
    </div>
  );
};

