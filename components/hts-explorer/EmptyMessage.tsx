import { ReactNode } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";

// In place of a list with nothing in it
export const EmptyMessage = ({
  title,
  description,
  icon = <MagnifyingGlassIcon className="h-5 w-5" />,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
}) => (
  <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tt-soft text-base-content/60" aria-hidden>
      {icon}
    </span>
    <div>
      <p className={tt.title}>{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-base-content/70">{description}</p>}
    </div>
  </div>
);
