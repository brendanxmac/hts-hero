import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/api/supabase/server";
import config from "@/config";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";

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

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  return (
    <div className="flex flex-col max-h-svh">
      <AuthenticatedHeader />
      {children}
    </div>
  );
}
