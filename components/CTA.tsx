import config from "@/config";
import { redirect, RedirectType } from "next/navigation";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="bg-black hero overflow-hidden min-h-screen">
      <div className="relative hero-overlay bg-black"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-3xl p-8 md:p-0">
          <h2 className="font-bold text-4xl md:text-6xl tracking-tight mb-8 md:mb-12">
            Make HTS Codes Easy!
          </h2>
          <p className="md:text-lg opacity-80 mb-12 md:mb-16">
            Save yourself from reading through endless PDF&apos;s and hoping you
            didn&apos;t miss something, or hiring someone for more who takes 10x
            longer
          </p>

          <button className="btn btn-primary btn-wide rounded-md">
            <Link href={config.auth.loginUrl}>Get {config.appName}</Link>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
