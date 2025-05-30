import Link from "next/link";

const ExploreHero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-10 px-8 py-8 lg:py-28">
      <div className="flex flex-col gap-10 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
          Find any HTS code <span className="text-primary">in seconds</span>
        </h1>
        <p className="flex flex-col text-lg text-gray-300 leading-relaxed">
          Fast and accurate search with easy navigation. No more PDF's & tables
        </p>

        <Link
          className="btn btn-wide btn-primary hover:text-white rounded-md"
          href="/explore"
        >
          Try it free!
        </Link>

        {/* <TestimonialsAvatars priority={true} /> */}
      </div>
      <div className="lg:w-full flex justify-center">
        <video
          className="rounded-2xl w-full sm:w-[34rem]"
          autoPlay
          muted
          loop
          playsInline
          src="/about-hero-demo.mp4"
        ></video>
      </div>
    </section>
  );
};

export default ExploreHero;
