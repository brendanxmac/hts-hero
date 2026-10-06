import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

// A grid of links to other comparison pages
export function ComparisonLinks({ links }: { links: { href: string; title: string; caption: string }[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`${ui.card} group flex h-full items-start justify-between gap-3 p-5 transition-colors hover:border-primary/40`}
          >
            <span className="flex flex-col gap-1">
              <span className="font-semibold text-base-content group-hover:text-primary">{link.title}</span>
              <span className={ui.caption}>{link.caption}</span>
            </span>
            <ChevronRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
