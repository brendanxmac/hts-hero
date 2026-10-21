"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { SIGNUP_EMAIL_KEY } from "@/components/tariff-updates/SubscribeForm";
import { createSupabaseClient } from "@/libs/supabase/client";
import { Provider } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import config from "@/config";
import { useUser } from "../../contexts/UserContext";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeftIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import logo from "@/app/logo.svg";
import { THEME } from "@/components/ui/theme";
import { trackerDisplay, trackerSans } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { SIGNUP_HOME } from "@/libs/tariff-tracker/onboarding";
import PasswordRequirements from "@/components/PasswordRequirements";

// Component that uses useSearchParams wrapped in Suspense
function LoginContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  // Where to go after signing in: the page that sent them here, else the Tariff Tracker
  const redirectTo = searchParams.get("redirect") || config.auth.callbackUrl;
  const isRedirectForSignUp = searchParams.get("sign-up") === "true";

  if (user) {
    redirect(redirectTo);
  }

  const supabase = createSupabaseClient();
  const [email, setEmail] = useState<string>("");
  // Signing up right after subscribing to tariff news: the address they just gave (SubscribeForm)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SIGNUP_EMAIL_KEY);
      if (saved) setEmail((now) => now || saved);
    } catch {
      // Storage blocked: nothing to fill in
    }
  }, []);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(isRedirectForSignUp);
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false);
  const [showOtpVerification, setShowOtpVerification] =
    useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(false);

  const handleValidationChange = (
    isValid: boolean,
    passwordsMatchParam: boolean
  ) => {
    // For signup, we need valid password and passwords to match
    setIsPasswordValid(isValid);
    setPasswordsMatch(passwordsMatchParam);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email for a password reset link!");
        setIsDisabled(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });

      if (error) {
        if (error.message.includes("expired")) {
          toast.error("This code has expired. Please request a new one.");
        } else if (error.message.includes("invalid")) {
          toast.error("Invalid code. Please check and try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Successfully signed in!");
        // A typed code skips the auth callback: say where a new account came from here (the
        // server keeps it only for an account made in the last hour)
        const target = searchParams.get("redirect") || (isSignUp ? SIGNUP_HOME : redirectTo);
        await fetch("/api/tracker/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "signup", redirect: target }),
        }).catch((): null => null);
        window.location.href = target;
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password requirements for signup
    if (isSignUp && !isPasswordValid) {
      toast.error("Please meet all password requirements");
      return;
    }

    // Validate passwords match for signup
    if (isSignUp && !passwordsMatch) {
      toast.error("Passwords must match");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // The confirmation link signs them in and goes on to where sign-up was headed (e.g. the
        // import they tracked from the calculator)
        const signUpRedirect =
          window.location.origin +
          "/api/auth/callback" +
          `?redirect=${encodeURIComponent(searchParams.get("redirect") || SIGNUP_HOME)}`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: signUpRedirect,
          },
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Check your email to confirm your account!");
          setIsDisabled(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Successfully signed in!");
          window.location.href = redirectTo;
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (
    e: any,
    options: {
      type: string;
      provider?: Provider;
    }
  ) => {
    e?.preventDefault();

    setIsLoading(true);

    try {
      const { type, provider } = options;
      // A new account with nowhere it was headed starts on the home page, with every product
      const redirectParam = `?redirect=${encodeURIComponent(searchParams.get("redirect") || (isSignUp ? SIGNUP_HOME : redirectTo))}`;
      const redirectURL =
        window.location.origin + "/api/auth/callback" + redirectParam;

      if (type === "oauth") {
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectURL,
          },
        });
      } else if (type === "otp") {
        // The emailed link signs them in and comes back to the same place the code does
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectURL },
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success(
            "Email sent! Check your inbox for a message from HTS Hero (including spam). If this is your first time signing in, you will need to confirm your email first.",
            {
              duration: 30000,
            }
          );
          setShowOtpVerification(true);
          setShowOtpForm(false);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const title = showForgotPassword
    ? "Reset your password"
    : showOtpVerification
      ? "Enter your passcode"
      : showOtpForm
        ? "Sign in with a passcode"
        : isSignUp
          ? `Create your ${config.appName} account`
          : `Sign in to ${config.appName}`;
  const subtitle = showForgotPassword
    ? "Enter your email and we'll send you a link to set a new password."
    : showOtpVerification
      ? "Enter the one-time passcode we sent to your email."
      : showOtpForm
        ? "We'll email you a one-time passcode. No password needed."
        : isSignUp
          ? null
          : "Welcome back. Pick up where you left off.";

  return (
    <main
      className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} flex min-h-screen w-full flex-col items-center bg-base-200 px-4 py-10 sm:py-16`}
    >
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Image src={logo} alt={`${config.appName} logo`} width={28} height={28} priority />
            <span className={`${tt.display} text-lg font-semibold text-base-content`}>{config.appName}</span>
          </Link>
          <Link href="/" className={ui.button({ variant: "ghost", size: "sm" })}>
            <ArrowLeftIcon className="h-4 w-4" />
            Home
          </Link>
        </div>

        <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-6`}>
          <header className="flex flex-col gap-1.5">
            <h1 className={`${tt.display} text-2xl font-semibold tracking-tight text-base-content`}>{title}</h1>
            {subtitle && <p className={tt.subtitle}>{subtitle}</p>}
          </header>

          {showForgotPassword ? (
            /* Forgot Password Form */
            <form className="flex w-full flex-col gap-5" onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-email" className={ui.fieldLabel}>
                  Email
                </label>
                <input
                  id="reset-email"
                  required
                  name="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={ui.input}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isDisabled}
                />
              </div>

              <div className="flex w-full gap-2">
                <button
                  className={`${ui.button({ size: "lg" })} grow`}
                  onClick={() => {
                    setShowForgotPassword(false);
                    setEmail("");
                    setIsDisabled(false);
                  }}
                  disabled={isLoading}
                  type="button"
                >
                  Back
                </button>
                <button
                  className={`${ui.button({ variant: "primary", size: "lg" })} grow`}
                  disabled={isLoading || isDisabled}
                  type="submit"
                >
                  {isLoading && <Spinner />}
                  Send reset link
                </button>
              </div>
            </form>
          ) : showOtpVerification ? (
            /* OTP Verification Form */
            <form className="flex w-full flex-col gap-5" onSubmit={handleVerifyOtp}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="otp-code" className={ui.fieldLabel}>
                  One-time passcode
                </label>
                <input
                  id="otp-code"
                  required
                  name="otp"
                  type="text"
                  value={otpCode}
                  placeholder="123456"
                  className={`${ui.input} h-14 text-center text-2xl tracking-[0.4em] tabular-nums`}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  data-1p-ignore
                />
              </div>

              <div className="flex w-full gap-2">
                <button
                  className={`${ui.button({ size: "lg" })} grow`}
                  onClick={() => {
                    setShowOtpVerification(false);
                    setShowOtpForm(true);
                    setOtpCode("");
                  }}
                  disabled={isLoading}
                  type="button"
                >
                  Back
                </button>
                <button
                  className={`${ui.button({ variant: "primary", size: "lg" })} grow`}
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading && <Spinner />}
                  Sign in
                </button>
              </div>
            </form>
          ) : showOtpForm ? (
            /* OTP Form */
            <form className="flex w-full flex-col gap-5" onSubmit={(e) => handleSignup(e, { type: "otp" })}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="otp-email" className={ui.fieldLabel}>
                  Email
                </label>
                <input
                  id="otp-email"
                  required
                  name="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={ui.input}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isDisabled}
                />
              </div>

              <div className="flex w-full gap-2">
                <button
                  className={`${ui.button({ size: "lg" })} grow`}
                  onClick={() => {
                    setShowOtpForm(false);
                    setEmail("");
                    setIsDisabled(false);
                  }}
                  disabled={isLoading}
                  type="button"
                >
                  Back
                </button>
                <button
                  className={`${ui.button({ variant: "primary", size: "lg" })} grow`}
                  disabled={isLoading || isDisabled}
                  type="submit"
                >
                  {isLoading && <Spinner />}
                  Send passcode
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className={`${ui.link} text-sm disabled:opacity-50`}
                  onClick={() => setShowOtpVerification(true)}
                  disabled={isLoading}
                  data-1p-ignore
                >
                  Already have a passcode? Enter it here
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Email & Password Form */}
              <form onSubmit={handleEmailPasswordAuth} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className={ui.fieldLabel}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={ui.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isDisabled}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className={ui.fieldLabel}>
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        className={`${ui.link} text-sm disabled:opacity-50`}
                        onClick={() => {
                          setShowForgotPassword(true);
                          setEmail("");
                          setPassword("");
                        }}
                        disabled={isLoading}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      className={`${ui.input} pr-10`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Enter your password"
                      disabled={isDisabled}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 transition-colors hover:text-base-content"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isDisabled}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="confirm-password" className={ui.fieldLabel}>
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`${ui.input} pr-10`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={isDisabled}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 transition-colors hover:text-base-content"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isDisabled}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {isSignUp && (password.length > 0 || confirmPassword.length > 0) && (
                  <PasswordRequirements
                    password={password}
                    confirmPassword={confirmPassword}
                    onValidationChange={handleValidationChange}
                  />
                )}

                <button
                  type="submit"
                  className={`${ui.button({ variant: "primary", size: "lg" })} w-full`}
                  disabled={isLoading || isDisabled || (isSignUp && (!isPasswordValid || !passwordsMatch))}
                >
                  {isLoading ? <Spinner /> : isSignUp ? "Create account" : "Sign in"}
                </button>
              </form>

              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-base-content/60">
                <span className="h-px flex-1 bg-base-300" />
                or
                <span className="h-px flex-1 bg-base-300" />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  className={`${ui.button({ size: "lg" })} w-full`}
                  onClick={(e) => handleSignup(e, { type: "oauth", provider: "google" })}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
                      <path
                        fill="#FFC107"
                        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                      />
                      <path
                        fill="#FF3D00"
                        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </button>

                <button
                  className={`${ui.button({ size: "lg" })} w-full`}
                  onClick={() => setShowOtpForm(true)}
                  disabled={isLoading}
                >
                  <EnvelopeIcon className="h-5 w-5 text-base-content/60" />
                  Continue with a passcode
                </button>
              </div>
            </>
          )}
        </section>

        {!showForgotPassword && !showOtpForm && !showOtpVerification && (
          <p className="text-center text-sm text-base-content/70">
            {isSignUp ? "Already have an account?" : "New to " + config.appName + "?"}{" "}
            <button
              type="button"
              className={`${ui.link} disabled:opacity-50`}
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsDisabled(false);
                setConfirmPassword("");
              }}
              disabled={isLoading}
            >
              {isSignUp ? "Sign in" : "Create a free account"}
            </button>
          </p>
        )}
      </div>
    </main>
  );
}

// A small spinner for buttons that are waiting on a request
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// This a login/singup page for Supabase Auth.
// Successfull login redirects to /api/auth/callback where the Code Exchange is processed (see app/api/auth/callback/route.js).
export default function Login() {
  return (
    <Suspense fallback={<main className={`${THEME} hts-tracker min-h-screen w-full bg-base-200`} />}>
      <LoginContent />
    </Suspense>
  );
}
