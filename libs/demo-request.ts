import { cleanWebsite, COMPANY_TYPES, isCompanyType, isRole, ROLES } from "@/libs/signup-onboarding";

// The homepage's "Get a Demo" form (DemoRequestDialog): the same questions as the sign-up
// onboarding (what the company does, the role, the website) plus the visitor's name, work email,
// company and how many products they manage. Checked the same way in the browser and on the server.

export const DEMO_PRODUCT_RANGES = [
  { id: "1-10", label: "1–10" },
  { id: "11-25", label: "11–25" },
  { id: "26-100", label: "26–100" },
  { id: "101-500", label: "101–500" },
  { id: "500+", label: "500+" },
] as const;
export type DemoProductRange = (typeof DEMO_PRODUCT_RANGES)[number]["id"];
const isProductRange = (v: unknown): v is DemoProductRange => DEMO_PRODUCT_RANGES.some((r) => r.id === v);

export type DemoRequest = {
  name: string;
  email: string;
  company: string;
  companyType: string;
  role: string;
  website: string;
  products: DemoProductRange;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const parseDemoRequest = (body: Record<string, unknown>): { request: DemoRequest } | { error: string } => {
  const text = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const company = text(body.company);
  const website = cleanWebsite(text(body.website)) ?? "";
  if (!name) return { error: "Please enter your name." };
  if (!EMAIL.test(email)) return { error: "Please enter a valid work email." };
  if (!company) return { error: "Please enter your company." };
  if (!isCompanyType(body.companyType)) return { error: "Please pick what your company does." };
  if (!isRole(body.role)) return { error: "Please pick your role." };
  if (!isProductRange(body.products)) return { error: "Please pick how many products you manage." };
  return { request: { name, email, company, companyType: body.companyType, role: body.role, website, products: body.products } };
};

export const companyTypeLabel = (id: string) => COMPANY_TYPES.find((t) => t.id === id)?.label ?? id;
export const roleLabel = (id: string) => ROLES.find((r) => r.id === id)?.label ?? id;
export const productsLabel = (id: string) => DEMO_PRODUCT_RANGES.find((r) => r.id === id)?.label ?? id;
