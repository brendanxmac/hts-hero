import Link from "next/link";

type CTABannerColor = "primary" | "secondary" | "accent";

interface CTABannerProps {
  message: string;
  ctaText: string;
  href: string;
  color?: CTABannerColor;
  openInNewTab?: boolean;
  subText?: string;
}

const gradientClasses: Record<CTABannerColor, string> = {
  primary:
    "bg-gradient-to-r from-primary via-primary to-primary/90 shadow-md shadow-primary/10",
  secondary:
    "bg-gradient-to-r from-secondary via-secondary to-secondary/90 shadow-md shadow-secondary/10",
  accent:
    "bg-gradient-to-r from-accent via-accent to-accent/90 shadow-md shadow-accent/10",
};

const textClasses: Record<CTABannerColor, string> = {
  primary: "text-primary-content",
  secondary: "text-secondary-content",
  accent: "text-accent-content",
};

const buttonClasses: Record<CTABannerColor, string> = {
  primary:
    "bg-primary-content text-primary hover:bg-primary-content/90",
  secondary:
    "bg-secondary-content text-secondary hover:bg-secondary-content/90",
  accent:
    "bg-accent-content text-accent hover:bg-accent-content/90",
};

export function CTABanner({
  message,
  ctaText,
  href,
  color = "primary",
  openInNewTab = false,
  subText,
}: CTABannerProps) {
  return (
    <div className={gradientClasses[color]}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-6">
        <p
          className={`${textClasses[color]} text-xs sm:text-sm lg:text-lg font-medium text-center sm:text-left flex-1 min-w-0`}
        >
          {message}
        </p>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <Link
            href={href}
            {...(openInNewTab
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm whitespace-nowrap ${buttonClasses[color]}`}
          >
            {ctaText}
            <span aria-hidden="true">&rarr;</span>
          </Link>
          {subText && (
            <span className={`${textClasses[color]} text-[10px] sm:text-xs opacity-90 text-center sm:text-right`}>
              {subText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
