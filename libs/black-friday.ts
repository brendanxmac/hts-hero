// Relative, so the Remotion render of the sale's visual (emails/assets/black-friday) can import it too
import { monthlyRate } from "../components/pricing-calculator/lib/pricing";

// The Black Friday 2026 sale (decided 2026-11-26): 40% off the first year of every annual Duty Guard
// plan, Essentials and Pro, every size. It renews at the normal annual price. Bought in Duty Guard's
// plans dialog as always; the checkout adds the Stripe coupon (a 40% "once" coupon, so only the first
// yearly invoice). Shown as a popup once a day and a banner in place of the usual one, on the
// marketing pages, the HTS pages, the blog and Duty Guard, never to a paying account.
//
// The sale is on only between `startsAt` and `endsAt` AND with the coupon's id set
// (NEXT_PUBLIC_BLACK_FRIDAY_COUPON_ID, the same custom id in Stripe test and live): without the
// coupon, nothing shows a price the checkout wouldn't charge. A coupon id can't be redeemed by a
// customer on its own (only through our server), so it's safe in the browser.
export const SALE = {
  id: "black-friday-2026",
  name: "Black Friday",
  percentOff: 40,
  startsAt: Date.parse("2026-11-26T00:00:00-05:00"),
  // Thursday Dec 3, 11:59pm Eastern
  endsAt: Date.parse("2026-12-03T23:59:59-05:00"),
  endsLabel: "Dec 3",
} as const;

// (Next inlines it at build; the guard is for Remotion's browser, which has no `process`)
export const SALE_COUPON_ID = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BLACK_FRIDAY_COUPON_ID) || null;

export const isSaleLive = (now = Date.now()) => !!SALE_COUPON_ID && now >= SALE.startsAt && now <= SALE.endsAt;

const cents = (amount: number) => Math.round(amount * 100) / 100;

// An annual plan in the sale: its usual per-month price, the sale's (the first year), and both years' totals
export const saleAnnual = (listPrice: number) => {
  const usual = monthlyRate(listPrice, "annual");
  const sale = cents(usual * (1 - SALE.percentOff / 100));
  return { usual, sale, usualYear: usual * 12, saleYear: cents(usual * 12 * (1 - SALE.percentOff / 100)) };
};

// Days left, counting today, for "Ends in 3 days"
export const saleDaysLeft = (now = Date.now()) => Math.max(0, Math.ceil((SALE.endsAt - now) / 86_400_000));
