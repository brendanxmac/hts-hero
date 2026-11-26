import { ReactNode } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { FollowTheme } from "@/components/ui/marketing/FollowTheme";
import { guardAdmin } from "@/libs/admin/access";

export const dynamic = "force-dynamic";

// The media kit, in the landing pages' look. Admin only for now (everyone else gets a 404); to make
// it public, drop the guard here and in the page, and take /media-kit out of the sitemap excludes.
export default async function Layout({ children }: { children: ReactNode }) {
  await guardAdmin();
  return (
    <FollowTheme>
      <MarketingLayout sale={false}>{children}</MarketingLayout>
    </FollowTheme>
  );
}
