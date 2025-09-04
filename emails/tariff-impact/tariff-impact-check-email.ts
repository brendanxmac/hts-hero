import { HtsCodeSet } from "../../interfaces/hts";
import { sendEmail } from "../../libs/resend";
import { TariffCodeSet } from "../../tariffs/announcements/announcements";

export const sendTariffImpactCheckEmail = async (
  recipient: string,
  tariffCodeSet: TariffCodeSet,
  userHtsCodeSet: HtsCodeSet,
  affectedImportsCount: number
) => {
  const html = tariffImpactCheckEmailHtml(
    tariffCodeSet,
    userHtsCodeSet,
    affectedImportsCount
  );
  const text = tariffImpactCheckEmailText(
    tariffCodeSet,
    userHtsCodeSet,
    affectedImportsCount
  );

  await sendEmail({
    to: recipient,
    subject: `🚨 New Tariffs Affect ${affectedImportsCount} of your Imports`,
    text,
    html,
    replyTo: "support@htshero.com",
  });
};

export const tariffImpactCheckEmailHtml = (
  tariffCodeSet: TariffCodeSet,
  userHtsCodeSet: HtsCodeSet,
  affectedImportsCount: number
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
    <h2>New Tariff Announcement: ${tariffCodeSet.name}</h2>
    
    <div class="alert-box">
      <h3>We&apos;ve identified that ${affectedImportsCount} of your ${userHtsCodeSet.name} imports are affected by this announcement</h3>
      <p>To instantly see which ones are affected and the full tariff impacts, click the button below.</p>
    </div>

    <a href="https://htshero.com/tariffs/impact-checker?tariffAnnouncement=${tariffCodeSet.id}&htsCodeSet=${userHtsCodeSet.id}" class="cta-button">See Affected Imports</a><br/>
    
    <p>Our Tariff Impact Checker helps you or your clients:</p>
    <ul>
      <li>See which imports are affected by new tariff announcements</li>
      <li>Quickly understand the potential cost impacts</li>
      <li>Discover possible exemptions, trade programs, and countries of origin alternatives</li>
      <li>Get a jump start on supply chain adjustmnet, if needed</li>
    </ul>

    <p>If you have any questions about this announcement or need assistance, our support team (support@htshero.com) is here to help!</p>
    
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

export const tariffImpactCheckEmailText = (
  tariffCodeSet: TariffCodeSet
  userHtsCodeSet: HtsCodeSet,
  affectedImportsCount: number
) => {
  return `New Tariff Announcement: ${tariffAnnouncementName}

HTS Hero has identified that ${affectedImportsCount} of your ${affectedListName} imports have been identified to be impacted by these new tariffs

You can instantly see which ones are impacted and easily view the full tariff impacts to make informed decisions about your supply chain.

See Affected Imports: https://htshero.com/tariffs/impact-checker

Our impact checker will help you:
• Identify which of your HTS codes are included in the new tariff announcement
• Understand the potential cost impact on your imports
• Plan ahead for any necessary adjustments to your supply chain

If you have any questions about this announcement or need assistance with your tariff analysis, our support team (support@htshero.com) is here to help!

Best,

Brendan
Founder | HTS Hero (https://htshero.com)`;
};
