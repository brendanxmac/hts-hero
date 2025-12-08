"use client";

import { ClassificationStatus } from "../../interfaces/hts";

export interface StatusDropdownProps {
  status: ClassificationStatus;
  isUpdating: boolean;
  disabled: boolean;
  onChange: (status: ClassificationStatus) => void;
}

export function StatusDropdown({
  status,
  isUpdating,
  disabled,
  onChange,
}: StatusDropdownProps) {
  const statusStyles = {
    [ClassificationStatus.FINAL]: "text-success border-success/30",
    [ClassificationStatus.REVIEW]: "text-warning border-warning/30",
    [ClassificationStatus.DRAFT]: "text-base-content/70",
  };

  return (
    <div className="relative">
      <select
        className={`select select-sm h-9 bg-base-100 rounded-lg border border-base-content/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 hover:border-primary/40 cursor-pointer font-semibold text-xs ${statusStyles[status]}`}
        value={status}
        disabled={isUpdating || disabled}
        onChange={(e) => onChange(e.target.value as ClassificationStatus)}
      >
        <option value={ClassificationStatus.DRAFT}>Draft</option>
        <option value={ClassificationStatus.REVIEW}>Review</option>
        <option value={ClassificationStatus.FINAL}>Final</option>
      </select>
      {isUpdating && (
        <span className="loading loading-spinner loading-xs absolute right-8 top-1/2 -translate-y-1/2 text-primary" />
      )}
    </div>
  );
}
