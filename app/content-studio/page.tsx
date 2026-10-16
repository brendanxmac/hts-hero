import SocialStudio from "@/components/social-studio/SocialStudio"
import { guardSocialStudio } from "@/libs/social-studio/access"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Content Studio | HTS Hero",
  robots: { index: false, follow: false },
}

export default async function SocialStudioPage() {
  await guardSocialStudio()
  return <SocialStudio />
}
