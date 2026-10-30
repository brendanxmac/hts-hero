import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { signupHref } from "@/components/tariff-tracker/access/signup";
import { SignupOnboarding, type OnboardingStep } from "@/components/onboarding/SignupOnboarding";
import { isEntryPoint, onboardingNext, ONBOARDING_PATH } from "@/libs/signup-onboarding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome to HTS Hero",
  robots: { index: false, follow: false },
};

// The sign-up onboarding, for accounts that signed up from the homepage (its Get Started Free
// goes to /signup?redirect=/onboarding?from=<section>). Signed out, sign up first; finished, on to
// that section's next step (onboardingNext);
// part way, it picks up at the first question not yet answered. In development, ?preview=1 shows
// it signed out, saving nothing.
export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ preview?: string; from?: string }> }) {
  const params = await searchParams;
  // The homepage section whose button they came from (?from=)
  const entryPoint = isEntryPoint(params.from) ? params.from : null;
  if (process.env.NODE_ENV === "development" && params.preview === "1") return <SignupOnboarding userId="preview" initialStep="company_type" entryPoint={entryPoint} preview />;

  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) redirect(signupHref(entryPoint ? `${ONBOARDING_PATH}?from=${entryPoint}` : ONBOARDING_PATH));

  // No table yet (before the migration) reads as a fresh start
  const { data } = await createAdminClient()
    .from("signup_onboarding")
    .select("company_type, company_website, website_skipped, entry_point, completed_at")
    .eq("user_id", user.id)
    .maybeSingle();
  // The section they started from: this visit's ?from=, else the one saved on their first start
  const from = entryPoint ?? (isEntryPoint(data?.entry_point) ? data.entry_point : null);
  if (data?.completed_at) redirect(onboardingNext(from));

  const step: OnboardingStep = !data?.company_type ? "company_type" : !data.company_website && !data.website_skipped ? "website" : "role";
  return <SignupOnboarding userId={user.id} initialStep={step} entryPoint={from} />;
}
