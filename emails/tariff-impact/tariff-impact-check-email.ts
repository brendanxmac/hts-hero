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
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tariff Impact Alert - HTS Hero</title>
    <style>
      /* Reset and base styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #0f172a;
        background-color: #f1f5f9;
        margin: 0;
        padding: 0;
      }
      
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      }
      
      .header {
        background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
        color: white;
        padding: 40px 30px;
        text-align: center;
      }
      
      .header h1 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: -0.5px;
      }
      
      .header .subtitle {
        font-size: 16px;
        font-weight: 400;
      }
      
      .content {
        padding: 40px 30px;
      }
      
      .alert-section {
        background: #ffffff;
        border: 3px solid #1e40af;
        border-radius: 12px;
        padding: 30px;
        margin: 30px 0;
        position: relative;
        overflow: hidden;
      }
      
      .alert-section h2 {
        color: #0f172a;
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .impact-summary {
        background: white;
        margin: 20px 0;
      }
      
      .summary-item {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 16px;
        align-items: start;
        padding: 16px 0;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .summary-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      
      .summary-item:first-child {
        padding-top: 0;
      }
      
      .summary-label {
        font-weight: 600;
        color: #64748b;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .summary-value {
        font-weight: 700;
        color: #0f172a;
        font-size: 15px;
        text-align: left;
        line-height: 1.4;
        word-break: break-word;
      }
      
      .affected-count {
        background: #fef3c7;
        color: #d97706;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 700;
        display: inline-block;
        border: 1px solid #fde68a;
      }
      
      .cta-section {
        text-align: center;
        margin: 30px 0;
      }
      
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
        color: #ffffff !important;
        padding: 16px 32px;
        text-decoration: none !important;
        border-radius: 8px;
        font-weight: 700;
        font-size: 16px;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 14px 0 rgba(30, 64, 175, 0.3);
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;
      }
      
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(30, 64, 175, 0.4);
      }
      
      .benefits-section {
        background: #f1f5ff;
        border: 1px solid #e0e7ff;
        border-radius: 8px;
        padding: 24px;
        margin: 30px 0;
      }
      
      .benefits-section h3 {
        color: #0f172a;
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .benefits-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .benefits-list li {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
        padding: 0;
      }
      
      .checkmark {
        color: #059669;
        font-size: 16px;
        font-weight: bold;
        margin-right: 12px;
        flex-shrink: 0;
        margin-top: 2px;
        line-height: 1;
      }
      
      .benefits-list li span {
        color: #334155;
        font-size: 15px;
        line-height: 1.6;
        flex: 1;
      }
      
      .support-section {
        background: #f1f5ff;
        border: 1px solid #e0e7ff;
        border-radius: 8px;
        padding: 20px;
        margin: 30px 0;
        text-align: center;
      }
      
      .support-section p {
        color: #0c4a6e;
        font-size: 15px;
        margin: 0;
      }
      
      .support-section a {
        color: #0284c7;
        text-decoration: none;
        font-weight: 600;
      }
      
      .footer {
        background: #f1f5ff;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #e0e7ff;
      }
      
      .footer p {
        color: #64748b;
        font-size: 14px;
        margin: 0;
        line-height: 1.6;
      }
      
      .footer a {
        color: #1e40af;
        text-decoration: none;
        font-weight: 600;
      }
      
      .signature {
        margin-top: 20px;
        color: #334155;
        font-size: 15px;
      }
      
      .signature .name {
        font-weight: 700;
        color: #0f172a;
      }
      
      .signature .title {
        color: #64748b;
        font-size: 14px;
      }
      
      /* Mobile responsiveness */
      @media only screen and (max-width: 600px) {
        .email-container {
          margin: 0;
          box-shadow: none;
        }
        
        .header, .content, .footer {
          padding: 20px 16px;
        }
        
        .header h1 {
          font-size: 24px;
        }
        
        .alert-section {
          padding: 20px 16px;
          margin: 20px 0;
        }
        
        .impact-summary {
          padding: 20px 16px;
        }
        
        .summary-item {
          grid-template-columns: 1fr;
          gap: 8px;
          padding: 12px 0;
        }
        
        .summary-value {
          text-align: left;
        }
        
        .cta-button {
          padding: 14px 24px;
          font-size: 15px;
        }
        
        .benefits-section {
          margin: 20px 0;
          padding: 20px 16px;
        }
        
        .benefits-list li {
          margin-bottom: 14px;
        }
        
        .support-section {
          margin: 20px 0;
          padding: 16px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Tariff Impact Alert</h1>
        <p class="subtitle">Some of your imports are affected by a new tariff announcement</p>
      </div>
      
      <div class="content">
        <p style="font-size: 16px; color: #334155; margin-bottom: 30px;">
          We've identified that <strong>${affectedImportsCount} of your imports</strong> are affected by a new tariff announcement.
        </p>
        
        <div class="alert-section">
          <h2>Impact Summary</h2>
          <div class="impact-summary">
            <div class="summary-item">
              <span class="summary-label">Tariff Announcement</span>
              <span class="summary-value">${tariffCodeSet.name}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Your Import List</span>
              <span class="summary-value">${userHtsCodeSet.name}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Imports Affected</span>
              <span class="summary-value">
                <span class="affected-count">${affectedImportsCount} ${affectedImportsCount === 1 ? "import" : "imports"}</span>
              </span>
            </div>
          </div>
          
          <div class="cta-section">
            <a href="https://htshero.com/tariffs/impact-checker?tariffAnnouncement=${tariffCodeSet.id}&htsCodeSet=${userHtsCodeSet.id}" class="cta-button">
              View Affected Imports →
            </a>
          </div>
        </div>
        
        <div class="benefits-section">
          <h3>Why use Tariff Impact Checker?</h3>
          <ul class="benefits-list">
            <li><span class="checkmark">✓</span><span>See which specific imports are affected by new tariff announcements</span></li>
            <li><span class="checkmark">✓</span><span>Quickly understand the potential cost impacts on your business</span></li>
            <li><span class="checkmark">✓</span><span>Discover possible exemptions, trade programs, and alternative countries of origin</span></li>
            <li><span class="checkmark">✓</span><span>Get a head start on supply chain adjustments, if needed</span></li>
          </ul>
        </div>
        
        <div class="support-section">
          <p>
            Questions about this announcement? Our support team is here to help!<br>
            Contact us at <a href="mailto:support@htshero.com">support@htshero.com</a>
          </p>
        </div>
      </div>
      
      <div class="footer">
        <div class="signature">
          <p>
            <span class="name">Brendan</span><br>
            <span class="title">Founder | <a href="https://htshero.com">HTS Hero</a></span>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

export const tariffImpactCheckEmailText = (
  tariffCodeSet: TariffCodeSet,
  userHtsCodeSet: HtsCodeSet,
  affectedImportsCount: number
) => {
  return `Tariff Impact Alert

Some of your imports are affected by a new tariff announcement

Tariff Announcement: ${tariffCodeSet.name}
Your Import List: ${userHtsCodeSet.name}
Imports Affected: ${affectedImportsCount}

Click the link below to instantly see which ones are affected and the full tariff details: https://htshero.com/tariffs/impact-checker?tariffAnnouncement=${tariffCodeSet.id}&htsCodeSet=${userHtsCodeSet.id}

Our Tariff Impact Checker helps you or your clients:
• See which imports are affected by new tariff announcements
• Quickly understand the potential cost impacts
• Discover possible exemptions, trade programs, and countries of origin alternatives
• Get a jump start on supply chain adjustment, if needed

If you have any questions about this announcement or need assistance, our support team (support@htshero.com) is here to help!

Best,

Brendan
Founder | HTS Hero (https://htshero.com)`;
};
