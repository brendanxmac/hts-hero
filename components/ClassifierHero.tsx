"use client";

import Link from "next/link";

const ClassifierHero = () => {
  return (
    <>
      <section className="bg-none w-full mx-auto bg-base-100 flex flex-col items-center justify-center gap-6 sm:gap-10 pt-4 px-8 pb-8">
        <div className="flex flex-col gap-4 sm:gap-6 items-center justify-center text-center">
          <div className="flex flex-col gap-5 md:gap-8 mt-8">
            <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
              Classify Anything in{" "}
              <span className="underline decoration-primary">Minutes</span>
            </h1>
            <p className="text-sm sm:text-lg leading-relaxed font-medium">
              Turn product descriptions into HTS Codes, insanely fast
            </p>
          </div>

          <Link
            className="btn btn-wide btn-sm btn-primary sm:btn-md"
            href="/classifications"
          >
            Try it Now!
          </Link>

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>
        <div className="flex justify-center sm:rounded-2xl overflow-hidden">
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
