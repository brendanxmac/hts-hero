import { aluminumTariffs } from "./aluminum";
import { automobileTariffs } from "./automobile";
import { canadaTariffs } from "./canada";
import { chinaTariffs } from "./china";
import { mexicoTariffs } from "./mexico";
import { reciprocalTariffs } from "./reciprocal";
import { exceptionTariffs } from "./exception";
import { ironAndSteelTariffs } from "./iron-and-steel";
import { HtsElement } from "../../interfaces/hts";
import {
  BaseTariffI,
  getBaseTariffs,
  splitOnClosingParen,
} from "../../libs/hts";
import { ContentRequirementI } from "../../components/Element";
import { ContentRequirements } from "../../enums/tariff";
import { TariffI, UITariff, TariffSet } from "../../interfaces/tariffs";
import { TariffColumn } from "../../enums/tariff";
import { brazilTariffs } from "./brazil";
import { copperTariffs } from "./copper";
import { EuropeanUnionCountries } from "../../constants/countries";

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

export const hasActiveDescendants = (
  tariff: UITariff,
  tariffs: UITariff[],
  visited: Set<string> = new Set()
): boolean => {
  // Prevent infinite loops by tracking visited tariffs
  if (visited.has(tariff.code)) {
    return false;
  }

  visited.add(tariff.code);

  return (
    tariff.exceptions?.some((e) =>
      tariffs.some(
        (t) =>
          (t.code === e && t.isActive) ||
          hasActiveDescendants(t, tariffs, visited)
      )
    ) ?? false
  );
};

// Helper function to collect all exception codes recursively
export const collectExceptionCodes = (
  tariff: TariffI,
  tariffs: TariffI[],
  exceptionCodes: Set<string>,
  ignoreCodes?: string[]
) => {
  if (tariff.exceptions) {
    tariff.exceptions.forEach((code) => {
      if (ignoreCodes?.includes(code)) return;

      exceptionCodes.add(code);
      // Find the exception tariff and recursively collect its exceptions
      const exceptionTariff = tariffs.find((t) => t.code === code);
      if (exceptionTariff) {
        collectExceptionCodes(
          exceptionTariff,
          tariffs,
          exceptionCodes,
          ignoreCodes
        );
      }
    });
  }
};

export const getStandardTariffSet = (
  tariffs: TariffI[],
  ignoreCodes: string[] = [],
  contentRequirements: ContentRequirementI<ContentRequirements>[]
): TariffSet => {
  const contentRequirementCodes = new Set<string>();
  const contentRequirementTariffs = tariffs.filter((t) => t.contentRequirement);
  contentRequirementTariffs.forEach((t) => {
    collectExceptionCodes(t, tariffs, contentRequirementCodes);
  });

  const exceptionCodes = new Set<string>();
  // ????? Use to pass contentRequirements.length > 0 check here and use tariffs if not
  const regularSet = tariffs.filter((t) => !t.contentRequirement);

  // Recursively get all the exceptions for all applicables minus content requirement ones
  regularSet.forEach((t) => {
    collectExceptionCodes(t, tariffs, exceptionCodes, ignoreCodes);
  });

  // Are there any in contentRequirementExceptionTariffs that do NOT exist in exceptionTariffs?
  const exceptionsThatOnlyContentRequirementsHave = Array.from(
    contentRequirementCodes
  ).filter((t) => !exceptionCodes.has(t));

  const regularSetWithoutContentRequirementTariffs = regularSet.filter(
    (t) => !exceptionsThatOnlyContentRequirementsHave.includes(t.code)
  );

  // Set isActive here now that we have the full picture
  const regularSetWithIsActive = regularSetWithoutContentRequirementTariffs.map(
    (t) => ({
      ...t,
      isActive: tariffIsActive(t, regularSetWithoutContentRequirementTariffs),
    })
  );

  return {
    name: contentRequirements.length > 0 ? "Article" : "",
    exceptionCodes: exceptionCodes,
    tariffs: regularSetWithIsActive,
  };
};

