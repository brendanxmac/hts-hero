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
    users: ["customs-broker", "manufacturer", "importer"],
  },
  {
    id: "bulk-classify",
    title: "Classify Thousands of Products Easily",
    icon: <SparklesIcon className="w-5 h-5" />,
    users: ["customs-broker", "manufacturer", "importer"],
  },
  {
    id: "review-approve",
    title: "Review & Approve Team Classifications",
    icon: <CheckBadgeIcon className="w-5 h-5" />,
    users: ["customs-broker", "manufacturer", "importer"],
  },
  {
    id: "share",
    title: "Share Classifications with Teammates & Clients",
    icon: <ShareIcon className="w-5 h-5" />,
    users: ["customs-broker", "freight-forwarder", "manufacturer", "importer"],
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
    </section>
  );
};

export default UseCases;
