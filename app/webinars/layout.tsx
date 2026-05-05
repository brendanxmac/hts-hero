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
        message={`Want audit-ready classifications without hours of research?`}
        ctaText="Try Now"
        href="/classify"
      // subText="Produce audit-ready classifications in minutes"
      />
      <Suspense>
        {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      </Suspense>
      <main className="min-h-screen max-w-6xl mx-auto p-8">{children}</main>
      <Footer />
    </div>
  );
}
