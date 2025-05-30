import Link from "next/link";

const ExploreCTA = () => {
  return (
    <section className="hero overflow-hidden min-h-[75vh]">
      <div className="relative hero-overlay bg-black"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-4xl p-8 md:p-0">
          <h2 className=" text-white font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
            See How Fast HTS Lookup Should Be
          </h2>
          <p className="text-neutral-content md:text-lg mb-12 md:mb-16">
            Save yourself from all the inaccurate results, downloads, and
            frustration.
            <br /> Get HTS lookup tool tailor made for classifiers.
          </p>

          <Link href="/explore" className="btn btn-wide btn-primary">
            Try HTS Hero
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExploreCTA;
