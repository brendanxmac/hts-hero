import { Suspense } from "react";
import { createClient } from "@/app/api/supabase/server";
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader";
import UnauthenticatedHeader from "@/components/UnauthenticatedHeader";
import Footer from "@/components/Footer";

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
      <Suspense>
        {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      </Suspense>
      <main className="min-h-screen max-w-6xl mx-auto p-8">{children}</main>
      <Footer />
    </div>
  );
}
