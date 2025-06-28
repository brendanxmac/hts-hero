import Link from "next/link";

const ExploreCTA = () => {
  return (
    <section className="hero overflow-hidden min-h-[75vh]">
      <div className="relative hero-overlay bg-black"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-4xl p-8 md:p-0">
          <h2 className=" text-white font-bold text-3xl md:text-5xl tracking-tight mb-8">
            See How Fast HTS Lookup{" "}
            <span className="text-primary">Should Be</span>
          </h2>
          <p className="text-neutral-content md:text-lg mb-12">
            Save yourself from the strange search results, PDF downloads, and
            frustration.
            <br /> Get HTS explorer built for customs brokers.
          </p>

          <Link href="/explore" className="btn btn-wide btn-primary">
            Try Now!
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExploreCTA;
