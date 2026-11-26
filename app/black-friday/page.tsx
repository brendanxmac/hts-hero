import { Metadata } from "next";
import { BlackFridayPage } from "@/components/sale/BlackFridayPage";
import { isSaleLive, SALE } from "@/libs/black-friday";

export const metadata: Metadata = {
  title: `${SALE.name}: ${SALE.percentOff}% Off a Full Year of Duty Guard | HTS Hero`,
  description: `${SALE.percentOff}% off the first year of every annual Duty Guard plan, Essentials and Pro. Tariff alerts, entry audits and savings detection. Ends ${SALE.endsLabel}.`,
  // A week-long offer: kept out of search, reached from the popup, the banner and the email
  robots: { index: false, follow: true },
  alternates: { canonical: "/black-friday" },
};

// The sale's page (libs/black-friday.ts, components/sale/BlackFridayPage.tsx). Rendered per request,
// so it's never served from a cache that's on the wrong side of the sale's end
export const dynamic = "force-dynamic";

export default function Page() {
  return <BlackFridayPage serverLive={isSaleLive()} />;
}