export const getContentRequirementTariffSets = (
  tariffs: TariffI[],
  contentRequirements: ContentRequirementI<ContentRequirements>[]
): TariffSet[] => {
  const sets: TariffSet[] = [];

  for (const contentRequirement of contentRequirements) {
    const exceptionCodes = new Set<string>();
    let tariffSet = tariffs.filter(
      (t) =>
        !t.contentRequirement ||
        t.contentRequirement.content === contentRequirement.name
    );

    tariffSet.forEach((t) => {
      collectExceptionCodes(t, tariffs, exceptionCodes);
    });

    const tariffSetWithIsActive = tariffSet.map((t) => ({
      ...t,
      isActive: tariffIsActive(t, tariffs),
    }));

    sets.push({
      name: `${contentRequirement.name} Content`,
      exceptionCodes,
      tariffs: tariffSetWithIsActive,
    });
  }

  return sets;
};

export const getAdValoremRate = (
  column: TariffColumn,
  tariffSet: UITariff[],
  baseTariffs: BaseTariffI[]
) => {
  let rate = 0;
  tariffSet.forEach((tariff) => {
    if (tariff.isActive) {
      rate += tariff[column];
    }
  });

  if (baseTariffs && baseTariffs.length > 0) {
    baseTariffs
      .filter((tariff) => tariff.type === "percent")
      .forEach((t) => {
        rate += t.value;
      });
  }

  return rate;
};

export const getEUCountryTotalBaseRate = (
  baseTariffs: BaseTariffI[],
  customsValue: number,
  units?: number
) => {
  const amountRates = getAmountRates(baseTariffs);
  const adValoremEquivalentAmountRate = amountRates
    .map(
      (dollarAmount) =>
        (units
          ? (dollarAmount * units) / customsValue
          : dollarAmount / customsValue) * 100
    )
    .reduce((acc, t) => acc + t, 0);

  const adValoremRate = baseTariffs.reduce((acc, t) => {
    if (t.type === "percent") {
      return acc + t.value;
    }
    return acc;
  }, 0);

  return adValoremEquivalentAmountRate + adValoremRate;
};

// export const getRate = (
//   baseTariffs: BaseTariffI[],
//   tariffs: UITariff[],
//   column: TariffColumn,
//   country: string,
//   isContentRequirementSet: boolean
// ) => {
//   const isEUCountry = EuropeanUnionCountries.includes(country);

//   if (isEUCountry && !isContentRequirementSet) {
//     const amountRates = getAmountRates(baseTariffs);
//     const adValoremEquivalentAmountRate = amountRates
//       .map((t) => (t / 1000) * 100)
//       .reduce((acc, t) => acc + t, 0);
//     const adValoremRate = baseTariffs.reduce((acc, t) => {
//       if (t.type === "percent") {
//         return acc + t.value;
//       }
//       return acc;
//     }, 0);

//     const totalBaseAdValoremEquivalentRate =
//       adValoremEquivalentAmountRate + adValoremRate;

//     if (totalBaseAdValoremEquivalentRate < 15) {
//       return 15;
//     } else {
//       return 0;
//     }
//   } else {
//     // Get the amount rate(s) and do a + with that and the ad valorem rate
//   }

//   // TODO: consider how to get amount rates from additional tariffs
// };

export const getAmountRates = (baseTariffs: BaseTariffI[]) => {
  return baseTariffs.filter((t) => t.type === "amount").map((t) => t.value);
};

export const getAmountRatesString = (baseTariffs: BaseTariffI[]) => {
  return baseTariffs
    .filter((t) => t.type === "amount")
    .map((t) => t.raw)
    .join(" + ");
};

export const getBaseTariffsForColumn = (
  htsElement: HtsElement,
  column: TariffColumn
) => {
  const tariffString = getTariffForColumn(column, htsElement);
  // only needed if string has countries specified, which USITC writes within parenthesis ()
  // if not parenthesis then the function just returns the tariff as an element in array
  const tariffParts = splitOnClosingParen(tariffString);

  return tariffParts.map((part) => getBaseTariffs(part));
};

export const getTariffForColumn = (
  column: TariffColumn,
  htsElement: HtsElement
) => {
  if (column === TariffColumn.GENERAL) {
    return htsElement.general;
  } else if (column === TariffColumn.SPECIAL) {
    return htsElement.special;
  } else if (column === TariffColumn.OTHER) {
    return htsElement.other;
  }
};

