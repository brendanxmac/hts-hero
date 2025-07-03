import { ReactNode } from "react";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import { ClassifyTabProvider } from "../../contexts/ClassifyTabContext";
import { redirect } from "next/navigation";
import { createClient } from "../api/supabase/server";
import Home from "./page";

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
    <ClassifyTabProvider>
      <div className="h-screen flex flex-col">
        <AuthenticatedHeader />
        <Home user={user} />
      </div>
    </ClassifyTabProvider>
  );
}
