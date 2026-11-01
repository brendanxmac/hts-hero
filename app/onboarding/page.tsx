import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { KNOWN_ACCOUNT_COOKIE, signupHref } from "@/components/tariff-tracker/access/signup";
import { SignupOnboarding, type OnboardingStep } from "@/components/onboarding/SignupOnboarding";
import { isEntryPoint, onboardingNext, ONBOARDING_PATH, safeNext } from "@/libs/signup-onboarding";

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
export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ preview?: string; from?: string; next?: string }> }) {
  const params = await searchParams;
  // The homepage section whose button they came from (?from=)
  const entryPoint = isEntryPoint(params.from) ? params.from : null;
  // Where to land after it, when the button that sent them knows (the import it saved)
  const next = safeNext(params.next);
  if (process.env.NODE_ENV === "development" && params.preview === "1") return <SignupOnboarding userId="preview" initialStep="company_type" entryPoint={entryPoint} preview />;

  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) {
    const query = [entryPoint && `from=${entryPoint}`, next && `next=${encodeURIComponent(next)}`].filter(Boolean).join("&");
    const back = `${ONBOARDING_PATH}${query ? `?${query}` : ""}`;
    // This browser has had an account: sign in, not up, as Duty Guard does (proxy.ts)
    if ((await cookies()).get(KNOWN_ACCOUNT_COOKIE)) redirect(`/signin?redirect=${encodeURIComponent(back)}`);
    redirect(signupHref(back));
  }

  // No table yet (before the migration) reads as a fresh start
  const { data } = await createAdminClient()
    .from("signup_onboarding")
    .select("company_type, company_website, website_skipped, entry_point, completed_at")
    .eq("user_id", user.id)
    .maybeSingle();
  // The section they started from: this visit's ?from=, else the one saved on their first start
  const from = entryPoint ?? (isEntryPoint(data?.entry_point) ? data.entry_point : null);
  if (data?.completed_at) redirect(next ?? onboardingNext(from));

  const step: OnboardingStep = !data?.company_type ? "company_type" : !data.company_website && !data.website_skipped ? "website" : "role";
  return <SignupOnboarding userId={user.id} initialStep={step} entryPoint={from} next={next} />;
}