export const isAncestorTariff = (
  possibleAncestor: UITariff,
  tariff: UITariff,
  allTariffs: UITariff[]
): boolean => {
  const hasExceptions =
    possibleAncestor.exceptions && possibleAncestor.exceptions.length > 0;

  if (hasExceptions) {
    const exceptions = allTariffs.filter((t) =>
      possibleAncestor.exceptions.includes(t.code)
    );

    return (
      exceptions.some((e) => e.code === tariff.code) ||
      exceptions.some((e) => isAncestorTariff(tariff, e, allTariffs))
    );
  } else {
    return false;
  }
};

export const isDescendantTariff = (
  possibleDescendant: UITariff,
  tariff: UITariff,
  allTariffs: UITariff[]
): boolean => {
  const tariffHasExceptions = tariff.exceptions && tariff.exceptions.length > 0;

  if (tariffHasExceptions) {
    const exceptions = allTariffs.filter((t) =>
      tariff.exceptions.includes(t.code)
    );

    return (
      exceptions.some((e) => e.code === possibleDescendant.code) ||
      exceptions.some((e) => isDescendantTariff(tariff, e, allTariffs))
    );
  } else {
    return false;
  }
};

export const applicableTariffIsActive = (
  tariff: UITariff,
  tariffs: UITariff[]
) => {
  const atLeastOneActiveDescendant = hasActiveDescendants(tariff, tariffs);
  const isActiveItself = tariffIsActive(tariff, tariffs);

  return atLeastOneActiveDescendant || isActiveItself;
};

// TODO: triple check this to ensure that we're doing the right checks
//  especially when it comes to handling inclusions that are tariffs...
//  That should probably be its own function anyways... somehow
export const tariffIsActive = (
  tariff: TariffI,
  applicableTariffs: TariffI[],
  tariffCodesToIgnore?: string[]
) => {
  if (tariff.requiresReview) return false;

  const noExceptions = !tariff.exceptions;
  const noTariffInclusions = !tariff.inclusions || !tariff.inclusions.tariffs;

  if (noExceptions && noTariffInclusions) return true;

  const exceptionTariffs = noExceptions
    ? []
    : applicableTariffs.filter((t) => tariff.exceptions?.includes(t.code));

  const inclusionTariffs = noTariffInclusions
    ? []
    : applicableTariffs.filter((t) =>
        tariff.inclusions?.tariffs?.includes(t.code)
      );

  const exceptions = [...exceptionTariffs, ...inclusionTariffs];

  if (
    noExceptions &&
    !noTariffInclusions && // has inclusions
    exceptions.length === 0 // but those inclusions do not apply
  ) {
    return false;
  }

  const noReviewNeeded = exceptions.filter((e) => !e.requiresReview);

  // I think here is where we need to check that even if there's a tariff that
  // does not require review, if it's not active itself, all good...
  const hasExceptionTariffWithNoReviewNeededThatIsActive = noReviewNeeded.some(
    (t) => tariffIsActive(t, applicableTariffs)
  );

  const hasInclusionTariffWithNoReviewNeededThatIsActive =
    inclusionTariffs.some((t) => tariffIsActive(t, applicableTariffs));

  return (
    noReviewNeeded.length === 0 ||
    !hasExceptionTariffWithNoReviewNeededThatIsActive ||
    hasInclusionTariffWithNoReviewNeededThatIsActive
  );
};

export const getTariffByCode = (code: string) =>
  TariffsList.find((t) => t.code === code);

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
  const includesCountry =
    countries?.includes(countryCode) || countries?.includes("*");

  // matches against ANY heading, subheading, or full code
  //TODO: consider if we get an HTS code without the right format on the full 10 digits
  const includesCode = codes
    ?.map((code) => htsCode.includes(code))
    .some(Boolean);
  // TODO: test that this will grab heading and subheadings properly for full codes...

  if (!includesCode && !includesCountry) {
    return false;
  }

  const includesCountryAndCode = includesCountry && includesCode;

  const includesTariffs = tariffs !== undefined && tariffs.length > 0;
  const applicableTariffs = tariffs
    ? getTariffsByCode(
        tariffs.filter((t) => !tariffCodesToIgnore?.includes(t))
      ).filter((t) =>
        tariffIsApplicable(t, countryCode, htsCode, tariffCodesToIgnore)
      )
    : [];
  const hasApplicableTariffs =
    applicableTariffs && applicableTariffs.length > 0;

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
  ...brazilTariffs,
  ...copperTariffs,
];
