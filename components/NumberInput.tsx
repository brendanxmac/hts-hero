interface Props {
  label: string;
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
    <div className="flex flex-col">
      <label className="label label-text">{label}</label>
      <div className="relative w-full max-w-xs">
        <input
          type="number"
          min={min === undefined ? undefined : min}
          max={max === undefined ? undefined : max}
          className="input input-bordered w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] pr-16"
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value));
          }}
        />
        {subtext && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
