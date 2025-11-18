import { sendEmail } from "../../libs/resend";

interface TeamRequestConfirmationParams {
  name: string;
  email: string;
  productType: "classify" | "tariff";
  notes?: string;
}

export const sendTeamRequestConfirmationEmail = async ({
  name,
  email,
  productType,
  notes,
}: TeamRequestConfirmationParams) => {
  const productName = productType === "tariff" ? "Tariff Pro" : "Classify Pro";
  const emoji = "🎉";

  const html = teamRequestConfirmationEmailHtml({
    name,
    productName,
    emoji,
    notes,
  });
  const text = teamRequestConfirmationEmailText({
    name,
    productName,
    notes,
  });

  await sendEmail({
    to: email,
    subject: `${emoji} Your Demo of ${productName} for Teams!`,
    text,
    html,
    replyTo: "brendan@htshero.com",
  });
};

const teamRequestConfirmationEmailHtml = ({
  name,
  productName,
  emoji,
  notes,
}: {
  name: string;
  productName: string;
  emoji: string;
  notes?: string;
}) => {
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
        background-color: #ffffff;
      }
      .logo {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo img {
        height: 30px;
        width: auto;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .header h1 {
        color: #f59e0b;
        margin: 10px 0;
        font-size: 28px;
      }
      .notes-section {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #d1d5db;
      }
      .notes-section .notes-content {
        background-color: #ffffff;
        padding: 12px;
        border-radius: 4px;
        color: #374151;
        white-space: pre-wrap;
        margin-top: 8px;
      }
      .cta-button,
      .cta-button:visited,
      .cta-button:hover,
      .cta-button:active {
        display: inline-block;
        background-color: #617BFF;
        color: #ffffff !important;
        padding: 14px 28px;
        text-decoration: none !important;
        border-radius: 8px;
        margin: 20px 0;
        font-weight: bold;
        font-size: 16px;
      }
      .features {
        background-color: #f9fafb;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .features h3 {
        color: #1f2937;
        margin-top: 0;
      }
      .feature-item {
        margin: 12px 0;
        padding-left: 20px;
        position: relative;
      }
      .feature-item:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #10b981;
        font-weight: bold;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 14px;
        color: #6b7280;
        text-align: center;
      }
      .signature {
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <p>Hi ${name},</p>
    
    <p>Thank you for your interest in <strong>${productName} for Teams</strong>! We've received your request and are looking forward to your demo call.</p>
    <p style="font-size: 18px; font-weight: bold;">If you didn't already book your demo call, you can do that here:</p>
    <a href="https://calendly.com/brendan-htshero/30min" class="cta-button">Book Your Demo Call →</a>


    <div class="features">
      <h3>Here's what we'll cover on our call:</h3>
      <div class="feature-item">Your team's specific needs and how ${productName} can help</div>
      <div class="feature-item">Pricing, onboarding, and support options based on your team size</div>
      <div class="feature-item">A demo of the product</div>
      <div class="feature-item">Any other questions you have</div>
    </div>

    <p>In the meantime, feel free to explore our tools and resources at HTS Hero. If you have any urgent questions, don't hesitate to reach out!</p>

    
    <a href="https://htshero.com" class="cta-button">Visit HTS Hero →</a>
    

    <div class="signature">
      <p>
        Looking forward to connecting soon!<br /><br />
        Best,<br />
        <strong>Brendan</strong><br />
        Founder | HTS Hero<br />
        // add phone number here
        <a href="tel:+12065651468">+1 (206) 565-1468</a><br />
        <a href="mailto:brendan@htshero.com">brendan@htshero.com</a>
      </p>
    </div>

    <div class="footer">
      <p>© 2025 HTS Hero. All rights reserved.</p>
      <p>Questions? Reply to this email or contact us at <a href="mailto:support@htshero.com">support@htshero.com</a></p>
    </div>
  </body>
</html>`;
};

const teamRequestConfirmationEmailText = ({
  name,
  productName,
  notes,
}: {
  name: string;
  productName: string;
  notes?: string;
}) => {
  return `Hi ${name},

Thank you for your interest in ${productName} for Teams! We've received your request and are looking forward to your demo call.

If you didn't already book your demo call, you can do that here: https://calendly.com/brendan-htshero/30min

Here's what we'll cover in the call:
✓ Your team's specific needs and how ${productName} can help
✓ Pricing, onboarding, and support options based on your team size
✓ Any other questions you have

In the meantime, feel free to explore our tools and resources at https://htshero.com. If you have any urgent questions, don't hesitate to reach out!

Looking forward to connecting soon!

Best regards,
Brendan McLaughlin
Founder, HTS Hero
brendan@htshero.com

---
© 2025 HTS Hero. All rights reserved.
Questions? Reply to this email or contact us at support@htshero.com`;
};
