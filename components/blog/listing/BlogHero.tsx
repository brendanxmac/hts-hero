import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";

// The top band of a blog listing page: what's here, and the category links
export function BlogHero({
  kicker,
  title,
  lead,
  breadcrumbs,
  children,
}: {
  kicker: string;
  title: string;
  lead: string;
  breadcrumbs?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="w-full border-b border-base-300">
      <div className={`${ui.container} flex flex-col gap-6 pb-10 pt-6`}>
        {breadcrumbs}
        <div className="flex max-w-4xl flex-col gap-4 pt-4">
          <span className={ui.kicker}>{kicker}</span>
          <h1 className={ui.display}>{title}</h1>
          <p className={`${ui.lead} max-w-3xl`}>{lead}</p>
        </div>
        {children}
      </div>
    </header>
  );
}
