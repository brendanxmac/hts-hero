import config from "@/config";

// Every demo and "let's talk" button opens Calendly directly, in a new tab. A signed-in visitor's
// name and email are filled in for them.
export const openBookCall = (prefill: { name?: string; email?: string } = {}) => {
  const url = new URL(config.bookCallUrl);
  if (prefill.name) url.searchParams.set("name", prefill.name);
  if (prefill.email) url.searchParams.set("email", prefill.email);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
};

// A demo link that carries why the visitor is booking, so it's there on the booking. Calendly keeps
// the utm_* values on the event (Event details, and its webhooks and exports); `a1` pre-fills the
// event's first invitee question, so it shows in the booking itself when that question is text.
export const bookCallHref = ({ campaign, source, context }: { campaign: string; source: string; context: string }) => {
  const url = new URL(config.bookCallUrl);
  url.searchParams.set("utm_source", "htshero");
  url.searchParams.set("utm_medium", source);
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("a1", context);
  return url.toString();
};
