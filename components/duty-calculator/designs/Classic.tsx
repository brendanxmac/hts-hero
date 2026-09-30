"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { CompareView } from "../Compare";
import { CountryField } from "../CountryField";
import { Field, NumberField, Segmented } from "../controls";
import { formatDate, mono, TRANSPORT_MODES } from "../format";
import { HtsCodeField } from "../HtsCodeField";
import { BasisPanel, NotAppliedPanel, QuestionsPanel, SimpleSummary, Statement, SummaryStats } from "../Results";
import {
  EMPTY_STEPS,
  emptyTitle,
  ExampleButtons,
  PreferenceSelect,
  ShareButtons,
  VerifiedNotice,
  ViewSwitch,
} from "../shared";
import { MAX_COMPARE, TariffFinder } from "../useTariffFinder";
import styles from "../theme.module.css";

// The original redesign: a form card on top, then a statement with panels around it
export const ClassicDesign = ({ f }: { f: TariffFinder }) => {
  const { result, selectedElement, country, countries } = f;
  return (
    <>
      {/* Entry details */}
      <section className={`${styles.card} p-5 sm:p-7`} aria-labelledby="entry-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <h2 id="entry-heading" className="text-[17px] font-semibold tracking-tight">
            Entry details
          </h2>
          <span className="text-[13px] text-[var(--dc-text-3)]">Results update as you type</span>
        </div>

        {f.loading ? (
          <FormSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5 gap-y-6">
            <Field
              label="HTS code"
              htmlFor="dc-hts"
              className="md:col-span-5"
              action={
                <button
                  type="button"
                  className={`${styles.link} inline-flex items-center gap-1 text-[13px]`}
                  onClick={() => f.openExplore()}
                >
                  <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                  Search by description
                </button>
              }
            >
              <HtsCodeField
                id="dc-hts"
                selectedElement={selectedElement}
                onSelect={(el) => f.selectElement(el, "hts_selector")}
                autoFocus={!f.codeParam}
              />
            </Field>

            <Field
              label={countries.length > 1 ? "Countries of origin" : "Country of origin"}
              htmlFor="dc-country"
              className="md:col-span-4"
              hint={
                countries.length > 1
                  ? `Comparing ${countries.length}. ${countries[0].name} is shown in the Detailed and Simple views.`
                  : `Add up to ${MAX_COMPARE - 1} more to compare side by side`
              }
            >
              <CountryField id="dc-country" selected={countries} onChange={f.changeCountries} max={MAX_COMPARE} />
            </Field>

            <Field label="Customs value" htmlFor="dc-value" className="md:col-span-3">
              <NumberField id="dc-value" prefix="$" suffix="USD" value={f.customsValue} onChange={f.setCustomsValue} />
            </Field>

            <Field label="Entry date" htmlFor="dc-date" className="md:col-span-3">
              <input
                id="dc-date"
                type="date"
                className={`${styles.input} ${styles.num}`}
                value={f.entryDate}
                onChange={(e) => f.setEntryDate(e.target.value)}
              />
            </Field>

            <Field label="Mode of transport" className="md:col-span-5">
              <Segmented
                label="Mode of transport"
                options={TRANSPORT_MODES}
                value={f.transportMode}
                onChange={f.setTransportMode}
              />
            </Field>

            {result?.requiresQuantity && (
              <Field
                label="Quantity"
                htmlFor="dc-quantity"
                className="md:col-span-4"
                hint={`The base rate (${result.base.reasons[0]}) is charged per unit`}
              >
                <NumberField id="dc-quantity" suffix={f.unitLabel} value={f.quantity} onChange={f.setQuantity} />
              </Field>
            )}

            {result && result.availablePreferences.length > 0 && (
              <Field
                label="Trade preference"
                htmlFor="dc-preference"
                className="md:col-span-4"
                hint="Only if the goods qualify under the program's rules of origin"
              >
                <PreferenceSelect f={f} id="dc-preference" />
              </Field>
            )}
          </div>
        )}
      </section>

      {/* Results */}
      {!f.loading &&
        (!result || !selectedElement || !country ? (
          <EmptyState f={f} />
        ) : (
          <section className="flex flex-col gap-4" aria-labelledby="results-heading" aria-live="polite">
            <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
              <div className="min-w-0">
                <h2 id="results-heading" className="text-[22px] font-semibold tracking-tight">
                  Duty estimate
                </h2>
                <p className="mt-1 text-[14px] text-[var(--dc-text-2)]">
                  <span className={`${mono.className} font-semibold text-[var(--dc-text)]`}>{selectedElement.htsno}</span>
                  {" · "}
                  {f.comparing
                    ? f.compareEntries.map((e) => `${e.country.flag} ${e.country.name}`).join(" vs ")
                    : `${country.flag} ${country.name}`}
                  {" · "}
                  {formatDate(result.asOf)}
                  {" · "}
                  {f.transportLabel}
                </p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-auto items-center gap-2">
                <ViewSwitch f={f} className={f.compareCountries.length ? "basis-full sm:basis-auto" : "flex-1"} />
                <ShareButtons f={f} />
              </div>
            </div>

            <VerifiedNotice f={f} />

            {f.comparing ? (
              <CompareView
                entries={f.compareEntries}
                customsValue={f.customsValue}
                onRemove={f.removeCountry}
                onPreferenceChange={f.setPreference}
                onViewDetails={f.viewCountryDetails}
              />
            ) : f.view === "simple" ? (
              <div className={styles.card}>
                <SimpleSummary
                  result={result}
                  customsValue={f.customsValue}
                  openQuestions={f.openQuestions}
                  onShowDetails={() => f.changeView("detailed")}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-8 flex flex-col gap-4 min-w-0">
                  <div className={`${styles.card} overflow-hidden`}>
                    <SummaryStats result={result} customsValue={f.customsValue} />
                    <Statement result={result} customsValue={f.customsValue} unitLabel={f.unitLabel} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <BasisPanel
                      result={result}
                      revision={f.revisionForDate}
                      verified={f.verified}
                      htsRevisionName={f.htsRevisionName}
                      transportMode={f.transportMode}
                    />
                    <NotAppliedPanel lines={result.lines} />
                  </div>
                </div>
                <aside className="lg:col-span-4 flex flex-col gap-4">
                  {result.questions.length > 0 && (
                    <QuestionsPanel
                      questions={result.questions}
                      answers={f.answers}
                      impacts={f.impacts}
                      lines={result.lines}
                      onAnswer={f.answer}
                    />
                  )}
                </aside>
              </div>
            )}
          </section>
        ))}
    </>
  );
};

const FormSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5 gap-y-6" aria-busy="true" aria-label="Loading HTS data">
    {["md:col-span-5", "md:col-span-4", "md:col-span-3", "md:col-span-3", "md:col-span-5"].map((span, i) => (
      <div key={i} className={`flex flex-col gap-2 ${span}`}>
        <div className={`${styles.skeleton} h-3.5 w-24`} />
        <div className={`${styles.skeleton} h-[46px] w-full`} />
      </div>
    ))}
  </div>
);

const EmptyState = ({ f }: { f: TariffFinder }) => (
  <section className={`${styles.card} p-6 sm:p-10`}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight">{emptyTitle(f)}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--dc-text-2)]">
          You&apos;ll get a line-by-line statement: the base rate, every Chapter 99 tariff and exemption in effect on your
          entry date, and customs fees, each with the reason it applies.
        </p>
        <ol className="mt-6 flex flex-col gap-3">
          {EMPTY_STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-[14.5px] text-[var(--dc-text)]">
              <span
                className={`${styles.num} flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--dc-accent-soft)] border border-[var(--dc-accent-border)] text-[12px] font-semibold text-[var(--dc-accent)]`}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className={styles.eyebrow}>Try an example</div>
        <ExampleButtons onExample={f.selectExample} />
      </div>
    </div>
  </section>
);
