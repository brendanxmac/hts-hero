import config from "@/config";

// Every demo and "let's talk" button opens Calendly directly, in a new tab. A signed-in visitor's
// name and email are filled in for them.
export const openBookCall = (prefill: { name?: string; email?: string } = {}) => {
  const url = new URL(config.bookCallUrl);
  if (prefill.name) url.searchParams.set("name", prefill.name);
  if (prefill.email) url.searchParams.set("email", prefill.email);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
};
