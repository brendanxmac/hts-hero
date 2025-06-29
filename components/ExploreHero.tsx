// import Link from "next/link";

import Link from "next/link";

const ExploreHero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col items-center justify-center gap-10 p-12">
      <div className="flex flex-col gap-10 items-center justify-center text-center">
        <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
          Find HTS Codes <span className="text-primary">In Seconds</span>
        </h1>
        <p className="flex flex-col text-lg text-gray-300 leading-relaxed">
          Fast and accurate with clickable navigation, say goodbye to PDF
          downloads & squinting at tables.
        </p>

        <Link
          className="btn btn-wide btn-primary hover:text-white rounded-md"
          href="/explore"
        >
          Try Now!
        </Link>

        {/* <TestimonialsAvatars priority={true} /> */}
      </div>
      <div className="lg:w-full flex justify-center">
        <video
          className="rounded-2xl w-full border-2 border-base-300"
          autoPlay
          muted
          loop
          playsInline
          src="/explore.mp4"
        ></video>
      </div>
    </section>
  );
};

export default ExploreHero;
