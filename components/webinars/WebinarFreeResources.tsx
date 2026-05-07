import { PlaybookBanner } from "@/components/hts-page/PlaybookBanner";
import { ClassifyCTA } from "@/components/ClassifyCTA";
import Link from "next/link";

export default function WebinarFreeResources() {
  return (
    <section className="mt-16 pt-12 border-t border-base-content/10">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          While you wait...
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Checkout Our Free Resources
        </h2>
        <p className="text-base-content/60 mt-2 max-w-2xl mx-auto">
          Reduce your import risk and save money with these free tools and guides.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Playbook Banner */}
        <PlaybookBanner />

        {/* Classification Assistant CTA */}
        <ClassifyCTA
          title="Classify Any Product in Minutes"
          subtitle="AI-powered candidate discovery with GRI / legal note / CROSS ruling validation — free to try."
          ctaText="Start Classifying"
          ctaRedirectUrl="/classify"
        />

        {/* Duty Calculator CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-transparent via-secondary/10 to-primary/10 border border-secondary/10">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-secondary"
              >
                <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                <path
                  fillRule="evenodd"
                  d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
                  clipRule="evenodd"
                />
                <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-base md:text-lg font-bold text-base-content">
                Calculate Duties & Tariffs for Any Import
              </span>
              <span className="text-sm text-base-content/60">
                See the full duty & tariff breakdown for any US import — base rates,
                Section 301, 232, and trade program savings.
              </span>
            </div>
          </div>
          <Link
            href="/duty-calculator"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-secondary text-secondary-content hover:bg-secondary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <span>Calculate Duties</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
