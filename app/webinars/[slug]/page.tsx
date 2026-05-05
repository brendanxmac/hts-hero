import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { createAdminClient } from "@/app/api/supabase/server";
import { getWebinarBySlug } from "@/libs/supabase/webinars";
import WebinarRegistrationForm from "@/components/webinars/WebinarRegistrationForm";
import WebinarVideoEmbed from "@/components/webinars/WebinarVideoEmbed";
import WebinarPresenter from "@/components/webinars/WebinarPresenter";
import WebinarEditButton from "@/components/webinars/WebinarEditButton";
import { MarkdownProse } from "@/components/MarkdownProse";
import WebinarFreeResources from "@/components/webinars/WebinarFreeResources";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createAdminClient();
  const webinar = await getWebinarBySlug(supabase, params.slug);

  if (!webinar) {
    return getSEOTags({
      title: "Webinar Not Found | HTS Hero",
      description: "This webinar could not be found.",
    });
  }

  return getSEOTags({
    title: `${webinar.title} — HTS Hero Webinar`,
    description: webinar.description,
    canonicalUrlRelative: `/webinars/${webinar.slug}`,
    extraTags: {
      openGraph: {
        title: `${webinar.title} — HTS Hero Webinar`,
        description: webinar.description,
        url: `/webinars/${webinar.slug}`,
        images: webinar.graphic_url
          ? [{ url: webinar.graphic_url, width: 1200, height: 630 }]
          : [],
        locale: "en_US",
        type: "website",
      },
    },
  });
}

export const dynamic = "force-dynamic";

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/New_York",
  });
}

export default async function WebinarDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createAdminClient();
  const webinar = await getWebinarBySlug(supabase, params.slug);

  if (!webinar) {
    notFound();
  }

  const isUpcoming =
    webinar.status === "upcoming" || webinar.status === "live";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link + Edit */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/webinars"
          className="link !no-underline text-base-content/80 hover:text-base-content inline-flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          All Webinars
        </Link>
        <WebinarEditButton webinar={webinar} />
      </div>

      {/* Hero graphic — square image centered on a gradient backdrop */}
      {webinar.graphic_url && (
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-base-200 to-secondary/20" />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="relative flex items-center justify-center py-6 sm:py-8 md:py-10 px-4">
            <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden shadow-2xl ring-1 ring-base-content/10">
              <Image
                src={webinar.graphic_url}
                alt={webinar.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Title + badges — always above the grid */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {isUpcoming && (
            <span className="badge badge-primary text-white font-semibold">
              {webinar.status === "live" ? "Live Now" : "Upcoming"}
            </span>
          )}
          {webinar.status === "completed" && (
            <span className="badge badge-ghost font-semibold">Past Event</span>
          )}
          {webinar.status === "cancelled" && (
            <span className="badge badge-error text-white font-semibold">
              Cancelled
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
          {webinar.title}
        </h1>

        <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base text-base-content/70">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                clipRule="evenodd"
              />
            </svg>
            <span>{formatFullDate(webinar.scheduled_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {formatTime(webinar.scheduled_at)}
              {webinar.duration_minutes
                ? ` · ${webinar.duration_minutes} min`
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: Registration CTA — shown above presenter on small screens */}
      <div className="lg:hidden mb-8">
        <WebinarRegistrationForm webinar={webinar} variant="compact" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              About This Webinar
            </h2>
            <MarkdownProse size="base">{webinar.description}</MarkdownProse>
          </div>
          {/* Presenter */}
          <div className="mb-8">
            <WebinarPresenter
              presenterName={webinar.presenter_name}
              presenterTitle={webinar.presenter_title}
            />
          </div>

          {/* Promo video */}
          {webinar.promo_video_url && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                Watch the Preview
              </h2>
              <WebinarVideoEmbed url={webinar.promo_video_url} />
            </div>
          )}
        </div>

        {/* Desktop sidebar: Registration — hidden on mobile (shown above instead) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="lg:sticky lg:top-8">
            <WebinarRegistrationForm webinar={webinar} />
          </div>
        </div>
      </div>

      {/* Bottom CTA — always visible, great for mobile after scrolling */}
      {/* <div className="mt-8 mb-4">
        <WebinarRegistrationForm webinar={webinar} variant="compact" />
      </div> */}

      {/* Free Resources */}
      <WebinarFreeResources />

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: webinar.title,
            description: webinar.description,
            startDate: webinar.scheduled_at,
            eventAttendanceMode:
              "https://schema.org/OnlineEventAttendanceMode",
            eventStatus:
              webinar.status === "cancelled"
                ? "https://schema.org/EventCancelled"
                : "https://schema.org/EventScheduled",
            location: {
              "@type": "VirtualLocation",
              url: `https://${config.domainName}/webinars/${webinar.slug}`,
            },
            image: webinar.graphic_url,
            organizer: {
              "@type": "Organization",
              name: "HTS Hero",
              url: `https://${config.domainName}`,
            },
            performer: {
              "@type": "Person",
              name: webinar.presenter_name,
            },
          }),
        }}
      />
    </div>
  );
}
