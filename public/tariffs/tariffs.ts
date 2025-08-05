import { aluminumTariffs } from "./aluminum";
import { automobileTariffs } from "./automobile";
import { canadaTariffs } from "./canada";
import { chinaTariffs } from "./china";
import { mexicoTariffs } from "./mexico";
import { reciprocalTariffs } from "./reciprocal";
import { exceptionTariffs } from "./exception";
import { ironAndSteelTariffs } from "./iron-and-steel";
import { HtsElement } from "../../interfaces/hts";

export type Metal = "Aluminum" | "Steel" | "Copper";

export enum TariffCategory {
  SECTION_232 = "Section 232",
  SECTION_301 = "Section 301",
  IEEPA = "IEEPA",
}

export type ContentRequirement = Metal;

export interface TariffI {
  code: string;
  description: string;
  name: string;
  exceptions?: string[];
  inclusions?: {
    tariffs?: string[];
    codes?: string[];
    countries?: string[];
  };
  exclusions?: {
    tariffs?: string[];
    codes?: string[];
    countries?: string[];
  };
  general?: number;
  special?: number;
  other?: number;
  unit?: string;
  requiresReview?: boolean;
  contentRequirement?: ContentRequirement;
  category?: TariffCategory; // TODO: implement this
}

export enum TariffColumn {
  GENERAL = "general",
  SPECIAL = "special",
  OTHER = "other",
}

// TODO: would need to get lists of all countries that qualify for all agreements
// then would need to map that to the country selected -- would also rely on
// the classifier to select whether or not the item qualifies
export const getTariffColumn = (
  htsElement: HtsElement,
  countryCode: string
) => {};

export const findExceptions = (
  tariff: TariffI,
  countryCode: string,
  htsCode: string
): TariffI[] => {
  if (tariff.exceptions && tariff.exceptions.length > 0) {
    const exceptionTariffs = getTariffsByCode(tariff.exceptions);
    const childrenExceptions = exceptionTariffs.flatMap((exception) =>
      findExceptions(exception, htsCode, countryCode)
    );
    return [...exceptionTariffs, ...childrenExceptions].filter((t) =>
      tariffIsApplicable(t, countryCode, htsCode)
    );
  }
  return [];
};

// TODO: triple check this to ensure that we're doing the right checks
//  especially when it comes to handling inclusions that are tariffs...
//  That should probably be its own function anyways... somehow
export const tariffIsActive = (
  tariff: TariffI,
  countryCode: string,
  htsCode: string,
  tariffCodesToIgnore?: string[]
) => {
  if (tariff.requiresReview) return false;
  const noExceptions = !tariff.exceptions;
  const noTariffInclusions = !tariff.inclusions || !tariff.inclusions.tariffs;
  if (noExceptions && noTariffInclusions) return true;

  const exceptionTariffs = noExceptions
    ? []
    : getTariffsByCode(tariff.exceptions);
  console.log("Exception Tariffs", tariff.code, exceptionTariffs);
  console.log("TARIFF INCLUSIONS:", tariff.code, tariff.inclusions?.tariffs);
  const inclusionTariffs = noTariffInclusions
    ? []
    : getTariffsByCode(tariff.inclusions.tariffs);
  console.log("Inclusion Tariffs", tariff.code, inclusionTariffs);

  const exceptions = [...exceptionTariffs, ...inclusionTariffs];

  const applicableExceptions = exceptions.filter((t) =>
    tariffIsApplicable(t, countryCode, htsCode, tariffCodesToIgnore)
  );

  console.log("Tariff:", tariff.code);
  console.log("Applicable Exceptions:", applicableExceptions);

  if (
    noExceptions &&
    !noTariffInclusions &&
    applicableExceptions.length === 0
  ) {
    return false;
  }

  const noReviewNeeded = applicableExceptions.filter((e) => !e.requiresReview);

  return noReviewNeeded.length === 0;
};

export const getTariffsByCode = (codes: string[]) =>
  codes.map((c) => TariffsList.find((t) => t.code === c)).filter(Boolean);

export const tariffIsApplicableToCode = (
  tariff: TariffI,
  htsCode: string
): boolean => {
  if (!tariff?.inclusions) return false;

  const { codes, tariffs } = tariff.inclusions;
  const includesTariffs = tariffs !== undefined && tariffs.length > 0;
  const applicableTariffs = tariffs
    ? getTariffsByCode(tariffs).filter((t) =>
        tariffIsApplicableToCode(t, htsCode)
      )
    : [];
  const hasApplicableTariffs =
    applicableTariffs && applicableTariffs.length > 0;

  // matches against ANY heading, subheading, or full code
  //TODO: consider if we get an HTS code without the right format on the full 10 digits
  const includesCode = codes
    ?.map((code) => htsCode.includes(code))
    .some(Boolean);
  // TODO: test that this will grab heading and subheadings properly for full codes...

  if (tariff.exclusions) {
    const { codes } = tariff.exclusions;

    if (codes && codes.length > 0) {
      // Important: this checks if any exclusion code is included WITHIN the HTS Code to ensure
      // that we're not directly matching but matching against any substring of an HTS code
      // in case the exclusion is against and entire heading or subheading, and beyond
      if (codes.some((code) => htsCode.includes(code))) {
        return false;
      }
    }

    // currently we have no exclusions that are tariffs, so we don't need to check that
  }

  // NOTE: this assumes we'll never have tariffs alongside codes, which we don't, for now
  return (
    (includesTariffs && hasApplicableTariffs) ||
    (includesCode && !includesTariffs)
  );
};

