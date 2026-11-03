import * as ui from "@/components/ui/styles";

// Under every audit: how owed is worked out, and who files what
export const AuditDisclaimer = () => (
  <p className={ui.caption}>
    Owed is the duty in force on the entry date, worked out from the verified tariff data with each product&apos;s answers and
    trade program from your imports. Differences are possible, not certain. Results may not be complete or accurate. Always confirm results yourself. HTS Hero finds and
    documents; refunds, protests, and corrections are filed by you or your licensed customs broker.
  </p>
);
