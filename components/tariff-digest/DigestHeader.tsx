import Image from "next/image"
import Link from "next/link"
import logo from "@/app/logo.svg"
import config from "@/config"
import { darkBand } from "@/components/home/lib/theme"

// /tariff-digest's header: the name and nothing to click away to, so the page asks one thing. It
// sits on the hero's dark band in both modes.
export const DigestHeader = () => (
  <div className={darkBand}>
    <div className="mx-auto flex h-20 w-full max-w-(--breakpoint-xl) items-center justify-between px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-2.5 text-base-content no-underline">
        <Image src={logo} alt="" width={28} height={28} priority />
        <span className="text-lg font-bold tracking-tight [font-family:var(--font-tracker-display)]">{config.appName}</span>
      </Link>
      <span className="hidden text-sm text-base-content/50 sm:block">Free · Every Monday</span>
    </div>
  </div>
)
