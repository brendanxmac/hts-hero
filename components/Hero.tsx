import config from "@/config";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          Find the HTS Code for Your Product{<br />}
          <span className="text-[#40C969]">in Seconds</span>
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Save hours of work, avoid heavy fines or delays at customs, & stop
          blindly relying on suppliers or forwarders to get your code...
        </p>

        <Link
          className="btn btn-primary bg-white text-black hover:text-white btn-wide rounded-md"
          href={config.auth.callbackUrl}
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
          src="/hero-demo.mp4"
        ></video>
      </div>
    </section>
  );
};

export default Hero;
