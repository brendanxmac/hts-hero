import Link from "next/link";

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
    <section className="rounded-2xl border-2 border-base-content/10 bg-base-100 overflow-hidden shadow-sm mb-8">
      <div className="bg-base-200/40 px-6 py-4 border-b border-base-content/10 flex items-center justify-between">
        <h3 className="text-base font-bold text-base-content flex items-center gap-2">
          <svg className="w-5 h-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {title}
        </h3>
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary">
          {items.length}
        </span>
      </div>
      <div className="divide-y divide-base-content/8">
        {items.map((item) => (
          <Link
            key={item.uuid}
            href={item.href}
            className="block hover:bg-primary/[0.04] transition-colors group"
          >
            <div className="flex items-center gap-4 px-6 py-4">
              <span className="shrink-0 min-w-[100px] px-3 py-1.5 rounded-lg bg-primary/[0.07] border border-primary/10 text-sm font-mono font-bold text-primary text-center group-hover:bg-primary/15 transition-colors">
                {item.code || item.label || "—"}
              </span>
              <span className="text-sm text-base-content/70 group-hover:text-base-content transition-colors leading-snug flex-1">
                {item.description}
              </span>
              <svg
                className="shrink-0 w-4 h-4 text-base-content/15 group-hover:text-primary transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
