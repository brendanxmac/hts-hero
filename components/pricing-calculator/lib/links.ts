import config from "@/config";

// Where the page's calls to action go
export const LINKS = {
  calculator: "/duty-calculator",
  classify: "/classify",
  signUp: config.auth.loginUrl,
  estimate: "#estimate",
  contact: `mailto:${config.resend.supportEmail}`,
};

// A mailto link with the estimate in the body, so a quote request starts with the details
export const contactLink = (subject: string, body?: string) =>
  `${LINKS.contact}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;

// A link that reopens the estimator with these options. Pass the origin to link to the site
// being viewed (e.g. a preview); it defaults to the live site.
export const estimateUrl = (query: string, origin = `https://${config.domainName}`) =>
  `${origin}/pricing-calculator?${query}#estimate`;
