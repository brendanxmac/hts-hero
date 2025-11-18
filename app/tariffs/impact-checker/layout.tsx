import { ReactNode } from "react";
import UnauthenticatedHeader from "../../../components/UnauthenticatedHeader";
import { createClient } from "@/app/api/supabase/server";
import { AuthenticatedHeader } from "../../../components/AuthenticatedHeader";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("HERERERERE RE RERERERERER");

  // if (!user) {
  //   const headersList = headers();
  //   const fullUrl =
  //     headersList.get("x-pathname") || headersList.get("referer") || "";
  //   const pathname = fullUrl.includes("://")
  //     ? new URL(fullUrl).pathname
  //     : fullUrl;
  //   const redirectParam = pathname
  //     ? `?redirect=${encodeURIComponent(pathname)}`
  //     : "";
  //   redirect(`/signin${redirectParam}`);
  // }

  return (
    <div className="h-screen flex flex-col max-h-svh bg-base-300 overflow-y-auto">
      {user ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
      {children}
    </div>
  );
}
