"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "../../components/Footer";

const cardStyle =
  "bg-base-100 rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-6 md:p-8";

const PLAYBOOK_FILENAME = "The Audit Ready Classifications Playbook.pdf";

type PageStatus = "loading" | "downloaded" | "error" | "no_token";

export default function PlaybookDownloadPage() {
  const searchParams = useSearchParams();
  const token = useMemo(
    () => searchParams.get("token")?.trim() ?? null,
    [searchParams]
  );
  const [status, setStatus] = useState<PageStatus>(
    token ? "loading" : "no_token"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerDownload = useCallback(async (signedUrl: string) => {
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error("Failed to download file");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = PLAYBOOK_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/audit-playbook-download?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
          setStatus("error");
          return;
        }

        if (data.signedUrl) {
          await triggerDownload(data.signedUrl);
          if (!cancelled) setStatus("downloaded");
        } else {
          setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
          setStatus("error");
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("Something went wrong. Please try again.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, triggerDownload]);

  if (status === "no_token") {
    return (
      <div className="min-h-screen flex flex-col bg-base-100">
        <main className="relative flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <p className="text-base-content/90 font-semibold mb-4">
              Use the secure link from your email to download the playbook. The link is one-time use and expires in 8 hours.
            </p>
            <Link
              href="/the-audit-ready-classifications-playbook"
              className="btn btn-primary"
            >
              Get a new download link
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col bg-base-100">
        <main className="relative flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <p className="text-error font-semibold mb-4">
              {errorMessage ?? "Something went wrong. Please try again."}
            </p>
            <Link
              href="/the-audit-ready-classifications-playbook"
              className="btn btn-primary"
            >
              Go to Playbook Page
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
          <section className="text-center mb-6 md:mb-14">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-success/15 text-success font-semibold text-sm uppercase tracking-wider px-4 py-2 mb-6">
              <span aria-hidden>✓</span> Playbook Downloaded!
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-base-content mb-4">
              You&apos;re One Step Closer to{" "}
              <span className="text-primary">Audit-Ready</span> Classifications!
            </h1>
            <p className="text-lg md:text-xl text-base-content/80 max-w-2xl mx-auto">
              Now that you have the playbook, you can use our tools to classify your products in minutes, not hours.
            </p>
          </section>

          {/* Why you're close */}
          <section className={cardStyle + " mb-8"}>
            <h2 className="text-xl md:text-2xl font-bold text-base-content mb-6 text-center">
              What&apos;s Next?
            </h2>
            <ul className="space-y-4 text-left">
              <li className="flex items-start gap-3 text-base md:text-lg text-base-content/90">
                <span className="text-primary font-bold shrink-0 text-lg">1.</span>
                <span>
                  <strong className="text-base-content">You have the framework.</strong> The playbook teaches you the repeatable process and documentation habits that stand up to CBP review.
                </span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg text-base-content/90">
                <span className="text-primary font-bold shrink-0 text-lg">2.</span>
                <span>
                  <strong className="text-base-content">You have the tool.</strong> The HTS Hero <Link href="/about" className="link link-primary font-bold">Classification Assistant</Link> turns that process into speed: AI-powered candidate discovery, plus legal note & GRI analysis all documented in a single place.
                </span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg text-base-content/90">
                <span className="text-primary font-bold shrink-0 text-lg">3.</span>
                <span>
                  <strong className="text-base-content">Start Classifying!</strong> Enter a product description, get candidates, see the analysis, document your reasoning, and generate an audit-ready report in minutes.
                </span>
              </li>
            </ul>
            <Link href="/classifications" className="btn btn-primary btn-lg mt-6 w-full">
              Try Classification Assistant FREE!
            </Link>
          </section>

          {/* How to use the Classification Assistant */}
          <section className={cardStyle + " mb-8"}>
            <h2 className="text-xl md:text-2xl font-bold text-base-content mb-2 text-center">
              How to Use the Classification Assistant
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
                    Enter a product description (or paste from your system) and get likely HTS candidates in seconds.
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
                    Use the AI legal notes & GRI analysis to confirm the best fit at each level and document your reasoning just like the playbook recommends.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content font-bold text-sm">
                  3
                </span>
                <div>
                  <strong className="text-base-content block mb-1">Export your Audit-Ready Report</strong>
                  <p className="text-base-content/80 text-sm md:text-base">
                    Generate a professional, branded classification report in one click. Ready to file for your records or share with your team / client.
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
              Trusted by customs brokers & importers to generate 1,000+ audit-ready HTS classifications
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
