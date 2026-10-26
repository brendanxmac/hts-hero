import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";

// A list of HTS codes or Chapter 99 headings in a card, two columns on wide screens: each one's code,
// its name under it, linked to its page (or plain when it resolves to no line of the current HTS).
// The Chapter 99 page's covered codes, the headings that take precedence and the program's other
// headings all use it, and so do the covered-codes search results.

export type CodeListItem = { code: string; name?: string; href: string | null };

export function CodeList({ items }: { items: CodeListItem[] }) {
  return (
    <ul className="m-0 grid list-none overflow-hidden p-0 md:grid-cols-2 md:[&>li:nth-child(odd):last-child]:col-span-2 md:[&>li:nth-child(odd):last-child]:border-r-0">
      {items.map(({ code, name, href }) => {
        const body = (
          <>
            <span className="min-w-0 flex-1">
              <span className={`${mono.className} block text-sm font-semibold ${href ? "text-primary" : "text-base-content"}`}>{code}</span>
              {name && <span className={`${ui.bodySm} block`}>{name}</span>}
            </span>
            {href && <ChevronRightIcon className="h-4 w-4 shrink-0 text-base-content/60 group-hover:text-primary" aria-hidden />}
          </>
        );
        return (
          <li key={code} className="-mb-px border-b border-base-300 md:odd:border-r">
            {href ? (
              <Link href={href} className="group flex h-full items-center gap-3 px-6 py-3 transition-colors hover:bg-tt-soft">
                {body}
              </Link>
            ) : (
              <div className="flex h-full items-center gap-3 px-6 py-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
