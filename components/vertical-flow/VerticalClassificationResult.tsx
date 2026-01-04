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
import { ClassifyPage } from "../../enums/classify";
import { CollapsibleSection } from "../CollapsibleSection";
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
import {
  ClassificationDetailsSummary,
  TariffDutiesSummary,
} from "../classification-ui";

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

  // Ref for auto-growing textarea
  const basisTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  const resizeBasisTextarea = useCallback(() => {
    const textarea = basisTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  // Resize on mount and when classification changes
  useLayoutEffect(() => {
    resizeBasisTextarea();
  }, [classification.notes, classification.levels, resizeBasisTextarea]);

  // State for importers
  const [importers, setImporters] = useState<Importer[]>([]);
  const [selectedImporterId, setSelectedImporterId] = useState<string>("");
  const [isLoadingImporters, setIsLoadingImporters] = useState(true);
  const [newImporter, setNewImporter] = useState("");
  const [isCreatingImporter, setIsCreatingImporter] = useState(false);
  const [showCreateImporterModal, setShowCreateImporterModal] = useState(false);

  // Tariff calculation state - initialize from classificationRecord if available
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

  // Debounce refs
  const customsValueTimeoutRef = useState<NodeJS.Timeout | null>(null);
  const unitsTimeoutRef = useState<NodeJS.Timeout | null>(null);

  // Fetch importers on component mount
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

  // Find the tariff element (the element with actual tariff data)
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

  // Update content requirements when tariff element changes
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

  // Update tariffs when element or country changes
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

  // Handlers
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

  // Tariff summary rates for collapsed view - derived from countryWithTariffs
  const tariffSummaryRates = useMemo(() => {
    if (!selectedCountry || !countryWithTariffs || !tariffElement) {
      return [];
    }

    const { baseTariffs, tariffSets } = countryWithTariffs;
    const isOtherColumnCountry = Column2CountryCodes.includes(
      selectedCountry.code
    );
    const is15PercentCapCountry =
      EuropeanUnionCountries.includes(selectedCountry.code) ||
      selectedCountry.code === "JP" ||
      selectedCountry.code === "KR";

    const tariffColumn = isOtherColumnCountry
      ? TariffColumn.OTHER
      : TariffColumn.GENERAL;

    const adValoremEquivalentRate = get15PercentCountryTotalBaseRate(
      baseTariffs.flatMap((t) => t.tariffs),
      customsValue,
      units
    );

    const filteredBase = baseTariffs.flatMap((t) => t.tariffs);

    // Calculate rates for each tariff set
    return tariffSets.map((tariffSet) => {
      const isArticleSet =
        tariffSet.name === "Article" || tariffSet.name === "";
      const shouldIncludeBaseTariffs =
        isArticleSet &&
        !(is15PercentCapCountry && adValoremEquivalentRate < 15);

      const adValoremRate = shouldIncludeBaseTariffs
        ? getAdValoremRate(tariffColumn, tariffSet.tariffs, filteredBase)
        : getAdValoremRate(tariffColumn, tariffSet.tariffs);

      const hasAmountTariffs =
        shouldIncludeBaseTariffs &&
        filteredBase.some((t) => t.type === "amount");

      // For display name:
      // - "Article" or empty -> empty string (no label prefix)
      // - Content names -> remove " Content" suffix if present (e.g., "Aluminum Content" -> "Aluminum")
      let displayName = "";
      if (!isArticleSet) {
        displayName = tariffSet.name.replace(/ Content$/i, "");
      }

      return {
        name: displayName,
        rate: adValoremRate,
        hasAmountTariffs,
        amountRatesString: hasAmountTariffs
          ? getAmountRatesString(filteredBase)
          : null,
      };
    });
  }, [selectedCountry, countryWithTariffs, tariffElement, customsValue, units]);

  if (!element) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tariffs & Duties Section */}
      <CollapsibleSection
        title="Tariffs & Duties"
        // subtitle="See import cost estimates for any country of origin"
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
        iconBgClass="bg-secondary/20"
        iconTextClass="text-secondary"
        collapsedContent={
          <TariffDutiesSummary
            selectedCountry={selectedCountry}
            tariffRates={tariffSummaryRates}
          />
        }
        collapsedContentInline
      >
        <div className="flex flex-col gap-5">
          {/* Country & Value Inputs */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Country Selection */}
            <div className="flex-1 flex flex-col gap-2">
              <SecondaryLabel value="Country of Origin" />
              <CountrySelection
                singleSelect
                selectedCountries={selectedCountry ? [selectedCountry] : []}
                setSelectedCountries={(countries) => {
                  const country = countries[0] || null;
                  setSelectedCountry(country);
                  // Save country_of_origin to the classification record
                  if (classificationId) {
                    updateClassification(
                      classificationId,
                      undefined,
                      undefined,
                      undefined,
                      undefined,
                      country?.code || undefined
                    ).then(() => refreshClassifications());
                  }
                }}
              />
            </div>

            {/* Customs Value */}
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

          {/* Units and Content Requirements (conditional) */}
          {countryWithTariffs &&
            (countryWithTariffs.baseTariffs
              ?.flatMap((t) => t.tariffs)
              ?.some((t) => t.type === "amount") ||
              uiContentPercentages.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Units Input */}
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

                {/* Content Percentage Inputs */}
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

          {/* Tariff Results */}
          {selectedCountry && countryWithTariffs && tariffElement ? (
            <div className="mt-2">
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
            /* Empty state - prompt to select country */
            <div className="relative overflow-hidden flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-base-content/10 bg-gradient-to-br from-base-200/60 via-base-100 to-base-200/60">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/15 border border-secondary/25">
                  <GlobeAltIcon className="w-7 h-7 text-secondary" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-base-content">
                    Select a Country of Origin
                  </h4>
                  <p className="text-sm text-base-content/60 mt-1 max-w-sm">
                    Select the country of origin for this item to see applicable
                    tariffs and import duties.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Classification Complete Section - Contains all levels */}
      <CollapsibleSection
        title="Classification Decisions"
        // subtitle="See each classification level and your decisions"
        icon={<CheckCircleIcon className="w-5 h-5" />}
        iconBgClass="bg-success/20"
        iconTextClass="text-success"
        summaryContent={
          <span className="flex items-center gap-2 text-success font-semibold">
            Complete
          </span>
        }
        badge={
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-success/20 text-success border border-success/30">
            {levels.length} {levels.length === 1 ? "level" : "levels"}
          </span>
        }
        collapsedContent={<ClassificationDetailsSummary levels={levels} />}
      >
        <div
          className={`flex flex-col ${classification.isComplete ? "gap-2" : ""}`}
        >
          {/* Classification Levels */}
          {levels.map((level, index) => (
            <div key={`level-${index}`}>
              {/* Flow Connector - shows between levels only when classification is not complete */}
              {index > 0 && (
                <div className="flex flex-col items-center py-3">
                  <div className="w-px h-3 bg-gradient-to-b from-success/30 to-success/20" />
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/15 border border-success/25">
                    <ChevronDownIcon className="w-3 h-3 text-success/70" />
                  </div>
                  <div className="w-px h-3 bg-gradient-to-b from-success/20 to-transparent" />
                </div>
              )}

              <VerticalClassificationStep
                classificationLevel={index}
                classificationRecord={classificationRecord}
                onOpenExplore={onOpenExplore}
              />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Importer Section */}
      <div className="relative z-20 rounded-2xl border border-base-content/15 bg-base-100">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-current/20 shrink-0">
              <TagIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-base-content">Importer</h3>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-5 pb-5 pt-0">
          <div className="h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent mb-5" />
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
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-base-content/10 border border-base-content/15 hover:border-primary/40 hover:bg-primary/10 disabled:opacity-50"
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

      {/* Notes Section */}
      <div className="relative rounded-2xl border border-base-content/15 bg-base-100 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-current/20 shrink-0">
              <DocumentTextIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-base-content">
              Basis for Classification
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-5 pb-5 pt-0">
          <div className="h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent mb-5" />
          <textarea
            ref={basisTextareaRef}
            className={`whitespace-pre-wrap min-h-36 w-full px-4 py-3 rounded-xl border transition-all duration-200 placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 resize-none overflow-hidden text-base ${
              canUpdateDetails
                ? "bg-base-100 border-base-content/20 hover:border-primary/40"
                : "bg-base-200/50 border-base-content/15 cursor-not-allowed opacity-60"
            }`}
            placeholder="Add any notes about your classification here"
            value={
              classification.notes ||
              generateBasisForClassification(classification)
            }
            disabled={!canUpdateDetails}
            onChange={(e) => {
              setClassification({
                ...classification,
                notes: e.target.value,
              });
              resizeBasisTextarea();
            }}
            onBlur={() => {
              // Immediately save when user leaves the textarea
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
                <span className="loading loading-spinner loading-xs"></span>
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
