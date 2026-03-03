"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";

const cardStyle =
  "bg-base-100 rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-6 md:p-8";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email?.trim() ?? "");
}

const BONUS_TOTAL_VALUE = 322; // Sum of playbook + all bonuses for anchor

export default function AuditReadyClassificationsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const heroEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    const el = heroEndRef.current;
    if (el) observer.observe(el);
    return () => el && observer.unobserve(el);
  }, []);

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

      if (data.signedUrl) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = "The Audit Ready Classifications Playbook.pdf";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        router.push("/audit-ready-playbook-downloaded");
      }
    } catch (e) {
      console.error("Playbook download error:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <main className="relative flex-1">
        <div className="relative z-10">

          {/* Hero: headline + book cover */}
          <section className="max-w-6xl mx-auto relative pt-10 pb-8 md:pt-16 md:pb-4 text-center flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            <p className="w-fit mx-auto py-2 px-6 bg-warning/90 rounded-lg font-bold text-sm md:text-base lg:text-xl tracking-wider mb-0">
              Claim your <span className="underline">FREE Copy</span> of 'The Audit-Ready Classifications Playbook' & learn:
            </p>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
              How to Produce Classifications<br /> that Defend Profits <br /><span className="underline text-warning/90">10x Faster</span>
            </h1>

            {/* <p className="md:text-xl">A simple system that importers love and anyone can follow</p> */}

            {/* Book cover + download form (side-by-side on wide screens, same height for future video swap) */}
            <div className="w-full mb-10 grid grid-cols-1 lg:grid-cols-[1fr,minmax(320px,400px)] lg:gap-8 xl:gap-10 lg:items-stretch lg:text-left">
              <div className="relative w-full min-h-[320px] lg:min-h-0 lg:h-full rounded-2xl overflow-hidden shadow-2xl shadow-base-content/20 border-4 border-base-content/10 bg-base-200/30 flex items-center justify-center">
                <Image
                  src="/The Defensible Classifications Playbook.png"
                  alt="The Audit-Ready Classifications Playbook - book cover"
                  width={600}
                  height={800}
                  className="w-full h-full max-h-[70vh] lg:max-h-none lg:h-full object-contain"
                  sizes="(max-width: 1023px) 100vw, 60vw"
                  priority
                />
              </div>
              {/* Download form - visible to the right on lg+, same height as book cover */}
              <div className="hidden lg:flex flex-col h-full rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-6 xl:p-8 shadow-xl justify-between">
                <div>
                  <h3 className="text-xl xl:text-2xl font-bold text-base-content mb-1">
                    Get your free copy
                  </h3>
                  <p className="text-base-content/80 text-sm xl:text-base mb-5">
                    Enter your email for instant access to the playbook + all bonuses.
                  </p>
                  <div className="flex flex-col gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                      className="input input-bordered input-lg w-full text-base"
                      disabled={isLoading}
                      aria-label="Email for free playbook"
                    />
                    <button
                      onClick={handleDownload}
                      disabled={isLoading}
                      className="btn btn-primary btn-lg font-bold w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-70"
                    >
                      {isLoading ? "Sending…" : "Download FREE"}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-3 text-sm text-error font-medium">{error}</p>
                  )}
                </div>
                <p className="text-xs text-base-content/70 pt-2">
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            </div>
            {/* Same form, stacked below image on smaller screens so mobile still has it in hero */}
            <div className="lg:hidden w-full max-w-md mx-auto mb-10 rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-6 shadow-xl">
              <h3 className="text-xl font-bold text-base-content mb-1 text-center">
                Get your free copy
              </h3>
              <p className="text-base-content/80 text-sm mb-5 text-center">
                Enter your email for instant access to the playbook + all bonuses.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                  className="input input-bordered input-lg w-full text-base"
                  disabled={isLoading}
                  aria-label="Email for free playbook"
                />
                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="btn btn-primary btn-lg font-bold w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-70"
                >
                  {isLoading ? "Sending…" : "Download FREE"}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-error font-medium text-center">{error}</p>
              )}
              <p className="mt-4 text-xs text-base-content/70 text-center">
                No spam. Unsubscribe anytime.
              </p>
            </div>

            {/* Social proof strip */}
            {/* <div className="uppercase gap-2 sm:gap-4 px-4 py-10 rounded-xl bg-primary/10 border border-primary/20  sm:text-xl md:text-2xl lg:text-3xl font-semibold text-primary">
              <h3>Learn the System Trusted by customs brokers & importers  <br /> to create 1,000+ Audit-Ready Classifications</h3>
            </div> */}

            <div ref={heroEndRef} className="absolute bottom-0 left-0 w-full h-1" aria-hidden />
          </section>

          {/* Attention-grabber block - styled like classic funnel headline */}
          <section className="max-w-6xl mx-auto">
            <div className="px-4 text-center">
              <p className="inline-block p-4 rounded-xl bg-warning/10 text-base-content font-bold md:text-lg lg:text-xl mb-6 md:mb-12">
                Attention: Importers, Customs Brokers, Compliance Teams And Classification Professionals...
              </p>
              <p className="font-bold text-3xl sm:text-4xl md:text-5xl mb-4">
                I&apos;ve Uncovered a
              </p>
              <p className="font-bold text-4xl sm:text-6xl md:text-7xl mb-6 lg:mb-10 leading-loose">
                <span className="text-warning">Step-by-Step System</span> for Generating <span className="text-primary">Audit-Ready</span> Classifications
              </p>
              {/* <p className="text-base-content font-bold text-xl sm:text-2xl md:text-3xl mb-6">
                That Almost Nobody Knows About...
              </p> */}
              <p className="text-base-content font-bold text-lg sm:text-xl md:text-2xl mb-6">
                That Has The Ability To Reduce Your Compliance Risk And Defend Your Classifications Faster Than Anything Else You&apos;ve Ever Tried!
              </p>
              {/* <p className="text-base-content/90 text-base md:text-lg max-w-2xl mx-auto">
                That Has The Ability To Reduce Your Compliance Risk And Defend Your Classifications Faster Than Anything Else You&apos;ve Ever Tried!
              </p> */}
            </div>
          </section>

          {/* Why this book matters - quote, headline, photo, story */}
          <section className="py-10 md:py-14">
            <div>
              <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                {/* Quote first */}
                {/* <blockquote className="border-none">
                  <p className="text-lg sm:text-xl text-base-content/90 italic">
                    &ldquo;A bad system will beat a good person every time.&rdquo;
                  </p>
                  <footer className="mt-1 text-base-content/60 text-sm not-italic">
                    — W. Edwards Deming
                  </footer>
                </blockquote> */}

                {/* Huge title */}
                <h2 className="mt-8 text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-base-content leading-tight">
                  Misclassification can cost you a year of profits and put your company at serious risk.
                </h2>

                {/* Intro copy */}
                <p className="mt-6 text-lg md:text-xl lg:text-2xl text-base-content/90 leading-relaxed">
                  Yet a simple, repeatable way to produce audit-proof HTS classifications didn&apos;t exist.
                </p>
                <p className="mt-6 text-lg md:text-xl lg:text-2xl text-base-content/90 leading-relaxed">
                  <strong className="text-primary">This playbook is that missing system.</strong>
                </p>

                {/* Photo + intro — right before "I spent two years..." */}
                <div className="mt-10 flex flex-col items-center">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-xl shrink-0">
                    <Image
                      src="/profile-photo.png"
                      alt="Brendan"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover object-top"
                      sizes="160px"
                    />
                  </div>
                  <p className="mt-4 text-xl sm:text-2xl font-bold text-base-content">
                    Hi, I&apos;m Brendan 👋
                  </p>
                </div>

                {/* Story */}
                <div className="mt-8 space-y-5 text-lg md:text-xl lg:text-2xl text-base-content/90 leading-relaxed">
                  <p>
                    I spent two years building it: reading all 4,000 pages of the HTS, studying CROSS rulings, taking classification courses, consulting Licensed Customs Brokers, and eventually leaving my software career to bring it to the industry.
                  </p>
                  <p>
                    Since July 2025, customs brokers and large importers have used it to produce 1,000+ audit-ready classifications. Every HTS classifier—whether you&apos;re a veteran or new to the game—deserves a system that increases compliance, stabilizes operations, and helps you sleep at night. This is that system.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sticky CTA bar - appears after scrolling past hero */}
          {showStickyCta && (
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
          )}

          {/* What you get - benefits first */}
          <section className="py-8">
            <div className={cardStyle}>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-base-content">
                What You Will Learn
              </h2>
              <p className="text-center text-base-content/80 mb-8 max-w-xl mx-auto">
                A simple system that importers love and anyone can follow.
              </p>
              <ul className="space-y-4 text-left max-w-xl mx-auto">
                {[
                  "How to use the CLEAR Framework to quickly understand the classification-relevant details of any product",
                  "A repeatable process to build classifications that stand up to CBP review",
                  "How to document reasoning so audits don't become nightmares and classifications defend themselves",
                  "How to cut classification time without cutting corners",
                  "Simple frameworks that reduce risk and protect your margins",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-base md:text-lg text-base-content/90"
                  >
                    <span className="text-primary font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-center text-base-content/70 mt-6 text-sm font-medium">
                Get instant access below ↓
              </p>
            </div>
          </section>

          {/* Who this is for */}
          <section className="py-8">
            <div className={cardStyle}>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-base-content">
                Built for Everyone Who Touches Classifications
              </h2>
              <p className="text-center text-base-content/80 text-lg mb-10 max-w-2xl mx-auto">
                Whether you’re a solo importer or a global compliance team, the Audit-Ready Classifications Playbook gives you a repeatable system that protects your business and speeds up your work.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Companies & Teams of Any Size",
                    copy: "From startups to enterprises—scale your classification process without scaling chaos. One framework that works whether you classify 10 items or 10,000.",
                  },
                  {
                    title: "20+ Year Veteran Classifiers",
                    copy: "Turn decades of intuition into a system others can follow. Document your expertise once, defend classifications faster, and spend less time re-explaining your reasoning.",
                  },
                  {
                    title: "First-Time Classifiers",
                    copy: "No guesswork, no overwhelm. A clear path from product details to defensible HTS codes—so you can classify with confidence from day one.",
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
                    copy: "Whether you ship once a year or every day—same playbook, same clarity. Reduce risk and get to the right classification without the trial and error.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-base-200/50 border border-base-content/10 hover:border-primary/30 transition-colors"
                  >
                    <h3 className="font-bold text-base-content text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-base-content/80 leading-relaxed">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Free Bonuses */}
          <section className="py-8">
            <div className={cardStyle}>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-base-content">
                Free Bonuses When You Claim Your Playbook
              </h2>
              <p className="text-center text-base-content/80 mb-6 max-w-xl mx-auto">
                Get instant access to these tools and templates—included at no extra cost.
              </p>
              <p className="text-center mb-8">
                <span className="text-base-content/60 text-lg font-medium line-through">${BONUS_TOTAL_VALUE} value</span>
                <span className="ml-2 text-primary font-bold text-xl">FREE today</span>
              </p>
              <ul className="space-y-6 max-w-3xl mx-auto">
                {[
                  {
                    title: "Classification Assistant Free Trial",
                    copy: "Generate audit-ready classifications in a fraction of the time—free for 10 days!",
                    value: "$49",
                  },
                  {
                    title: "Duty & Tariff Calculator",
                    copy: "Find the landed cost for any US import and discover ways to save.",
                    value: "$29",
                  },
                  {
                    title: "Tariff Impact Checker",
                    copy: "Instantly see if new HTS or tariff updates affect your imports, and get notified when they do.",
                    value: "$39",
                  },
                  {
                    title: "The GRI's for Regular People",
                    copy: "The GRI's written in a way you actually understand, plus The ANSER Framework to help you master GRI 5 and avoid embarrassing container classification mistakes.",
                    value: "$59",
                  },
                  {
                    title: "The Audit-Ready Classifications Template",
                    copy: "An easy-to-follow template for generating audit-ready classifications. Helps you apply the CLEAR Framework and The DOOR Method to consistently produce classifications that defend themselves.",
                    value: "$79",
                  },
                  {
                    title: "Audit-Ready Classification Example",
                    copy: "Quickly learn how to produce audit-ready classifications with a full in-depth classification of a Men's T-Shirt.",
                    value: "$29",
                  },
                  {
                    title: "The CLEAR Framework Template",
                    copy: "A plug-and-play template of the CLEAR framework that helps you quickly understand any product to prevent classification blind spots. Bonus: Includes message template you can send to suppliers to confirm product details fast.",
                    value: "$39",
                  },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 rounded-xl bg-base-200/50 border border-base-content/10"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-base-content mb-1">{item.title}</h3>
                      <p className="text-sm text-base-content/80 leading-relaxed">{item.copy}</p>
                    </div>
                    <span className="text-base-content/60 text-sm font-medium shrink-0 sm:pt-0.5">
                      <span className="line-through">{item.value}</span>
                      <span className="ml-1.5 text-primary font-semibold">FREE</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA block */}
          <section className="py-8 pb-16">
            <div className={`${cardStyle} text-center border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent`}>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                Instant access — no credit card required
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-base-content mb-2">
                Get the Playbook + All Bonuses FREE
              </h2>
              <p className="text-base-content/60 text-sm line-through mb-1">
                ${BONUS_TOTAL_VALUE} value
              </p>
              <p className="text-primary font-bold text-xl mb-6">
                Free today when you enter your email below
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your best email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                  className="input input-bordered input-lg w-full text-base input-primary"
                  disabled={isLoading}
                  aria-label="Email address"
                />
                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="btn btn-primary btn-lg font-bold text-base whitespace-nowrap transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-70"
                >
                  {isLoading ? "Sending…" : "Yes — Send Me the Playbook"}
                </button>
              </div>
              <p className="mt-4 text-sm text-base-content/70 max-w-md mx-auto">
                Join 1,000+ import professionals. We never share your email. Unsubscribe anytime.
              </p>
              {error && (
                <p className="mt-3 text-sm text-error font-medium">{error}</p>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
