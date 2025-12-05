interface Props {
  label?: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  subtext?: string;
}

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
          type="number"
          min={min === undefined ? undefined : min}
          max={max === undefined ? undefined : max}
          className="w-full h-[45px] px-3 bg-base-200/50 rounded-xl border border-base-content/10 transition-all duration-200 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] pr-14 placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 hover:border-primary/30 hover:bg-base-200/70"
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value));
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
