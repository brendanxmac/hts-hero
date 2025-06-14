import { ReactNode } from "react";
import { createClient } from "@/app/api/supabase/server";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import { ClassifyTabProvider } from "../../contexts/ClassifyTabContext";
import UnauthenticatedHeader from "../../components/UnauthenticatedHeader";

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
    <ClassifyTabProvider>
      <div className="h-screen flex flex-col">
        {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
        {children}
      </div>
    </ClassifyTabProvider>
  );
}
