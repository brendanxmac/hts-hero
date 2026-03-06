"use client";

import { ClockIcon } from "@heroicons/react/16/solid";

const cardStyle =
  "bg-base-100 rounded-xl sm:rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-4 sm:p-6 md:p-8 text-base-content min-w-0";

const verticalCardStyle =
  "rounded-xl sm:rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-4 sm:p-6 shadow-xl text-base-content focus-within:border-primary/50 transition-colors min-w-0";

type PlaybookCTAProps = {
  email: string;
  setEmail: (value: string) => void;
  error: string;
  isLoading: boolean;
  onSubmit: () => void;
  bonusTotalValue: number;
  copiesLeft: number;
  /** When true, show success message instead of the form (e.g. "Check your email"). */
  emailSent?: boolean;
  /** "card" = full CTA block (section + full copy). "vertical" = compact form for hero/sidebar. */
  variant?: "card" | "vertical";
  /** Optional wrapper className (for vertical: e.g. "hidden lg:flex flex-col h-full" or "lg:hidden w-full max-w-md mx-auto mb-10"). */
  className?: string;
};

const emailSentMessage = (
  <div className="rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 border-2 border-primary/30 p-5 sm:p-6 text-center space-y-3 animate-[fadeIn_0.4s_ease-out]">
    <div className="text-4xl sm:text-5xl leading-none">🎉</div>
    <p className="text-primary font-extrabold text-lg sm:text-xl tracking-tight">
      You&apos;re in! Check your inbox.
    </p>
    <p className="text-base-content/80 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
      Your download link is on its way! Check your inbox for a message from HTS Hero.
    </p>
    <p className="text-xs text-base-content/50 italic">
      Don&apos;t see it? Check your spam folder. <br /> Link expires in 8 hours.
    </p>
  </div>
);

export default function PlaybookCTA({
  email,
  setEmail,
  error,
  isLoading,
  onSubmit,
  bonusTotalValue,
  copiesLeft,
  emailSent = false,
  variant = "card",
  className = "",
}: PlaybookCTAProps) {
  if (variant === "vertical") {
    return (
      <div className={`flex flex-col h-full justify-center items-center min-w-0 w-full ${verticalCardStyle} ${className}`.trim()}>
        <div className="min-w-0 w-full px-3 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-2 sm:mb-3 text-center break-words leading-tight">
            Get Your FREE Copy + 7 Bonuses!
          </h2>
          {emailSent ? (
            emailSentMessage
          ) : (
            <>
              <p className="text-primary font-bold text-sm sm:text-base xl:text-lg mb-3 sm:mb-5 break-words px-2">
                A ${bonusTotalValue} value for absolutely free!
              </p>
              <div className="flex flex-col gap-2 sm:gap-3 w-full min-w-0">
                <input
                  type="email"
                  placeholder="Enter your best email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                  className="input input-bordered input-md md:input-lg w-full min-w-0 text-sm sm:text-base input-primary"
                  disabled={isLoading}
                  aria-label="Email address"
                />
                <button
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="btn btn-primary btn-md md:btn-lg font-bold w-full min-w-0 text-sm sm:text-base break-words transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-70"
                >
                  {isLoading ? "Sending…" : "Send Me the Playbook!"}
                </button>

                <p className="text-[10px] min-[360px]:text-xs font-semibold text-primary uppercase tracking-wider py-2 break-words">
                  Instant access — no credit card required
                </p>

                <div className="flex gap-1 justify-center items-center mb-4">
                  <ClockIcon className="h-3.5 w-3.5 text-secondary animate-pulse" />
                  <p className="text-secondary font-bold text-xs sm:text-sm">
                    Bonuses Only Available During March
                  </p>
                </div>
              </div>
              {error && (
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-error font-medium break-words">{error}</p>
              )}
            </>
          )}
        </div>
        {!emailSent && (
          <p className="text-center text-xs text-base-content/70 pt-2 break-words">
            We never share your email and don&apos;t send spam. <br /> Unsubscribe anytime.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="py-6 sm:py-8 px-2 sm:px-0 min-w-0">
      <div
        className={`${cardStyle} text-center border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent focus-within:border-primary/50 transition-colors w-full max-w-full`}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-1 sm:mb-2 break-words leading-tight">
          Get Your FREE Copy + 7 Bonuses!
        </h2>
        {emailSent ? (
          emailSentMessage
        ) : (
          <>
            <p className="text-primary font-bold text-base sm:text-lg md:text-xl mb-4 sm:mb-6 break-words">
              A ${bonusTotalValue} value, FREE today when you enter your email below!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-xl mx-auto w-full min-w-0">
              <input
                type="email"
                placeholder="Enter your best email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                className="input input-bordered input-lg w-full min-w-0 text-sm sm:text-base input-primary"
                disabled={isLoading}
                aria-label="Email address"
              />
              <button
                onClick={onSubmit}
                disabled={isLoading}
                className="btn btn-primary btn-lg font-bold w-full sm:w-auto sm:flex-shrink-0 text-sm sm:text-base break-words transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-70"
              >
                {isLoading ? "Sending…" : "Send Me the Playbook!"}
              </button>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider my-2 pt-2 break-words">
              Instant access — no credit card required
            </p>

            <div className="flex gap-2 justify-center items-center animate-pulse mt-2 lg:my-3">
              <ClockIcon className="h-3.5 w-3.5 text-secondary" />
              <p className="text-secondary font-bold text-xs sm:text-sm">
                Bonuses Only Available During March
              </p>
            </div>

            <p className="mt-2 sm:mt-4 text-xs text-base-content/60 max-w-lg mx-auto break-words px-1">
              We never share your email and don&apos;t send spam. Unsubscribe anytime.
            </p>
            {error && (
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-error font-medium break-words">{error}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
