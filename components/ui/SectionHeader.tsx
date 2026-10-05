import { ReactNode } from "react";
import * as ui from "./styles";

// The top of a page section: a kicker, the section's <h2> and an optional lead paragraph.
// Every section on a page starts with one, so sections read the same everywhere.
export function SectionHeader({
  kicker,
  title,
  titleId,
  children,
  className = "",
}: {
  kicker: ReactNode;
  title: ReactNode;
  titleId?: string;
  // The lead paragraph
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 max-w-3xl ${className}`}>
      <span className={ui.kicker}>{kicker}</span>
      <h2 id={titleId} className={ui.sectionTitle}>
        {title}
      </h2>
      {children && <p className={ui.body}>{children}</p>}
    </div>
  );
}
