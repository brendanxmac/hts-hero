import { ReactNode } from "react";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Create your ${config.appName} account`,
  canonicalUrlRelative: "/signup",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
