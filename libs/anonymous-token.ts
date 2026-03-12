import { v4 as uuidv4 } from "uuid";

const COOKIE_NAME = "anon_classification_token";
const COOKIE_MAX_AGE_DAYS = 30;

export function getAnonymousToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  return match ? match.split("=")[1] : null;
}

export function getOrCreateAnonymousToken(): string {
  const existing = getAnonymousToken();
  if (existing) return existing;

  const token = uuidv4();
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  return token;
}

export function clearAnonymousToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAnonymousTokenFromCookieHeader(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  return match ? match.split("=")[1] : null;
}
