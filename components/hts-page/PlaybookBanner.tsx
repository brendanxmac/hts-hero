import Link from "next/link";
import Image from "next/image";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content`;

export function PlaybookBanner() {
  return (
    <section className="relative rounded-2xl overflow-hidden border-2 border-secondary/20 bg-base-100 shadow-md mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.06] via-transparent to-secondary/[0.03] pointer-events-none" />
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          <div className="relative w-32 sm:w-36 md:w-40 aspect-[2/3] rounded-xl overflow-hidden border-2 border-base-content/10 shadow-lg shrink-0">
            <Image
              src={`${STORAGE_BASE}/book-cover.jpg`}
              alt="The Audit-Ready Classifications Playbook"
              fill
              sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, 160px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-secondary text-secondary-content text-[10px] font-extrabold uppercase tracking-widest">
                Free
              </span>
              <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                Playbook + 7 Bonuses
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-base-content leading-tight">
              The Audit-Ready Classifications Playbook
            </h3>
            <p className="text-sm text-base-content/60 leading-relaxed">
              Learn how to create HTS classifications that reduce import risk and defend profits — faster than ever.
            </p>
            <div>
              <Link
                href="/the-audit-ready-classifications-playbook"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-content font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/25"
              >
                Download Free Playbook
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8 lg:border-l border-t lg:border-t-0 border-secondary/10 flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-4">
            What&apos;s inside
          </p>
          <ul className="flex flex-col gap-3">
            {[
              "Step-by-step classification methodology",
              "Audit defense strategies & documentation templates",
              "Common classification mistakes to avoid",
              "GRI application guide with real examples",
              "7 FREE tools and templates to boost your classifications",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-base-content/70">
                <svg className="shrink-0 w-4 h-4 text-secondary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
