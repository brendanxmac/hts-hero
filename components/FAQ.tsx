"use client";

import { useState } from "react";
import { Crisp } from "crisp-sdk-web";
import { ArrowRightIcon, ChatBubbleLeftRightIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import config from "../config";
import { useUser } from "../contexts/UserContext";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import LetsTalkModal from "./LetsTalkModal";
import { FaqItem, FAQItem } from "./FAQItem";

interface Props {
  faqItems: FAQItem[];
}

export const FAQ = ({ faqItems }: Props) => {
  const { user } = useUser();
  const [isBookDemoModalOpen, setIsBookDemoModalOpen] = useState(false);

  const handleBookDemoClick = () => {
    try {
      trackEvent(MixpanelEvent.CLICKED_TARIFF_TEAM_LETS_TALK, {
        userEmail: user?.email || "",
        userName: user?.user_metadata?.full_name || "",
        isLoggedIn: !!user,
      });
    } catch (e) {
      console.error("Error tracking book demo click:", e);
    }

    setIsBookDemoModalOpen(true);
  };

  const handleSupportClick = () => {
    if (config.crisp?.id) {
      Crisp.chat.show();
      Crisp.chat.open();
    } else if (config.resend?.supportEmail) {
      window.open(
        `mailto:${config.resend.supportEmail}?subject=Question about ${config.appName}`,
        "_blank"
      );
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-base-100 py-16 lg:py-24"
      id="faq"
    >
      {/* Background elements matching page theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-24 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header matching page theme */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-base-content">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base md:text-lg text-base-content/60 max-w-2xl mx-auto">
            Everything you need to know about HTS Hero
          </p>
        </div>

        {/* FAQ Items Container */}
        <div className="bg-base-100 rounded-2xl border border-base-content/10 shadow-lg overflow-hidden">
          <ul className="divide-y divide-base-content/10">
            {faqItems.map((item, i) => (
              <FaqItem key={i} item={item} />
            ))}
          </ul>
        </div>

        {/* Still have questions? */}
        <div className="mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-base-content/10 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 px-6 py-10 sm:px-10 sm:py-12 shadow-lg">
            {/* Decorative blurs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-16 -right-10 w-56 h-56 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
                Still have questions?
              </h3>
              <p className="mt-3 text-sm sm:text-base text-base-content/70 max-w-xl">
                Book a quick demo and we&apos;ll walk you through exactly how HTS Hero can help you or your team, or reach out and our team will get back to
                you fast.
              </p>

              {/* Primary CTA */}
              <button
                onClick={handleBookDemoClick}
                className="group mt-8 inline-flex items-center justify-center gap-2 px-10 sm:px-14 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-primary text-primary-content hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 hover:shadow-xl"
              >
                <span>Book a Demo</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="mt-3 text-xs sm:text-sm text-base-content/60">
                See it live in 30 minutes &middot; No commitment
              </p>

              {/* Secondary support options */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSupportClick}
                  className="btn btn-outline btn-sm gap-2 w-full sm:w-auto"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Talk with Support
                </button>
                <a
                  href={`mailto:${config.resend?.supportEmail ?? ""}?subject=Question about ${config.appName}`}
                  className="btn btn-outline btn-sm gap-2 w-full sm:w-auto"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  Send Us An Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LetsTalkModal
        isOpen={isBookDemoModalOpen}
        onClose={() => setIsBookDemoModalOpen(false)}
      />
    </section>
  );
};
