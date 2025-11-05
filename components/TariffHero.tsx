import Link from "next/link";

const TariffHero = () => {
  return (
    <section className="flex justify-center items-center w-full bg-base-300 text-base-content px-6 pt-10 lg:pt-16">
      <div className="w-full flex flex-col max-w-7xl lg:min-w-5xl gap-4 sm:gap-8">
        <div className="flex flex-col gap-2 md:gap-4 text-center lg:text-left lg:flex-1 items-center">
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-6xl tracking-tight max-w-3xl text-center mx-auto">
            Find the Best Tariff Rate for Any Import in{" "}
            <span className="text-yellow-400">Seconds</span>
          </h1>

          <div className="flex justify-center lg:justify-start mt-4">
            <Link
              className="btn btn-wide bg-yellow-400 text-base-300 hover:bg-yellow-500"
              href="/explore"
            >
              Check your Imports!
            </Link>
          </div>

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>
        <div className="flex justify-center sm:rounded-2xl overflow-hidden mx-auto">
          <video
            className="w-full max-h-[55vh] border border-neutral-content/20 rounded-md md:rounded-2xl"
            autoPlay
            muted
            loop
            controls
            controlsList="nofullscreen noplaybackrate nodownload"
            playsInline
            disablePictureInPicture
            src="/tariffs-hero.mp4"
          ></video>
        </div>
      </div>
    </section>
  );
};

export default TariffHero;
