import { sendEmail } from "../../libs/resend";

export const sendTariffImpactCheckEmail = async (
  recipient: string,
  tariffAnnouncement: string,
  subject: string
) => {
  const html = tariffImpactCheckEmailHtml(tariffAnnouncement);
  const text = tariffImpactCheckEmailText(tariffAnnouncement);

  await sendEmail({
    to: recipient,
    subject: subject || `New Tariff Announcement - Check Your Imports`,
    text,
    html,
    // TODO: implement no-reply?
    replyTo: "support@htshero.com",
  });
};

export const tariffImpactCheckEmailHtml = (tariffAnnouncement: string) => {
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
      .alert-box {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
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
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <h2>🚨 New Tariff Announcement: ${tariffAnnouncement}</h2>
    
    <div class="alert-box">
      <h3>Important: Some of your imports may be affected</h3>
      <p>A new tariff announcement has been made that may impact some of the products you import. It's important to check if your HTS codes are included in this announcement to understand the potential impact on your business.</p>
    </div>

    <p>Don't let unexpected tariff changes catch you off guard. Use our Tariff Impact Checker to quickly identify which of your imports are affected by this new announcement.</p>

    <a href="https://htshero.com/tariffs/impact-checker" class="cta-button">Check Your Imports Now</a><br/>
    
    <p>Our impact checker will help you:</p>
    <ul>
      <li>Identify which of your HTS codes are included in the new tariff announcement</li>
      <li>Understand the potential cost impact on your imports</li>
      <li>Plan ahead for any necessary adjustments to your supply chain</li>
    </ul>

    <p>If you have any questions about this announcement or need assistance with your tariff analysis, our support team (support@htshero.com) is here to help!</p>
    
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

export const tariffImpactCheckEmailText = (tariffAnnouncement: string) => {
  return `🚨 New Tariff Announcement: ${tariffAnnouncement}

Important: Some of your imports may be affected

A new tariff announcement has been made that may impact some of the products you import. It's important to check if your HTS codes are included in this announcement to understand the potential impact on your business.

Don't let unexpected tariff changes catch you off guard. Use our Tariff Impact Checker to quickly identify which of your imports are affected by this new announcement.

Check Your Imports Now: https://htshero.com/tariffs/impact-checker

Our impact checker will help you:
• Identify which of your HTS codes are included in the new tariff announcement
• Understand the potential cost impact on your imports
• Plan ahead for any necessary adjustments to your supply chain

If you have any questions about this announcement or need assistance with your tariff analysis, our support team (support@htshero.com) is here to help!

Best,

Brendan
Founder | HTS Hero (https://htshero.com)`;
};
