import Link from "next/link";
import { LockClosedIcon, CheckIcon } from "@heroicons/react/16/solid";
import { ReactNode } from "react";

const UNLOCK_BENEFITS = [
  "CROSS Ruling Validation",
  "Branded Classification Reports",
  "File Attachments & Notes",
  "10 FREE Classifications",
] as const;

interface LockedTabOverlayProps {
  children: ReactNode;
  classificationId?: string;
  featureName: string;
}

export function LockedTabOverlay({
  children,
  classificationId,
  featureName,
}: LockedTabOverlayProps) {
  const signupHref = `/signin?redirect=${encodeURIComponent(
    classificationId
      ? `/classifications/${classificationId}`
      : "/classifications"
  )}&sign-up=true`;

  return (
    <div className="relative">
      {/* Blurred, non-interactive content behind the overlay */}
      <div className="blur-[6px] pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-12 sm:pt-20 bg-base-100/40">
        <div className="w-full max-w-md mx-4 rounded-2xl border border-primary/20 bg-base-100 shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-primary/[0.08] via-primary/[0.04] to-secondary/[0.08] px-6 pt-6 pb-4 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary to-secondary opacity-25 blur-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-full bg-base-100 border-2 border-primary/30 shadow-lg flex items-center justify-center">
                <LockClosedIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-base-content">
              Unlock {featureName}
            </h3>
            <p className="text-sm text-base-content/60 mt-1 leading-relaxed max-w-xs">
              Create a <span className="font-semibold text-primary">FREE</span>{" "}
              account to access this feature and more.
            </p>
          </div>

          {/* Benefits list */}
          <div className="px-6 py-4 border-t border-base-200">
            <ul className="space-y-2.5">
              {UNLOCK_BENEFITS.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-success shrink-0" />
                  <span className="text-sm text-base-content/80 font-medium">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="px-6 pb-6 pt-2 flex flex-col items-center">
            <Link
              href={signupHref}
              className="btn btn-primary w-full font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              Unlock for Free
              <span aria-hidden="true" className="ml-1">→</span>
            </Link>
            <span className="text-[10px] text-base-content/40 mt-2">
              Takes 10 seconds · No credit card required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
