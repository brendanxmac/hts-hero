import { CodeList, RuleSet } from "../types"
import { columnAssignments } from "./columns"
import { confirmationInputs } from "./confirmations"
import { fees } from "./fees"
import { headings as section201Quartz } from "./headings/201-quartz"
import { headings as section122 } from "./headings/122"
import { headings as section232Autos } from "./headings/232-autos"
import { headings as section232Metals } from "./headings/232-metals"
import { headings as section232Metals2025 } from "./headings/232-metals-2025"
import { headings as ieepa2026 } from "./headings/ieepa-2026"
import { headings as section232Mhdv } from "./headings/232-mhdv"
import { headings as section232Pharmaceuticals } from "./headings/232-pharmaceuticals"
import { headings as section232Uas } from "./headings/232-uas"
import { headings as quotas } from "./headings/quotas"
import { headings as section232Semiconductors } from "./headings/232-semiconductors"
import { headings as section232Wood } from "./headings/232-wood"
import { headings as section301Brazil } from "./headings/301-brazil"
import { headings as section301China } from "./headings/301-china"
import { headings as section301ForcedLabor } from "./headings/301-forced-labor"
import { headings as section338Canada } from "./headings/338-canada"
import { headings as deals } from "./headings/deals"
import { namedInputs } from "./inputs"
import { interactions } from "./interactions"
import generatedLists from "./lists.generated.json"
import { aircraftLists } from "./lists/aircraft"
import { brazilLists } from "./lists/brazil"
import { canada338Lists } from "./lists/canada-338"
import { canada338BanLists } from "./lists/canada-338-bans"
import { china301Lists } from "./lists/china-301"
import { forcedLaborLists } from "./lists/forced-labor-301"
import { metalsLists } from "./lists/metals"
import { metals2025Lists } from "./lists/metals-2025"
import { ieepa2026Lists } from "./lists/ieepa-2026"
import { pharmaceuticalLists } from "./lists/pharmaceuticals"
import { quartzLists } from "./lists/quartz"
import { uasLists } from "./lists/uas"
import { vehiclePartsLists } from "./lists/vehicle-parts"
import { preferences } from "./preferences"
import { programs } from "./programs"
import { prohibitions } from "./prohibitions"

const tariffs = [
  ...section122,
  ...section232Metals,
  ...section232Metals2025,
  ...ieepa2026,
  ...section232Autos,
  ...section232Wood,
  ...section232Mhdv,
  ...section232Semiconductors,
  ...section232Pharmaceuticals,
  ...section232Uas,
  ...section301China,
  ...section301Brazil,
  ...section301ForcedLabor,
  ...section201Quartz,
  ...section338Canada,
  ...quotas,
  ...deals,
]

// Every rule record across all dates. The engine resolves it to a single date with getRulesAsOf().
export const AllRules: RuleSet = {
  programs,
  tariffs,
  prohibitions,
  lists: [...(generatedLists as CodeList[]), ...china301Lists, ...aircraftLists, ...metalsLists, ...metals2025Lists, ...ieepa2026Lists, ...brazilLists, ...forcedLaborLists, ...pharmaceuticalLists, ...quartzLists, ...canada338Lists, ...canada338BanLists, ...uasLists, ...vehiclePartsLists],
  interactions,
  columnAssignments,
  preferences,
  fees,
  inputs: [...namedInputs, ...confirmationInputs(tariffs)],
}
