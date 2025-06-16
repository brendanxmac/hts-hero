import { sendEmail } from "../../libs/resend";
import { Purchase } from "../../libs/supabase/purchase";

export const sendPurchaseConfirmationEmail = async (
  recipient: string,
  purchase: Purchase
) => {
  const html = purchaseConfirmationEmailHtml(purchase);
  const text = purchaseConfirmationEmailText(purchase);

  await sendEmail({
    to: recipient,
    subject: "Purchase Confirmation",
    text,
    html,
    replyTo: "brendan@htshero.com",
  });
};

export const purchaseConfirmationEmailHtml = (purchase: Purchase) => {
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
    <p>Your purchase has been confirmed, you now have full access to Code Finder.</p>

    <div class="purchase-details">
      <h3>Purchase Details:</h3>
      <p><strong>Order ID:</strong> ${purchase.id}</p>
      <p><strong>Plan:</strong> ${purchase.product_name}</p>
      <p><strong>Expires:</strong> ${new Date(purchase.expires_at).toLocaleString()}</p>
      <p><strong>Purchase Date:</strong> ${new Date(purchase.created_at).toLocaleString()}</p>
    </div>

    <h3>What's next?</h3>
    <p>🚨 If you didn't sign up prior to purchasing,<span style="color: red; font-weight: bold;"> you must sign up with the same email you used to purchase</span></p>
    
    <p>Otherwise, after logging in (if not already) you can go directly to the <a href="https://htshero.com/signin">app</a> to get your HTS Code!</p>

    <p>If you have any questions or need assistance, our support team (support@htshero.com) is here to help!</p>
    

    <a href="https://htshero.com/signin" class="cta-button">Get your HTS Code!</a><br/>
    
    <div>
      <p>
        Best,<br /><br />
        Brendan<br />
        Founder | <a href="https://htshero.com/about">HTS Hero</a>
      </p>
    </div>
  </body>
</html>`;
};

export const purchaseConfirmationEmailText = (purchase: Purchase) => {
  return `Thank you for choosing HTS Hero! 🎉

Your purchase has been confirmed, you now have full access to Code Finder.

Purchase Details:
Order ID: ${purchase.id}
Plan: ${purchase.product_name}
Expires: ${new Date(purchase.expires_at).toLocaleString()}
Purchase Date: ${new Date(purchase.created_at).toLocaleString()}

What's next?
🚨 If you didn't sign up before purchasing, you must sign up with the same email you used to purchase

Otherwise after logging in (if not already) and go to the app (https://htshero.com/app) to get your HTS Code!

Get your HTS Code: https://htshero.com/app

If you have any questions or need assistance, our support team is here to help (support@htshero.com)!

Best,

Brendan
Founder | HTS Hero (https://htshero.com/about)`;
};
