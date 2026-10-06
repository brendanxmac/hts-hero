import Link from "next/link";
import type { Category, CategorySlug } from "@/libs/blog/types";

// Links to every category with posts, with the current one marked
export function CategoryNav({
  categories,
  current,
}: {
  categories: (Category & { count: number })[];
  current?: CategorySlug;
}) {
  const items = [
    { href: "/blog", label: "All articles", active: !current, count: null },
    ...categories.map((c) => ({
      href: `/blog/category/${c.slug}`,
      label: c.title,
      active: c.slug === current,
      count: c.count,
    })),
  ];
  return (
    <nav aria-label="Blog categories">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                item.active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              {item.label}
              {item.count !== null && <span className="tabular-nums text-base-content/60">{item.count}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
