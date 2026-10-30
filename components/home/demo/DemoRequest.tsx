"use client";

import { FormEvent, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Dialog } from "@/components/ui/Dialog";
import { trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { useUser } from "@/contexts/UserContext";
import { bookCallHref } from "@/libs/book-call";
import { DEMO_PRODUCT_RANGES, type DemoProductRange } from "@/libs/demo-request";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { cleanWebsite, COMPANY_TYPES, readFirstTouch, ROLES } from "@/libs/signup-onboarding";

// The homepage's "Get a Demo": a quieter button beside Get Started Free that opens a short form
// (the onboarding's questions, plus name, work email, company and how many products), sends it to
// Brendan (/api/demo-request), then goes straight to his Calendly with the name and email filled
// in and the answers on the booking.

const field =
  "h-12 w-full rounded-xl border border-base-300 bg-base-100 px-4 text-base text-base-content placeholder:text-base-content/40 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/30";
const pill = (on: boolean) =>
  `rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${on ? "border-primary bg-primary text-primary-content" : "border-base-300 text-base-content/80 hover:border-base-content/40"}`;

const Choices = <T extends string>({ label, options, value, onChange }: { label: string; options: readonly { id: T; label: string }[]; value: T | ""; onChange: (v: T) => void }) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="mb-2 text-sm font-semibold text-base-content">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} className={pill(value === o.id)} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  </fieldset>
);

export const DemoRequestButton = ({ className }: { className: string }) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [companyType, setCompanyType] = useState<(typeof COMPANY_TYPES)[number]["id"] | "">("");
  const [role, setRole] = useState<(typeof ROLES)[number]["id"] | "">("");
  const [products, setProducts] = useState<DemoProductRange | "">("");
  const [nickname, setNickname] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openForm = () => {
    // Signed in: their email is already known
    if (user?.email && !email) setEmail(user.email);
    setOpen(true);
    trackEvent(MixpanelEvent.DEMO_FORM_OPENED, { signed_in: !!user });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!companyType || !role || !products) return setError("Please answer each question.");
    if (website.trim() && !cleanWebsite(website)) return setError("Enter a website like yourcompany.com, or leave it blank.");
    setSending(true);
    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, website, companyType, role, products, nickname, firstTouch: readFirstTouch() }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
      trackEvent(MixpanelEvent.DEMO_REQUESTED, { company_type: companyType, role, products });
      // On to Calendly, in this tab: their name and email filled in, the answers on the booking
      const url = new URL(
        bookCallHref({
          source: "home",
          campaign: "demo",
          context: `${company} · ${COMPANY_TYPES.find((t) => t.id === companyType)?.label} · ${ROLES.find((r) => r.id === role)?.label} · ${products} products${website ? ` · ${website}` : ""}`,
        }),
      );
      url.searchParams.set("name", name.trim());
      url.searchParams.set("email", email.trim());
      window.location.href = url.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSending(false);
    }
  };

  return (
    <>
      <button type="button" onClick={openForm} className={className}>
        Get a Demo
      </button>

      <Dialog open={open} onClose={() => !sending && setOpen(false)} className="relative z-[80]">
        <div className="fixed inset-0 bg-black/60" aria-hidden />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} relative w-full max-w-xl rounded-3xl bg-base-100 p-6 text-base-content shadow-2xl sm:p-8`}>
              <button type="button" onClick={() => setOpen(false)} disabled={sending} className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/50 hover:bg-base-200 hover:text-base-content" aria-label="Close">
                <XMarkIcon className="h-5 w-5" />
              </button>
              <Dialog.Title className={`${tt.display} m-0 pr-8 text-2xl font-semibold tracking-tight`}>Get a Demo</Dialog.Title>
              <p className="m-0 mt-2 text-base text-base-content/70">Tell us a little about your company, then pick a time that works for you.</p>

              <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold">Name</span>
                    <input required autoComplete="name" className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold">Work email</span>
                    <input required type="email" autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold">Company</span>
                    <input required autoComplete="organization" className={field} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Imports" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold">
                      Company website <span className="font-normal text-base-content/50">(optional)</span>
                    </span>
                    <input inputMode="url" autoComplete="url" className={field} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="yourcompany.com" />
                  </label>
                </div>
                {/* Only bots fill this in */}
                <input type="text" tabIndex={-1} autoComplete="off" value={nickname} onChange={(e) => setNickname(e.target.value)} className="hidden" aria-hidden />

                <Choices label="What does your company do?" options={COMPANY_TYPES} value={companyType} onChange={(v) => setCompanyType(v as typeof companyType)} />
                <Choices label="What is your role?" options={ROLES} value={role} onChange={(v) => setRole(v as typeof role)} />
                <Choices label="How many products do you manage?" options={DEMO_PRODUCT_RANGES} value={products} onChange={(v) => setProducts(v as typeof products)} />
                <p className="-mt-3 text-xs text-base-content/50">A product is one HTS code from one country of origin.</p>

                {error && <p className="m-0 text-sm text-error">{error}</p>}
                <button type="submit" disabled={sending} className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-content transition-colors hover:bg-primary/90 disabled:opacity-60">
                  {sending ? "One moment…" : "Next: Pick a Time"}
                </button>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </>
  );
};
