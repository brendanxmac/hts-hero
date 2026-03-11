import { ReactNode } from "react";
import { Metadata } from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "US Import Duty & Tariff Calculator — See Rates by Country | HTS Hero",
  description:
    "Calculate US import duties and tariffs for any HTS code from ~200 countries. See base rates, Section 301, Section 232, AD/CVD duties, reciprocal tariffs, and trade program savings like USMCA and GSP.",
  keywords: [
    "US import duty calculator",
    "tariff calculator by country",
    "Section 301 tariff rates",
    "Section 232 tariff rates",
    "USMCA duty savings",
    "import tariff lookup",
    "customs duty calculator",
  ],
  openGraph: {
    title: "US Import Duty & Tariff Calculator | HTS Hero",
    description:
      "Calculate duties for any HTS code from ~200 countries. Includes Section 301, 232, AD/CVD, and trade program savings.",
    url: `https://${config.domainName}/about/tariffs`,
    siteName: "HTS Hero",
    type: "website",
  },
  alternates: {
    canonical: "/about/tariffs",
  },
};

export default async function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
