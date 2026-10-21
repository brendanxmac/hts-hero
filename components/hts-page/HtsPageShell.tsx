import Link from "next/link";
import * as mk from "@/components/ui/marketing/styles";

// The section and chapter pages' body: the breadcrumb trail, then the page. The header, footer
// and classification band come from the HTS pages' frame (HtsFrame).

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HtsPageShellProps {
  breadcrumbs: BreadcrumbItem[];
  children: React.ReactNode;
}

const linkClass = "text-base-content/70 underline-offset-4 hover:text-primary hover:underline";

export function HtsPageShell({ breadcrumbs, children }: HtsPageShellProps) {
  return (
    <div className={`${mk.container} pt-6 pb-16 sm:pb-20`}>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-y-1 text-sm text-base-content/60">
          <li>
            <Link href="/explore" className={linkClass}>HTS</Link>
          </li>
          {breadcrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center">
              <span aria-hidden="true" className="mx-1.5 text-base-content/60">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className={linkClass}>
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-base-content" aria-current="page">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
