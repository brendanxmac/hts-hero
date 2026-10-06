import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";

// A chart card's title and description, with an optional control on the right
export const ChartCaption = ({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <figcaption className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
    {/* Shrinks so the action stays on the same line, until there's no room for both */}
    <div className="min-w-0 flex-1 basis-64">
      <h3 className={ui.cardTitle}>{title}</h3>
      <p className={`${ui.caption} mt-0.5`}>{children}</p>
    </div>
    {action}
  </figcaption>
);
