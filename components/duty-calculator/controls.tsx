"use client";

import { ReactNode, useEffect, useState } from "react";
import styles from "./theme.module.css";

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
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {action}
    </div>
    {children}
    {hint && <p className="text-[12.5px] leading-snug text-[var(--dc-text-3)]">{hint}</p>}
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
    <div className={`${styles.input} ${styles.num} flex items-center gap-2 px-3.5`}>
      {prefix && <span className="text-[var(--dc-text-3)] font-medium">{prefix}</span>}
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        className="flex-1 min-w-0 bg-transparent outline-none text-[15.5px] font-medium"
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
      {suffix && <span className="text-[13px] font-medium text-[var(--dc-text-3)]">{suffix}</span>}
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
    <div
      role="radiogroup"
      aria-label={label}
      className={styles.segmented}
      style={compact ? { height: 38 } : undefined}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${styles.segment} ${active ? styles.segmentActive : ""} ${compact ? "px-3 text-[13px]" : "px-2"}`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
