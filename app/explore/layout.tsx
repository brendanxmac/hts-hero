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
        message="Trying to find the correct HTS Code for your product?"
        ctaText="Find the Correct Code"
        href="/classify"
        subText="Produce an audit-ready classification in minutes"
      />
      {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ClassificationCTA
          title="Found what you're looking for? Classify it"
          subtitle="Enter your product description to start an AI-guided classification."
        />
      </div>
    </div>
  );
}
