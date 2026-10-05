"use client";

import { ReactNode, useId } from "react";
import * as ui from "@/components/ui/styles";
import { Switch } from "@/components/ui/Switch";

// One product in the estimate: a header with an on/off switch, and its options while it's on
export const ProductCard = ({
  name,
  summary,
  enabled,
  includedWith,
  onToggle,
  children,
}: {
  name: string;
  summary: string;
  enabled: boolean;
  // Set when another product in the estimate includes this one: it stays on, at no charge
  includedWith?: string;
  onToggle: (enabled: boolean) => void;
  children?: ReactNode;
}) => {
  const titleId = useId();
  return (
    <div className={ui.card}>
      <div className={`flex items-center justify-between gap-4 px-5 py-4 ${enabled && children ? "border-b border-base-300" : ""}`}>
        <div className="min-w-0">
          <h3 id={titleId} className={ui.cardTitle}>
            {name}
          </h3>
          <p className={`${ui.caption} mt-0.5`}>{summary}</p>
        </div>
        {includedWith ? (
          <span className={ui.badge("success")}>Included with {includedWith}</span>
        ) : (
          <Switch checked={enabled} onChange={onToggle} labelledBy={titleId} />
        )}
      </div>
      {enabled && children && <div className="flex flex-col gap-5 px-5 py-5">{children}</div>}
    </div>
  );
};
