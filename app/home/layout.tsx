import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";
import { AuthenticatedHeader } from "../../components/AuthenticatedHeader";
import { GreenGlow } from "../../components/GreenGlow";
import { VerticalAnchor } from "../../enums/style";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
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
    <div className="flex flex-col h-screen">
      <AuthenticatedHeader />
      {children}
      {/* <GreenGlow anchor={VerticalAnchor.BOTTOM} /> */}
    </div>
  );
}
