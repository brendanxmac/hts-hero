"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/libs/supabase/client";
import toast from "react-hot-toast";
import config from "@/config";
import { useRouter } from "next/navigation";
import PasswordRequirements from "@/components/PasswordRequirements";

export default function ResetPassword() {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidToken, setIsValidToken] = useState<boolean>(false);
  const [isCheckingToken, setIsCheckingToken] = useState<boolean>(true);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has a valid session (from reset link)
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsValidToken(!!session);
      setIsCheckingToken(false);
    };

    checkSession();
  }, [supabase.auth]);

  const handleValidationChange = (
    isPasswordValid: boolean,
    passwordsMatch: boolean
  ) => {
    setCanSubmit(isPasswordValid && passwordsMatch);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.error("Please meet all password requirements");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
        // Redirect to app after successful password reset
        setTimeout(() => {
          router.push("/app");
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <main className="p-8 md:p-24" data-theme={config.colors.theme}>
        <div className="flex justify-center items-center min-h-[50vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </main>
    );
  }

  if (!isValidToken) {
    return (
      <main className="p-8 md:p-24" data-theme={config.colors.theme}>
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
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Invalid or Expired Link
          </h1>
          <p className="text-base-content/70">
            This password reset link is invalid or has expired. Please request a
            new password reset link.
          </p>
          <Link href="/signin" className="btn btn-primary">
            Back to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 md:p-24" data-theme={config.colors.theme}>
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
        Reset Your Password
      </h1>

      <div className="space-y-4 max-w-xl mx-auto">
        <form
          className="form-control w-full space-y-4"
          onSubmit={handleResetPassword}
        >
          <div className="flex flex-col gap-0">
            <label className="label">
              <span className="label-text">New Password</span>
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              autoComplete="new-password"
              className="input input-bordered w-full"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-0">
            <label className="label">
              <span className="label-text">Confirm New Password</span>
            </label>
            <input
              required
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              className="input input-bordered w-full"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <PasswordRequirements
            password={password}
            confirmPassword={confirmPassword}
            onValidationChange={handleValidationChange}
          />

          <button
            className="btn btn-primary btn-block"
            disabled={isLoading || !canSubmit}
            type="submit"
          >
            {isLoading && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
            Reset Password
          </button>

          <div className="text-center">
            <Link href="/signin" className="btn btn-link btn-sm">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
