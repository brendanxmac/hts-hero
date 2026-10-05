import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";

// A form field: its label (with an optional action at the right), the control, and a hint
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
      <label htmlFor={htmlFor} className={ui.fieldLabel}>
        {label}
      </label>
      {action}
    </div>
    {children}
    {hint && <p className={`${ui.caption} leading-snug`}>{hint}</p>}
  </div>
);
