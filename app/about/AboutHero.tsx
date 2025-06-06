import { RegistrationTrigger } from "../../libs/early-registration";

interface AboutHeroProps {
  setIsRegisterOpen: (isOpen: boolean) => void;
  setRegistrationTrigger: (trigger: RegistrationTrigger) => void;
}

const AboutHero = ({
  setIsRegisterOpen,
  setRegistrationTrigger,
}: AboutHeroProps) => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-10 px-8 py-8 lg:py-28">
      <div className="flex flex-col gap-10 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
          Classify any product{" "}
          <span className="text-[#40C969]">in minutes</span>
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Transform classifications from time consuming and tedious to
          effortless and enjoyable with our all-in-one platform.
        </p>

        <button
          className="btn btn-wide btn-primary bg-white text-black hover:text-white rounded-md"
          onClick={() => {
            setIsRegisterOpen(true);
            setRegistrationTrigger(RegistrationTrigger.hero);
          }}
        >
          Try it free!
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
          src="/about-hero-demo.mp4"
        ></video>
      </div>
    </section>
  );
};

export default AboutHero;
