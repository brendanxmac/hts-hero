"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Webinar } from "@/libs/supabase/webinars";

interface Props {
  webinar: Webinar;
  variant?: "full" | "compact";
}

export default function WebinarRegistrationForm({
  webinar,
  variant = "full",
}: Props) {
  const { user } = useUser();
  const [email, setEmail] = useState(user?.email ?? "");

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user?.email]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/webinar-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          webinar_slug: webinar.slug,
          user_id: user?.id ?? null,
          referrer: document.referrer || null,
          page_url: window.location.href,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setIsRegistered(true);
          return;
        }
        throw new Error(data.error || "Registration failed.");
      }

      setIsRegistered(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="relative overflow-hidden bg-success/10 border border-success/30 rounded-2xl p-6 md:p-8 text-center">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-success/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-success"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-success mb-2">
            You&apos;re Registered!
          </h3>
          <p className="text-base-content/80">
            The access link has been sent to{" "}
            <span className="font-semibold">{email}</span>. <br /> Check your inbox (including spam)
            for more details and updates as the event gets closer
          </p>
        </div>
      </div>
    );
  }

  const isPast =
    webinar.status === "completed" || webinar.status === "cancelled";

  if (isPast) {
    return (
      <div className="bg-base-200 rounded-2xl p-6 md:p-8 text-center">
        <p className="text-base-content/70 font-medium">
          {webinar.status === "cancelled"
            ? "This webinar has been cancelled."
            : "This webinar has already taken place."}
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 p-6">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="relative text-center">
          <h3 className="text-lg font-bold mb-2">
            Reserve Your Spot
          </h3>
          <p className="text-sm text-base-content/60 mb-4">
            Register now and we&apos;ll send you the join link and reminders.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered input-lg w-full sm:flex-1 bg-base-100 text-base"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow whitespace-nowrap"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Register Now"
              )}
            </button>
          </form>
          {error && <p className="text-error text-sm mt-2">{error}</p>}
          {user?.email && (
            <p className="text-xs text-base-content/50 mt-2">
              Registering as {user.email}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 p-6 md:p-8">
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Free Event
          </span>
        </div>
        <h3 className="text-xl font-bold mb-1">Register for this Webinar</h3>
        <p className="text-sm text-base-content/60 mb-5">
          Enter your email to reserve your spot. We&apos;ll send you the join
          link and reminders before the event.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered input-lg w-full bg-base-100 text-base"
            disabled={isSubmitting}
          />

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg w-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow text-base"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Register Now"
            )}
          </button>

          <p className="text-xs text-base-content/40 text-center">
            {user?.email
              ? `Registering as ${user.email}`
              : "No account needed — just your email"}
          </p>
        </form>
      </div>
    </div>
  );
}
