import type { ComponentType } from "react"
import { BigNumber } from "./templates/BigNumber"
import { DigestPromo } from "./templates/DigestPromo"
import { CountrySnapshot } from "./templates/CountrySnapshot"
import { HeadToHead } from "./templates/HeadToHead"
import { LaunchMemo } from "./templates/launch/LaunchMemo"
import { LaunchSlam } from "./templates/launch/LaunchSlam"
import { LaunchTeaser } from "./templates/launch/LaunchTeaser"
import { LaunchVideo } from "./templates/launch/LaunchVideo"
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
  LaunchTeaser,
  LaunchVideo,
  LaunchMemo,
  LaunchSlam,
  DigestPromo,
}
