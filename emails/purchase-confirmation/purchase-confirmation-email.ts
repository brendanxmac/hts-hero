import { sendEmail } from "../../libs/resend";
import { StripePaymentMode } from "../../libs/stripe";
import { Purchase } from "../../libs/supabase/purchase";

export const sendPurchaseConfirmationEmail = async (
  recipient: string,
  purchase: Purchase,
  mode: StripePaymentMode
) => {
  const html = purchaseConfirmationEmailHtml(purchase, mode);
  const text = purchaseConfirmationEmailText(purchase, mode);

  await sendEmail({
    to: recipient,
    subject: `Purchase Confirmation`,
    text,
    html,
    replyTo: "brendan@htshero.com",
  });
};

export const purchaseConfirmationEmailHtml = (
  purchase: Purchase,
  mode: StripePaymentMode
) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .purchase-details {
        background-color: #cbcbcb;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .cta-button,
      .cta-button:visited,
      .cta-button:hover,
      .cta-button:active {
        display: inline-block;
        background-color: #007bff;
        color: #ffffff !important;
        padding: 12px 24px;
        text-decoration: none !important;
        border-radius: 4px;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <p>Thank you for choosing HTS Hero! 🎉</p>
    <p>Your purchase has been confirmed.</p>

    <div class="purchase-details">
      <h3>Purchase Details:</h3>
      <p><strong>Order ID:</strong> ${purchase.id}</p>
      <p><strong>Plan:</strong> ${purchase.product_name}</p>
      <p><strong>Type:</strong> ${mode === StripePaymentMode.PAYMENT ? "One-Time Payment" : "Subscription"}</p>
      ${
        mode === StripePaymentMode.PAYMENT
          ? `<p><strong>Expires:</strong> ${new Date(purchase.expires_at).toLocaleString()}</p>`
          : `<p><strong>Renews:</strong> Monthly</p>`
      }
      <p><strong>Purchase Date:</strong> ${new Date(purchase.created_at).toLocaleString()}</p>
    </div>

    <h3>What's next?</h3>
    <p>🚨 If you didn't sign up prior to purchasing,<span style="color: red; font-weight: bold;"> you must sign up with the same email you used to purchase.</span></p>
    <p>Once logged in, you'll be able to access all the HTS Hero features that you purchased!</p>
    <p>To view or manage your purchases, log into HTS Hero & click on your profile icon in the top right corner, then click "Billing".</p>
    <p>If you have any questions or need assistance, our support team (support@htshero.com) is here to help!</p>
    

    <a href="https://htshero.com" class="cta-button">Get Started!</a><br/>
    
    <div>
      <p>
        Best,<br /><br />
        Brendan<br />
        Founder | <a href="https://htshero.com">HTS Hero</a>
      </p>
    </div>
  </body>
</html>`;
};

export const purchaseConfirmationEmailText = (
  purchase: Purchase,
  mode: StripePaymentMode
) => {
  return `Thank you for choosing HTS Hero! 🎉

Your purchase has been confirmed.

Purchase Details:
Order ID: ${purchase.id}
Plan: ${purchase.product_name}
Type: ${mode === StripePaymentMode.PAYMENT ? "One-Time Payment" : "Subscription"}
Expires: ${new Date(purchase.expires_at).toLocaleString()}
Purchase Date: ${new Date(purchase.created_at).toLocaleString()}

What's next?
🚨 If you didn't sign up before purchasing, you must sign up with the same email you used to purchase

Otherwise after logging in (if not already) you'll be able to access all the features of the app that you purchased!

To access the app, go to: https://htshero.com/app

If you have any questions or need assistance, our support team is here to help (support@htshero.com)!

Best,

Brendan
Founder | HTS Hero (https://htshero.com/about)`;
};
