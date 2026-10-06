import Link from "next/link";

// Blog → category → (this page), above a blog page's title
export function BlogBreadcrumbs({ trail }: { trail: { href?: string; label: string }[] }) {
  const linkClass = "hover:underline text-base-content/70 underline-offset-4 hover:text-primary";
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-y-1 text-sm text-base-content/60">
        {trail.map((crumb, i) => (
          // The current page's title repeats the <h1>, so phones skip it rather than wrap it
          <li key={crumb.label} className={crumb.href ? "flex items-center" : "hidden items-center sm:flex"}>
            {i > 0 && <span aria-hidden="true" className="mx-1.5">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className={linkClass}>
                {crumb.label}
              </Link>
            ) : (
              <span className="max-w-xs truncate text-base-content" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
