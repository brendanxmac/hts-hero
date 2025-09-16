import { HtsCodeSet } from "../../interfaces/hts";
import { TariffCodeSet } from "../../tariffs/announcements/announcements";

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
      
      .content {
        padding-top: 40px;
        padding-left: 30px;
        padding-right: 30px;
        padding-bottom: 0px;
      }
      
      .alert-section {
        background: #ffffff;
        border: 4px solid #1e40af;
        border-radius: 8px;
        padding: 32px;
        margin: 0 0 32px 0;
        position: relative;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      }
      
      .alert-section h2 {
        color: #0f172a;
        font-size: 26px;
        font-weight: 700;
        margin: 0 0 16px 0;
        text-align: left;
        letter-spacing: -0.4px;
        line-height: 1.2;
      }
      
      .alert-section h3 {
        color: #475569;
        font-size: 18px;
        font-weight: 600;
        margin: 24px 0 20px 0;
        text-align: left;
        letter-spacing: -0.2px;
        line-height: 1.3;
      }
      
      .impact-summary {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        margin: 0;
        padding: 20px;
      }
      
      .summary-item {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 20px;
        align-items: start;
        padding: 18px 0;
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
        color: #475569;
        font-size: 15px;
        line-height: 1.4;
        letter-spacing: 0.1px;
      }
      
      .summary-value {
        font-weight: 600;
        color: #0f172a;
        font-size: 16px;
        text-align: left;
        line-height: 1.5;
        word-break: break-word;
      }
      
      .affected-count {
        background: #fef3c7;
        color: #d97706;
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 700;
        display: inline-block;
        border: 1px solid #fde68a;
        letter-spacing: 0.2px;
      }
      
      .cta-section {
        text-align: center;
        margin: 28px 0 0 0;
      }
      
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
        color: #ffffff !important;
        padding: 18px 36px;
        text-decoration: none !important;
        border-radius: 8px;
        font-weight: 700;
        font-size: 16px;
        letter-spacing: 0.3px;
        box-shadow: 0 4px 14px 0 rgba(30, 64, 175, 0.25);
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;
        line-height: 1.2;
      }
      
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px 0 rgba(30, 64, 175, 0.4);
      }
      
      .benefits-section {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 28px;
        margin: 32px 0;
      }
      
      .benefits-section h3 {
        color: #0f172a;
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 24px 0;
        text-align: center;
        letter-spacing: -0.3px;
        line-height: 1.2;
      }
      
      .benefits-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .benefits-list li {
        display: flex;
        align-items: flex-start;
        margin-bottom: 18px;
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
        font-size: 16px;
        line-height: 1.6;
        flex: 1;
      }
      
      .support-section {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 24px;
        margin: 32px 0;
        text-align: center;
      }
      
      .support-section p {
        color: #475569;
        font-size: 16px;
        margin: 0;
        line-height: 1.5;
      }
      
      .support-section a {
        color: #0284c7;
        text-decoration: none;
        font-weight: 600;
      }
      
      .footer {
        background: #000000;
        padding: 0;
        text-align: center;
      }
      
      .logo-block {
        background: #000000;
        padding: 40px 30px;
        cursor: pointer;
        transition: opacity 0.2s ease;
      }
      
      .logo-block:hover {
        opacity: 0.8;
      }
      
      .logo-block img {
        max-width: 200px;
        height: auto;
        display: block;
        margin: 0 auto;
      }
      
      .disclaimers {
        background: #ffffff;
        padding: 30px;
        padding-top: 10px;
      }
      
      .disclaimers p {
        color: #64748b;
        font-size: 13px;
        margin: 0 0 16px 0;
        line-height: 1.5;
      }
      
      .disclaimers p:last-child {
        margin-bottom: 0;
      }
      
      /* Mobile responsiveness */
      @media only screen and (max-width: 600px) {
        .email-container {
          margin: 0;
          box-shadow: none;
        }
        
        .content, .footer {
          padding: 20px 16px;
        }
    
        
        .alert-section {
          padding: 24px 20px;
          margin: 0 0 24px 0;
        }
        
        .alert-section h2 {
          font-size: 22px;
          margin-bottom: 12px;
        }
        
        .alert-section h3 {
          font-size: 16px;
          margin: 20px 0 16px 0;
        }
        
        .impact-summary {
          padding: 16px;
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
          padding: 16px 28px;
          font-size: 15px;
        }
        
        .benefits-section {
          margin: 24px 0;
          padding: 24px 20px;
        }
        
        .benefits-list li {
          margin-bottom: 14px;
        }
        
        .support-section {
          margin: 24px 0;
          padding: 20px;
        }
        
        .logo-block {
          padding: 30px 20px;
        }
        
        .logo-block img {
          max-width: 160px;
        }
        
        .disclaimers {
          padding: 20px 16px;
        }
        
        .disclaimers p {
          font-size: 12px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="content">
        <div class="alert-section">
          <h2>New Tariff Impact Alert</h2>
          <p style="font-size: 17px; color: #334155; margin: 0 0 20px 0; line-height: 1.6;">
          We've identified that <strong>${affectedImportsCount} of your imports</strong> are affected by a new tariff announcement.
        </p>
          <h3>Your Impact Summary</h3>
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
            If you have questions about this notification or need assistance, our support team is here to help!<br>
            Contact us at <a href="mailto:support@htshero.com">support@htshero.com</a>
          </p>
        </div>
      </div>
      
      <div class="footer">
        <div class="disclaimers">
          <p>
            Data Source Disclaimer: We obtain our tariff information from official government sources, but we do not guarantee the full accuracy of our tariff impact checks, especially if some time has passed since you initially received this email.
          </p>
          <p>
            Liability Disclaimer: HTS Hero is not responsible for any actions taken based on the information displayed. Please verify all tariff information with official sources or contact a customs broker before making business decisions.
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
  return `New Tariff Impact Alert

We've identified that ${affectedImportsCount} of your imports are affected by a new tariff announcement.

YOUR IMPACT SUMMARY

Tariff Announcement: ${tariffCodeSet.name}
Your Import List: ${userHtsCodeSet.name}
Imports Affected: ${affectedImportsCount} ${affectedImportsCount === 1 ? "import" : "imports"}

View Affected Imports: https://htshero.com/tariffs/impact-checker?tariffAnnouncement=${tariffCodeSet.id}&htsCodeSet=${userHtsCodeSet.id}

WHY USE TARIFF IMPACT CHECKER?

✓ See which specific imports are affected by new tariff announcements
✓ Quickly understand the potential cost impacts on your business
✓ Discover possible exemptions, trade programs, and alternative countries of origin
✓ Get a head start on supply chain adjustments, if needed

If you have questions about this notification or need assistance, our support team is here to help!
Contact us at support@htshero.com

---

DISCLAIMERS:

Data Source Disclaimer: We obtain our tariff information from official government sources, but we do not guarantee the full accuracy of our tariff impact checks, especially if some time has passed since you initially received this email.

Liability Disclaimer: HTS Hero is not responsible for any actions taken based on the information displayed. Please verify all tariff information with official sources or contact a customs broker before making business decisions.

---

HTS Hero (https://htshero.com)`;
};
