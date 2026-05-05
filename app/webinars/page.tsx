import { getSEOTags } from "@/libs/seo";
import { createAdminClient } from "@/app/api/supabase/server";
import { getAllWebinars, Webinar } from "@/libs/supabase/webinars";
import WebinarCard from "@/components/webinars/WebinarCard";
import WebinarAdminButton from "@/components/webinars/WebinarAdminButton";

export const metadata = getSEOTags({
  title:
    "Webinars — HTS Classification & Trade Compliance Training | HTS Hero",
  description:
    "Join live and on-demand webinars on HTS classification, tariff updates, and trade compliance best practices hosted by HTS Hero.",
  canonicalUrlRelative: "/webinars",
});

export const dynamic = "force-dynamic";

export default async function WebinarsPage() {
  const supabase = createAdminClient();
  const allWebinars = await getAllWebinars(supabase);

  const now = new Date();
  const upcoming: Webinar[] = [];
  const past: Webinar[] = [];

  for (const w of allWebinars) {
    if (
      w.status === "upcoming" ||
      w.status === "live" ||
      new Date(w.scheduled_at) > now
    ) {
      upcoming.push(w);
    } else {
      past.push(w);
    }
  }

  upcoming.sort(
    (a, b) =>
      new Date(a.scheduled_at).valueOf() - new Date(b.scheduled_at).valueOf(),
  );

  return (
    <>
      <section className="text-center max-w-3xl mx-auto mt-6 mb-12">
        <h1 className="font-extrabold text-3xl lg:text-5xl tracking-tight mb-6">
          HTS Hero Webinars
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Live sessions on HTS classification, tariff updates, and trade
          compliance. <br /> Register to attend or watch past recordings.
        </p>
        <div className="mt-6">
          <WebinarAdminButton />
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Upcoming
            </span>{" "}
            Webinars
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {upcoming.map((webinar, i) => (
              <WebinarCard
                key={webinar.id}
                webinar={webinar}
                isImagePriority={i <= 1}
              />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Past Webinars
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {past.map((webinar) => (
              <WebinarCard key={webinar.id} webinar={webinar} />
            ))}
          </div>
        </section>
      )}

      {allWebinars.length === 0 && (
        <section className="text-center py-20">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 text-primary"
            >
              <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">No Webinars Yet</h2>
          <p className="text-base-content/60 max-w-md mx-auto">
            We&apos;re planning upcoming webinars on classification, tariffs, and
            trade compliance. Check back soon!
          </p>
        </section>
      )}
    </>
  );
}
