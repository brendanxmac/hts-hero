"use client";

const cardStyle =
  "bg-base-100 rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-6 md:p-8 text-base-content";

const verticalCardStyle =
  "rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-6 xl:p-8 shadow-xl text-base-content focus-within:border-primary/50 transition-colors";

type PlaybookCTAProps = {
  email: string;
  setEmail: (value: string) => void;
  error: string;
  isLoading: boolean;
  onSubmit: () => void;
  bonusTotalValue?: number;
  /** "card" = full CTA block (section + full copy). "vertical" = compact form for hero/sidebar. */
  variant?: "card" | "vertical";
  /** Optional wrapper className (for vertical: e.g. "hidden lg:flex flex-col h-full" or "lg:hidden w-full max-w-md mx-auto mb-10"). */
  className?: string;
};

export default function PlaybookCTA({
  email,
  setEmail,
  error,
  isLoading,
  onSubmit,
  bonusTotalValue = 379,
  variant = "card",
  className = "",
}: PlaybookCTAProps) {
  if (variant === "vertical") {
    return (
      <div className={`flex flex-col h-full justify-between ${verticalCardStyle} ${className}`.trim()}>
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            Instant access — no credit card required
          </p>
          <h2 className="text-xl xl:text-2xl font-bold text-base-content mb-2">
            Get the Playbook + All Bonuses for FREE
          </h2>
          <p className="text-primary font-bold text-base xl:text-lg mb-5">
            A ${bonusTotalValue} value, FREE today when you enter your email below!
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Enter your best email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              className="input input-bordered input-lg w-full text-base input-primary"
              disabled={isLoading}
              aria-label="Email address"
            />
            <button
              onClick={onSubmit}
              disabled={isLoading}
              className="btn btn-primary btn-lg font-bold w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-70"
            >
              {isLoading ? "Sending…" : "Send Me the Playbook!"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-error font-medium">{error}</p>
          )}
        </div>
        <p className="text-sm text-base-content/70 pt-2">
          We never share your email and don&apos;t send spam. Unsubscribe anytime.
        </p>
      </div>
    );
  }

  return (
    <section className="py-8 pb-16">
      <div
        className={`${cardStyle} text-center border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent focus-within:border-primary/50 transition-colors`}
      >
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
          Instant access — no credit card required
        </p>
        <h2 className="text-2xl md:text-4xl font-bold text-base-content mb-2">
          Get the Playbook + All Bonuses for FREE
        </h2>
        <p className="text-primary font-bold text-xl mb-6">
          A ${bonusTotalValue} value, FREE today when you enter your email below!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your best email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            className="input input-bordered input-lg w-full text-base input-primary"
            disabled={isLoading}
            aria-label="Email address"
          />
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="btn btn-primary btn-lg font-bold text-base whitespace-nowrap transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-70"
          >
            {isLoading ? "Sending…" : "Send Me the Playbook!"}
          </button>
        </div>
        <p className="mt-4 text-sm text-base-content/70 max-w-lg mx-auto">
          We never share your email and don&apos;t send spam. Unsubscribe anytime.
        </p>
        {error && (
          <p className="mt-3 text-sm text-error font-medium">{error}</p>
        )}
      </div>
    </section>
  );
}
