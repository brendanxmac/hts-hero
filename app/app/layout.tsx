import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/api/supabase/server";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import { ClassifyTabProvider } from "../../contexts/ClassifyTabContext";

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
    redirect("/about/importer");
  }

  return (
    <ClassifyTabProvider>
      <div className="h-screen flex flex-col">
        <AuthenticatedHeader />
        {children}
      </div>
    </ClassifyTabProvider>
  );
}
