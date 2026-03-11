import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import config from "@/config";
import ThemeToggle from "../ThemeToggle";
import { CTABanner } from "../CTABanner";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HtsPageShellProps {
  bannerMessage: string;
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
}

export function HtsPageShell({ bannerMessage, breadcrumbs, children }: HtsPageShellProps) {
  return (
    <>
      <header className="sticky top-0 z-50">
        <CTABanner
          message={bannerMessage}
          ctaText="Verify Your Classification"
          href="/classifications"
        />
        <div className="bg-base-100/80 backdrop-blur-lg border-b border-base-content/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-5"
                priority
                width={24}
                height={24}
              />
              <span className="font-bold text-base-content text-base">
                {config.appName}
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-base-content/50">
            <li>
              <Link href="/explore" className="hover:text-primary transition-colors">HTS</Link>
            </li>
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="flex items-center">
                <span aria-hidden="true" className="mx-1 text-base-content/30">&rsaquo;</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-base-content">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {children}
      </div>

      <footer className="border-t border-base-content/10 bg-base-200/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/40">
          <span>&copy; {new Date().getFullYear()} HTS Hero. Data sourced from the USITC Harmonized Tariff Schedule.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-base-content transition-colors">About</Link>
            <Link href="/blog" className="hover:text-base-content transition-colors">Blog</Link>
            <Link href="/privacy-policy" className="hover:text-base-content transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-base-content transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
