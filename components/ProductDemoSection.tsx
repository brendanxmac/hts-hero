interface ProductDemoSectionProps {
  title: string;
  subtitle: string;
  demoUrl: string;
}

export default function ProductDemoSection({
  title,
  subtitle,
  demoUrl,
}: ProductDemoSectionProps) {
  return (
    <section className="relative w-full bg-base-200 px-4 sm:px-6 py-12 sm:py-20">
      <div className="flex flex-col max-w-5xl mx-auto items-center text-center gap-3 sm:gap-4 mb-8">
        <span className="inline-flex items-center rounded-full border border-base-content/10 bg-base-content/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-base-content/80">
          Real product demo
        </span>
        <h2 className="font-black text-base-content text-3xl sm:text-5xl md:text-6xl">
          {title}
        </h2>
        <p className="text-base-content/80 sm:text-lg lg:text-xl">{subtitle}</p>
      </div>
      <div className="relative max-w-3xl mx-auto">
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent blur"></div>
        <div className="relative rounded-2xl border border-base-content/10 bg-base-200 shadow-xl">
          <iframe
            className="w-full aspect-video rounded-lg"
            src={demoUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
