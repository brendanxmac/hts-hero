import Link from "next/link";

const TariffHero = () => {
  return (
    <section className="flex justify-center items-center w-full bg-base-100 text-base-content px-6 pt-10 lg:pt-16">
      <div className="w-full flex flex-col max-w-7xl lg:min-w-5xl gap-4 sm:gap-8">
        <div className="flex flex-col gap-2 md:gap-4 text-center lg:text-left lg:flex-1 items-center">
          <h1 className="font-extrabold text-3xl sm:text-4xl md:text-6xl tracking-tight max-w-4xl text-center mx-auto">
            See The <span className="underline decoration-primary">Latest</span>{" "}
            Tariffs & Exemptions For Any Import
          </h1>

          <p className="text-sm sm:text-lg leading-relaxed font-medium">
            Discover every tariff, exemption, and trade agreement for any import
            from any country
          </p>

          <div className="flex justify-center lg:justify-start mt-4">
            <Link className="btn btn-wide btn-primary" href="/explore">
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
