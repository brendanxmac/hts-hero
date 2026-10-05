import { Metadata } from "next";
import Link from "next/link";
import config from "@/config";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { CHANGELOG_ADMIN_EMAIL, getChangelogEntries } from "@/libs/supabase/tariff-changelog";
import { getLatestVerifiedRevision } from "../../../tariffs/engine-v2/revisions";
import { ChangelogList } from "../../../components/duty-calculator/ChangelogList";
import styles from "../../../components/ui/theme.module.css";

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
    <main className={`${styles.root} w-full flex-1 shrink-0 flex flex-col`}>
      <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6 pt-10 pb-16 md:pt-14">
        <Link
          href="/duty-calculator"
          className="inline-flex items-center gap-1 text-[13.5px] font-medium text-[var(--dc-text-2)] hover:text-[var(--dc-text)]"
        >
          <span aria-hidden>←</span> Tariff calculator
        </Link>
        <h1 className="mt-4 text-[32px] leading-[1.15] sm:text-[40px] font-semibold tracking-[-0.025em] text-[var(--dc-text)]">
          Changelog
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-[var(--dc-text-2)]">
          Every change to the tariff calculator: new HTS revisions, corrections and improvements.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--dc-border)] bg-[var(--dc-surface)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--dc-text-2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--dc-positive)]" aria-hidden />
          Tariff data verified through HTS {latestVerified.title}
        </div>

        <ChangelogList initialEntries={entries} isAdmin={isAdmin} />
      </div>
    </main>
  );
}
