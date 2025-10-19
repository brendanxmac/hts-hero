import Link from "next/link";

export default function TariffEstimatorHeader() {
  return (
    <div className="flex flex-col gap-2 md:gap-4 text-center lg:text-left lg:flex-1 items-center py-12">
      <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-6xl lg:text-7xl tracking-tight max-w-4xl text-center mx-auto">
        {/* Check Your Import Costs Before You Commit */}
        {/* <span className="text-primary">Instant</span> Tariff Rates for Any
        Product */}
        {/* See If Your Product Can Be Imported{" "}
        <span className="text-primary">Profitably</span> */}
        {/* Know If You Can Import at a <span className="text-primary">Profit</span> */}
        {/* Check Import Profitability{" "}
        <span className="bg-primary px-2 py-1 text-base-200 inline-block">
          Before Buying
        </span> */}
        {/* Know Your Import Costs{" "}
        <span className="bg-primary px-2 py-1 text-base-200 inline-block">
          Before You Buy
        </span> */}
        {/* <span className="bg-primary px-2 py-1 text-base-200 inline-block">
          Instantly
        </span>{" "}
        See Your Import Costs */}
        {/* Validate Import Costs
        <span className="bg-primary px-2 py-1 text-base-200 inline-block">
          Before you Commit
        </span>{" "} */}
        {/* See Every Tariff for Any Product
        <span className="bg-primary px-2 py-1 text-base-200 inline-block">
          Before you Commit
        </span>{" "} */}
        {/* Know your Duties
        <span className="bg-primary px-2 py-1 text-base-200 inline-block">
          Before your Product Order
        </span>{" "} */}
        <span className="bg-primary px-2 py-1 text-base-200 inline-block">
          Instantly
        </span>{" "}
        See The Tariff Costs for Any Product{" "}
      </h1>
      <p className="text-sm md:text-lg lg:text-xl text-neutral-300 leading-relaxed max-w-5xl mx-auto md:my-4">
        Check your import profitability & explore ways to save
      </p>

      <div className="flex justify-center lg:justify-start">
        <Link className="btn btn-wide btn-primary" href="/explore">
          Check your Imports!
        </Link>
      </div>
    </div>
  );
}
