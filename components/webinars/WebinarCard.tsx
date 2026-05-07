"use client";

import Link from "next/link";
import Image from "next/image";
import { Webinar } from "@/libs/supabase/webinars";

function formatWebinarDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

function formatWebinarTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/New_York",
  });
}

function getStatusBadge(webinar: Webinar) {
  const now = new Date();
  const scheduled = new Date(webinar.scheduled_at);

  if (webinar.status === "cancelled") {
    return (
      <span className="badge badge-error text-white font-semibold">
        Cancelled
      </span>
    );
  }

  if (webinar.status === "live") {
    return (
      <span className="badge badge-success text-white font-semibold gap-1">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        Live Now
      </span>
    );
  }

  if (scheduled > now) {
    return (
      <span className="badge badge-primary text-white font-semibold">
        Upcoming
      </span>
    );
  }

  return (
    <span className="badge badge-ghost font-semibold">Past</span>
  );
}

export default function WebinarCard({
  webinar,
  isImagePriority = false,
}: {
  webinar: Webinar;
  isImagePriority?: boolean;
}) {
  return (
    <article className="card bg-base-200 rounded-box overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
      <Link
        href={`/webinars/${webinar.slug}`}
        className="block cursor-pointer"
      >
        {webinar.graphic_url && (
          <figure className="relative aspect-video">
            <Image
              src={webinar.graphic_url}
              alt={webinar.title}
              fill
              className="object-cover"
              priority={isImagePriority}
            />
          </figure>
        )}
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {getStatusBadge(webinar)}
          </div>

          <h2 className="text-xl md:text-2xl font-bold mb-1">
            {webinar.title}
          </h2>

          <p className="text-base-content/80 line-clamp-2 mb-3">
            {webinar.description}
          </p>

          <div className="flex flex-col gap-1 text-sm text-base-content/70">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{formatWebinarDate(webinar.scheduled_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {formatWebinarTime(webinar.scheduled_at)}
                {webinar.duration_minutes
                  ? ` · ${webinar.duration_minutes} min`
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 flex-shrink-0"
              >
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
              <span>
                {webinar.presenter_name}
                {webinar.presenter_title
                  ? ` · ${webinar.presenter_title}`
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
