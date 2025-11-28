"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { createSupabaseClient } from "@/libs/supabase/client";
import { Provider } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import config from "@/config";
import { useUser } from "../../contexts/UserContext";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import PasswordRequirements from "@/components/PasswordRequirements";

// Component that uses useSearchParams wrapped in Suspense
function LoginContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const isRedirectForSignUp = searchParams.get("sign-up") === "true";

  if (user) {
    redirect(redirectTo || "/");
  }

  const supabase = createSupabaseClient();
  const [email, setEmail] = useState<string>("");
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
        window.location.href = redirectTo || "/";
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
        const signUpRedirect =
          window.location.origin +
          "/api/auth/callback" +
          `?redirect=${encodeURIComponent("/signin")}`;
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
          window.location.href = redirectTo || "/";
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
      const redirectParam = redirectTo
        ? `?redirect=${encodeURIComponent(redirectTo)}`
        : "";
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
        const { error } = await supabase.auth.signInWithOtp({
          email,
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

  return (
    <main className="p-8 md:p-24 h-screen" data-theme={config.colors.theme}>
      <div className="text-center mb-4">
        <Link href="/" className="btn btn-ghost btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Home
        </Link>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-8">
        {showForgotPassword
          ? "Reset Your Password"
          : showOtpVerification
            ? "Enter Passcode"
            : showOtpForm
              ? "Sign in with Passcode"
              : isSignUp
                ? "Sign up for"
                : "Sign in to"}{" "}
        {!showOtpForm &&
          !showForgotPassword &&
          !showOtpVerification &&
          config.appName}
      </h1>

      <div className="space-y-4 max-w-xl mx-auto">
        {showForgotPassword ? (
          /* Forgot Password Form */
          <>
            <form
              className="form-control w-full space-y-4"
              onSubmit={handleForgotPassword}
            >
              <div className="flex flex-col gap-0">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  required
                  name="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="input input-bordered w-full placeholder:opacity-60"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isDisabled}
                />
              </div>

              <div className="flex gap-2 w-full">
                <button
                  className="grow btn btn-outline"
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
                  className="grow btn btn-primary"
                  disabled={isLoading || isDisabled}
                  type="submit"
                >
                  {isLoading && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                  Send Reset Link
                </button>
              </div>
            </form>
          </>
        ) : showOtpVerification ? (
          /* OTP Verification Form */
          <>
            <form
              className="form-control w-full space-y-4"
              onSubmit={handleVerifyOtp}
            >
              <div className="flex flex-col gap-0">
                <label className="label">
                  <span className="label-text">
                    Enter one-time the passcode sent to your email
                  </span>
                </label>
                <input
                  required
                  name="otp"
                  type="text"
                  value={otpCode}
                  placeholder="123456"
                  className="input input-bordered w-full placeholder:opacity-40 text-center text-2xl tracking-widest"
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  data-1p-ignore
                />
              </div>

              <div className="flex gap-2 w-full">
                <button
                  className="grow btn btn-outline"
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
                  className="grow btn btn-primary"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                  Sign In
                </button>
              </div>
            </form>
          </>
        ) : showOtpForm ? (
          /* OTP Form */
          <>
            <form
              className="form-control w-full space-y-4"
              onSubmit={(e) => handleSignup(e, { type: "otp" })}
            >
              <div className="flex flex-col gap-0">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  required
                  name="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  placeholder="john-doe@gmail.com"
                  className="input input-bordered w-full placeholder:opacity-60"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isDisabled}
                />
              </div>

              <div className="flex gap-2 w-full">
                <button
                  className="grow btn btn-outline"
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
                  className="grow btn btn-primary"
                  disabled={isLoading || isDisabled}
                  type="submit"
                >
                  {isLoading && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                  Send Passcode
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link btn-sm"
                  onClick={() => setShowOtpVerification(true)}
                  disabled={isLoading}
                  data-1p-ignore
                >
                  Already have a passcode? Enter it here
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Email & Password Form */}
            <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input input-bordered w-full placeholder:opacity-30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isDisabled}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pr-10 placeholder:opacity-30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter your password"
                    disabled={isDisabled}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isDisabled}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Confirm Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="input input-bordered w-full pr-10 placeholder:opacity-30"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isDisabled}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isDisabled}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isSignUp &&
                (password.length > 0 || confirmPassword.length > 0) && (
                  <PasswordRequirements
                    password={password}
                    confirmPassword={confirmPassword}
                    onValidationChange={handleValidationChange}
                  />
                )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={
                  isLoading ||
                  isDisabled ||
                  (isSignUp && (!isPasswordValid || !passwordsMatch))
                }
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : isSignUp ? (
                  "Sign Up"
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="flex justify-center items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-link btn-sm"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setIsDisabled(false);
                    setConfirmPassword("");
                  }}
                  disabled={isLoading}
                >
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Sign Up"}
                </button>
                {!isSignUp && (
                  <>
                    <button
                      type="button"
                      className="btn btn-link btn-sm"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setEmail("");
                        setPassword("");
                      }}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </>
                )}
              </div>
            </form>

            <div className="divider text-xs text-base-content/50 font-medium pt-4">
              OR
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <button
                className="btn btn-primary"
                onClick={(e) =>
                  handleSignup(e, { type: "oauth", provider: "google" })
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 bg-white rounded-md p-1"
                    viewBox="0 0 48 48"
                  >
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
                className="btn btn-primary"
                onClick={() => setShowOtpForm(true)}
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#617BFF"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#fff"
                  className="w-6 h-6 bg-white rounded-md p-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                Continue with Passcode
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// This a login/singup page for Supabase Auth.
// Successfull login redirects to /api/auth/callback where the Code Exchange is processed (see app/api/auth/callback/route.js).
export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
