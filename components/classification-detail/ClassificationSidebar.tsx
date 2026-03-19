"use client";

import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/logo.svg";
import { ClassificationI, ClassificationRecord } from "../../interfaces/hts";
import { ClassificationNavItem, NavTab } from "./useClassificationNav";
import { UserProfile } from "../../libs/supabase/user";
import ThemeToggle from "../ThemeToggle";
import ButtonAccount from "../ButtonAccount";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LockClosedIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";
import {
  EyeIcon,
  ListBulletIcon,
  ScaleIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  PaperClipIcon,
  DocumentTextIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getTutorialFromPathname, Tutorial, TutorialI } from "../Tutorial";
import { Product, userHasActivePurchaseForProduct } from "../../libs/supabase/purchase";
import { GiftIcon } from "@heroicons/react/24/solid";
import { useIsReadOnly } from "../../contexts/ReadOnlyContext";

interface Props {
  classification: ClassificationI;
  classificationRecord?: ClassificationRecord;
  latestHtsCode: string;
  navItems: ClassificationNavItem[];
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNavigateBack: () => void;
  isSaving: boolean;
  userProfile: UserProfile | null;
  isAnonymous: boolean;
}

function CopyableHtsCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  if (!code) {
    return (
      <p className="text-lg md:text-xl font-mono font-semibold text-base-content/70">
        —
      </p>
    );
  }

  return (
    <span className="relative inline-block">
      <span
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="text-lg md:text-xl font-mono font-semibold text-primary cursor-pointer"
      >
        {code}
      </span>
      <span
        className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-success text-white text-[10px] font-semibold whitespace-nowrap pointer-events-none transition-all duration-200 ${copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
      >
        Copied!
      </span>
    </span>
  );
}

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  overview: EyeIcon,
  "cross-rulings": ScaleIcon,
  "duty-tariffs": CurrencyDollarIcon,
  attachments: PaperClipIcon,
  "classification-report": DocumentTextIcon,
};

