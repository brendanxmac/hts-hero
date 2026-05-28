import { Suspense } from "react";
import { createClient } from "@/app/api/supabase/server";
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader";
import UnauthenticatedHeader from "@/components/UnauthenticatedHeader";
import Footer from "@/components/Footer";
import { CTABanner } from "../../components/CTABanner";

export default async function WebinarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <CTABanner
        message={`Produce HTS classifications that avoid audits, in minutes`}
        ctaText="Try Now"
        href="/classifications/new"
      />
      <Suspense>
        {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      </Suspense>
      <main className="min-h-screen max-w-6xl mx-auto p-8">{children}</main>
      <Footer />
    </div>
  );
}
