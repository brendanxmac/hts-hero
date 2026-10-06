import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import config from "@/config";
import ThemeToggle from "@/components/ThemeToggle";
import * as ui from "@/components/ui/styles";

// The site header on public pages (/hts, /blog, /compare): the promo bar, then the site bar
// with the logo, the tools and the theme toggle
export function PageHeader() {
  return (
    <header>
      <div className="bg-neutral text-neutral-content">
        <div className={`${ui.container} py-2.5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-6`}>
          <p className="text-sm text-center sm:text-left">
            <span className="font-semibold">Want audit-ready HTS Codes for all your Imports?</span>{" "}
            <span className="text-neutral-content/80">And get all the evidence you need to defend them!</span>
          </p>
          <Link
            href="/classify"
            className={`${ui.button({ size: "sm" })} shrink-0`}
          >
            Find your codes, fast!
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
      <div className="border-b border-base-300 bg-base-100">
        <div className={`${ui.container} h-14 flex items-center justify-between gap-4`}>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src={logo} alt={`${config.appName} logo`} className="w-5" priority width={24} height={24} />
            <span className={ui.cardTitle}>{config.appName}</span>
          </Link>
          <nav aria-label="Tools" className="flex items-center gap-1 sm:gap-2">
            <Link href="/duty-calculator" className={ui.button({ variant: "ghost", size: "sm" })}>
              Duty Calculator
            </Link>
            <Link href="/explore" className={`${ui.button({ variant: "ghost", size: "sm" })} hidden sm:inline-flex`}>
              HTS Explorer
            </Link>
            <Link href="/blog" className={`${ui.button({ variant: "ghost", size: "sm" })} hidden sm:inline-flex`}>
              Blog
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
