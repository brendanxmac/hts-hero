"use client";

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import { useClassifications } from "../../contexts/ClassificationsContext";
import { useHts } from "../../contexts/HtsContext";
import { PDFProps } from "../../interfaces/ui";
import PDF from "../PDF";
import {
  CheckCircleIcon,
  TagIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
} from "@heroicons/react/16/solid";
import { UserProfile, UserRole } from "../../libs/supabase/user";
import {
  fetchImportersForUser,
  fetchImportersForTeam,
  createImporter,
} from "../../libs/supabase/importers";
import {
  ClassificationRecord,
  HtsElement,
  Importer,
} from "../../interfaces/hts";
import { updateClassification } from "../../libs/classification";
import Modal from "../Modal";
import ImporterDropdown from "../ImporterDropdown";
import { CountrySelection } from "../CountrySelection";
import { Countries, Country } from "../../constants/countries";
import { CountryTariff } from "../CountryTariff";
import {
  addTariffsToCountry,
  CountryWithTariffs,
  TariffsList,
  tariffIsApplicableToCode,
  getAdValoremRate,
  getAmountRatesString,
  get15PercentCountryTotalBaseRate,
} from "../../tariffs/tariffs";
import { TariffColumn } from "../../enums/tariff";
import { EuropeanUnionCountries } from "../../constants/countries";
import { Column2CountryCodes } from "../../tariffs/tariff-columns";
import { ContentRequirementI } from "../Element";
import { ContentRequirements } from "../../enums/tariff";
import {
  getHtsElementParents,
  generateBasisForClassification,
} from "../../libs/hts";
import { NumberInput } from "../NumberInput";
import { PercentageInput } from "../PercentageInput";
import { SecondaryLabel } from "../SecondaryLabel";
import { VerticalClassificationStep } from "./VerticalClassificationStep";
import { VerticalSectionDiscovery } from "./VerticalSectionDiscovery";
import { VerticalChapterDiscovery } from "./VerticalChapterDiscovery";
import { LevelConnector } from "../classification-ui/LevelConnector";
import {
  ShareIcon,
  LinkIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";
import apiClient from "../../libs/api";
import config from "@/config";

const ShareSection = ({
  classificationRecord,
}: {
  classificationRecord: ClassificationRecord;
}) => {
  const [isShared, setIsShared] = useState(
    classificationRecord.is_shared ?? false
  );
  const [shareToken, setShareToken] = useState(
    classificationRecord.share_token ?? null
  );
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : `https://${config.domainName}`}/c/${shareToken}`
    : null;

  const handleToggleShare = async () => {
    setIsToggling(true);
    try {
      const response: { share_token: string | null; is_shared: boolean } =
        await apiClient.post("/classification/share", {
          id: classificationRecord.id,
          enable: !isShared,
        });
      setIsShared(response.is_shared);
      setShareToken(response.share_token);
    } catch (error) {
      console.error("Error toggling share:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-base-300 bg-base-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShareIcon className="w-4 h-4 text-base-content/50" />
            <h3 className="text-sm font-semibold text-base-content">
              Share Classification
            </h3>
          </div>
          <label className="flex items-center cursor-pointer gap-2">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={isShared}
              onChange={handleToggleShare}
              disabled={isToggling}
            />
            {isToggling && (
              <span className="loading loading-spinner loading-xs" />
            )}
          </label>
        </div>
      </div>

      {isShared && shareUrl && (
        <div className="p-5">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200/50 border border-base-300 text-sm text-base-content/60 truncate font-mono">
              <LinkIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-xs">{shareUrl}</span>
            </div>
            <button
              className="btn btn-sm btn-primary gap-1.5 shrink-0"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface Props {
  userProfile: UserProfile;
  classificationRecord?: ClassificationRecord;
  onOpenExplore: () => void;
}

export const VerticalClassificationResult = ({
  userProfile,
  classificationRecord,
  onOpenExplore,
}: Props) => {
  const { classification, setClassification, classificationId, flushAndSave } =
    useClassification();
  const { refreshClassifications } = useClassifications();
  const { htsElements } = useHts();
  const { levels } = classification;
  const [showPDF, setShowPDF] = useState<PDFProps | null>(null);
  const element = classification.levels[levels.length - 1]?.selection;

  const canUpdateDetails =
    userProfile.role === UserRole.ADMIN ||
    userProfile.id === classificationRecord?.user_id;

  const basisTextareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeBasisTextarea = useCallback(() => {
    const textarea = basisTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useLayoutEffect(() => {
    resizeBasisTextarea();
  }, [classification.notes, classification.levels, resizeBasisTextarea]);

  useEffect(() => {
    if (
      classification.isComplete &&
      (classification.notes === undefined || classification.notes === null)
    ) {
      setClassification({
        ...classification,
        notes: generateBasisForClassification(classification),
      });
    }
  }, [classification.isComplete]);

  const [importers, setImporters] = useState<Importer[]>([]);
  const [selectedImporterId, setSelectedImporterId] = useState<string>("");
  const [isLoadingImporters, setIsLoadingImporters] = useState(true);
  const [newImporter, setNewImporter] = useState("");
  const [isCreatingImporter, setIsCreatingImporter] = useState(false);
  const [showCreateImporterModal, setShowCreateImporterModal] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(() => {
    if (classificationRecord?.country_of_origin) {
      return (
        Countries.find(
          (c) => c.code === classificationRecord.country_of_origin
        ) || null
      );
    }
    return null;
  });
  const [countryWithTariffs, setCountryWithTariffs] =
    useState<CountryWithTariffs | null>(null);
  const [tariffElement, setTariffElement] = useState<HtsElement | null>(null);
  const [customsValue, setCustomsValue] = useState<number>(10000);
  const [uiCustomsValue, setUiCustomsValue] = useState<number>(10000);
  const [units, setUnits] = useState<number>(1000);
  const [uiUnits, setUiUnits] = useState<number>(1000);
  const [contentRequirements, setContentRequirements] = useState<
    ContentRequirementI<ContentRequirements>[]
  >([]);
  const [uiContentPercentages, setUiContentPercentages] = useState<
    ContentRequirementI<ContentRequirements>[]
  >([]);

  const customsValueTimeoutRef = useState<NodeJS.Timeout | null>(null);
  const unitsTimeoutRef = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedImporters] = await Promise.all([
          userProfile.team_id
            ? fetchImportersForTeam(userProfile.team_id)
            : fetchImportersForUser(),
          refreshClassifications(),
        ]);
        setImporters(fetchedImporters);
        setIsLoadingImporters(false);

        if (classificationRecord) {
          setSelectedImporterId(classificationRecord.importer_id || "");
        }
      } catch (error) {
        console.error("Error fetching importers:", error);
        setIsLoadingImporters(false);
      }
    };

    fetchData();
  }, []);

  const findTariffElement = useCallback(
    (el: HtsElement): HtsElement => {
      if (el.general || el.special || el.other) {
        return el;
      }
      const parents = getHtsElementParents(el, htsElements);
      for (let i = parents.length - 1; i >= 0; i--) {
        const parent = parents[i];
        if (parent.general || parent.special || parent.other) {
          return parent;
        }
      }
      return el;
    },
    [htsElements]
  );

  useEffect(() => {
    if (tariffElement) {
      const codeBasedContentRequirements = Array.from(
        TariffsList.filter((t) =>
          tariffIsApplicableToCode(t, tariffElement.htsno)
        ).reduce((acc, t) => {
          if (t.contentRequirement) {
            acc.add(t.contentRequirement.content);
          }
          return acc;
        }, new Set<ContentRequirements>())
      );

      const newContentRequirements = codeBasedContentRequirements.map(
        (contentRequirement) => ({
          name: contentRequirement,
          value: 80,
        })
      );
      setContentRequirements(newContentRequirements);
      setUiContentPercentages(newContentRequirements);
    }
  }, [tariffElement]);

  useEffect(() => {
    if (element && selectedCountry) {
      const tariffEl = findTariffElement(element);
      setTariffElement(tariffEl);

      const newCountryWithTariffs = addTariffsToCountry(
        selectedCountry,
        element,
        tariffEl,
        contentRequirements,
        undefined,
        units,
        customsValue
      );
      setCountryWithTariffs(newCountryWithTariffs);
    } else {
      setCountryWithTariffs(null);
      setTariffElement(null);
    }
  }, [
    element,
    selectedCountry,
    contentRequirements,
    units,
    customsValue,
    findTariffElement,
  ]);

  const handleAddImporter = async () => {
    if (!newImporter.trim()) return;

    setIsCreatingImporter(true);
    try {
      const newImporterData = await createImporter(
        newImporter.trim(),
        userProfile.team_id || undefined
      );
      setImporters((prev) => [...prev, newImporterData]);
      setNewImporter("");
      setSelectedImporterId(newImporterData.id);
      await updateClassification(
        classificationId,
        undefined,
        newImporterData.id,
        undefined
      );
      await refreshClassifications();
    } catch (error) {
      console.error("Failed to create importer:", error);
    } finally {
      setIsCreatingImporter(false);
    }
  };

  const handleCustomsValueChange = (value: number) => {
    setUiCustomsValue(value);
    if (customsValueTimeoutRef[0]) {
      clearTimeout(customsValueTimeoutRef[0]);
    }
    const timeout = setTimeout(() => {
      setCustomsValue(value);
    }, 300);
    customsValueTimeoutRef[1](timeout);
  };

  const handleUnitsChange = (value: number) => {
    setUiUnits(value);
    if (unitsTimeoutRef[0]) {
      clearTimeout(unitsTimeoutRef[0]);
    }
    const timeout = setTimeout(() => {
      setUnits(value);
    }, 300);
    unitsTimeoutRef[1](timeout);
  };

  const handleSliderChange = (
    contentRequirement: ContentRequirements,
    value: number
  ) => {
    setUiContentPercentages((prev) =>
      prev.map((c) => (c.name === contentRequirement ? { ...c, value } : c))
    );
    setTimeout(() => {
      setContentRequirements((prev) =>
        prev.map((c) => (c.name === contentRequirement ? { ...c, value } : c))
      );
    }, 300);
  };

  if (!element) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tariffs & Duties */}
      <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-base-300 bg-base-200/30">
          <div className="flex items-center gap-2.5">
            <CurrencyDollarIcon className="w-4 h-4 text-base-content/50" />
            <h3 className="text-sm font-semibold text-base-content">
              Tariffs & Duties
            </h3>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <SecondaryLabel value="Country of Origin" />
                <CountrySelection
                  singleSelect
                  selectedCountries={selectedCountry ? [selectedCountry] : []}
                  setSelectedCountries={(countries) => {
                    const country = countries[0] || null;
                    setSelectedCountry(country);
                    if (classificationId) {
                      updateClassification(
                        classificationId,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        country?.code ?? null
                      ).then(() => refreshClassifications());
                    }
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <SecondaryLabel value="Customs Value (USD)" />
                <NumberInput
                  value={uiCustomsValue}
                  setValue={handleCustomsValueChange}
                  min={0}
                  prefix="$"
                />
              </div>
            </div>

            {countryWithTariffs &&
              (countryWithTariffs.baseTariffs
                ?.flatMap((t) => t.tariffs)
                ?.some((t) => t.type === "amount") ||
                uiContentPercentages.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {countryWithTariffs.baseTariffs
                    ?.flatMap((t) => t.tariffs)
                    ?.some((t) => t.type === "amount") && (
                    <div className="flex flex-col gap-2">
                      <SecondaryLabel value="Units / Weight" />
                      <NumberInput
                        value={uiUnits}
                        setValue={handleUnitsChange}
                        min={0}
                        subtext={
                          element &&
                          tariffElement &&
                          (element.units.length > 0 ||
                            tariffElement.units.length > 0)
                            ? `${[...element.units, ...tariffElement.units]
                                .reduce((acc: string[], unit: string) => {
                                  if (!acc.includes(unit)) {
                                    acc.push(unit);
                                  }
                                  return acc;
                                }, [])
                                .join(",")}`
                            : ""
                        }
                      />
                    </div>
                  )}

                  {uiContentPercentages.map((contentPercentage) => (
                    <div
                      key={`${contentPercentage.name}-content-requirement`}
                      className="flex flex-col gap-2"
                    >
                      <SecondaryLabel
                        value={`${contentPercentage.name} Value Percentage`}
                      />
                      <PercentageInput
                        value={contentPercentage.value}
                        onChange={(value) =>
                          handleSliderChange(contentPercentage.name, value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

            {selectedCountry && countryWithTariffs && tariffElement ? (
              <div className="mt-1">
                <CountryTariff
                  units={units}
                  customsValue={customsValue}
                  country={countryWithTariffs}
                  htsElement={element}
                  tariffElement={tariffElement}
                  contentRequirements={contentRequirements}
                  countryIndex={0}
                  countries={[countryWithTariffs]}
                  setCountries={(updater) => {
                    const updated =
                      typeof updater === "function"
                        ? updater([countryWithTariffs])
                        : updater;
                    setCountryWithTariffs(updated[0] || null);
                  }}
                  isModal={false}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-6 rounded-lg border border-base-300 bg-base-200/30">
                <GlobeAltIcon className="w-10 h-10 text-base-content/20 mb-3" />
                <h4 className="text-sm font-semibold text-base-content/70">
                  Select a Country of Origin
                </h4>
                <p className="text-xs text-base-content/40 mt-1 max-w-xs text-center">
                  Choose the country of origin to see applicable tariffs and
                  import duties.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Classification Progression */}
      <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-base-300 bg-base-200/30">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-4 h-4 text-success" />
            <h3 className="text-sm font-semibold text-base-content">
              Classification
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-success/10 text-[11px] font-semibold text-success">
              Complete
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col">
            {classification.preliminaryLevels &&
              classification.preliminaryLevels.length > 0 && (
                <>
                  <VerticalSectionDiscovery />
                  <LevelConnector isActive={false} hasPreviousSelection={true} />
                  <VerticalChapterDiscovery />
                  <LevelConnector isActive={false} hasPreviousSelection={true} />
                </>
              )}

            {levels.map((level, index) => (
              <div key={`level-${index}`}>
                {index > 0 && (
                  <div className="flex flex-col items-center py-2.5">
                    <div className="w-px h-2.5 bg-success/20" />
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success/10 border border-success/20">
                      <ChevronDownIcon className="w-3 h-3 text-success/60" />
                    </div>
                    <div className="w-px h-2.5 bg-success/10" />
                  </div>
                )}

                <VerticalClassificationStep
                  classificationLevel={index}
                  classificationRecord={classificationRecord}
                  onOpenExplore={onOpenExplore}
                  disableAutoScroll
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share */}
      {userProfile && classificationRecord && (
        <ShareSection classificationRecord={classificationRecord} />
      )}

      {/* Importer */}
      <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-base-300 bg-base-200/30">
          <div className="flex items-center gap-2.5">
            <TagIcon className="w-4 h-4 text-base-content/50" />
            <h3 className="text-sm font-semibold text-base-content">
              Importer
            </h3>
          </div>
        </div>

        <div className="p-5">
          <div className="flex gap-2">
            <ImporterDropdown
              importers={importers}
              selectedImporterId={selectedImporterId}
              onSelectionChange={(value) => {
                setSelectedImporterId(value);
                updateClassification(
                  classificationId,
                  undefined,
                  value || null,
                  undefined
                ).then(() => refreshClassifications());
              }}
              onCreateSelected={() => setShowCreateImporterModal(true)}
              isLoading={isLoadingImporters}
              disabled={!canUpdateDetails}
              showCreateOption={canUpdateDetails}
            />
            {selectedImporterId && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSelectedImporterId("");
                  updateClassification(
                    classificationId,
                    undefined,
                    null,
                    undefined
                  ).then(() => refreshClassifications());
                }}
                disabled={isLoadingImporters || !canUpdateDetails}
                title="Clear selected importer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basis for Classification */}
      <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-base-300 bg-base-200/30">
          <div className="flex items-center gap-2.5">
            <DocumentTextIcon className="w-4 h-4 text-base-content/50" />
            <h3 className="text-sm font-semibold text-base-content">
              Basis for Classification
            </h3>
          </div>
        </div>

        <div className="p-5">
          <textarea
            ref={basisTextareaRef}
            className={`whitespace-pre-wrap min-h-36 w-full px-4 py-3 rounded-lg border transition-all duration-150 placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none overflow-hidden text-sm leading-relaxed ${
              canUpdateDetails
                ? "bg-base-100 border-base-300 hover:border-base-content/30"
                : "bg-base-200/50 border-base-300 cursor-not-allowed opacity-60"
            }`}
            placeholder="Add any notes about your classification here"
            value={classification.notes ?? ""}
            disabled={!canUpdateDetails}
            onChange={(e) => {
              setClassification({
                ...classification,
                notes: e.target.value,
              });
              resizeBasisTextarea();
            }}
            onBlur={() => {
              flushAndSave();
            }}
          />
        </div>
      </div>

      {showPDF && (
        <PDF
          title={showPDF.title}
          bucket={showPDF.bucket}
          filePath={showPDF.filePath}
          isOpen={showPDF !== null}
          setIsOpen={(isOpen) => {
            if (!isOpen) {
              setShowPDF(null);
            }
          }}
        />
      )}

      <Modal
        isOpen={showCreateImporterModal}
        setIsOpen={setShowCreateImporterModal}
      >
        <div className="p-6 flex flex-col gap-4 min-w-80">
          <h3 className="text-lg font-semibold">Create New Importer</h3>
          <input
            type="text"
            placeholder="Importer name"
            value={newImporter}
            className="input input-bordered w-full"
            onChange={(e) => setNewImporter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newImporter.trim()) {
                handleAddImporter();
                setShowCreateImporterModal(false);
                setNewImporter("");
              }
            }}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setShowCreateImporterModal(false);
                setNewImporter("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                handleAddImporter();
                setShowCreateImporterModal(false);
                setNewImporter("");
              }}
              disabled={isCreatingImporter || !newImporter.trim()}
            >
              {isCreatingImporter ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
