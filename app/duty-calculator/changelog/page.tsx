import { Metadata } from "next";
import Link from "next/link";
import config from "@/config";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { CHANGELOG_ADMIN_EMAIL, getChangelogEntries } from "@/libs/supabase/tariff-changelog";
import { getLatestVerifiedRevision } from "@/tariffs/engine-v2/revisions";
import { ChangelogList } from "@/components/duty-calculator/changelog/ChangelogList";
import { THEME_LIGHT } from "@/components/ui/theme";
import * as mk from "@/components/ui/marketing/styles";

export const metadata: Metadata = {
  title: "Tariff Calculator Changelog | HTS Hero",
  description:
    "Every update to the HTS Hero duty and tariff calculator: new HTS revisions, tariff data corrections and improvements, with dates.",
  alternates: { canonical: "/duty-calculator/changelog" },
  openGraph: {
    title: "Tariff Calculator Changelog | HTS Hero",
    description: "Every update to the HTS Hero duty and tariff calculator, with dates.",
    url: `https://${config.domainName}/duty-calculator/changelog`,
    siteName: "HTS Hero",
    type: "website",
  },
};

export default async function TariffChangelogPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.email === CHANGELOG_ADMIN_EMAIL;
  // The admin also sees drafts, so the read uses the service role only for them
  const entries = await getChangelogEntries(isAdmin ? createAdminClient() : supabase, { includeDrafts: isAdmin });
  const latestVerified = getLatestVerifiedRevision();

  return (
    <main className={`${THEME_LIGHT} ${mk.page} flex w-full flex-1 flex-col`}>
      <header className={`${mk.bandTint} relative overflow-hidden`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(48rem_24rem_at_85%_-10%,rgba(45,212,191,0.18),transparent)]"
        />
        <div className={`${mk.container} relative flex flex-col gap-8 pb-16 pt-8 sm:pb-20`}>
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
            <Link
              href="/duty-calculator"
              className="inline-flex items-center gap-1 font-medium text-slate-600 underline-offset-4 hover:text-teal-700 hover:underline"
            >
              <span aria-hidden>←</span> Tariff calculator
            </Link>
          </nav>
          <div className="flex max-w-3xl flex-col gap-4 sm:pt-6">
            <span className={mk.eyebrow}>Duty Calculator</span>
            <h1 className={mk.display}>Changelog</h1>
            <p className={`${mk.lead} mt-2 max-w-2xl`}>
              Every change to the tariff calculator: new HTS revisions, corrections and improvements.
            </p>
            <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Tariff data verified through HTS {latestVerified.title}
            </div>
          </div>
        </div>
      </header>

      <div className={`${mk.container} pb-24 pt-6 sm:pt-10`}>
        <div className="w-full max-w-3xl">
          <ChangelogList initialEntries={entries} isAdmin={isAdmin} />
        </div>
      </div>
    </main>
  );
}
