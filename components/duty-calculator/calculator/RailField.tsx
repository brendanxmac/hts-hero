import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";

// A field in the entry rail: a small-caps label over the control
export const RailField = ({
  label,
  htmlFor,
  action,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  action?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-baseline justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className={ui.label}
      >
        {label}
      </label>
      {action}
    </div>
    {children}
    {hint && (
      <p className={`${ui.caption} leading-snug`}>
        {hint}
      </p>
    )}
  </div>
);
