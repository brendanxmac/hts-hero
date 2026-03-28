"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import { useClassification } from "../../../contexts/ClassificationContext";
import { useUser } from "../../../contexts/UserContext";
import { MixpanelEvent, trackEvent } from "../../../libs/mixpanel";
import { canCreateClassification } from "../../../libs/can-create-classification";
import Modal from "../../../components/Modal";
import ConversionPricing from "../../../components/ConversionPricing";
import { SignUpGateCTA } from "../../../components/SignUpGateCTA";
import TextAreaInput from "../../../components/TextAreaInput";
import toast from "react-hot-toast";
import { CheckCircleIcon } from "@heroicons/react/16/solid";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { NUM_FREE_CLASSIFICATIONS } from "../../../constants/classification";
import {
  isValidTenDigitHtsInput,
  normalizeHtsCode,
} from "../../../libs/hts-code";

const TIPS = [
  { text: "Include size, material, weight, color" },
  { text: "Describe components & dominant material" },
  { text: "Mention intended audience (children, professionals, etc.)" },
  { text: "Specify intended use (commercial, personal, household, etc.)" },
];

type InputMode = "description" | "hts_code";

function NewClassificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const {
    startNewClassification,
    startClassificationFromHtsCode,
    setArticleDescription,
    resetClassificationState,
  } = useClassification();
  const [showPricing, setShowPricing] = useState(false);
  const [showSignUpGate, setShowSignUpGate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("description");
  const [localDescription, setLocalDescription] = useState("");
  const [localHtsCode, setLocalHtsCode] = useState("");
  const [htsFocused, setHtsFocused] = useState(false);
  const hasAutoSubmittedRef = useRef(false);

  const productParam = searchParams.get("product") || "";

  useEffect(() => {
    resetClassificationState();
  }, []);

  useEffect(() => {
    if (productParam && !hasAutoSubmittedRef.current) {
      setLocalDescription(productParam);
      hasAutoSubmittedRef.current = true;
    }
  }, [productParam]);

  const descriptionCanSubmit = localDescription.trim().length > 0;
  const htsCanSubmit = isValidTenDigitHtsInput(localHtsCode);
  const canSubmit =
    inputMode === "description" ? descriptionCanSubmit : htsCanSubmit;

  const signUpGateDescription =
    inputMode === "hts_code"
      ? `HTS code: ${normalizeHtsCode(localHtsCode.trim())}`
      : localDescription.trim();

  const createClassificationRecord = async () => {
    if (inputMode === "description") {
      return startNewClassification(localDescription, true);
    }
    return startClassificationFromHtsCode(localHtsCode.trim());
  };

  const reportClassificationEvent = (newId: string, mixpanelBase: Record<string, unknown>) => {
    if (!user) {
      trackEvent(MixpanelEvent.ANONYMOUS_CLASSIFICATION_STARTED, {
        classification_id: newId,
        source: "classifications_new_form",
        entry_point: "classifications_new",
        ...mixpanelBase,
      });
    } else {
      trackEvent(MixpanelEvent.CLASSIFICATION_STARTED, {
        ...mixpanelBase,
        entry_point: "classifications_new",
      });
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);

    try {
      const {
        allowed,
        blockReason,
        isPayingUser,
        isOnTeam,
        classificationCount,
      } = await canCreateClassification(user);

      if (!allowed) {
        if (blockReason === "anonymous_limit_reached") {
          setShowSignUpGate(true);
        } else {
          if (inputMode === "description") {
            setArticleDescription(localDescription);
          } else {
            setArticleDescription(signUpGateDescription);
          }
          trackEvent(MixpanelEvent.CLICKED_CLASSIFY_PRO_UPGRADE, {
            entry_point: "new_classification",
            input_mode: inputMode,
          });
          setShowPricing(true);
        }
        setLoading(false);
        return;
      }

      const classificationId = await createClassificationRecord();

      const entryModeProp =
        inputMode === "hts_code" ? "hts_code_entry" : "product_description";

      if (!user) {
        reportClassificationEvent(classificationId, {
          item:
            inputMode === "description"
              ? localDescription
              : normalizeHtsCode(localHtsCode.trim()),
          entry_mode: entryModeProp,
        });
      } else {
        const count = classificationCount ?? 0;
        const isTrialUserWithinLimit =
          !isPayingUser && !isOnTeam && count < NUM_FREE_CLASSIFICATIONS;
        reportClassificationEvent(classificationId, {
          item:
            inputMode === "description"
              ? localDescription
              : normalizeHtsCode(localHtsCode.trim()),
          is_paying_user: isPayingUser,
          is_team_member: isOnTeam,
          is_trial_user: isTrialUserWithinLimit,
          classification_count: count,
          entry_mode: entryModeProp,
        });
      }

      router.replace(`/classifications/${classificationId}`);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error(
        message.length > 0 && message.length < 220
          ? message
          : "Something went wrong. Please try again or contact support."
      );
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] flex items-start justify-center bg-base-100 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl mx-auto px-5 sm:px-6 pt-10 sm:pt-16 md:pt-20 pb-16">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-1.5 text-sm font-medium text-base-content/40 hover:text-base-content/70 transition-colors mb-8 sm:mb-10"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
          Back
        </button>

        {/* Subtle mode switch — above title; neutral, easy to ignore */}
        {user && <div className="flex justify-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs text-base-content/[0.28]">
            <span
              className={
                inputMode === "description"
                  ? "text-base-content/[0.38]"
                  : "text-base-content/[0.22]"
              }
            >
              Description
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={inputMode === "hts_code"}
              aria-label="Use HTS code instead of description"
              onClick={() =>
                setInputMode((m) =>
                  m === "description" ? "hts_code" : "description"
                )
              }
              className="relative h-3.5 w-7 shrink-0 rounded-full border border-base-content/[0.07] bg-base-content/[0.035] transition-[border-color,background-color] hover:border-base-content/[0.11] hover:bg-base-content/[0.05] focus:outline-none focus-visible:ring-1 focus-visible:ring-base-content/15 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute left-[1px] top-1/2 block h-2 w-2 -translate-y-1/2 rounded-full bg-base-content/[0.22] transition-transform duration-200 ease-out ${inputMode === "hts_code" ? "translate-x-4" : ""
                  }`}
              />
            </button>
            <span
              className={
                inputMode === "hts_code"
                  ? "text-base-content/[0.38]"
                  : "text-base-content/[0.22]"
              }
            >
              HTS code
            </span>
          </div>
        </div>}

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-base-content mb-3">
            {inputMode === "hts_code"
              ? "Enter an HTS code"
              : "Describe Your Product"}
          </h1>
          <p className="text-base text-base-content/50 max-w-2xl mx-auto leading-relaxed">
            {inputMode === "hts_code"
              ? "Provide a 10-digit US HTS code & we will give you the full classification path"
              : "Enter a detailed product description to begin your classification"}
          </p>
        </div>

        {/* Input card */}
        <div className="mb-8">
          {inputMode === "description" ? (
            <TextAreaInput
              buttonText="Start Classification"
              placeholder="e.g. Men's 100% cotton denim jeans, dyed blue & pre-washed for an athletic figure"
              defaultValue={productParam}
              onChange={(value) => setLocalDescription(value)}
              onSubmit={handleSubmit}
              canSubmit={descriptionCanSubmit}
              loading={loading}
            />
          ) : (
            <div
              className={`w-full flex flex-col gap-3 rounded-2xl transition-all duration-200 border ${htsFocused
                ? "bg-base-100 ring-2 ring-primary/50 border-primary/30"
                : "bg-base-100/80 hover:bg-base-100 border-base-content/10 hover:border-primary/30"
                }`}
            >
              <div className="px-4 pt-4 pb-2">
                <label
                  htmlFor="new-classification-hts-code"
                  className="text-xs font-semibold uppercase tracking-wider text-base-content/60"
                >
                  10-digit HTS code
                </label>
                <input
                  id="new-classification-hts-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                  placeholder="e.g. 8458.91.50.70"
                  value={localHtsCode}
                  onChange={(e) => setLocalHtsCode(e.target.value)}
                  onFocus={() => setHtsFocused(true)}
                  onBlur={() => setHtsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && htsCanSubmit && !loading) {
                      e.preventDefault();
                      void handleSubmit();
                    }
                  }}
                  className="mt-2 w-full bg-transparent text-lg font-mono font-medium text-base-content placeholder:text-base-content/30 outline-none border-0 focus:ring-0"
                />
                <p className="mt-1 text-xs text-base-content/45">
                  Dots and spaces optional. Must resolve to exactly 10 digits in chapters 1-97.
                </p>
              </div>
              <div className="px-4 pb-4">
                <button
                  type="button"
                  className="btn btn-primary w-full gap-2 rounded-xl min-h-[2.75rem] font-semibold"
                  disabled={!htsCanSubmit || loading}
                  onClick={() => void handleSubmit()}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : null}
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        {inputMode === "description" && (
          <div>
            <span className="block text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-4 text-center">
              Tips for Best Results
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-base-200/50 border border-base-content/[0.06]"
                >
                  <CheckCircleIcon className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-base-content/60 leading-relaxed">
                    {tip.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showPricing && (
        <Modal isOpen={showPricing} setIsOpen={setShowPricing}>
          <ConversionPricing />
        </Modal>
      )}
      {showSignUpGate && (
        <Modal isOpen={showSignUpGate} setIsOpen={setShowSignUpGate}>
          <SignUpGateCTA articleDescription={signUpGateDescription} />
        </Modal>
      )}
    </main>
  );
}

export default function NewClassificationPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-100">
          <span className="loading loading-spinner loading-lg text-primary" />
        </main>
      }
    >
      <NewClassificationContent />
    </Suspense>
  );
}
