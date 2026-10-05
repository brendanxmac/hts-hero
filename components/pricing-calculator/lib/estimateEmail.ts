import { Billing, Estimate, formatPrice } from "./pricing";

// The estimate as plain text, for the body of a quote request
export const estimateEmailBody = (est: Estimate, billing: Billing, link: string) =>
  [
    "Hi HTS Hero team,",
    "",
    `I'd like to get started with this plan (${billing} billing):`,
    "",
    ...est.lines.map(
      (line) =>
        `- ${line.label} (${line.detail}): ${
          line.includedWith ? "included" : line.monthly === null ? "custom quote" : `${formatPrice(line.monthly)}/mo`
        }`
    ),
    "",
    `Estimated total: ${formatPrice(est.monthly)}/mo${est.hasQuote ? " plus a custom quote" : ""}`,
    "",
    `The estimate: ${link}`,
  ].join("\n");
