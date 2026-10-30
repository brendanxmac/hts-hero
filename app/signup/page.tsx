"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import config from "@/config";
import logo from "@/app/logo.svg";
import { useUser } from "@/contexts/UserContext";
import { createSupabaseClient } from "@/libs/supabase/client";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { SIGNUP_HOME } from "@/libs/tariff-tracker/onboarding";
import { SIGNUP_EMAIL_KEY } from "@/components/tariff-updates/SubscribeForm";
import { THEME } from "@/components/ui/theme";
import { trackerDisplay, trackerSans } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import PasswordRequirements from "@/components/PasswordRequirements";

// The sign-up page, on its own route so sign-ups can be told apart from sign-ins (page views,
// Sign Up Started). Laid out like HubSpot's: the logo, "100% free", Google above email, the
// consent line and a way to sign in. Every way to sign up that /signin had is here: Google, email
// and a password (confirmed by email), or a code emailed to them. Each comes back through
// /api/auth/callback (or, for a typed code, the onboarding note) to `redirect`, else SIGNUP_HOME.
// /signin?sign-up=true lands here, so every older sign-up link keeps working.

type Step = "start" | "password" | "code";
type Method = "google" | "email_password" | "email_code";

const started = (method: Method, redirectTo: string) => trackEvent(MixpanelEvent.SIGN_UP_STARTED, { method, redirect: redirectTo });

const pill = "inline-flex h-12 w-full items-center justify-center gap-3 rounded-full text-base font-semibold transition-colors disabled:cursor-not-allowed";
const field = `${ui.input} h-12 rounded-full px-5`;

function SignUpContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || SIGNUP_HOME;
  if (user) redirect(redirectTo);

  const supabase = createSupabaseClient();
  const [step, setStep] = useState<Step>("start");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [valid, setValid] = useState({ password: false, match: false });
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Signing up right after subscribing to tariff news: the address they just gave (SubscribeForm)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SIGNUP_EMAIL_KEY);
      if (saved) setEmail((now) => now || saved);
    } catch {
      // Storage blocked: nothing to fill in
    }
  }, []);

  // Every way in comes back through the auth callback, to where sign-up was headed
  const callbackUrl = () => `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const signInHref = `${config.auth.loginUrl}?redirect=${encodeURIComponent(redirectTo)}`;

  const google = async () => {
    setLoading(true);
    started("google", redirectTo);
    try {
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl() } });
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const createWithPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid.password) return toast.error("Please meet all password requirements");
    if (!valid.match) return toast.error("Passwords must match");
    setLoading(true);
    started("email_password", redirectTo);
    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: callbackUrl() } });
      if (error) toast.error(error.message);
      else setSent(true);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async () => {
    setLoading(true);
    started("email_code", redirectTo);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: callbackUrl() } });
      if (error) toast.error(error.message);
      else {
        toast.success("Code sent. Check your inbox, including spam.");
        setStep("code");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: "email" });
      if (error) {
        toast.error(
          error.message.includes("expired")
            ? "This code has expired. Please request a new one."
            : error.message.includes("invalid")
              ? "Invalid code. Please check and try again."
              : error.message,
        );
        return;
      }
      // A typed code skips the auth callback: say where the new account came from here (the
      // server keeps it only for an account made in the last hour)
      await fetch("/api/tracker/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", redirect: redirectTo }),
      }).catch((): null => null);
      window.location.href = redirectTo;
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const back = (
    <button type="button" onClick={() => { setStep("start"); setSent(false); setCode(""); }} className={`${ui.link} inline-flex items-center gap-1.5 self-start text-sm`} disabled={loading}>
      <ArrowLeftIcon className="h-4 w-4" aria-hidden /> Back
    </button>
  );

  return (
    <main className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} flex min-h-screen w-full flex-col items-center bg-base-100 px-4 py-14 sm:py-24`}>
      <div className="flex w-full max-w-md flex-col items-center">
        <Link href="/" className="flex items-center gap-2.5 rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40">
          <Image src={logo} alt="" width={40} height={40} priority />
          <span className={`${tt.display} text-3xl font-bold text-base-content`}>{config.appName}</span>
        </Link>

        <h1 className={`${tt.display} mt-8 text-center text-3xl font-semibold tracking-tight text-base-content`}>Create your account</h1>
        <p className="mt-2 text-center text-lg font-medium text-base-content/70">100% free. No credit card needed.</p>

        <div className="mt-8 flex w-full flex-col gap-4">
          {step === "start" && (
            <>
              <button type="button" onClick={google} disabled={loading} className={`${pill} relative border border-base-300 bg-base-100 text-base-content hover:bg-base-200`}>
                <GoogleIcon className="absolute left-5 h-5 w-5" />
                Continue with Google
              </button>

              <div className="my-2 flex items-center gap-4 text-sm font-medium text-base-content/60">
                <span className="h-px flex-1 bg-base-300" />
                OR
                <span className="h-px flex-1 bg-base-300" />
              </div>

              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (emailOk) setStep("password");
                }}
              >
                <label className="sr-only" htmlFor="signup-email">Email</label>
                <input id="signup-email" type="email" required autoComplete="email" placeholder="name@company.com" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" disabled={!emailOk} className={`${pill} bg-primary text-primary-content hover:bg-primary/90 disabled:bg-base-200 disabled:text-base-content/40`}>
                  Continue with email
                </button>
              </form>
            </>
          )}

          {step === "password" && !sent && (
            <form className="flex flex-col gap-4" onSubmit={createWithPassword}>
              {back}
              <p className="text-sm text-base-content/70">
                Create a password for <span className="font-semibold text-base-content">{email.trim()}</span>
              </p>
              <div className="relative">
                <label className="sr-only" htmlFor="signup-password">Password</label>
                <input id="signup-password" type={showPassword ? "text" : "password"} required minLength={6} autoComplete="new-password" placeholder="Password" className={`${field} pr-12`} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              <label className="sr-only" htmlFor="signup-confirm">Confirm password</label>
              <input id="signup-confirm" type={showPassword ? "text" : "password"} required minLength={6} autoComplete="new-password" placeholder="Confirm password" className={field} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <PasswordRequirements password={password} confirmPassword={confirmPassword} onValidationChange={(p, m) => setValid({ password: p, match: m })} />
              <button type="submit" disabled={loading || !valid.password || !valid.match} className={`${pill} bg-primary text-primary-content hover:bg-primary/90 disabled:bg-base-200 disabled:text-base-content/40`}>
                {loading ? <Spinner /> : "Create account"}
              </button>
              <button type="button" onClick={sendCode} disabled={loading} className={`${ui.link} self-center text-sm`}>
                Email me a sign-in code instead
              </button>
            </form>
          )}

          {step === "password" && sent && (
            <div className="flex flex-col gap-3 rounded-2xl bg-base-200 p-5 text-center" role="status">
              <p className="font-semibold text-base-content">Check your email</p>
              <p className="text-sm text-base-content/70">
                We sent a link to <span className="font-semibold text-base-content">{email.trim()}</span>. Click it to confirm your account and you&apos;re in.
              </p>
            </div>
          )}

          {step === "code" && (
            <form className="flex flex-col gap-4" onSubmit={verifyCode}>
              {back}
              <p className="text-sm text-base-content/70">
                Enter the code we sent to <span className="font-semibold text-base-content">{email.trim()}</span>
              </p>
              <label className="sr-only" htmlFor="signup-code">One-time code</label>
              <input id="signup-code" required inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="123456" className={`${field} text-center text-2xl tracking-[0.4em] tabular-nums`} value={code} onChange={(e) => setCode(e.target.value)} data-1p-ignore />
              <button type="submit" disabled={loading || code.length < 6} className={`${pill} bg-primary text-primary-content hover:bg-primary/90 disabled:bg-base-200 disabled:text-base-content/40`}>
                {loading ? <Spinner /> : "Create account"}
              </button>
              <button type="button" onClick={sendCode} disabled={loading} className={`${ui.link} self-center text-sm`}>
                Send a new code
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm leading-relaxed text-base-content/70">
          By continuing, you acknowledge {config.appName}&apos;s{" "}
          <Link href="/privacy-policy" className="font-semibold text-base-content underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          and agree to get occasional product updates and promotional emails.
        </p>

        <p className="mt-6 text-sm text-base-content/70">
          Have an account?{" "}
          <Link href={signInHref} className="font-semibold text-base-content underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const Spinner = () => (
  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default function SignUp() {
  return (
    <Suspense fallback={<main className={`${THEME} hts-tracker min-h-screen w-full bg-base-100`} />}>
      <SignUpContent />
    </Suspense>
  );
}
