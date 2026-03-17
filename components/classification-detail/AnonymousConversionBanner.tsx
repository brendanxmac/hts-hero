import Link from "next/link";
import {
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { LockClosedIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/16/solid";

const LOSS_ITEMS = [
  "HTS Code Results & Reasoning",
  "Classification Defense Report",
  "CROSS Ruling Validation",
  "Unlimited Duty & Tariff Lookups",
  "10 FREE Classifications",
] as const;

interface AnonymousConversionBannerProps {
  classificationId?: string;
}

export function AnonymousConversionBanner({
  classificationId,
}: AnonymousConversionBannerProps) {
  const signupHref = `/signin?redirect=${encodeURIComponent(
    classificationId
      ? `/classifications/${classificationId}`
      : "/classifications"
  )}&sign-up=true`;

  return (
    <div className="border-b border-primary/20 bg-gradient-to-r from-primary/[0.06] via-base-100 to-secondary/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
          {/* Icon + messaging */}
          <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-xl animate-pulse" />
              <div className="relative p-2 md:p-3 rounded-full bg-base-100 shadow-lg border border-primary/20">
                <LockClosedIcon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base md:text-lg font-bold text-base-content leading-snug">
                Create a <span className="text-primary">FREE</span> account to
                save your results & verify your code!
              </p>
              <div className="hidden sm:flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                {LOSS_ITEMS.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-base-content/60"
                  >
                    <CheckIcon className="w-3 h-3 text-success shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-1 shrink-0 w-full sm:w-auto">
            <Link
              href={signupHref}
              className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              Save Results & Verify Code
              <span aria-hidden="true" className="ml-1">
                →
              </span>
            </Link>
            <span className="text-[10px] text-base-content/40">
              Takes 10 seconds · No credit card
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
