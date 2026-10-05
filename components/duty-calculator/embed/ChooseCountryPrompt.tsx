import * as ui from "@/components/ui/styles";

// In place of the estimate until a country of origin is chosen
export const ChooseCountryPrompt = () => (
  <div className="rounded-lg border border-dashed border-base-content/20 px-6 py-10 text-center">
    <div className={ui.cardTitle}>
      Choose a country of origin
    </div>
    <p className="mt-1 text-sm text-base-content/70">
      You&apos;ll see every duty and tariff that applies, line by line,
      and why.
    </p>
  </div>
);
