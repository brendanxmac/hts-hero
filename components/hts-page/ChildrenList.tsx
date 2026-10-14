import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";

// What a section or chapter contains: one row per chapter or heading, each a link
interface ChildItem {
  uuid: string;
  code?: string;
  label?: string;
  description: string;
  href: string;
}

interface ChildrenListProps {
  title: string;
  items: ChildItem[];
}

export function ChildrenList({ title, items }: ChildrenListProps) {
  if (items.length === 0) return null;

  return (
    <section className={`${tt.panel} overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 border-b border-base-300 px-6 py-5">
        <h3 className={tt.title}>{title}</h3>
        <span className={tt.chip("primary")}>{items.length}</span>
      </div>
      <div className="divide-y divide-base-300">
        {items.map((item) => (
          <Link key={item.uuid} href={item.href} className="group block transition-colors hover:bg-tt-soft">
            <div className="flex items-center gap-4 px-6 py-4">
              <span className={`${mono.className} shrink-0 min-w-[100px] rounded-full bg-primary/10 px-3 py-1 text-center text-sm font-semibold text-primary`}>
                {item.code || item.label || "—"}
              </span>
              <span className="flex-1 text-sm leading-snug text-base-content/70 transition-colors group-hover:text-base-content">
                {item.description}
              </span>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-base-content/60 transition-colors group-hover:text-primary" aria-hidden />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
