import * as mk from "@/components/ui/marketing/styles";

// "Trade Pros Deserve Better": the brand video, on a dark band
export const VideoBand = () => (
  <section className={`${mk.band} ${mk.bandDark} relative overflow-hidden`} aria-labelledby="video-title">
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <h2 id="video-title" className={mk.h2Dark}>
        Trade Pros Deserve <span className={mk.accentDark}>Better</span>
      </h2>
      <p className={`${mk.leadDark} mt-4 max-w-2xl`}>See why customs brokers and trade teams are switching to HTS Hero.</p>
      <div className="mt-12 w-full max-w-5xl overflow-hidden rounded-2xl ring-1 ring-base-300">
        <div className="relative aspect-video">
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube.com/embed/yDg86gTQebA?rel=0&modestbranding=1"
            title="Trade Pros Deserve Better"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  </section>
);
