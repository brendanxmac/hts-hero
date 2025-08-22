import { ReactNode } from "react";
import UnauthenticatedHeader from "../../../components/UnauthenticatedHeader";
import { createClient } from "@/app/api/supabase/server";
import { AuthenticatedHeader } from "../../../components/AuthenticatedHeader";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="h-screen flex flex-col max-h-svh bg-base-300 overflow-hidden">
      {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
    </div>
  );
}
