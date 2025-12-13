"use client";

import { useState } from "react";
import {
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  TruckIcon,
  CubeIcon,
  DocumentTextIcon,
  CalculatorIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  MapIcon,
  ClipboardDocumentCheckIcon,
  ShareIcon,
  CheckBadgeIcon,
  SparklesIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/utilities/style";

type UserType =
  | "customs-broker"
  | "manufacturer"
  | "freight-forwarder"
  | "importer";

interface UserAvatar {
  id: UserType;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: "primary" | "secondary";
}

interface JobItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  users: UserType[];
}

const userAvatars: UserAvatar[] = [
  {
    id: "customs-broker",
    title: "Customs Brokers",
    description:
      "Classify faster, generate client reports instantly, and stay ahead of tariff changes",
    icon: <DocumentTextIcon className="w-7 h-7" />,
    accentColor: "primary",
  },
  {
    id: "manufacturer",
    title: "Manufacturers",
    description:
      "Classify with confidence, know your import costs, find savings, and get notified when tariffs affect your supply chain",
    icon: <BuildingOffice2Icon className="w-7 h-7" />,
    accentColor: "secondary",
  },
  {
    id: "freight-forwarder",
    title: "Freight Forwarders",
    description:
      "Provide accurate duty quotes and help clients understand their total landed costs",
    icon: <TruckIcon className="w-7 h-7" />,
    accentColor: "primary",
  },
  {
    id: "importer",
    title: "Importers & Brands",
    description:
      "Verify HTS codes, monitor tariff impacts, and discover exemptions you might be missing",
    icon: <BuildingStorefrontIcon className="w-7 h-7" />,
    accentColor: "secondary",
  },
];

const jobItems: JobItem[] = [
  {
    id: "classification",
    title: "HTS Classification",
    icon: <CubeIcon className="w-5 h-5" />,
    users: ["customs-broker", "manufacturer", "importer"],
  },
  {
    id: "duty-quotes",
    title: "Duty Quotes for Any Import",
    icon: <CalculatorIcon className="w-5 h-5" />,
    users: ["customs-broker", "manufacturer", "freight-forwarder", "importer"],
  },
  {
    id: "tariffs",
    title: "See Every Tariff for Any Import",
    icon: <GlobeAltIcon className="w-5 h-5" />,
    users: ["customs-broker", "manufacturer", "freight-forwarder", "importer"],
  },
  {
    id: "savings",
    title: "Discover Savings - Exemptions & Trade Programs",
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    users: ["customs-broker", "manufacturer", "freight-forwarder", "importer"],
  },
  {
    id: "reports",
    title: "Create Classification Advisory Reports",
    icon: <DocumentTextIcon className="w-5 h-5" />,
    users: ["customs-broker"],
  },
  {
    id: "notifications",
    title: "Get Notified When New Tariffs Affect Your Imports",
    icon: <BellAlertIcon className="w-5 h-5" />,
    users: ["manufacturer", "importer"],
  },
  {
    id: "cheapest-country",
    title: "Find the Cheapest Country to Import From",
    icon: <MapIcon className="w-5 h-5" />,
    users: ["manufacturer", "importer"],
  },
  {
    id: "verify-catalog",
    title: "Verify HTS Codes for Your Entire Catalog",
    icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />,
    users: ["customs-broker", "importer"],
  },
  {
    id: "bulk-classify",
    title: "Classify Thousands of Products Easily",
    icon: <SparklesIcon className="w-5 h-5" />,
    users: ["customs-broker", "importer"],
  },
  {
    id: "review-approve",
    title: "Review & Approve Team Classifications",
    icon: <CheckBadgeIcon className="w-5 h-5" />,
    users: ["customs-broker"],
  },
  {
    id: "share",
    title: "Share Classifications with Teammates & Clients",
    icon: <ShareIcon className="w-5 h-5" />,
    users: ["customs-broker", "freight-forwarder"],
  },
];

