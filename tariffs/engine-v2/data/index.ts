import { CodeList, RuleSet } from "../types"
import { columnAssignments } from "./columns"
import { confirmationInputs } from "./confirmations"
import { fees } from "./fees"
import { headings as section122 } from "./headings/122"
import { headings as section232Autos } from "./headings/232-autos"
import { headings as section232Metals } from "./headings/232-metals"
import { headings as section232Mhdv } from "./headings/232-mhdv"
import { headings as section232Semiconductors } from "./headings/232-semiconductors"
import { headings as section232Wood } from "./headings/232-wood"
import { headings as section301China } from "./headings/301-china"
import { headings as deals } from "./headings/deals"
import { namedInputs } from "./inputs"
import { interactions } from "./interactions"
import generatedLists from "./lists.generated.json"
import { china301Lists } from "./lists/china-301"
import { preferences } from "./preferences"
import { programs } from "./programs"

const tariffs = [
  ...section122,
  ...section232Metals,
  ...section232Autos,
  ...section232Wood,
  ...section232Mhdv,
  ...section232Semiconductors,
  ...section301China,
  ...deals,
]

// Every rule record across all dates. The engine resolves it to a single date with getRulesAsOf().
export const AllRules: RuleSet = {
  programs,
  tariffs,
  lists: [...(generatedLists as CodeList[]), ...china301Lists],
  interactions,
  columnAssignments,
  preferences,
  fees,
  inputs: [...namedInputs, ...confirmationInputs(tariffs)],
}
