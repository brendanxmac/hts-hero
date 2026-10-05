import { ReactNode } from "react";
import { createClient } from "@/app/api/supabase/server";
import UnauthenticatedHeader from "../../components/UnauthenticatedHeader";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import { THEME } from "../../components/ui/theme";

export default async function PricingCalculatorLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The analytical theme covers the site header too
  return (
    <div className={`${THEME} flex flex-col max-h-svh overflow-y-auto`}>
      {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
    </div>
  );
}
