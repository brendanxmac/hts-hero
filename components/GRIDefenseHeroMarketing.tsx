"use client";

import { useRef, useEffect } from "react";

const keywords = [
  "According to GRI 1",
  "Based on Section XV Note 1(g)",
  "Under GRI 3(a)",
  "Based on Chapter Note 3(a)",
  "Per GRI 3(b)",
  "Additional US Note Note 1(g) states",
];

const PIXELS_PER_SECOND = 60;

export const GRIDefenseHeroMarketing = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let segmentWidth = track.scrollWidth / 2;
    let lastTime = performance.now();

    const resizeObserver = new ResizeObserver(() => {
      segmentWidth = track.scrollWidth / 2;
    });
    resizeObserver.observe(track);

    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      offsetRef.current += PIXELS_PER_SECOND * delta;
      if (offsetRef.current >= segmentWidth) {
        offsetRef.current -= segmentWidth;
      }

      track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
      requestAnimationFrame(animate);
    };

    const rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative mx-4 md:mx-8 px-8 md:px-16 text-center">
      <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-primary/90 mb-4">
        Defensible & Documented
      </p>
      <h2 className="gri-text-glow text-3xl md:text-4xl lg:text-6xl font-bold text-base-content leading-tight max-w-3xl mx-auto">
        Not Just Codes, <span className="text-primary">Proof</span>
      </h2>
      <p className="text-base md:text-lg text-base-content/60 mt-6 max-w-3xl mx-auto">
        GRI, Legal Note, & CROSS Rulings defense included for every classification
      </p>

      {/* Stock-ticker style marquee */}
      <div className="gri-marquee-wrapper mt-8 pt-6 border-t border-base-content/10 overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-10 md:gap-16 whitespace-nowrap will-change-transform"
        >
          {[...keywords, ...keywords].map((k, i) => (
            <span
              key={i}
              className={`shrink-0 text-sm md:text-xl font-semibold ${k.includes("GRI") ? "text-primary/80" : "text-secondary/80"
                }`}
            >
              {k}...
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
