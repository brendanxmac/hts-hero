import { ReactNode } from "react";

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
      <span className="text-xs font-semibold uppercase tracking-wider text-primary">{kicker}</span>
      <h2 id={titleId} className="text-2xl sm:text-3xl font-semibold tracking-tight text-base-content">
        {title}
      </h2>
      {children && <p className="text-base leading-relaxed text-base-content/70">{children}</p>}
    </div>
  );
}
