import Link from "next/link";

type SectionCTAVariant = "primary" | "secondary" | "accent" | "subtle";

interface SectionCTAProps {
  message: string;
  description?: string;
  ctaText: string;
  href: string;
  variant?: SectionCTAVariant;
  openInNewTab?: boolean;
}

const variantStyles: Record<SectionCTAVariant, { wrapper: string; button: string }> = {
  primary: {
    wrapper: "bg-primary/[0.04] border border-primary/10",
    button: "bg-primary text-primary-content hover:bg-primary/90 shadow-sm",
  },
  secondary: {
    wrapper: "bg-secondary/[0.04] border border-secondary/10",
    button: "bg-secondary text-secondary-content hover:bg-secondary/90 shadow-sm",
  },
  accent: {
    wrapper: "bg-accent/[0.04] border border-accent/10",
    button: "bg-accent text-accent-content hover:bg-accent/90 shadow-sm",
  },
  subtle: {
    wrapper: "bg-base-200/40 border border-base-content/8",
    button: "bg-base-content/10 text-base-content hover:bg-base-content/15",
  },
};

export function SectionCTA({
  message,
  description,
  ctaText,
  href,
  variant = "primary",
  openInNewTab = false,
}: SectionCTAProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl px-5 py-4 ${styles.wrapper}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm md:text-base font-semibold text-base-content/90">
          {message}
        </p>
        {description && (
          <p className="text-xs sm:text-sm text-base-content/50 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <Link
        href={href}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${styles.button}`}
      >
        {ctaText}
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  );
}
