import {
  findFirstElementInProgressionWithTariff,
  getTemporaryTariffs,
  isSimpleTariff,
  sumPercentages,
  getTemporaryTariffRate,
} from "../libs/hts";
import { HtsElement, HtsLevelClassification, TemporaryTariff } from "./hts";

export class Tariff {
  htsCode: string;
  original: string;
  weightRate: string | null;
  baseRate: string | null;
  temporaryAdjustments: TemporaryTariff[];

  private constructor(
    htsElement: HtsElement,
    temporaryTariffs: TemporaryTariff[]
  ) {
    this.htsCode = htsElement.htsno;
    this.original = htsElement.general;
    this.weightRate = this.getWeightRate(htsElement.general);
    this.baseRate = this.getBaseRate(htsElement.general);
    this.temporaryAdjustments = temporaryTariffs;
  }

  static async create(
    classificationProgression: HtsLevelClassification[]
  ): Promise<Tariff> {
    const classificationElementWithTariff =
      findFirstElementInProgressionWithTariff(classificationProgression);
    const temporaryTariffs = await getTemporaryTariffs(
      classificationElementWithTariff
    );

    return new Tariff(classificationElementWithTariff, temporaryTariffs);
  }

  private getWeightRate(tariffString: string): string {
    /*
     * Regex Breakdown
     * [\d.]+: Matches one or more digits, optionally including a decimal point (e.g., 25.4, 3.50, 100).
     * (?:[^\w\s\d]+)?: This part matches one or more non-alphanumeric characters, allowing for any currency symbol (e.g., $, €, ¢, £, ¥, etc.). The ? makes it optional, in case there’s no symbol.
     * /: Matches the literal /, indicating "per".
     *[a-zA-Z]+: Matches one or more letters, which represent the unit (e.g., kg, lb, ton, stone, etc.).
     */

    // Example usage:
    // "25.4¢/kg + 7.7%"   ---> "25.4¢/kg"
    // "$3.50/lb + 10%"    ---> "$3.50/lb"
    // "50€/ton + 5%"      ---> "50€/ton"
    // "100$/stone + 15%"  ---> "100$/stone"
    // "10.5£/tonne + 20%" ---> "10.5£/tonne"

    const match = tariffString.match(/[\d.]+(?:[^\w\s\d]+)?\/[a-zA-Z]+/);
    return match ? match[0] : null;
  }

  private getBaseRate(tariffString: string): string | null {
    if (tariffString.toLowerCase() === "free") {
      return tariffString;
    }

    const match = tariffString.match(/\d+(\.\d+)?%/);

    return match ? match[0] : null;
  }

  isCompound(): boolean {
    const tariff = this.original;
    return tariff.includes("+") || tariff.toLowerCase().includes("plus");
  }

  getTotal(): string {
    const noTemporaryTariffs = this.temporaryAdjustments.length === 0;
    const oneTemporaryTariff = this.temporaryAdjustments.length === 1;

    // Just one additional temporary tariff
    if (noTemporaryTariffs) {
      console.log("No Additional Tariffs");
      return this.baseRate;
    }
    // Just one additional temporary tariff
    if (oneTemporaryTariff && isSimpleTariff(this.temporaryAdjustments[0])) {
      const additionalTariff = this.temporaryAdjustments[0].element.general;
      const additionalPercentage = this.getBaseRate(additionalTariff);

      if (additionalPercentage) {
        console.log("Additional is Percentage");
        const baseTariffIsCompound = this.isCompound();

        if (!baseTariffIsCompound) {
          console.log("Base Tariff is NOT compound");
          console.log(this.baseRate);
          console.log(this.original);
          const baseAsPercentage =
            this.baseRate.toLowerCase() === "free" ? "0%" : this.baseRate;
          return sumPercentages(
            `${baseAsPercentage} + ${additionalPercentage}`
          );
        }

        console.log("Base Tariff is compound");
        const temporaryTariffRate = getTemporaryTariffRate(additionalTariff);
        if (temporaryTariffRate) {
          console.log("Additional Tariff is simple rate based add-on");

          const totalPercentage = sumPercentages(
            `${this.baseRate} + ${temporaryTariffRate}`
          );

          return `${this.weightRate} + ${totalPercentage}`;
        }

        console.log(`Additional Tariff is complex`);
        return `${this.baseRate} + ${additionalTariff}`;
      }
    }

    // Multiple Additional Temporary Tariffs
    console.log("Multiple Additional Temporary Tariffs");
    return "Needs Review";
  }
}
