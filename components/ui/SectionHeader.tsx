import { ReactNode } from "react";
import styles from "./theme.module.css";

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
    <div className={`flex flex-col gap-2 max-w-[80ch] ${className}`}>
      <span className={styles.kicker}>{kicker}</span>
      <h2 id={titleId} className={styles.h2}>
        {title}
      </h2>
      {children && <p className={styles.body}>{children}</p>}
    </div>
  );
}
