import { ReactNode } from "react";
import { createClient } from "@/app/api/supabase/server";
import UnauthenticatedHeader from "../../components/UnauthenticatedHeader";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import { CTABanner } from "../../components/CTABanner";
import { ClassificationCTA } from "../../components/ClassificationCTA";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
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
    <div className="flex flex-col min-h-svh bg-base-100">
      <CTABanner
        message="Trying to find an HTS Code?"
        ctaText="Find Your Code, Fast"
        href="/classify"
      // subText="With AI Research"
      />
      {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ClassificationCTA
          title="Can't find what you're looking for?"
          subtitle="Enter your product description to start an AI Assisted classification."
        />
      </div>
    </div>
  );
}
