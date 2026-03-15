import { ReactNode } from "react";
import { createClient } from "@/app/api/supabase/server";
import { ClassifyTabProvider } from "../../contexts/ClassifyTabContext";
import { ClassificationsLayoutShell } from "../../components/ClassificationsLayoutShell";

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
      <ClassificationsLayoutShell isAuthenticated={!!user}>
        {children}
      </ClassificationsLayoutShell>
    </ClassifyTabProvider>
  );
}
