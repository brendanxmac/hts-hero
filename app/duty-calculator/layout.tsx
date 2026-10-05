import { ReactNode } from "react";
import { createClient } from "@/app/api/supabase/server";
import UnauthenticatedHeader from "../../components/UnauthenticatedHeader";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- for the commented-out banner
import { CTABanner } from "../../components/CTABanner";
import { THEME } from "../../components/ui/theme";

export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The analytical theme covers the site header too
  return (
    <div className={`${THEME} flex flex-col max-h-svh overflow-y-auto`}>
      {/* <CTABanner
        message="Your duty rate is only correct if your HTS code is correct."
        ctaText="Verify Your Classifications"
        href="/classify"
      /> */}
      {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
    </div>
  );
}
