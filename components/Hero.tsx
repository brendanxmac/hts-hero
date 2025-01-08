import config from "@/config";

const Hero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-10 md:gap-0 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          HTS Code & Tariff for Your Product{"\n"}
          <span className="text-[#40C969] block">in Seconds</span>
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Save hours of work, avoid fines, & determine your import costs for the
          price of a gumball
          {/* with our automated HTS code & tariff lookup tool */}
        </p>
        <button className="btn btn-primary btn-wide bg-neutral-100 text-black rounded-md hover:text-neutral-100">
          Get {config.appName}
        </button>
        {/* <TestimonialsAvatars priority={true} /> */}
      </div>
      <div className="lg:w-full flex justify-center">
        <video
          className="rounded-2xl w-full sm:w-[34rem]"
          autoPlay
          muted
          loop
          playsInline
          controls
          src="/demo-wide-long.mp4"
        ></video>
      </div>
    </section>
  );
};

export default Hero;
