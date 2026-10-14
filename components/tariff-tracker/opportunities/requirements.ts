import { SavingKind } from "../insights/savings";

// What it takes to secure each kind of saving. For now, the general steps for each kind.
//
// TODO(requirements): the exact requirements for each trade program and exemption, from its
// legal source: rules of origin (tariff shift, regional value content), certification and
// documentation, who signs what, the SPI to claim on the CBP Form 7501, and the evidence each
// exemption's condition needs. Needs a strategy agreed with the product owner (structured data per
// program and Chapter 99 exemption, reviewed like the tariff data) before it's built.

export interface RequirementStep {
  title: string;
  detail: string;
}

export interface Requirements {
  // Specific to this program or exemption (false while only the general steps exist)
  specific: boolean;
  steps: RequirementStep[];
}

const GENERAL: Record<SavingKind, RequirementStep[]> = {
  program: [
    { title: "Check the rules of origin", detail: "The goods must qualify as originating under the program's rules, not only be shipped from the country." },
    { title: "Get the proof from your supplier", detail: "A certification of origin, or the supporting records the program asks for." },
    { title: "Claim it on the entry", detail: "Your broker claims the program's special program indicator (SPI) on the entry summary, and you keep the records." },
  ],
  exemption: [
    { title: "Confirm the condition is true of your goods", detail: "Read the exemption's text: it applies only when the goods meet it exactly." },
    { title: "Document it", detail: "Keep the evidence that the goods qualify (specifications, certificates, end-use records)." },
    { title: "Tell your broker", detail: "They enter it with the right Chapter 99 heading or statement on the entry." },
  ],
  origin: [
    { title: "Find a supplier there", detail: "Countries that already ship this product to the US are the realistic places to start." },
    { title: "Make sure it's made there", detail: "The goods must be substantially transformed there to take its origin, not just assembled lightly or transshipped." },
    { title: "Mark and document the origin", detail: "Country of origin marking, and records of where and how the goods were made, for your broker and for Customs." },
  ],
};

export const requirementsFor = (kind: SavingKind): Requirements => ({ specific: false, steps: GENERAL[kind] });
