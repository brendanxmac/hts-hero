"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Footer from "../../components/Footer";
import PlaybookCTA from "../../components/PlaybookCTA";

const cardStyle =
  "bg-base-100 rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-6 md:p-8";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email?.trim() ?? "");
}

const BONUS_TOTAL_VALUE = 224; // Sum of playbook + all bonuses for anchor
const FREE_COPIES_LEFT = 71;

export default function AuditReadyClassificationsPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [emailSent, setEmailSent] = useState(false);

  const handleDownload = async () => {
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/audit-playbook-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.success) {
        setEmailSent(true);
      }
    } catch (e) {
      console.error("Playbook download error:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100 overflow-x-hidden">
      <main className="relative flex-1 overflow-x-hidden">
        <div className="relative z-10 min-w-0">

          {/* Hero: headline + book cover */}
          <section className="max-w-6xl mx-auto relative pt-6 pb-6 sm:pb-8 md:pb-4 px-4 sm:px-6 text-center flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            <p className="w-full max-w-4xl mx-auto py-2 px-4 sm:px-6 bg-primary/90 rounded-md text-base-100 font-bold text-xs sm:text-base md:text-lg tracking-wider mb-0 break-words">
              Claim your <span className="underline">FREE</span> Copy of &quot;The Audit-Ready Classifications Playbook&quot; & Learn:
            </p>
            {/* <p className="text-secondary text-sm md:text-base font-bold">
              Only 297 Free Copies Left!
            </p> */}

            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8 break-words leading-tight">
              How to Produce HTS Classifications that Reduce Import Risk And Protect Profits
            </h1>

            {/* <p className="md:text-xl">A simple system that importers love and anyone can follow</p> */}

            {/* Book cover + download form (side-by-side on wide screens, same height for future video swap) */}
            <div className="w-full max-w-full mb-6 sm:mb-10 grid grid-cols-1 lg:grid-cols-[1fr,minmax(280px,400px)] lg:gap-6 xl:gap-10 lg:items-stretch lg:text-left min-w-0">
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl shadow-base-content/20 border-2 sm:border-4 border-base-content/10 bg-base-200/30 lg:self-start shrink-0">
                <iframe
                  src="https://www.youtube.com/embed/vJP4d2gkyQU?si=vQbWSuVav4U22QwM"
                  title="The Audit-Ready Classifications Playbook"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              {/* Download form - visible to the right on lg+, same height as book cover */}
              <PlaybookCTA
                variant="vertical"
                className="hidden lg:flex flex-col h-full lg:text-left"
                email={email}
                setEmail={setEmail}
                error={error}
                isLoading={isLoading}
                onSubmit={handleDownload}
                bonusTotalValue={BONUS_TOTAL_VALUE}
                copiesLeft={FREE_COPIES_LEFT}
                emailSent={emailSent}
              />
            </div>
            {/* Same form, stacked below image on smaller screens */}
            <PlaybookCTA
              variant="vertical"
              className="lg:hidden w-full mb-6 sm:mb-10 text-center px-2 sm:px-0"
              email={email}
              setEmail={setEmail}
              error={error}
              isLoading={isLoading}
              onSubmit={handleDownload}
              bonusTotalValue={BONUS_TOTAL_VALUE}
              copiesLeft={FREE_COPIES_LEFT}
              emailSent={emailSent}
            />
          </section>

          {/* Attention-grabber block - styled like classic funnel headline */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 lg:pt-16">
            <div className="text-center min-w-0">
              <p className="p-2 sm:p-3 font-bold text-base-content bg-warning/70 text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-12 break-words">
                Attention: Importers, Customs Brokers, Compliance Teams And Classification Professionals...
              </p>

              <p className="font-bold text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl py-4 sm:py-6 break-words leading-tight">
                The <span className="text-error">Wrong HTS Code</span> Can Cost You A Year Of Profits & Headaches...
              </p>

              <p className="text-base-content font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl pt-2 sm:pt-4 max-w-4xl mx-auto md:mb-3 break-words">
                Despite this, a <span className="underline">simple system</span> for <span className="text-primary">generating accurate classifications that defend themselves </span> didn&apos;t exist...
              </p>

              <p className="text-base-content font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl py-4 sm:py-6 break-words">
                So I Quit My Job & Built It Myself!
              </p>

              {/* Photo + intro — right before "I spent two years..." */}
              <div className="mt-8 sm:mt-10 flex flex-col gap-4 sm:gap-6 items-center pb-12 sm:pb-20">
                <a
                  href="https://www.linkedin.com/in/brendan-mclaughlin-profile/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-48 h-48 min-[400px]:w-56 min-[400px]:h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full overflow-hidden ring-2 sm:ring-4 ring-primary/30 hover:ring-primary/90 shadow-xl shrink-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:scale-105 transition-all duration-300 max-w-[85vw] max-h-[85vw]"
                  aria-label="View Brendan's LinkedIn profile"
                >
                  <Image
                    src="/profile-photo.png"
                    alt="Brendan"
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover object-top"
                    sizes="(max-width: 400px) 192px, (max-width: 640px) 224px, 288px"
                  />
                </a>
                <p className="mt-2 sm:mt-4 text-lg sm:text-xl md:text-2xl font-bold text-base-content max-w-xl mx-auto px-1 break-words">
                  Hi, I&apos;m <a href="https://www.linkedin.com/in/brendan-mclaughlin-profile/" className="link link-primary">Brendan</a> 👋, the founder of HTS Hero and an engineer whose been flown around the world to help companies build better systems.
                </p>
              </div>
            </div>
          </section>

          {/* Proof of Results — bold strip (theme-aware: base-200 in both modes) */}
          <section className="py-8 sm:py-12 md:pt-16 px-4 sm:px-6 bg-primary/5 flex flex-col gap-4 md:gap-6 min-w-0">
            <div className="flex flex-col max-w-5xl mx-auto justify-center items-center text-center min-w-0 w-full">
              <p className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-5 sm:mb-6 lg:mb-10 text-center break-words leading-tight">
                I&apos;ve Developed a <span className="text-primary">Step-by-Step System</span> for Generating <span className="text-primary">Audit-Ready</span> Classifications
              </p>

              <p className="text-base-content font-medium md:font-bold text-base sm:text-lg md:text-xl lg:text-2xl pb-4 sm:pb-6 lg:pb-8 max-w-3xl mx-auto break-words">
                That Can <span className="text-primary">Reduce Your Compliance Risk</span> & Defend Your Business, Faster Than Anything Else You&apos;ve Ever Tried!
              </p>

              <p className="text-base-content font-medium md:font-bold text-base sm:text-lg md:text-xl lg:text-2xl pb-6 sm:pb-8 max-w-xl mx-auto break-words">
                And now... I&apos;ve turned that system into an <span className="font-bold text-primary">easy-to-follow playbook</span> so you can get the same results for <span className="underline">FREE!</span> 👇
              </p>

              <div className="relative w-full max-w-4xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-base-content/20 border-2 sm:border-4 border-base-content/10 [&>img]:block">
                <Image
                  src="/The Defensible Classifications Playbook.png"
                  alt="The Audit-Ready Classifications Playbook - book cover"
                  width={1200}
                  height={800}
                  className="block w-full max-w-4xl object-contain"
                  sizes="(max-width: 1024px) 100vw, 80vw"
                  priority
                />
              </div>

              <div className="max-w-5xl mx-auto text-center pt-6 sm:pt-10 lg:pt-20 pb-4 sm:pb-8 min-w-0">
                <h2 className="text-xl min-[400px]:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-base-content leading-tight break-words">
                  In just <span className="text-primary">6 months</span> this systems has helped customs brokers and importers generate{" "}
                  <span className="text-primary">1,000+ Audit-Ready Classifications</span>
                </h2>
              </div>

              <p className="text-base-content font-bold text-base sm:text-lg md:text-xl lg:text-2xl pb-2 lg:pb-4 max-w-2xl mx-auto break-words">
                And now, for a limited time, you can get the playbook and 7 bonuses, <span className="font-bold text-primary">absolutely FREE!</span>
              </p>

              {/* Arrow pointing down to the CTA */}
              <div className="flex justify-center py-2 lg:py-4" aria-hidden>
                <span className="inline-block text-primary animate-bounce w-8 h-8 sm:w-10 sm:h-10" style={{ animationDuration: "2s" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-sm">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </span>
              </div>

              <PlaybookCTA
                email={email}
                setEmail={setEmail}
                error={error}
                isLoading={isLoading}
                onSubmit={handleDownload}
                bonusTotalValue={BONUS_TOTAL_VALUE}
                copiesLeft={FREE_COPIES_LEFT}
                emailSent={emailSent}
              />
            </div>
          </section>

          {/* Sticky CTA bar - appears after scrolling past hero */}
          {/* {showStickyCta && (
            <div className="sticky top-0 z-20 py-3 px-4 bg-base-100/95 backdrop-blur border-b border-base-content/10 shadow-lg animate-in slide-in-from-top-2 duration-300">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
                <span className="text-sm font-semibold text-base-content/90 whitespace-nowrap">
                  Get the free playbook + bonuses
                </span>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-[320px]">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                    className="input input-bordered input-sm w-full flex-1"
                    disabled={isLoading}
                    aria-label="Email for free playbook"
                  />
                  <button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="btn btn-primary btn-sm font-semibold whitespace-nowrap"
                  >
                    {isLoading ? "Sending…" : "Download FREE"}
                  </button>
                </div>
              </div>
            </div>
          )} */}

          {/* What you get - benefits first */}
          <section className="py-8 sm:py-12 md:py-20 md:pb-10 max-w-4xl md:max-w-full mx-auto px-4 sm:px-6 text-center min-w-0">
            <h2 className="text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-2 break-words">
              What&apos;s <span className="text-primary">Inside</span> The Playbook?
            </h2>
            <p className="text-center text-base-content/80 mb-6 sm:mb-8 lg:mb-12 max-w-xl mx-auto text-base sm:text-lg lg:text-xl break-words">
              Here&apos;s a sneak peek of what you&apos;ll discover inside the &apos;<strong>The Audit-Ready Classifications Playbook</strong>&apos;:
            </p>
            <div className="flex flex-col md:flex-row md:items-stretch items-center justify-center md:gap-8 lg:gap-12 max-w-4xl md:max-w-6xl mx-auto w-full min-w-0">
              <div className="hidden md:block md:w-56 lg:w-72 xl:w-96 md:shrink-0 md:self-stretch min-h-[280px] lg:min-h-[320px]">
                <div className="relative w-full h-full min-h-[280px]">
                  <Image
                    src="/book-promo.png"
                    alt="The Audit-Ready Classifications Playbook"
                    fill
                    sizes="(min-width: 1280px) 384px, (min-width: 768px) 288px, 224px"
                    className="rounded-lg shadow-lg object-cover"
                  />
                </div>
              </div>
              <ul className="space-y-4 sm:space-y-6 md:space-y-10 text-left max-w-2xl mx-auto md:mx-0 flex-1 min-w-0 w-full list-outside pl-5 sm:pl-6">
                <li className="flex items-start gap-2 sm:gap-3 text-base sm:text-lg md:text-2xl text-base-content/90 break-words">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span><strong className="underline">The CLEAR Framework</strong> - A simple process to quickly understand the classification-relevant details of any product</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-base sm:text-lg md:text-2xl text-base-content/90 break-words">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span><strong className="underline">The DOOR Method</strong> - An easy-to-follow 4-step process that helps you build classifications that stand up to CBP review</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-base sm:text-lg md:text-2xl text-base-content/90 break-words">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span><strong>Learn</strong> how to easily document reasoning so audits don&apos;t become nightmares and classifications defend themselves</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-base sm:text-lg md:text-2xl text-base-content/90 break-words">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span><strong>See</strong> a full In-depth example of how to do produce audit-ready classifications from start to finish</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-base sm:text-lg md:text-2xl text-base-content/90 break-words">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span><strong>Discover</strong> how to drastically cut classification time without cutting corners</span>
                </li>
              </ul>
            </div>
            <p className="text-center mt-6 md:mt-14 lg:mt-16 md:text-lg lg:text-xl font-bold break-words mb-3">
              But that&apos;s not all...
            </p>
            <div className="flex justify-center py-2 lg:py-4" aria-hidden>
              <span className="inline-block text-primary animate-bounce w-8 h-8 sm:w-10 sm:h-10" style={{ animationDuration: "2s" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-sm">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </section>

          {/* Free Bonuses */}
          <section className="pb-8 px-4 sm:px-6 min-w-0">
            <div className="max-w-4xl mx-auto w-full">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center mb-2 sm:mb-8 text-base-content break-words">
                If You Download The Playbook <span className="underline">Today</span>, You&apos;ll
              </h3>
              <h2 className="text-primary text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-4 sm:mb-6 lg:mb-14 max-w-3xl mx-auto break-words leading-tight">
                Unlock the Following Bonuses for FREE!
              </h2>

              {/* <p className="text-center text-base-content/80 mb-6 max-w-xl mx-auto text-lg">
                Get instant access to these tools and templates, included at no extra cost.
              </p> */}

              <ul className="space-y-4 md:space-y-6">
                {[
                  {
                    icon: "🎯",
                    title: "Classification Assistant Free Trial",
                    copy: "Generate audit-ready classifications in a fraction of the time with our broker-loved AI assistant, free for 10 days!",
                    value: "$30",
                  },
                  {
                    icon: "💰",
                    title: "Duty & Tariff Calculator",
                    copy: "Find the landed cost for any US import and discover ways to save.",
                    value: "$79",
                  },
                  {
                    icon: "✓",
                    title: "Tariff Impact Checker",
                    copy: "Instantly see if new HTS or tariff updates affect your imports, and get notified when they do.",
                    value: "$39",
                  },
                  {
                    icon: "😌",
                    title: "The GRI's for Regular People",
                    copy: "The GRI's written in a way you actually understand, plus The ANSER Framework to help you master GRI 5 and avoid embarrassing container classification mistakes.",
                    value: "$19",
                  },
                  {
                    icon: "📄",
                    title: "The Audit-Ready Classifications Template",
                    copy: "An easy-to-follow template for generating audit-ready classifications. Helps you apply the CLEAR Framework and The DOOR Method to consistently produce classifications that defend themselves.",
                    value: "$29",
                  },
                  {
                    icon: "✅",
                    title: "Audit-Ready Classification Example",
                    copy: "Quickly learn how to produce audit-ready classifications with a full in-depth classification of a Men's T-Shirt.",
                    value: "$9",
                  },
                  {
                    icon: "💎",
                    title: "The CLEAR Framework Template",
                    copy: "A plug-and-play template of the CLEAR framework that helps you quickly understand any product to prevent classification blind spots. Plus, a hand-crafted message to easily get product details from suppliers",
                    value: "$19",
                  },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-200 to-base-200/80 border-2 border-base-content/10 shadow-lg shadow-base-content/5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-4 md:p-6 pl-6 sm:pl-8 md:pl-10">
                      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 flex-1 min-w-0">
                        <span className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-primary/15 text-primary font-extrabold text-lg sm:text-xl md:text-2xl lg:text-3xl flex items-center justify-center ring-2 ring-primary/20">
                          {item.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg md:text-lg lg:text-xl font-bold text-base-content mb-1 sm:mb-2 leading-tight break-words">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-base-content/85 leading-relaxed break-words">
                            {item.copy}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 sm:flex-col sm:items-end">
                        <span className="text-base-content/50 text-sm sm:text-base font-medium line-through">
                          {item.value} value
                        </span>
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary text-primary-content font-bold text-sm sm:text-base md:text-lg shadow-md">
                          FREE
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* <p className="text-center mt-12">
              <span className="text-2xl font-medium">A ${BONUS_TOTAL_VALUE} value,</span>
              <span className="ml-1 text-primary font-bold text-2xl">FREE today!</span>
            </p> */}
          </section>

          <div id="get-playbook" className="px-4 sm:px-6 max-w-4xl mx-auto scroll-mt-8 min-w-0">
            <PlaybookCTA
              email={email}
              setEmail={setEmail}
              error={error}
              isLoading={isLoading}
              onSubmit={handleDownload}
              bonusTotalValue={BONUS_TOTAL_VALUE}
              copiesLeft={FREE_COPIES_LEFT}
              emailSent={emailSent}
            />
          </div>


          {/* Who this is for */}
          <section className="py-8 pt-12 sm:pt-16 md:pt-20 md:mt-12 bg-primary/5 px-4 sm:px-6 min-w-0">
            <div className="max-w-4xl mx-auto w-full">
              <p className="text-center text-base-content text-base sm:text-lg md:text-2xl mb-3 sm:mb-4 break-words">
                If you&apos;re still here,{" "}
                <span className="font-bold">you might be asking yourself...</span>
              </p>
              <h2 className="text-primary text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6 sm:mb-10 lg:mb-16 break-words leading-tight">
                &ldquo;Is This Playbook For Me?&rdquo;
              </h2>
              <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-12 text-base-content max-w-3xl mx-auto break-words">
                This Playbook is for <span className="underline">Every Person and Company</span> Who Touches Classifications, including:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    title: "Companies & Teams of Any Size",
                    copy: "From startups to enterprises, scale your classification process without scaling chaos. One framework that works whether you classify 10 items or 10,000.",
                  },
                  {
                    title: "20+ Year Veteran Classifiers",
                    copy: "Apply decades of experience to a system that helps you seamlessly document & defend classifications, faster than ever.",
                  },
                  {
                    title: "First-Time Classifiers",
                    copy: "No guesswork, no overwhelm. This playbook give you a clear path from product details to defensible HTS codes, so you can classify with confidence from day one.",
                  },
                  {
                    title: "Licensed Customs Brokers & Compliance Teams",
                    copy: "Deliver audit-ready work in less time. Consistent methodology means fewer corrections, happier clients, and classifications that stand up to CBP review.",
                  },
                  {
                    title: "Manufacturers & Importers",
                    copy: "Protect your margins and your supply chain. Get classifications that defend themselves so audits don’t derail your operations or your bottom line.",
                  },
                  {
                    title: "Importers of All Shapes & Sizes",
                    copy: "Whether you ship once a year or every day, this playbook is for you. Reduce risk and get the right classification without the trial and error or blindly relying on suppliers",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 sm:p-5 rounded-xl bg-base-100 border border-base-content/10 hover:border-primary/30 transition-colors min-w-0"
                  >
                    <h3 className="font-bold text-primary text-base sm:text-lg lg:text-xl mb-1 sm:mb-2 break-words">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed break-words">{item.copy}</p>
                  </div>
                ))}
              </div>

              <p className="text-center text-base sm:text-lg lg:text-xl font-medium mt-8 sm:mt-10 max-w-3xl mx-auto break-words px-1">
                Whether you’re a solo importer or a global compliance team, the Audit-Ready Classifications Playbook gives you a repeatable system that protects your business and speeds up your work.
              </p>
            </div>
          </section>

          {/* Final CTA block — limited time, author + book */}
          <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 min-w-0">
            <div className="max-w-4xl mx-auto w-full">
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
                  <div className="flex gap-4 md:gap-5 shrink-0 justify-center">
                    <div className="relative w-28 min-[400px]:w-36 sm:w-44 md:w-48 lg:w-64 aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden border-2 border-base-content/10 shadow-lg shrink-0 max-w-[85vw]">
                      <Image
                        src="/book-cover.jpg"
                        alt="The Audit-Ready Classifications Playbook"
                        fill
                        sizes="(max-width: 400px) 112px, (max-width: 640px) 144px, (max-width: 768px) 176px, (max-width: 1024px) 192px, 256px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left min-w-0 w-full">
                    <p className="text-primary font-bold text-xs sm:text-sm uppercase tracking-wider mb-1 break-words">
                      Time is limited — Offer expires in April!
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-2 break-words leading-tight">
                      Get Your Playbook for <span className="text-primary">FREE</span> Before It&apos;s Gone!
                    </h2>
                    {/* <p className="text-base-content/80 text-base sm:text-lg mb-4 sm:mb-6 break-words">
                      It feels crazy to give away $200+ worth of value for free, but I want to help as many people as possible... So I&apos;m starting by giving away 100 copies for free. Enter your email below and I&apos;ll get it to you right away.
                    </p> */}
                    <p className="text-base-content/80 text-base sm:text-lg mb-4 sm:mb-6 break-words">
                      Only the first 100 copies of the playbook are free and are running out fast... Get your copy before it&apos;s gone by entering your email below!
                    </p>
                    <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-md mx-auto md:mx-0">
                      <input
                        type="email"
                        placeholder="Enter your best email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                        className="input input-bordered input-lg w-full min-w-0 text-base input-primary"
                        disabled={isLoading}
                        aria-label="Email address"
                      />
                      <button
                        onClick={handleDownload}
                        disabled={isLoading}
                        className="btn btn-primary btn-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 w-full text-sm sm:text-base break-words"
                      >
                        {isLoading ? "Sending…" : "Send My Free Copy Now!"}
                      </button>
                      {emailSent && (
                        <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 mt-3 text-center">
                          <p className="text-primary font-bold text-sm">Check your email</p>
                          <p className="text-base-content/80 text-xs sm:text-sm">We sent you a secure link. The link expires in 8 hours.</p>
                        </div>
                      )}
                    </div>
                    {error && (
                      <p className="mt-3 text-sm text-error font-medium">{error}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
