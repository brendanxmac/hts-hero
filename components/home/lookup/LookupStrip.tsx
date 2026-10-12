import { QuickLookup } from "../hero/QuickLookup";
import * as mk from "@/components/ui/marketing/styles";

// The free calculator, one step from the hero: an HTS code and a country of origin
export const LookupStrip = () => (
  <section className="border-b border-slate-200 bg-white py-10" aria-labelledby="lookup-title">
    <div className={`${mk.container} grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]`}>
      <div>
        <h2 id="lookup-title" className="text-2xl font-bold tracking-tight text-slate-900">
          Look up any US tariff, free
        </h2>
        <p className={`${mk.body} mt-1`}>Every duty line with its legal source. No account needed.</p>
      </div>
      <QuickLookup />
    </div>
  </section>
);
