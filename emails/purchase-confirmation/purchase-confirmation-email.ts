import { createAdminClient } from "../../app/api/supabase/server"
import { sendTransactional } from "../../libs/email/outbox"
import { StripePaymentMode } from "../../libs/stripe"
import { Purchase } from "../../libs/supabase/purchase"
import { trackerPlanFor } from "../../libs/tariff-tracker/plan"
import { trackerPlanForPriceId } from "../../libs/tariff-tracker/prices"
import { formatDay } from "../kit/brand"

// The receipt after a purchase (emails/account/PurchaseConfirmationEmail.tsx), sent at once
export const sendPurchaseConfirmationEmail = async (recipient: string, purchase: Purchase, mode: StripePaymentMode) => {
  const tracker = trackerPlanFor(purchase.product_name)
  const billing =
    mode === StripePaymentMode.PAYMENT ? "One-time" : (await trackerPlanForPriceId(purchase.price_id))?.billing === "annual" ? "Annual" : "Monthly"
  const until = purchase.expires_at ? formatDay(purchase.expires_at) : null
  await sendTransactional(createAdminClient(), {
    recipient,
    userId: purchase.user_id,
    template: "purchase_confirmation",
    props: {
      planName: purchase.product_name,
      billing,
      term: until ? (mode === StripePaymentMode.PAYMENT ? `Access until ${until}` : `Renews ${until}`) : "Active now",
      orderId: purchase.id.slice(0, 8),
      purchasedOn: formatDay(purchase.created_at),
      product: tracker ? "tracker" : "classify",
      importsCovered: tracker?.maxPairs ?? null,
      footer: { reason: "You're getting this receipt because you bought an HTS Hero plan with this email." },
    },
  })
}
