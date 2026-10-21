import Link from "next/link";
import { ArrowRightIcon, UserGroupIcon } from "@heroicons/react/20/solid";
import { MANAGED_TIERS, formatPrice } from "../lib/pricing";

// HTS Hero Managed, under the tariff plans: for importers who'd rather have our team watching their tariffs for them. A teaser
// only (it's priced on a call, so it stays out of the estimator); the homepage section has the rest.
export const ManagedTeaser = () => (
  <Link
    href="/#managed"
    className="group mt-6 flex flex-col gap-4 rounded-3xl border border-primary/25 bg-primary/[0.05] p-6 transition-colors hover:border-primary/50 sm:flex-row sm:items-center sm:justify-between sm:px-8"
  >
    <span className="flex items-center gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content">
        <UserGroupIcon className="h-6 w-6" aria-hidden />
      </span>
      <span>
        <span className="block text-lg font-bold text-base-content">HTS Hero Managed Tariffs</span>
        <span className="text-base-content/70">Overwhelmed by tariffs? We watch every tariff on your imports, audit every entry, and brief your team on what we find.</span>
      </span>
    </span>
    <span className="flex items-center gap-4">
      <span className="whitespace-nowrap text-2xl font-semibold [font-family:var(--font-tracker-display)] text-base-content">
        From {formatPrice(MANAGED_TIERS[0].price)}
        <span className="text-base font-medium text-base-content/60">/mo</span>
      </span>
      <ArrowRightIcon className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
    </span>
  </Link>
);
