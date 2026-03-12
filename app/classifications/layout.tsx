import { ReactNode } from "react";
import { createClient } from "@/app/api/supabase/server";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import { ClassifyTabProvider } from "../../contexts/ClassifyTabContext";
import UnauthenticatedHeader from "../../components/UnauthenticatedHeader";

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
      <div className="h-screen overflow-y-auto">
        {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
        {children}
      </div>
    </ClassifyTabProvider>
  );
}
