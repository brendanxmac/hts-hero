"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Webinar } from "@/libs/supabase/webinars";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  webinar?: Webinar;
}

function isoToEstLocalInput(isoStr: string): string {
  const d = new Date(isoStr);
  const est = new Date(
    d.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
  const year = est.getFullYear();
  const month = String(est.getMonth() + 1).padStart(2, "0");
  const day = String(est.getDate()).padStart(2, "0");
  const hours = String(est.getHours()).padStart(2, "0");
  const minutes = String(est.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function buildEmptyForm() {
  return {
    title: "",
    slug: "",
    description: "",
    graphic_url: "",
    scheduled_at: "",
    duration_minutes: "60",
    presenter_name: "Brendan Mclaughlin",
    presenter_title: "Founder of HTS Hero",
    join_link: "",
    promo_video_url: "",
    status: "upcoming",
    max_registrants: "",
  };
}

function buildFormFromWebinar(w: Webinar) {
  return {
    title: w.title,
    slug: w.slug,
    description: w.description,
    graphic_url: w.graphic_url ?? "",
    scheduled_at: w.scheduled_at ? isoToEstLocalInput(w.scheduled_at) : "",
    duration_minutes: String(w.duration_minutes ?? 60),
    presenter_name: w.presenter_name,
    presenter_title: w.presenter_title ?? "",
    join_link: w.join_link ?? "",
    promo_video_url: w.promo_video_url ?? "",
    status: w.status,
    max_registrants: w.max_registrants ? String(w.max_registrants) : "",
  };
}

export default function WebinarFormModal({ isOpen, onClose, webinar }: Props) {
  const router = useRouter();
  const isEdit = !!webinar;
  const [form, setForm] = useState(
    webinar ? buildFormFromWebinar(webinar) : buildEmptyForm(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const estDateStr = form.scheduled_at;
      const estIso = estDateStr
        ? new Date(estDateStr + ":00-05:00").toISOString()
        : "";

      const payload: Record<string, unknown> = {
        title: form.title,
        slug: form.slug || undefined,
        description: form.description,
        graphic_url: form.graphic_url || undefined,
        scheduled_at: estIso,
        duration_minutes: parseInt(form.duration_minutes) || 60,
        presenter_name: form.presenter_name,
        presenter_title: form.presenter_title || undefined,
        join_link: form.join_link || undefined,
        promo_video_url: form.promo_video_url || undefined,
        status: form.status,
        max_registrants: form.max_registrants
          ? parseInt(form.max_registrants)
          : undefined,
      };

      if (isEdit) {
        payload.id = webinar.id;
      }

      const res = await fetch("/api/webinar-admin", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} webinar.`);
      }

      onClose();

      if (isEdit && form.slug !== webinar.slug && form.slug) {
        router.push(`/webinars/${form.slug}`);
      }
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 px-4">
      <div
        className="fixed inset-0 bg-base-content/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {isEdit ? "Edit Webinar" : "Create Webinar"}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Title <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="HTS Classification Masterclass"
              className="input input-bordered w-full"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Slug</span>
              <span className="label-text-alt text-base-content/50">
                {isEdit ? "Change will update URL" : "Auto-generated from title if empty"}
              </span>
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="hts-classification-masterclass"
              className="input input-bordered w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Description <span className="text-error">*</span>
              </span>
              <span className="label-text-alt text-base-content/50">
                Markdown supported
              </span>
            </label>
            <textarea
              name="description"
              required
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder={"Join us for a deep dive into...\n\n## What you'll learn\n- Topic one\n- Topic two\n\n**Don't miss it!**"}
              className="textarea textarea-bordered w-full font-mono text-sm"
            />
          </div>

          {/* Date/Time + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Date & Time (EST) <span className="text-error">*</span>
                </span>
                <span className="label-text-alt text-base-content/50">
                  Eastern Time
                </span>
              </label>
              <input
                type="datetime-local"
                name="scheduled_at"
                required
                value={form.scheduled_at}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">Duration (min)</span>
              </label>
              <input
                type="number"
                name="duration_minutes"
                value={form.duration_minutes}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Presenter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Presenter Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="presenter_name"
                required
                value={form.presenter_name}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">Presenter Title</span>
              </label>
              <input
                type="text"
                name="presenter_title"
                value={form.presenter_title}
                onChange={handleChange}
                placeholder="Founder of HTS Hero"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Graphic URL */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Cover Graphic URL</span>
            </label>
            <input
              type="url"
              name="graphic_url"
              value={form.graphic_url}
              onChange={handleChange}
              placeholder="https://..."
              className="input input-bordered w-full"
            />
          </div>

          {/* Join Link */}
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Join Link (Zoom, Meet, etc.)
              </span>
            </label>
            <input
              type="url"
              name="join_link"
              value={form.join_link}
              onChange={handleChange}
              placeholder="https://zoom.us/j/..."
              className="input input-bordered w-full"
            />
          </div>

          {/* Promo Video */}
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Promo Video URL (YouTube)
              </span>
            </label>
            <input
              type="url"
              name="promo_video_url"
              value={form.promo_video_url}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              className="input input-bordered w-full"
            />
          </div>

          {/* Status + Max Registrants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Status</span>
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">Max Registrants</span>
                <span className="label-text-alt text-base-content/50">
                  Leave empty for unlimited
                </span>
              </label>
              <input
                type="number"
                name="max_registrants"
                value={form.max_registrants}
                onChange={handleChange}
                placeholder="Unlimited"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Webinar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
