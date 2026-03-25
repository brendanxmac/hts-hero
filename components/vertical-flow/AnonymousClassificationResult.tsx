"use client";

import Link from "next/link";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
  DocumentArrowDownIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  TagIcon,
  DocumentTextIcon,
  ShareIcon,
  BookOpenIcon,
  ScaleIcon,
  BookmarkIcon,
} from "@heroicons/react/24/solid";
import { ClassificationI } from "../../interfaces/hts";

interface Props {
  classification: ClassificationI;
  classificationId?: string;
}

const BlurredMockSection = ({
  icon,
  iconBgClass,
  iconTextClass,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="relative rounded-2xl border border-base-content/15 bg-base-100 overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
    </div>
    <div className="relative z-10 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconBgClass} border border-current/20 shrink-0`}
        >
          <span className={iconTextClass}>{icon}</span>
        </div>
        <h3 className="text-lg font-bold text-base-content">{title}</h3>
      </div>
      <div className="select-none pointer-events-none blur-[6px]">
        {children}
      </div>
    </div>
  </div>
);

export const AnonymousClassificationResult = ({
  classification,
  classificationId,
}: Props) => {
  const redirectPath = classificationId
    ? `/classifications/${classificationId}`
    : "/classifications";
  const signUpHref = `/signin?redirect=${encodeURIComponent(redirectPath)}&sign-up=true`;
  const signInHref = `/signin?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Enhanced Sign-Up CTA */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5 shadow-xl shadow-primary/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="relative z-10 p-8 md:p-10 flex flex-col items-center text-center gap-8">
          {/* Icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-xl animate-pulse" />
            <div className="relative p-5 rounded-full bg-base-100 shadow-lg border border-primary/20">
              <LockClosedIcon className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-3 max-w-2xl">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-base-content">
              Your HTS Code is Ready!
            </h3>
            <p className="text-base-content/70 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              You just classified{" "}
              <span className="font-bold text-base-content">
                {classification.articleDescription}
              </span>
              . Create a FREE account to unlock your results, plus everything below!
            </p>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
            {[
              {
                icon: DocumentArrowDownIcon,
                title: "Defense Report",
                description:
                  "Download a detailed PDF report — your first line of defense in a customs audit",
                iconBg: "bg-error/15",
                iconBorder: "border-error/20",
                iconColor: "text-error",
              },
              {
                icon: BookOpenIcon,
                title: "Full Classification Logic",
                description:
                  "See which HTS notes, GRIs, and reasoning support each level of your classification",
                iconBg: "bg-success/15",
                iconBorder: "border-success/20",
                iconColor: "text-success",
              },
              {
                icon: ScaleIcon,
                title: "CROSS Rulings",
                description:
                  "Unlock CBP CROSS rulings that further validate and support your classification",
                iconBg: "bg-warning/15",
                iconBorder: "border-warning/20",
                iconColor: "text-warning",
              },
              {
                icon: GlobeAltIcon,
                title: "Unlimited Tariff Lookups",
                description:
                  "See duties and tariff rates for any country of origin, instantly",
                iconBg: "bg-secondary/15",
                iconBorder: "border-secondary/20",
                iconColor: "text-secondary",
              },
              {
                icon: ShareIcon,
                title: "Share with Clients & Team",
                description:
                  "Generate shareable links so clients and teammates can review your classification",
                iconBg: "bg-accent/15",
                iconBorder: "border-accent/20",
                iconColor: "text-accent",
              },
              {
                icon: BookmarkIcon,
                title: "Save & Review Results",
                description:
                  "Save your classification, assign importers, add notes, and come back anytime",
                iconBg: "bg-primary/15",
                iconBorder: "border-primary/20",
                iconColor: "text-primary",
              },
              {
                icon: SparklesIcon,
                title: `More Free Classifications!`,
                description:
                  "Find Audit-Ready HTS Codes for all of your imports / products",
                iconBg: "bg-primary/15",
                iconBorder: "border-primary/20",
                iconColor: "text-primary",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-xl bg-base-200/50 border border-base-content/10 text-left ${index === 6 ? "sm:col-span-2" : ""
                  }`}
              >
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg ${item.iconBg} ${item.iconBorder} border shrink-0 mt-0.5`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${item.iconColor}`} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-base-content">
                    {item.title}
                  </span>
                  <span className="text-xs text-base-content/60 leading-relaxed">
                    {item.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-xs text-base-content/50">
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4" />
              <span>Free forever plan</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-3 w-full max-w-sm">
            <Link
              href={signUpHref}
              className="w-full btn btn-primary btn-lg text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
            >
              Create Free Account
            </Link>
            <p className="text-sm text-base-content/50">
              Already have an account?{" "}
              <Link
                href={signInHref}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>


      {/* Blurred Classification Section */}
      <BlurredMockSection
        icon={<CheckCircleIcon className="w-5 h-5" />}
        iconBgClass="bg-success/20"
        iconTextClass="text-success"
        title="Classification"
      >
        <div className="flex flex-col gap-3">
          {classification.levels.map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success/20 shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-3/4 rounded bg-base-content/10 mb-2" />
                <div className="h-3 w-1/2 rounded bg-base-content/7" />
              </div>
            </div>
          ))}
        </div>
      </BlurredMockSection>

      {/* Blurred Tariffs & Duties Section */}
      <BlurredMockSection
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
        iconBgClass="bg-secondary/20"
        iconTextClass="text-secondary"
        title="Tariffs & Duties"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-10 rounded-xl bg-base-content/10" />
            <div className="flex-1 h-10 rounded-xl bg-base-content/10" />
          </div>
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-base-content/8" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-20 rounded-xl bg-base-content/6" />
              <div className="h-20 rounded-xl bg-base-content/6" />
              <div className="h-20 rounded-xl bg-base-content/6" />
            </div>
            <div className="h-24 rounded-xl bg-base-content/5" />
          </div>
        </div>
      </BlurredMockSection>

      {/* Blurred Share Section */}
      <BlurredMockSection
        icon={<ShareIcon className="w-5 h-5" />}
        iconBgClass="bg-accent/20"
        iconTextClass="text-accent"
        title="Share Classification"
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 rounded bg-base-content/10" />
          <div className="h-6 w-12 rounded-full bg-base-content/10" />
        </div>
      </BlurredMockSection>

      {/* Blurred Importer Section */}
      {/* <BlurredMockSection
        icon={<TagIcon className="w-5 h-5" />}
        iconBgClass="bg-primary/20"
        iconTextClass="text-primary"
        title="Assign Importer"
      >
        <div className="h-10 rounded-xl bg-base-content/10" />
      </BlurredMockSection> */}

      {/* Blurred Notes Section */}
      <BlurredMockSection
        icon={<DocumentTextIcon className="w-5 h-5" />}
        iconBgClass="bg-primary/20"
        iconTextClass="text-primary"
        title="Add Notes"
      >
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-base-content/10" />
          <div className="h-4 w-5/6 rounded bg-base-content/8" />
          <div className="h-4 w-4/6 rounded bg-base-content/7" />
          <div className="h-4 w-full rounded bg-base-content/9" />
          <div className="h-4 w-3/4 rounded bg-base-content/8" />
        </div>
      </BlurredMockSection>

      {/* Blurred Notes Section */}
      <BlurredMockSection
        icon={<DocumentTextIcon className="w-5 h-5" />}
        iconBgClass="bg-primary/20"
        iconTextClass="text-primary"
        title="Related CROSS Rulings"
      >
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-base-content/10" />
          <div className="h-4 w-5/6 rounded bg-base-content/8" />
          <div className="h-4 w-4/6 rounded bg-base-content/7" />
          <div className="h-4 w-full rounded bg-base-content/9" />
          <div className="h-4 w-3/4 rounded bg-base-content/8" />
        </div>
      </BlurredMockSection>

      <BlurredMockSection
        icon={<DocumentTextIcon className="w-5 h-5" />}
        iconBgClass="bg-primary/20"
        iconTextClass="text-primary"
        title="Classification Report"
      >
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-base-content/10" />
          <div className="h-4 w-5/6 rounded bg-base-content/8" />
          <div className="h-4 w-4/6 rounded bg-base-content/7" />
          <div className="h-4 w-full rounded bg-base-content/9" />
          <div className="h-4 w-3/4 rounded bg-base-content/8" />
        </div>
      </BlurredMockSection>
    </div>
  );
};
