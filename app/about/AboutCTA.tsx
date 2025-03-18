import config from "@/config";
import Link from "next/link";
import { RegistrationTrigger } from "@/libs/early-registration";

interface AboutCTAProps {
  setIsRegisterOpen: (isOpen: boolean) => void;
  setRegistrationTrigger: (trigger: RegistrationTrigger) => void;
}

const AboutCTA = ({
  setIsRegisterOpen,
  setRegistrationTrigger,
}: AboutCTAProps) => {
  return (
    <section className="hero overflow-hidden min-h-[75vh]">
      <div className="relative hero-overlay bg-neutral-900"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-4xl p-8 md:p-0">
          <h2 className="font-bold text-4xl md:text-6xl tracking-tight mb-8 md:mb-12">
            Make Classification a Breeze!
            {/* Classify with Ease! */}
            {/* Experts Deserve Great Tools */}
          </h2>
          <p className="md:text-lg opacity-80 mb-12 md:mb-16">
            Save yourself from the manual searching, typing, and analysis.
            <br /> Get the intelligent assistant for classifiers.
          </p>

          <button
            className="btn btn-primary bg-white text-black hover:text-white btn-wide rounded-md"
            onClick={() => {
              setIsRegisterOpen(true);
              setRegistrationTrigger(RegistrationTrigger.cta);
            }}
          >
            Get {config.appName}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
