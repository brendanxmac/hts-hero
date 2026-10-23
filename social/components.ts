import type { ComponentType } from "react"
import { BigNumber } from "./templates/BigNumber"
import { CountrySnapshot } from "./templates/CountrySnapshot"
import { HeadToHead } from "./templates/HeadToHead"
import { Quiz } from "./templates/Quiz"
import { News } from "./templates/News"
import { OddRate } from "./templates/OddRate"
import { Ranking } from "./templates/Ranking"
import { RateSpread } from "./templates/RateSpread"
import { RateTimeline } from "./templates/RateTimeline"
import { SourcingSaver } from "./templates/SourcingSaver"
import { TopList } from "./templates/TopList"
import { TradeShift } from "./templates/TradeShift"
import type { TemplateId } from "./types"

export const COMPONENTS: Record<TemplateId, ComponentType<any>> = {
  RateTimeline,
  BigNumber,
  HeadToHead,
  Ranking,
  TradeShift,
  SourcingSaver,
  CountrySnapshot,
  RateSpread,
  TopList,
  Quiz,
  News,
  OddRate,
}
