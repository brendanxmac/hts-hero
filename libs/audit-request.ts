// The audit request form's options and validation, shared by the form and its API route so both
// accept exactly the same values

export const IMPORT_VALUES = ["Under $1M", "$1M to $10M", "$10M to $50M", "Over $50M"] as const;

export const AUDIT_TOPICS = [
  { id: "overpaid", label: "Overpaid duty on past entries" },
  { id: "ieepa", label: "IEEPA refunds" },
  { id: "section-122", label: "Section 122 refunds" },
  { id: "drawback", label: "Duty drawback" },
] as const;

export type AuditTopic = (typeof AUDIT_TOPICS)[number]["id"];

export interface AuditRequest {
  name: string;
  email: string;
  company: string;
  importValue: (typeof IMPORT_VALUES)[number];
  topics: AuditTopic[];
  notes: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 120, email: 200, company: 200, notes: 4000 };

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// The cleaned request, or the first problem with it
export const parseAuditRequest = (body: Record<string, unknown>): { request: AuditRequest } | { error: string } => {
  const name = text(body.name, MAX.name);
  const email = text(body.email, MAX.email).toLowerCase();
  const company = text(body.company, MAX.company);
  const importValue = IMPORT_VALUES.find((v) => v === body.importValue);
  const topicIds = AUDIT_TOPICS.map((t) => t.id) as readonly string[];
  const topics = (Array.isArray(body.topics) ? body.topics : []).filter(
    (t): t is AuditTopic => typeof t === "string" && topicIds.includes(t)
  );
  if (!name) return { error: "Please enter your name." };
  if (!EMAIL.test(email)) return { error: "Please enter a valid work email." };
  if (!company) return { error: "Please enter your company." };
  if (!importValue) return { error: "Please choose your yearly import value." };
  return { request: { name, email, company, importValue, topics, notes: text(body.notes, MAX.notes) } };
};