const UseCases = ({
  handleBookDemoClick,
}: {
  handleBookDemoClick: () => void;
}) => {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(
    "customs-broker"
  );

  const filteredJobs = selectedUser
    ? jobItems.filter((job) => job.users.includes(selectedUser))
    : jobItems;

  const selectedAvatar = userAvatars.find((a) => a.id === selectedUser);

  return (
    <section id="use-cases" className="relative overflow-hidden bg-base-100">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Combined Section Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-px bg-secondary/40" />
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Use Cases
            </span>
            <span className="w-8 h-px bg-secondary/40" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Get Your Job Done,{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Quick
            </span>{" "}
          </h2>
          {/* <p className="text-base-content/60 text-base md:text-lg max-w-2xl mx-auto">
            Select your role to see how HTS Hero can help you
          </p> */}
        </div>

        {/* User Avatar Selector */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {userAvatars.map((avatar) => {
            const isSelected = selectedUser === avatar.id;
            const isPrimary = avatar.accentColor === "primary";

            return (
              <button
                key={avatar.id}
                onClick={() => setSelectedUser(isSelected ? null : avatar.id)}
                className={classNames(
                  "group relative flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-300",
                  isSelected
                    ? isPrimary
                      ? "bg-primary/10 border-primary shadow-lg shadow-primary/20"
                      : "bg-secondary/10 border-secondary shadow-lg shadow-secondary/20"
                    : "bg-base-100 border-base-content/10 hover:border-base-content/30 hover:shadow-md"
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div
                    className={classNames(
                      "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center",
                      isPrimary ? "bg-primary" : "bg-secondary"
                    )}
                  >
                    <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={classNames(
                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                    isSelected
                      ? isPrimary
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary/20 text-secondary"
                      : "bg-base-200 text-base-content/60 group-hover:bg-base-300"
                  )}
                >
                  {avatar.icon}
                </div>

                {/* Title */}
                <span
                  className={classNames(
                    "font-semibold text-sm md:text-base transition-colors",
                    isSelected
                      ? isPrimary
                        ? "text-primary"
                        : "text-secondary"
                      : "text-base-content"
                  )}
                >
                  {avatar.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Jobs Section */}
        <div
          className={classNames(
            "relative rounded-3xl border p-6 md:p-10 transition-all duration-500",
            selectedUser
              ? selectedAvatar?.accentColor === "primary"
                ? "bg-gradient-to-br from-primary/5 via-base-100 to-primary/5 border-primary/20"
                : "bg-gradient-to-br from-secondary/5 via-base-100 to-secondary/5 border-secondary/20"
              : "bg-gradient-to-br from-base-200/50 via-base-100 to-base-200/50 border-base-content/10"
          )}
        >
          {/* Section Header */}
          <div className="mb-8 text-center">
            {selectedAvatar ? (
              <div className="animate-in fade-in duration-300">
                <h3
                  className={classNames(
                    "text-xl md:text-2xl font-bold",
                    selectedAvatar.accentColor === "primary"
                      ? "text-primary"
                      : "text-secondary"
                  )}
                >
                  How We Help {selectedAvatar.title}
                </h3>
                <p className="text-base-content/60 text-sm md:text-base mb-2">
                  {selectedAvatar.description}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-base-content/50 text-sm mb-2">
                  Select a role above to see relevant capabilities
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-base-content">
                  Everything We Help With
                </h3>
              </div>
            )}
          </div>

          {/* Jobs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className={classNames(
                  "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                  "bg-base-100/80 hover:bg-base-100",
                  selectedUser
                    ? selectedAvatar?.accentColor === "primary"
                      ? "border-primary/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                      : "border-secondary/10 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5"
                    : "border-base-content/5 hover:border-base-content/20 hover:shadow-md"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className={classNames(
                    "flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-all duration-300",
                    selectedUser
                      ? selectedAvatar?.accentColor === "primary"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                      : "bg-base-200 text-base-content/60"
                  )}
                >
                  {job.icon}
                </div>

                {/* Title */}
                <span
                  className={classNames(
                    "font-medium transition-colors",
                    selectedUser
                      ? selectedAvatar?.accentColor === "primary"
                        ? "text-base-content group-hover:text-primary"
                        : "text-base-content group-hover:text-secondary"
                      : "text-base-content/80 group-hover:text-base-content"
                  )}
                >
                  {job.title}
                </span>
              </div>
            ))}
          </div>

          {/* Show All Prompt */}
          {selectedUser && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setSelectedUser(null)}
                className="text-sm text-base-content/50 hover:text-base-content transition-colors underline underline-offset-2"
              >
                Show all {jobItems.length} jobs →
              </button>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {/* <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-base-content/60 text-sm md:text-base">
            Want to see how HTS Hero can help you or your team?
          </p>
          <button
            onClick={handleBookDemoClick}
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <span>Book a Demo</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default UseCases;
