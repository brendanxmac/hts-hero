"use client";

import { useCallback, useEffect, useRef } from "react";

// Cloudflare Turnstile in front of Supabase Auth (sign-up, sign-in, codes, password resets). Bots
// were creating accounts from Chinese residential networks (2026-11-06), and Supabase's CAPTCHA
// protection is checked by Supabase itself, so it also stops calls made straight to its API.
//
// With no NEXT_PUBLIC_TURNSTILE_SITE_KEY, nothing renders and getToken() gives undefined, so this
// can ship before CAPTCHA protection is switched on in Supabase (Supabase ignores a token while
// protection is off). Once it's on, every sign-up and sign-in call must send a fresh token: each
// one is single-use, so the widget resets after every call.
//
// Usage: const captcha = useCaptcha(); render {captcha.widget} once on the page; pass
// `captchaToken: await captcha.getToken()` in the auth call's options; call captcha.reset() after.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let scriptLoading: Promise<void> | null = null;
const loadScript = () => {
  if (window.turnstile) return Promise.resolve();
  if (!scriptLoading) {
    scriptLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptLoading = null;
        reject(new Error("Turnstile failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return scriptLoading;
};

// How long a submit waits for the (usually invisible) check to finish
const WAIT_MS = 15_000;

export const useCaptcha = () => {
  const el = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const waiters = useRef<((t: string | null) => void)[]>([]);

  const settle = (t: string | null) => {
    token.current = t;
    if (t) {
      waiters.current.forEach((w) => w(t));
      waiters.current = [];
    }
  };

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !el.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(el.current, {
          sitekey: SITE_KEY,
          // Shown only when Cloudflare needs the visitor to click; most people never see it
          appearance: "interaction-only",
          size: "flexible",
          callback: (t: string) => settle(t),
          "expired-callback": () => settle(null),
          "error-callback": () => settle(null),
        });
      })
      .catch((e) => console.error(e));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  // The token for the next auth call; waits for the check if it hasn't finished yet
  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!SITE_KEY) return undefined;
    if (token.current) return token.current;
    const t = await new Promise<string | null>((resolve) => {
      waiters.current.push(resolve);
      setTimeout(() => resolve(null), WAIT_MS);
    });
    return t ?? undefined;
  }, []);

  // After every auth call: the token can't be used twice
  const reset = useCallback(() => {
    token.current = null;
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }, []);

  const widget = SITE_KEY ? <div ref={el} className="flex w-full justify-center empty:hidden" /> : null;

  return { widget, getToken, reset };
};

// Supabase's errors, readable: a failed CAPTCHA, and a sign-up refused by the email-domain check
// (supabase/migrations/blocked_signup_domains.sql)
export const authErrorMessage = (message: string) => {
  if (/captcha/i.test(message)) return "We couldn't verify this browser. Please refresh the page and try again.";
  return message;
};
