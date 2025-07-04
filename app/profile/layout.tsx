import { ReactNode } from "react";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import { redirect } from "next/navigation";
import { createClient } from "../api/supabase/server";

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
    redirect("/signin");
  }

  return (
    <div className="h-screen flex flex-col">
      <AuthenticatedHeader />
      {children}
    </div>
  );
}
