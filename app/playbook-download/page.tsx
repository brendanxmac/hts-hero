"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Footer from "../../components/Footer";

const cardStyle =
  "bg-base-100 rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-6 md:p-8";

const PLAYBOOK_FILENAME = "The Audit Ready Classifications Playbook.pdf";

type PageStatus = "loading" | "downloaded" | "error";

export default function PlaybookDownloadPage() {
  const [status, setStatus] = useState<PageStatus>("loading");

  const triggerDownload = useCallback((signedUrl: string) => {
    const a = document.createElement("a");
    a.href = signedUrl;
    a.download = PLAYBOOK_FILENAME;
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/audit-playbook-download");
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          return;
        }

        if (data.signedUrl) {
          triggerDownload(data.signedUrl);
          setStatus("downloaded");
        } else {
          setStatus("error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [triggerDownload]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col bg-base-100">
        <main className="relative flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <p className="text-error font-semibold mb-4">
              Something went wrong. Please try again.
            </p>
            <Link
              href="/the-audit-ready-classifications-playbook"
              className="btn btn-primary"
            >
              Back to playbook
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-base-100">
        <main className="relative flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="mt-4 text-base-content/80">Preparing your download…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // status === "downloaded"
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <main className="relative flex-1">
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          {/* Success hero */}
          <section className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/15 text-primary font-semibold text-sm uppercase tracking-wider px-4 py-2 mb-6">
              <span aria-hidden>✓</span> Your playbook is ready
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-base-content mb-4">
              You&apos;re a few steps away from{" "}
              <span className="text-primary">audit-ready classifications</span>
            </h1>
            <p className="text-lg md:text-xl text-base-content/80 max-w-2xl mx-auto">
              You have the playbook. Now use free resources like the{" "}
              <span className="font-semibold text-primary">Classification Assistant</span> to start classifying 10x faster—build defensible HTS codes in minutes, not hours.
            </p>
          </section>

          {/* Why you're close */}
          <section className={cardStyle + " mb-8"}>
            <h2 className="text-xl md:text-2xl font-bold text-base-content mb-6 text-center">
              Why you&apos;re already ahead
            </h2>
            <ul className="space-y-4 text-left">
              <li className="flex items-start gap-3 text-base md:text-lg text-base-content/90">
                <span className="text-primary font-bold shrink-0 text-lg">1.</span>
                <span>
                  <strong className="text-base-content">You have the framework.</strong> The playbook gives you the repeatable process and documentation habits that stand up to CBP review.
                </span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg text-base-content/90">
                <span className="text-primary font-bold shrink-0 text-lg">2.</span>
                <span>
                  <strong className="text-base-content">You have the tool.</strong> The HTS Hero Classification Assistant turns that process into speed: AI-powered candidates, GRI-style analysis, and CROSS ruling validation—all in one place.
                </span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg text-base-content/90">
                <span className="text-primary font-bold shrink-0 text-lg">3.</span>
                <span>
                  <strong className="text-base-content">You can start right now.</strong> No setup. Enter a product description, get candidate codes, document your reasoning, and generate an audit-ready report in minutes.
                </span>
              </li>
            </ul>
          </section>

          {/* How to use the Classification Assistant */}
          <section className={cardStyle + " mb-8"}>
            <h2 className="text-xl md:text-2xl font-bold text-base-content mb-2 text-center">
              How to use the Classification Assistant
            </h2>
            <p className="text-base-content/80 text-center mb-6">
              Start generating audit-ready HTS classifications in three simple steps.
            </p>
            <ol className="space-y-5 text-left">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content font-bold text-sm">
                  1
                </span>
                <div>
                  <strong className="text-base-content block mb-1">Describe your product</strong>
                  <p className="text-base-content/80 text-sm md:text-base">
                    Enter a product description (or paste from your system). The assistant suggests likely HTS candidates in seconds.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content font-bold text-sm">
                  2
                </span>
                <div>
                  <strong className="text-base-content block mb-1">Review and validate</strong>
                  <p className="text-base-content/80 text-sm md:text-base">
                    Use GRI-style analysis and CROSS rulings to confirm the best fit and document your reasoning—exactly what the playbook recommends.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content font-bold text-sm">
                  3
                </span>
                <div>
                  <strong className="text-base-content block mb-1">Export your audit-ready report</strong>
                  <p className="text-base-content/80 text-sm md:text-base">
                    Generate a professional, branded classification report in one click. Ready to file or share with your team.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* CTA */}
          <section className="text-center">
            <p className="text-base-content/80 text-lg mb-6">
              Put the playbook into practice. Start your first classification now.
            </p>
            <Link
              href="/classifications"
              className="btn btn-primary btn-lg font-semibold text-base shadow-lg hover:shadow-xl transition-shadow"
            >
              Open Classification Assistant
            </Link>
            <p className="mt-4 text-sm text-base-content/60">
              No credit card required. Start classifying in seconds.
            </p>
          </section>

          {/* Trust strip */}
          <div className="mt-12 pt-8 border-t border-base-content/10 text-center">
            <p className="text-sm md:text-base font-semibold text-base-content/70">
              Trusted by customs brokers & importers · 1,000+ audit-ready HTS classifications created
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
