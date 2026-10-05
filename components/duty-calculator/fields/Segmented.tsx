"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";

// A full-width SegmentedControl for a form field; compact in dense rails
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