function StatusIndicator({ status }: { status: ClassificationNavItem["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="w-4 h-4 text-success shrink-0" />;
    case "active":
      return (
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
        </span>
      );
    case "pending":
      return (
        <span className="w-3 h-3 rounded-full border-2 border-base-content/20 shrink-0" />
      );
    default:
      return (
        <span className="w-3 h-3 rounded-full border-2 border-base-content/10 shrink-0" />
      );
  }
}

export const ClassificationSidebar = ({
  classification,
  classificationRecord,
  latestHtsCode,
  navItems,
  activeTab,
  onTabChange,
  onNavigateBack,
  isSaving,
  userProfile,
  isAnonymous,
}: Props) => {
  const readOnly = useIsReadOnly();
  const [classificationExpanded, setClassificationExpanded] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isPayingUser, setIsPayingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const pathname = usePathname();
  const tutorial = getTutorialFromPathname(pathname);

  const mainNavItems = navItems.filter((item) => !item.isSubItem);
  const classificationSubItems = navItems.filter((item) => item.isSubItem);
  const isClassificationTabActive = classificationSubItems.some(
    (item) => item.id === activeTab
  );

  useEffect(() => {
    const fetchIsPayingUser = async () => {
      if (userProfile) {
        const isPayingUser = await userHasActivePurchaseForProduct(userProfile.id, Product.CLASSIFY);
        setIsPayingUser(isPayingUser);
        setIsLoading(false);
      }
    };

    if (userProfile) {
      fetchIsPayingUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Logo & Back */}
        <div className="p-4 pb-0">
          <div className="flex gap-3 justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 px-2 py-1.5 mb-3"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-5"
                priority
                width={24}
                height={24}
              />
              <span className="font-bold text-sm text-base-content">
                {config.appName}
              </span>
            </Link>
            <ThemeToggle />
          </div>

          {readOnly ? (
            <div className="flex items-center gap-2 text-xs font-medium text-primary/70 px-2 py-1.5 -ml-0.5 rounded-lg bg-primary/5 border border-primary/10 w-full">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Shared Classification
            </div>
          ) : (
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-2 text-xs font-medium text-base-content/60 hover:text-primary transition-colors px-2 py-1.5 -ml-0.5 rounded-lg hover:bg-base-300/50 w-full"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              Back to Classifications
              {isSaving && (
                <span className="loading loading-spinner loading-xs ml-auto" />
              )}
            </button>
          )}
        </div>

        {/* Item Info */}
        <div className="px-4 py-3">
          <div className="px-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mb-1">
              Item Description
            </p>
            <p className="text-sm font-medium text-base-content leading-snug">
              {classification?.articleDescription || "—"}
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 mt-3 mb-1">
              HTS Code
            </p>
            <CopyableHtsCode code={latestHtsCode} />
          </div>
        </div>

        {/* Divider */}
        <div className="px-4">
          <div className="h-px bg-base-300" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="flex flex-col gap-0.5">
            {/* Overview */}
            {mainNavItems
              .filter((item) => item.id === "overview")
              .map((item) => {
                const Icon = NAV_ICONS[item.id] || EyeIcon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                        ? "bg-primary/10 text-primary border-l-2 border-primary -ml-px"
                        : "text-base-content/70 hover:bg-base-300/50 hover:text-base-content"
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  </li>
                );
              })}

            {/* Classification Section (expandable) */}
            {classificationSubItems.length > 0 && (
              <li>
                <button
                  onClick={() =>
                    setClassificationExpanded(!classificationExpanded)
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isClassificationTabActive && !classificationExpanded
                    ? "bg-primary/10 text-primary"
                    : "text-base-content/70 hover:bg-base-300/50 hover:text-base-content"
                    }`}
                >
                  <ListBulletIcon className="w-4 h-4 shrink-0" />
                  Classification
                  <ChevronDownIcon
                    className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${classificationExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                  />
                </button>

                {/* Sub-items */}
                {classificationExpanded && (
                  <ul className="ml-4 pl-3 border-l border-base-300 mt-0.5 flex flex-col gap-0.5">
                    {classificationSubItems.map((item) => {
                      const isActive = activeTab === item.id;
                      const hasSelection = item.status === "completed" && (item.htsno || item.selectionDescription);

                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${isActive
                              ? "bg-primary/10 text-primary"
                              : "text-base-content/60 hover:bg-base-300/50 hover:text-base-content"
                              }`}
                          >
                            <StatusIndicator status={item.status} />
                            {hasSelection ? (
                              <span className="flex flex-col items-start min-w-0">
                                {item.htsno && (
                                  <span className="font-mono font-semibold text-[11px] truncate max-w-full">
                                    {item.htsno}
                                  </span>
                                )}
                                {item.selectionDescription && (
                                  <span className="text-[10px] font-normal text-base-content/40 truncate max-w-full leading-tight">
                                    {item.selectionDescription}
                                  </span>
                                )}
                              </span>
                            ) : item.status === "active" ? (
                              "Current Level"
                            ) : (
                              item.label
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            )}

            {/* Remaining main nav items */}
            {mainNavItems
              .filter((item) => item.id !== "overview")
              .map((item) => {
                const Icon = NAV_ICONS[item.id] || ChevronRightIcon;
                const isActive = activeTab === item.id;
                    const showLock = !readOnly && isAnonymous && item.lockedForAnon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                        ? "bg-primary/10 text-primary border-l-2 border-primary -ml-px"
                        : "text-base-content/70 hover:bg-base-300/50 hover:text-base-content"
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {showLock && (
                        <LockClosedIcon className="w-3.5 h-3.5 text-base-content/30 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* Divider */}
        <div className="h-px bg-base-300" />


        {/* User Footer */}
        <div className="w-full flex flex-col p-3 items-center">
          {readOnly ? (
            <div className="w-full px-1">
              <Link
                href="/classify"
                className="btn btn-primary w-full gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                Try It Free
              </Link>
            </div>
          ) : (
            <>
              <div className="w-full px-2 flex items-center gap-2">
                {!isAnonymous && (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <ButtonAccount />
                    {userProfile && (
                      <span className="text-xs text-base-content/50 truncate">
                        {userProfile.name || userProfile.email}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  {tutorial && (
                    <button
                      className="btn btn-ghost btn-sm btn-circle"
                      onClick={() => setShowTutorial(true)}
                      title="Tutorial"
                    >
                      <PlayIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Upgrade / CTA */}
              {isAnonymous ? (
                <div className="w-full px-1">
                  <Link
                    href={`/signin?redirect=/classifications/${classificationRecord?.id || ""}`}
                    className="btn btn-primary w-full gap-2"
                  >
                    <GiftIcon className="w-4 h-4" />
                    Get 10 FREE Classifications
                  </Link>
                </div>
              ) : isPayingUser || isLoading ? null : (
                <div className="w-full mt-3 px-1">
                  <Link
                    href="/classifications"
                    className="w-full btn btn-sm btn-primary gap-2"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Upgrade to Pro
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {tutorial && (
        <Tutorial
          tutorial={tutorial}
          showTutorial={showTutorial}
          setShowTutorial={setShowTutorial}
        />
      )}
    </>
  );
};
