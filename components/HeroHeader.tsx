import Link from "next/link";

export default function HeroHeader() {
  return (
    <div className="flex flex-col gap-2 md:gap-4 text-center lg:text-left lg:flex-1 items-center">
      <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-6xl lg:text-7xl tracking-tight max-w-5xl text-center mx-auto">
        <span className="text-primary">Instantly</span> Know How New Tariffs
        Affect Your Imports
      </h1>
      <p className="text-sm md:text-lg lg:text-xl text-neutral-300 leading-relaxed max-w-5xl mx-auto md:my-4">
        Get notified, see what&apos;s affected, and discover potential savings
      </p>

      <div className="flex justify-center lg:justify-start">
        <Link className="btn btn-wide btn-primary" href="/explore">
          Check your Imports!
        </Link>
      </div>
    </div>
  );
}
