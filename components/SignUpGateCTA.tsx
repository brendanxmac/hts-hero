"use client";

import Link from "next/link";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { NUM_FREE_CLASSIFICATIONS } from "../constants/classification";

interface SignUpGateCTAProps {
  articleDescription?: string;
  classificationId?: string;
}

export const SignUpGateCTA = ({
  articleDescription,
  classificationId,
}: SignUpGateCTAProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/15 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 p-8 md:p-10 flex flex-col items-center text-center gap-6">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-xl animate-pulse" />
          <div className="relative p-4 rounded-full bg-base-100 shadow-lg border border-primary/20">
            <LockClosedIcon className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2 max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-extrabold text-base-content">
            You&apos;re Almost There!
          </h3>
          <p className="text-base-content/70 text-base md:text-lg leading-relaxed">
            Create a free account to get the HTS Code for your <span className="font-bold">{articleDescription}</span> and download
            your audit-ready classification report.
          </p>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
          {[
            {
              icon: SparklesIcon,
              text: `${NUM_FREE_CLASSIFICATIONS} free classifications`,
            },
            {
              icon: ShieldCheckIcon,
              text: "No credit card required",
            },
            {
              icon: DocumentCheckIcon,
              text: "Audit-ready PDF reports",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-base-200/60 border border-base-content/10"
            >
              <item.icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-base-content/80">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Link
            href={`/signin?redirect=${encodeURIComponent(classificationId ? `/classifications/${classificationId}` : "/classifications")}&sign-up=true`}
            className="flex-1 btn btn-primary btn-lg text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
          >
            Create Free Account
          </Link>
        </div>

        <p className="text-sm text-base-content/50">
          Already have an account?{" "}
          <Link
            href={`/signin?redirect=${encodeURIComponent(classificationId ? `/classifications/${classificationId}` : "/classifications")}`}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
