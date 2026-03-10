import { ReactNode } from "react";
import { createClient } from "@/app/api/supabase/server";
import UnauthenticatedHeader from "../../components/UnauthenticatedHeader";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import { CTABanner } from "../../components/CTABanner";

export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col max-h-svh bg-base-100 overflow-y-auto">
      <CTABanner
        message="Your duty rate is only correct if your HTS code is correct."
        ctaText="Verify Your Classification"
        href="/about"
      />
      {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
    </div>
  );
}
