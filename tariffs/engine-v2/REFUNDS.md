# Refunds: duties that were assessed but are now owed back

Not implemented. Notes for later, written Oct 7, 2026. Sources are in `tariffs/backfill/ieepa/` (`claims.md`, and the official texts in `sources/`).

## The problem

The engine answers "which duties applied to an entry on this date?" That's what was **assessed**, and audits of past entries need exactly that. But some duties that were assessed are no longer **owed**: a court has struck them down, and importers can get them back. The main case is IEEPA:

- **Feb 20, 2026:** the Supreme Court held that "IEEPA does not authorize the President to impose tariffs" (*Learning Resources v. Trump*, No. 24-1287, decided with *V.O.S. Selections*, No. 25-250).
- **Feb 24, 2026:** IEEPA duties ended for goods entered or withdrawn from warehouse on or after 12:00 a.m. ET (EO 14389; CSMS #67834313). Entries from Feb 20–23 still had them assessed.
- **Mar 4, 2026:** the Court of International Trade ordered CBP to liquidate or reliquidate entries without IEEPA duties (*Atmus Filtration v. United States*, No. 26-01259). Later orders extended this; the Mar 27 extension to finally liquidated entries is from a secondary source.
- **Apr 20, 2026:** CBP's refund function in ACE (CAPE) went live for unliquidated entries and entries within 80 days of liquidation. Later phases added more entry types, such as reconciliation from Jun 29, 2026. Refunds include interest under 19 U.S.C. 1505. See cbp.gov, "IEEPA duty refunds", and CSMS #68340863.

Section 122 may follow. The Court of International Trade held the Section 122 surcharge unlawful on May 7, 2026, and an appeal is pending. This comes from the draft timeline and isn't verified.

## Don't shorten the effective dates

An IEEPA record keeps its real effective period: it ends Feb 24, 2026, not Feb 20, and it isn't erased. Otherwise "what was assessed on this entry?" gives the wrong answer, and so does every chart of duties over time.

## Model it as a legal status on top

Something like:

```ts
interface LegalStatusChange extends Dated {
  id: string
  appliesTo: Selector            // e.g. { authorities: ["IEEPA"] }
  status: "invalidated"          // more kinds later, if needed
  decidedOn: IsoDate             // 2026-02-20
  refundable: boolean
  refundFrom?: IsoDate           // when refunds became available (2026-04-20, CAPE)
  source: Source                 // the decision, the CIT order, the CBP guidance
}
```

The result would show each affected line twice: the duty as assessed on the entry date, and a note that it's no longer owed and can be refunded with interest. A "net owed" total would leave it out, while the assessed total keeps it.

## Open questions

- **Refund eligibility depends on each entry**: its liquidation status and which CAPE phase covers it. Is that in scope (an input such as "liquidated more than 80 days ago?"), or just a pointer to CBP's guidance?
- **Interest:** show an estimate, or just say it's paid?
- **Postal and de minimis duties** collected under IEEPA (EO 14324) before Feb 24, 2026: are they refundable the same way? CBP's refund pages don't say.
- **Section 122**, if the May 7, 2026 ruling holds on appeal.
