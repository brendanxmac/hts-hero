"use client";

import { ClassificationStatus } from "../../interfaces/hts";
import { Select } from "@/components/ui/Select";

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
    [ClassificationStatus.FINAL]: "!border-success/30",
    [ClassificationStatus.REVIEW]: "!border-warning/30",
    [ClassificationStatus.DRAFT]: "",
  };

  return (
    <div className="relative">
      <Select
        value={status}
        onChange={onChange}
        options={[
          { value: ClassificationStatus.DRAFT, label: <span className="text-base-content/70">Draft</span> },
          { value: ClassificationStatus.REVIEW, label: <span className="text-warning">Review</span> },
          { value: ClassificationStatus.FINAL, label: <span className="text-success">Final</span> },
        ]}
        label="Classification status"
        size="sm"
        disabled={isUpdating || disabled}
        buttonClassName={`!h-9 !rounded-lg text-xs font-semibold ${statusStyles[status]}`}
      />
      {isUpdating && (
        <span className="loading loading-spinner loading-xs absolute right-8 top-1/2 -translate-y-1/2 text-primary" />
      )}
    </div>
  );
}
