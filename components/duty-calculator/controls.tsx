"use client";

import { ReactNode, useEffect, useState } from "react";
import { SegmentedControl } from "../ui/SegmentedControl";
import * as ui from "../ui/styles";

export const Field = ({
  label,
  htmlFor,
  hint,
  action,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col gap-2 min-w-0 ${className}`}>
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-base-content/70">
        {label}
      </label>
      {action}
    </div>
    {children}
    {hint && <p className="text-xs leading-snug text-base-content/60">{hint}</p>}
  </div>
);

const formatAmount = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });

// A number input that shows thousands separators and accepts pasted "$12,500.00"
export const NumberField = ({
  id,
  value,
  onChange,
  prefix,
  suffix,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}) => {
  const [text, setText] = useState(formatAmount(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatAmount(value));
  }, [value, focused]);

  return (
    <div className={`${ui.input} flex items-center gap-2 tabular-nums`}>
      {prefix && <span className="font-medium text-base-content/60">{prefix}</span>}
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        className="flex-1 min-w-0 bg-transparent outline-none text-base font-medium"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setText(formatAmount(value));
        }}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^\d.]/g, "");
          setText(cleaned);
          const parsed = parseFloat(cleaned);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
      />
      {suffix && <span className="text-sm font-medium text-base-content/60">{suffix}</span>}
    </div>
  );
};

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  compact,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
}) {
  return (
    <SegmentedControl label={label} options={options} value={value} onChange={onChange} size={compact ? "sm" : "md"} fullWidth />
  );
}
