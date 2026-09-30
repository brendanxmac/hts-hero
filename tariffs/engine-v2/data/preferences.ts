import { TradePrograms, TradeProgramStatus } from "../../../public/trade-programs"
import { TradePreference } from "../types"

// Converted from the existing TradePrograms list so both engines share one source for now.
// Only programs with an SPI symbol can be claimed on an entry line.
export const preferences: TradePreference[] = TradePrograms.filter(
  (p) => p.symbol && [TradeProgramStatus.ACTIVE, TradeProgramStatus.EXPIRED].includes(p.status),
).map((p) => ({
  symbol: p.symbol,
  name: p.name,
  // Matches the legacy rule: a program with no country list is open to any country
  // only when it needs review (e.g. civil aircraft); an empty list means none.
  countries: p.qualifyingCountries ?? (p.requiresReview ? "all" : []),
  effective:
    p.status === TradeProgramStatus.EXPIRED
      ? { to: "2021-01-01" } // GSP authorization lapsed after December 31, 2020
      : {},
}))
