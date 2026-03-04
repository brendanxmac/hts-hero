"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import PlaybookCTA from "../../components/PlaybookCTA";

const cardStyle =
  "bg-base-100 rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-6 md:p-8";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email?.trim() ?? "");
}

const BONUS_TOTAL_VALUE = 224; // Sum of playbook + all bonuses for anchor

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
            <p className="w-fit mx-auto py-2 px-6 bg-primary/90 rounded-md text-base-100 font-bold text-sm md:text-base lg:text-xl tracking-wider mb-0">
              Claim your <span className="underline">FREE</span> Copy of Our New Playbook & Learn:
            </p>
            <p className="text-secondary text-sm md:text-base font-bold">
              Only 297 Free Copies Left!
            </p>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
              How to Produce HTS Classifications that Reduce Import Risk And Protect Profits
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
              <PlaybookCTA
                variant="vertical"
                className="hidden lg:flex flex-col h-full lg:text-left"
                email={email}
                setEmail={setEmail}
                error={error}
                isLoading={isLoading}
                onSubmit={handleDownload}
              />
            </div>
            {/* Same form, stacked below image on smaller screens */}
            <PlaybookCTA
              variant="vertical"
              className="lg:hidden w-full max-w-md mx-auto mb-10 text-center"
              email={email}
              setEmail={setEmail}
              error={error}
              isLoading={isLoading}
              onSubmit={handleDownload}
            />

            <div ref={heroEndRef} className="absolute bottom-0 left-0 w-full h-1" aria-hidden />
          </section>

          {/* Attention-grabber block - styled like classic funnel headline */}
          <section className="max-w-5xl mx-auto">
            <div className="px-4 text-center">
              <p className="p-4 rounded-xl bg-primary font-bold text-base-100 md:text-lg lg:text-xl mb-6 md:mb-12">
                Attention: Importers, Customs Brokers, Compliance Teams And Classification Professionals...
              </p>

              <p className="font-bold text-4xl sm:text-5xl md:text-6xl py-6">
                The <span className="text-error">Wrong HTS Code</span> Can Cost You A Year Of Profits & Headaches...
              </p>

              <p className="text-base-content font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl pt-4 max-w-4xl mx-auto md:mb-3">
                Despite this, a <span className="underline">simple system</span> for generating <span className="text-primary"> accurate classifications that defend themselves </span> didn't exist...
              </p>

              <p className="text-base-content font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl sm:py-4 py-6">
                So I Spent Two Years Building It Myself!
              </p>

              {/* Photo + intro — right before "I spent two years..." */}
              <div className="mt-10 flex flex-col gap-6 items-center pb-20">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-xl shrink-0">
                  <Image
                    src="/profile-photo.png"
                    alt="Brendan"
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover object-top"
                    sizes="2000px"
                  />
                </div>
                <p className="mt-4 text-xl sm:text-2xl font-bold text-base-content max-w-xl mx-auto">
                  Hi, I&apos;m Brendan 👋, founder of HTS Hero and a systems engineer whose been flown around the world to help companies build better systems.
                </p>
              </div>
            </div>
          </section>

          {/* Proof of Results — bold strip (theme-aware: base-200 in both modes) */}
          <section className="py-12 md:py-24 px-4 bg-primary/5 flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col max-w-5xl mx-auto justify-center items-center text-center">
              <p className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6 lg:mb-10 text-center">
                I&apos;ve Uncovered a <span className="text-primary">Step-by-Step System</span> for Generating <span className="text-primary">Audit-Ready</span> Classifications
              </p>

              <p className="text-base-content font-bold text-lg sm:text-xl md:text-2xl pb-4 lg:pb-8 max-w-4xl mx-auto">
                That Can Reduce Your Compliance Risk And Protect Your Business, <span className="text-primary">Faster</span> Than Anything Else You&apos;ve Ever Tried!
              </p>

              <p className="text-base-content font-bold text-lg sm:text-xl md:text-2xl pb-8 lg:pb-14 max-w-2xl mx-auto">
                And now... I&apos;ve turned that system into an <span className="font-bold text-primary">easy-to-follow playbook</span> so you can get the same results <span className="underline">for free!</span> 👇
              </p>

              <div className="relative w-fit max-w-full mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-base-content/20 border-4 border-base-content/10 [&>img]:block">
                <Image
                  src="/The Defensible Classifications Playbook.png"
                  alt="The Audit-Ready Classifications Playbook - book cover"
                  width={1200}
                  height={800}
                  className="block max-w-full min-h-[50vh] w-auto h-auto"
                  sizes="(max-width: 1024px) 100vw, 80vw"
                  priority
                />
              </div>

              <div className="max-w-4xl mx-auto text-center pt-10 lg:pt-20 pb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-base-content leading-tight">
                  In just <span className="text-primary">6 months</span> the systems in this book have helped customs brokers and importers generate{" "}
                  <span className="text-primary">1,000+ Audit-Ready Classifications</span>
                </h2>
              </div>

              <p className="text-base-content font-bold text-lg sm:text-xl md:text-2xl pb-2 lg:pb-4  max-w-2xl mx-auto">
                And now, for a limited time, you can get the playbook & several bonuses, <span className="font-bold text-primary">absolutely FREE!</span>
              </p>

              <PlaybookCTA
                email={email}
                setEmail={setEmail}
                error={error}
                isLoading={isLoading}
                onSubmit={handleDownload}
                bonusTotalValue={BONUS_TOTAL_VALUE}
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
          <section className="py-12 md:py-24 md:pb-10 max-w-4xl md:max-w-full mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-2">
              What&apos;s <span className="text-primary">Inside</span> The Playbook?
            </h2>
            <p className="text-center text-base-content/80 mb-8 max-w-xl mx-auto text-lg lg:text-xl">
              Here&apos;s a sneak peek at what you&apos;ll discover inside your free copy of '<strong>The Audit-Ready Classifications Playbook</strong>':
            </p>
            <div className="flex flex-col md:flex-row md:items-stretch items-center justify-center md:gap-10 lg:gap-12 max-w-4xl md:max-w-6xl mx-auto">
              <div className="hidden md:block md:w-64 lg:w-96 md:shrink-0 md:self-stretch">
                <div className="relative w-full h-full min-h-[320px]">
                  <Image
                    src="/book-promo.png"
                    alt="The Audit-Ready Classifications Playbook"
                    fill
                    sizes="(min-width: 1024px) 288px, 256px"
                    className="rounded-lg shadow-lg object-cover"
                  />
                </div>
              </div>
              <ul className="space-y-6 md:space-y-10 text-left max-w-2xl mx-auto md:mx-0 flex-1 min-w-0">
                <li className="flex items-start gap-3 text-lg md:text-2xl text-base-content/90">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span><strong className="underline">The CLEAR Framework</strong> - A simple process to quickly understand the classification-relevant details of any product</span>
                </li>
                <li className="flex items-start gap-3 text-lg md:text-2xl text-base-content/90">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span><strong className="underline">The DOOR Method</strong> - An easy-to-follow 4-step process that helps you build classifications that stand up to CBP review</span>
                </li>
                <li className="flex items-start gap-3 text-lg md:text-2xl text-base-content/90">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span>How to document reasoning so audits don&apos;t become nightmares and classifications defend themselves</span>
                </li>
                <li className="flex items-start gap-3 text-lg md:text-2xl text-base-content/90">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span>A full In-depth example of how to do produce audit-ready classifications from start to finish</span>
                </li>
                <li className="flex items-start gap-3 text-lg md:text-2xl text-base-content/90">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span>How to drastically cut classification time without cutting corners</span>
                </li>
              </ul>
            </div>
            <p className="text-center mt-6 md:mt-14 lg:mt-18 md:text-xl font-bold">
              But that&apos;s not all...
            </p>
            <p className="text-center text-2xl md:text-4xl mt-6 font-medium">
              👇
            </p>
          </section>

          {/* Free Bonuses */}
          <section className="py-12 md:py-16 px-4">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-3 text-base-content">
                If You Download The Playbook <span className="underline">Today</span>, You&apos;ll
              </h3>
              <h2 className="text-primary text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-6 lg:mb-10">
                Unlock the Following Bonuses for FREE!
              </h2>

              {/* <p className="text-center text-base-content/80 mb-6 max-w-xl mx-auto text-lg">
                Get instant access to these tools and templates, included at no extra cost.
              </p> */}

              <ul className="space-y-8 md:space-y-10">
                {[
                  {
                    icon: "🎯",
                    title: "Classification Assistant Free Trial",
                    copy: "Generate audit-ready classifications in a fraction of the time with our broker-loved AI assitant, free for 10 days!",
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
                    copy: "A plug-and-play template of the CLEAR framework that helps you quickly understand any product to prevent classification blind spots. Bonus: Includes message template you can send to suppliers to confirm product details fast.",
                    value: "$19",
                  },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-200 to-base-200/80 border-2 border-base-content/10 shadow-lg shadow-base-content/5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 p-6 md:p-8 pl-8 sm:pl-10">
                      <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                        <span className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/15 text-primary font-extrabold text-xl md:text-2xl lg:text-3xl flex items-center justify-center ring-2 ring-primary/20">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-base-content mb-2 leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-base md:text-lg text-base-content/85 leading-relaxed">
                            {item.copy}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-3 sm:flex-col sm:items-end">
                        <span className="text-base-content/50 text-base font-medium line-through">
                          {item.value} value
                        </span>
                        <span className="px-4 py-2 rounded-lg bg-primary text-primary-content font-bold text-base md:text-lg shadow-md">
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

          <div id="get-playbook" className="px-4 max-w-4xl mx-auto scroll-mt-8">
            <PlaybookCTA
              email={email}
              setEmail={setEmail}
              error={error}
              isLoading={isLoading}
              onSubmit={handleDownload}
              bonusTotalValue={BONUS_TOTAL_VALUE}
            />
          </div>


          {/* Who this is for */}
          <section className="py-8 pt-20 md:mt-12 bg-primary/5">
            <div className='max-w-4xl mx-auto'>
              <p className="text-center text-base-content text-lg md:text-2xl mb-4">
                If you&apos;re still here, you{" "}
                <span className="text-primary font-bold">might be asking yourself...</span>
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-10 lg:mb-16 text-base-content">
                &ldquo;Is This Playbook For Me?&rdquo;
              </h2>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 lg:mb-12 text-base-content max-w-3xl mx-auto">
                This Playbook is <span className="underline">Built for Every Person and Company</span> Who Touches Classifications, including:
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Companies & Teams of Any Size",
                    copy: "From startups to enterprises, scale your classification process without scaling chaos. One framework that works whether you classify 10 items or 10,000.",
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
                    copy: "Whether you ship once a year or every day, this playbook is for you. Reduce risk and get to the right classification without the trial and error.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-base-100 border border-base-content/10 hover:border-primary/30 transition-colors"
                  >
                    <h3 className="font-bold text-primary text-lg lg:text-xl mb-2">{item.title}</h3>
                    <p className="text-sm text-base-content/80 leading-relaxed">{item.copy}</p>
                  </div>
                ))}
              </div>

              <p className="text-center text-lg lg:text-xl font-medium mt-10 max-w-3xl mx-auto">
                Whether you’re a solo importer or a global compliance team, the Audit-Ready Classifications Playbook gives you a repeatable system that protects your business and speeds up your work.
              </p>
            </div>
          </section>

          {/* Final CTA block — limited time, author + book */}
          <section className="py-12 md:py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className={`${cardStyle} overflow-hidden`}>
                <div className="flex flex-col md:flex-row gap-8 md:gap-10 lg:gap-12 items-center">
                  <div className="flex gap-4 md:gap-5 shrink-0 justify-center">
                    {/* <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-xl overflow-hidden border-2 border-base-content/10 shadow-lg shrink-0">
                      <Image
                        src="/profile-photo.png"
                        alt="Brendan McLaughlin"
                        fill
                        sizes="(max-width: 640px) 144px, 160px"
                        className="object-cover object-top"
                      />
                    </div> */}
                    <div className="relative w-20 h-28 sm:w-28 sm:h-36 md:w-32 md:h-64 lg:w-64 lg:h-80 rounded-xl overflow-hidden border-2 border-base-content/10 shadow-lg shrink-0">
                      <Image
                        src="/book-cover.jpg"
                        alt="The Audit-Ready Classifications Playbook"
                        fill
                        sizes="(max-width: 640px) 112px, 128px, 100vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left min-w-0">
                    <p className="text-primary font-bold text-sm uppercase tracking-wider mb-1">
                      Time is limited — only 97 free copies left!
                    </p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content mb-2">
                      Get Your <span className="text-primary">FREE</span> Book Before It&apos;s Gone
                    </h2>
                    <p className="text-base-content/80 text-lg mb-6">
                      I&apos;d like to send you a <strong>FREE</strong> copy of my hardcover playbook. Enter your email below and I&apos;ll get it to you right away.
                    </p>
                    <a
                      href="#get-playbook"
                      className="btn btn-primary btn-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Yes! Reserve My Free Copy Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
