"use client";

import Link from "next/link";

const ClassifierHero = () => {
  return (
    <>
      <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col items-center justify-center gap-10 pt-4 px-8 pb-8">
        <div className="flex flex-col gap-6 items-center justify-center text-center">
          <div className="flex flex-col gap-5 md:gap-8 mt-8">
            <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
              Classify Anything in{" "}
              <span className="bg-primary px-2 text-base-300 rounded-sm inline-block mt-2">
                Minutes
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-neutral-300 leading-relaxed">
              With the classification assistant purpose-built for customs
              brokers.
            </p>
          </div>

          <Link
            className="btn btn-wide btn-sm sm:btn-md btn-primary"
            href="/signin"
          >
            Try it Now!
          </Link>

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>
        <div className="flex justify-center sm:rounded-2xl overflow-hidden -mx-5 md:mx-0">
          {/* <Image
            className="rounded-3xl border-2 border-neutral-content/20"
            priority={true}
            src="/classifications.png"
            alt="Classifications"
            width={1000}
            height={1000}
          /> */}
          <video
            className="w-full max-h-[55vh] border border-neutral-content/20 rounded-md md:rounded-2xl"
            autoPlay
            muted
            loop
            playsInline
            src="/new-hero-demo.mp4"
          ></video>
        </div>
      </section>
    </>
  );
};

export default ClassifierHero;
