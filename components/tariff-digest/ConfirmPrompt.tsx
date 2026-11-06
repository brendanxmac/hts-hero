"use client"

import { Fragment } from "react"
import { Transition } from "@headlessui/react"
import { ArrowRightIcon, ArrowTopRightOnSquareIcon, CheckIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { Dialog } from "@/components/ui/Dialog"
import { trackerDisplay, trackerSans } from "@/components/ui/font"

// Right after someone signs up on /tariff-digest, over the page. A new address: check your inbox
// and tap Confirm (double opt-in: nothing is sent until they do), with the address they typed, a
// button straight to their webmail when we can tell which it is, and where else to look. Confirming
// lands them on /tariff-digest/welcome and sends the welcome email (libs/email/subscribers.ts).
// An address already on the list: nothing changes, their inbox gets the manage link to switch
// weekly / as it happens / both, and Continue goes to the welcome page. The
// dialog portals out of the page, so it carries the page's theme classes itself, and stays dark.

export type SignupStatus = "confirm_sent" | "already_subscribed" | "throttled"

// Where the confirmation comes from, so they know what to look for
const SENDER = "HTS Hero"

// The big webmail providers, by the address's domain: a search for our email where we can
const WEBMAIL: { domains: string[]; label: string; url: string }[] = [
  { domains: ["gmail.com", "googlemail.com"], label: "Open Gmail", url: "https://mail.google.com/mail/u/0/#search/from%3Ahtshero.com+in%3Aanywhere" },
  { domains: ["outlook.com", "hotmail.com", "live.com", "msn.com"], label: "Open Outlook", url: "https://outlook.live.com/mail/0/" },
  { domains: ["yahoo.com", "ymail.com"], label: "Open Yahoo Mail", url: "https://mail.yahoo.com/" },
  { domains: ["icloud.com", "me.com", "mac.com"], label: "Open iCloud Mail", url: "https://www.icloud.com/mail" },
]
const webmailFor = (email: string) => {
  const domain = email.split("@")[1]?.toLowerCase() ?? ""
  return WEBMAIL.find((w) => w.domains.includes(domain)) ?? null
}

// The envelope, a letter rising out of it, and a ring going out: "it's been sent" (globals.css)
const Envelope = () => (
  <div className="relative mx-auto flex h-28 w-28 items-center justify-center" aria-hidden>
    <span className="dg-ring absolute inset-0 rounded-full border-2 border-primary/50" />
    <span className="dg-ring absolute inset-0 rounded-full border-2 border-primary/30" style={{ animationDelay: "900ms" }} />
    <span className="absolute inset-2 rounded-full bg-primary/15" />
    <svg viewBox="0 0 64 64" className="relative h-16 w-16 overflow-visible">
      {/* The letter, behind the front of the envelope */}
      <g className="dg-letter">
        <rect x="16" y="14" width="32" height="30" rx="3" className="fill-base-content" />
        <rect x="21" y="21" width="16" height="3" rx="1.5" className="fill-primary" />
        <rect x="21" y="28" width="22" height="2.5" rx="1.25" className="fill-base-200 opacity-40" />
        <rect x="21" y="33" width="18" height="2.5" rx="1.25" className="fill-base-200 opacity-40" />
      </g>
      {/* The envelope */}
      <path d="M8 28 L32 44 L56 28 V52 a4 4 0 0 1 -4 4 H12 a4 4 0 0 1 -4 -4 Z" className="fill-primary" />
      <path d="M8 52 L26 38 M56 52 L38 38" className="stroke-primary-content/40" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  </div>
)

const primaryButton =
  "group inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-primary px-8 text-base font-semibold text-primary-content transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
const quietButton =
  "inline-flex h-12 w-full items-center justify-center rounded-full border border-base-content/15 text-base font-semibold text-base-content transition-colors hover:bg-base-content/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"

export function ConfirmPrompt({
  status,
  email,
  frequency = "weekly",
  onClose,
  onContinue,
  onChangeEmail,
}: {
  status: SignupStatus
  email: string
  // What they picked, for what starts once they confirm
  frequency?: "weekly" | "instant" | "both"
  // Closed without anything else to do (a new address: they go to their inbox)
  onClose: () => void
  // Already subscribed: on to the welcome page
  onContinue: () => void
  // Typed it wrong: back to the form
  onChangeEmail: () => void
}) {
  const already = status === "already_subscribed"
  const webmail = webmailFor(email)
  const close = already ? onContinue : onClose

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className={`relative z-50 hts-theme hts-tracker ${trackerSans.className} ${trackerDisplay.variable}`} onClose={close}>
        <Transition.Child as={Fragment} enter="ease-out duration-500" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-500"
              enterFrom="opacity-0 translate-y-6 scale-[0.97]"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-[0.98]"
            >
              <Dialog.Panel className="hts-tracker-on-dark relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-base-content/10 bg-base-200 px-8 pb-8 pt-10 text-center text-base-content shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] sm:px-10">
                <button
                  type="button"
                  onClick={close}
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-base-content/50 transition-colors hover:bg-base-content/10 hover:text-base-content"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                {already ? (
                  <>
                    <span className="dg-rise mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-content">
                      <CheckIcon className="h-11 w-11" aria-hidden />
                    </span>
                    <Dialog.Title className="dg-rise m-0 mt-7 text-3xl font-semibold leading-[1.1] tracking-tight [font-family:var(--font-tracker-display)] sm:text-4xl" style={{ ["--dg-delay" as string]: "120ms" }}>
                      You&apos;re already subscribed.
                    </Dialog.Title>
                    <Dialog.Description className="dg-rise m-0 mt-4 text-base leading-relaxed text-base-content/70" style={{ ["--dg-delay" as string]: "220ms" }}>
                      <span className="font-semibold text-base-content">{email}</span> already gets our tariff updates. Want them weekly, as they happen, or
                      both? We&apos;ve emailed you a link to change it in one click.
                    </Dialog.Description>
                    <button type="button" onClick={onContinue} className={`${primaryButton} dg-rise mt-9`} style={{ ["--dg-delay" as string]: "320ms" }}>
                      Continue
                      <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </button>
                  </>
                ) : (
                  <>
                    <Envelope />
                    <p className="dg-rise m-0 mt-7 text-xs font-bold uppercase tracking-[0.2em] text-primary" style={{ ["--dg-delay" as string]: "100ms" }}>
                      One last step
                    </p>
                    <Dialog.Title className="dg-rise m-0 mt-3 text-3xl font-semibold leading-[1.1] tracking-tight [font-family:var(--font-tracker-display)] sm:text-4xl" style={{ ["--dg-delay" as string]: "180ms" }}>
                      Check your inbox to confirm.
                    </Dialog.Title>
                    <Dialog.Description className="dg-rise m-0 mt-4 text-base leading-relaxed text-base-content/70" style={{ ["--dg-delay" as string]: "260ms" }}>
                      {status === "throttled" ? "We sent a confirmation link to " : "We just sent a confirmation link to "}
                      <span className="font-semibold text-base-content">{email}</span>. Tap <span className="font-semibold text-base-content">Confirm</span> in it and{" "}
                      {frequency === "weekly"
                        ? "your Weekly Tariff Digest starts Monday."
                        : frequency === "instant"
                          ? "the next tariff change comes to you the day it's out."
                          : "the next tariff change comes to you the day it's out, plus the digest every Monday."}
                    </Dialog.Description>

                    <div className="dg-rise mt-9 flex flex-col gap-2.5" style={{ ["--dg-delay" as string]: "360ms" }}>
                      {webmail ? (
                        <>
                          <a href={webmail.url} target="_blank" rel="noopener noreferrer" onClick={onClose} className={primaryButton}>
                            {webmail.label}
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
                          </a>
                          <button type="button" onClick={onClose} className={quietButton}>
                            Close
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={onClose} className={primaryButton}>
                          Got it
                        </button>
                      )}
                    </div>

                    <div className="dg-rise mt-8 border-t border-base-content/10 pt-5 text-sm leading-relaxed text-base-content/55" style={{ ["--dg-delay" as string]: "440ms" }}>
                      <p className="m-0">
                        Can&apos;t find it? It&apos;s from <span className="font-semibold text-base-content/80">{SENDER}</span>, so check your spam or promotions folder too.
                      </p>
                      <button type="button" onClick={onChangeEmail} className="mt-2 font-semibold text-base-content/80 underline decoration-base-content/30 underline-offset-4 hover:text-base-content">
                        Wrong address? Use a different email
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
