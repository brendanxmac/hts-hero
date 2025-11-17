"use client";

import Link from "next/link";

const ClassifierHero = () => {
  return (
    <>
      <section className="bg-none w-full mx-auto bg-base-300 flex flex-col items-center justify-center gap-6 pt-4 px-8 pb-8">
        <div className="flex flex-col gap-4 items-center justify-center text-center">
          <div className="flex flex-col gap-5 md:gap-8 mt-8">
            <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
              Classify Anything in{" "}
              <span className="bg-yellow-400 px-2 text-base-300 rounded-sm inline-block mt-2">
                Minutes
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-neutral-300 leading-relaxed">
              Turn product descriptions into classification reports, insanely
              fast
              {/* Go from product description to classification &
              client-ready report incredibly fast */}
            </p>
          </div>

          <Link
            className="btn btn-wide btn-sm sm:btn-md bg-yellow-400 text-base-300 hover:bg-yellow-500"
            href="/signin"
          >
            Try it Now!
          </Link>

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>
        <div className="flex justify-center sm:rounded-2xl overflow-hidden -mx-5 md:mx-0">
          <video
            className="w-full max-h-[55vh] border border-neutral-content/20 rounded-md md:rounded-2xl"
            autoPlay
            muted
            loop
            controls
            controlsList="nofullscreen noplaybackrate nodownload"
            playsInline
            disablePictureInPicture
            src="/new-hero-demo.mp4"
          ></video>
        </div>
      </section>
    </>
  );
};

export default ClassifierHero;
