import { revalidatePath } from "next/cache"

// The public /tariff-updates pages are cached for 15 minutes. When updates change (new ones,
// edits, regrouping, hiding), the list and every update page are rebuilt on their next visit
// instead, so the list never links to an update that has moved or gone.
export const revalidateTariffUpdates = () => revalidatePath("/tariff-updates", "layout")
