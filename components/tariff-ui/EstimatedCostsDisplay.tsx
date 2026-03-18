import {
  DutyEstimate,
  FeeEstimate,
  SummaryTotal,
  ADDITIONAL_FEES_TOTAL_RATE,
  formatCurrency,
} from "../../tariffs/tariff-calculations"

interface Props {
  dutyEstimates: DutyEstimate[]
  feeEstimates: FeeEstimate[]
  summaryTotals: SummaryTotal[]
  totalImportDuty: number
  totalFees: number
  customsValue: number
  showContentBreakdown?: boolean
}

export const EstimatedCostsDisplay = ({
  dutyEstimates,
  feeEstimates,
  summaryTotals,
  totalImportDuty,
  totalFees,
  customsValue,
  showContentBreakdown = false,
}: Props) => {
  return (
    <div className="card bg-base-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top row: Total Duty & Fees + Landed Cost */}

        <div className="flex-1 basis-0 flex flex-col items-center justify-center p-4 sm:p-6 bg-secondary/10 rounded-xl border border-secondary/20 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1 sm:mb-2">
            Landed Cost
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-secondary break-all text-center">
            {formatCurrency(totalImportDuty + customsValue)}
          </h2>
        </div>
        <div className="flex-1 basis-0 flex flex-col items-center justify-center p-4 sm:p-6 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1 sm:mb-2">
            Total Duty &amp; Fees
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-primary break-all text-center">
            {formatCurrency(totalImportDuty)}
          </h2>
          <div className="text-xs sm:text-sm text-base-content/50 mt-1 sm:mt-2 text-center">
            on {formatCurrency(customsValue)} customs value
          </div>
        </div>


        {/* Breakdown grid: per-tariff-set duty + Additional Fees */}

        {dutyEstimates.map((estimate, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-accent/10 rounded-xl flex-1 min-w-0 border border-accent/20 shadow-sm"
          >
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1 text-center">
              {estimate.tariffSetName} Duty
            </span>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-accent mb-2 break-all text-center">
              {formatCurrency(estimate.totalDuty)}
            </div>
            <div className="text-xs text-base-content/50 space-y-1 text-center w-full">
              {estimate.amountDuty > 0 && (
                <div className="flex flex-col xs:flex-row justify-center gap-0.5 xs:gap-2">
                  <span>Amount-based:</span>
                  <span className="font-medium">
                    {formatCurrency(estimate.amountDuty)}
                  </span>
                </div>
              )}
              <div className="flex flex-col xs:flex-row justify-center gap-0.5 xs:gap-2">
                <span>Ad valorem ({estimate.percentRate}%):</span>
                <span className="font-medium">
                  {formatCurrency(estimate.adValoremDuty)}
                </span>
              </div>
              {showContentBreakdown && (
                <div className="flex flex-col xs:flex-row justify-center gap-0.5 xs:gap-2">
                  <span>Applied to:</span>
                  <span className="font-medium">
                    {estimate.contentPercentage}% (
                    {formatCurrency(estimate.applicableValue)})
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Tariff rate tiles */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          {summaryTotals.map((total, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-accent/10 rounded-xl flex-1 min-w-0 border border-accent/20 shadow-sm"
            >
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1 text-center">
                {total.name || "Article"} Tariff Rate
              </span>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-accent text-center">
                {total.hasAmountTariffs && total.amountRatesString && (
                  <span className="text-2xl sm:text-3xl md:text-4xl">
                    {total.amountRatesString}
                  </span>
                )}
                {total.hasAmountTariffs && total.amountRatesString && total.rate > 0 && `+ `}
                {total.rate > 0 && `${total.rate}%`}
              </div>
            </div>
          ))}
        </div>


        <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-info/10 rounded-xl flex-1 min-w-0 border border-info/20 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1 text-center">
            Additional Fees
          </span>
          <div className="text-2xl sm:text-3xl md:text-4xl font-black text-info mb-2 break-all text-center">
            {formatCurrency(totalFees)}
          </div>
          <div className="text-xs text-base-content/50 space-y-1 text-center w-full">
            {feeEstimates.map((fee, i) => (
              <div key={i} className="flex flex-row justify-center gap-2">
                <span className="truncate">{fee.name}:</span>
                <span className="font-medium">
                  {formatCurrency(fee.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-info/10 rounded-xl flex-1 min-w-0 border border-info/20 shadow-sm">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1 text-center">
            Additional Fee Rate
          </span>
          <div className="text-2xl sm:text-3xl md:text-4xl font-black text-info">
            {ADDITIONAL_FEES_TOTAL_RATE}%
          </div>
        </div>


      </div>
    </div>
  )
}
