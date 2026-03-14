import { Suspense } from "react";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import TariffImpactCheckerTool from "../../../components/TariffImpactCheckerTool";

export default function TariffImpactCheckerPage() {
  return (
    <main className="w-full h-full flex flex-col bg-base-100 overflow-y-auto">
      {/* Static hero — server-rendered, crawlable */}
      <div className="shrink-0 relative overflow-hidden" id="tariff-hero">
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-base-content via-base-content to-base-content/80 bg-clip-text">
                  Tariff Impact Checker
                </span>
              </h1>
              <p className="text-base-content/60 text-sm md:text-base max-w-lg mt-1">
                Instantly see if new HTS or tariff updates affect your imports, and
                get notified when they do
              </p>
            </div>
            {/* Right side — client-rendered upgrade button renders here via portal */}
            <div id="tariff-hero-cta" />
          </div>
        </div>
      </div>

      {/* Interactive tool — client-rendered */}
      <Suspense
        fallback={
          <div className="w-full py-20 flex items-center justify-center">
            <LoadingIndicator />
          </div>
        }
      >
        <TariffImpactCheckerTool />
      </Suspense>
    </main>
  );
}
