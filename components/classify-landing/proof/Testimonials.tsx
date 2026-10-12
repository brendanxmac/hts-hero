import { testimonials } from "@/components/TestimonialsStrip";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

const initials = (company: string) =>
  company
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// The original homepage's testimonials strip, in the marketing theme
export const Testimonials = () => (
  <section className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="testimonials-title">
    <div className={mk.container}>
      <SectionIntro title={<><span className={mk.accent}>Loved</span> by Trade Pros</>} id="testimonials-title" center>
        Customs brokers, importers, and logistics teams rely on HTS Hero every day. Here&apos;s what they have to say:
      </SectionIntro>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.company} className={`${mk.card} flex flex-col p-8`}>
            <p className="text-amber-400" aria-label="5 stars">
              ★★★★★
            </p>
            <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-slate-800">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white" aria-hidden>
                {initials(t.company)}
              </span>
              <span>
                <span className="block font-semibold text-slate-900">{t.company}</span>
                <span className="text-sm text-slate-500">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);
