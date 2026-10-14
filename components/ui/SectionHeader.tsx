import { ReactNode } from "react";
import * as ui from "./styles";

// The top of a page section: a kicker, the section's <h2> and an optional lead paragraph.
// Every section on a page starts with one, so sections read the same everywhere. Inside the
// Tariff Tracker's look (.hts-tracker) the title is in Sora and the kicker is the Tracker's eyebrow.
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
      <span className={`${ui.kicker} tracker:font-bold`}>{kicker}</span>
      <h2 id={titleId} className={`${ui.sectionTitle} tracker:font-[family-name:var(--font-tracker-display)]`}>
        {title}
      </h2>
      {children && <p className={ui.body}>{children}</p>}
    </div>
  );
}
