"use client";

import { FormEvent, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as mk from "@/components/ui/marketing/styles";
import { Select } from "@/components/ui/Select";
import { AUDIT_TOPICS, AuditTopic, IMPORT_VALUES } from "@/libs/audit-request";

type Status = "idle" | "sending" | "sent" | "error";

// "Have us do it": a short form about the company. Sent to /api/audit-request, which saves it and
// emails the team.
export const AuditRequestForm = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<AuditTopic[]>(["overpaid"]);
  const [importValue, setImportValue] = useState("");

  const toggleTopic = (id: AuditTopic) =>
    setTopics((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/audit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          company: form.get("company"),
          importValue: form.get("importValue"),
          topics,
          notes: form.get("notes"),
          // Left empty by people; bots fill it in
          website: form.get("website"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      trackEvent(MixpanelEvent.TARIFF_AUDIT_REQUESTED, { import_value: form.get("importValue"), topics });
      setStatus("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className={`${mk.card} flex flex-col items-start gap-3 p-8 sm:p-10`} role="status">
        <CheckCircleIcon className="h-10 w-10 text-primary" aria-hidden />
        <h3 className="text-2xl font-semibold text-base-content">Thanks, your request is in.</h3>
        <p className={mk.body}>
          We&apos;ll email you to set up the audit and tell you exactly which entry data to send.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6 rounded-2xl border border-base-300 bg-base-100 p-8 sm:p-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={mk.fieldLabel}>Your name</span>
          <input name="name" required autoComplete="name" className={mk.input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={mk.fieldLabel}>Work email</span>
          <input name="email" type="email" required autoComplete="email" className={mk.input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={mk.fieldLabel}>Company</span>
          <input name="company" required autoComplete="organization" className={mk.input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={mk.fieldLabel}>US imports a year</span>
          <Select<string>
            name="importValue"
            required
            value={importValue}
            onChange={setImportValue}
            options={IMPORT_VALUES.map((v) => ({ value: v, label: v }))}
            placeholder="Choose a range"
            className="w-full"
            buttonClassName="!h-11 !rounded-lg !px-3.5 !text-base"
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${mk.fieldLabel} mb-2`}>What should we look at?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {AUDIT_TOPICS.map((topic) => (
            <label key={topic.id} className="flex items-center gap-2.5 rounded-lg border border-base-300 px-3 py-2.5 text-sm text-base-content/70 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/10">
              <input
                type="checkbox"
                className={mk.checkbox}
                checked={topics.includes(topic.id)}
                onChange={() => toggleTopic(topic.id)}
              />
              {topic.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className={mk.fieldLabel}>
          Anything else? <span className="font-normal text-base-content/60">Optional</span>
        </span>
        <textarea
          name="notes"
          rows={3}
          className={`${mk.textarea} min-h-24`}
          placeholder="Products, countries of origin, entry volume, deadlines…"
        />
      </label>

      {/* A field people never see; a bot filling it in is turned away */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {error && (
        <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error ring-1 ring-error/20" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={mk.small}>Free, with no obligation. We only use your details to set up the audit.</p>
        <button
          type="submit"
          disabled={status === "sending"}
          className={`${mk.buttonPrimary} sm:shrink-0`}
        >
          {status === "sending" ? "Sending…" : "Request my audit"}
        </button>
      </div>
    </form>
  );
};