export const tariffIsApplicable = (
  tariff: TariffI,
  countryCode: string,
  htsCode: string,
  tariffCodesToIgnore?: string[]
): boolean => {
  // For some reason tariff.code is undefined here...
  // why is the linter not catching these issues?
  // you'd think that the call site wouldn't be able to pass in a tariff without a code
  // but it is somehow happening, even without any !'s
  if (tariffCodesToIgnore?.includes(tariff.code)) return false;
  if (!tariff?.inclusions) return false;

  const { countries, codes, tariffs } = tariff.inclusions;
  const codesSpecified = codes !== undefined && codes.length > 0;
  const countriesSpecified = countries !== undefined && countries.length > 0;
  const includesTariffs = tariffs !== undefined && tariffs.length > 0;

  if (tariff.code === "9903.01.33") {
    const blah =
      tariffs &&
      getTariffsByCode(
        tariffs.filter((t) => !tariffCodesToIgnore?.includes(t))
      ).filter((t) =>
        tariffIsApplicable(t, countryCode, htsCode, tariffCodesToIgnore)
      );
    console.log("BLAH", tariff.code);
    console.log(blah);
  }
  const applicableTariffs = tariffs
    ? getTariffsByCode(
        tariffs.filter((t) => !tariffCodesToIgnore?.includes(t))
      ).filter((t) =>
        tariffIsApplicable(t, countryCode, htsCode, tariffCodesToIgnore)
      )
    : [];
  const hasApplicableTariffs =
    applicableTariffs && applicableTariffs.length > 0;
  if (tariff.code === "9903.01.33") {
    console.log(`HAS APPLICABLE TARIFFS: ${hasApplicableTariffs}`);
  }
  const includesCountry =
    countries?.includes(countryCode) || countries?.includes("*");

  // matches against ANY heading, subheading, or full code
  //TODO: consider if we get an HTS code without the right format on the full 10 digits
  const includesCode = codes
    ?.map((code) => htsCode.includes(code))
    .some(Boolean);
  // TODO: test that this will grab heading and subheadings properly for full codes...

  const includesCountryAndCode = includesCountry && includesCode;

  if (tariff.exclusions) {
    const { countries, codes } = tariff.exclusions;

    if (countries && countries.length > 0) {
      if (countries.includes(countryCode)) {
        return false;
      }
    }

    if (codes && codes.length > 0) {
      // Important: this checks if any exclusion code is included WITHIN the HTS Code to ensure
      // that we're not directly matching but matching against any substring of an HTS code
      // in case the exclusion is against and entire heading or subheading, and beyond
      if (codes.some((code) => htsCode.includes(code))) {
        return false;
      }
    }

    // currently we have no exclusions that are tariffs, so we don't need to check that
  }

  // NOTE: this assumes we'll never have tariffs alongside codes, which we don't, for now
  return (
    (includesTariffs && hasApplicableTariffs) ||
    (includesCountry && !codesSpecified && !includesTariffs) ||
    (includesCode && !countriesSpecified && !includesTariffs) ||
    (includesCountryAndCode && !includesTariffs)
  );
};

export const getTariffs = (countryCode: string, htsCode: string) => {
  return TariffsList.filter((tariff) =>
    tariffIsApplicable(tariff, countryCode, htsCode)
  );
};

export const getTariffsForCountry = (countryCode: string) => {
  let countryTariffs: TariffI[] = [];

  TariffsList.forEach((tariff) => {
    if (
      (tariff.inclusions?.countries?.includes(countryCode) ||
        tariff.inclusions?.countries?.includes("*")) &&
      !tariff.exclusions?.countries?.includes(countryCode)
    ) {
      countryTariffs.push(tariff);
    }
  });

  return countryTariffs;
};

export const getTariffsForCode = (htsCode: string) => {
  let codeTariffs: TariffI[] = [];

  TariffsList.forEach((tariff) => {
    if (tariff.inclusions?.codes?.includes(htsCode)) {
      codeTariffs.push(tariff);
    }
  });

  return codeTariffs;
};

// NOTES:
// 9903.01.43-76 are all suspended, but would take over this flat 10% if reinstated
//  They'll now be revoked entirely once revision 17 is out on August 8th
// Does not consider Countervailing orf Antidumping currently
// Does not consider any of the 98 exceptions for 01.25, 01.24, 01.01, 01.10, or 88.*'s
// If inclusions only has countries and not codes, tariff applies to all codes,
//  unless specified in exceptions list
// Does not currently consider the kg's of the steel or aluminum
// Does not currently consider the % of the product being foreign
// Does not currently consider the % of US originating
// Does not consider FTA's / can't apply yet
// If a tariff has exceptions, and one of the exceptions has 1 of more of the others
//  as it's own exceptions, we currently don't handle this aside from on a 1:1
//  basis. 7601.10.60.40 is a good example of this

export const TariffsList: TariffI[] = [
  ...reciprocalTariffs,
  ...aluminumTariffs,
  ...automobileTariffs,
  ...canadaTariffs,
  ...chinaTariffs,
  ...exceptionTariffs,
  ...ironAndSteelTariffs,
  ...mexicoTariffs,
];
