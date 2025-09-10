import { sendEmail } from "../../libs/resend";

interface TariffImpactCheckProcessingResults {
  processedUsers: number;
  processedCodeSets: number;
  emailsSent: number;
  errors: string[];
}

export const sendTariffImpactCheckResultsEmail = async (
  tariffAnnouncement: string,
  impactCheckProcessingResults: TariffImpactCheckProcessingResults
) => {
  const html = tariffImpactCheckResultsEmailHtml(
    tariffAnnouncement,
    impactCheckProcessingResults
  );
  const text = tariffImpactCheckResultsEmailText(
    tariffAnnouncement,
    impactCheckProcessingResults
  );

  await sendEmail({
    to: "brendan@htshero.com",
    subject: `Tariff Impact Check Results - ${tariffAnnouncement}`,
    text,
    html,
    // TODO: implement no-reply?
    replyTo: "support@htshero.com",
  });
};

export const tariffImpactCheckResultsEmailHtml = (
  tariffAnnouncement: string,
  impactCheckProcessingResults: TariffImpactCheckProcessingResults
) => {
  const { processedUsers, processedCodeSets, emailsSent, errors } =
    impactCheckProcessingResults;

  // Truncate errors if there are too many (limit to 50 errors max)
  const maxErrors = 50;
  const displayErrors = errors.slice(0, maxErrors);
  const hasMoreErrors = errors.length > maxErrors;
  const truncatedCount = errors.length - maxErrors;

  const errorsHtml =
    displayErrors.length > 0
      ? `
      <div class="error-section">
        <h3>❌ Errors Encountered (${errors.length} total)</h3>
        <ul class="error-list">
          ${displayErrors.map((error, index) => `<li>${index + 1}. ${error}</li>`).join("")}
        </ul>
        ${hasMoreErrors ? `<p class="truncation-notice">... and ${truncatedCount} more errors (truncated for email length)</p>` : ""}
      </div>
    `
      : '<div class="success-section"><h3>✅ No Errors Encountered</h3></div>';

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
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .summary-box {
        background-color: #e8f5e8;
        border: 1px solid #4caf50;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .error-section {
        background-color: #ffeaea;
        border: 1px solid #f44336;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .success-section {
        background-color: #e8f5e8;
        border: 1px solid #4caf50;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .error-list {
        max-height: 400px;
        overflow-y: auto;
        background-color: #fff;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ddd;
      }
      .error-list li {
        margin-bottom: 8px;
        font-family: monospace;
        font-size: 12px;
        word-break: break-all;
      }
      .truncation-notice {
        font-style: italic;
        color: #666;
        margin-top: 10px;
      }
      .stats-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      .stat-cell {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        text-align: center;
        border: 1px solid #dee2e6;
        width: 25%;
      }
      .stat-number {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
      }
      .stat-label {
        font-size: 14px;
        color: #666;
        margin-top: 5px;
      }
    </style>
  </head>
  <body>
    <h2>📊 Tariff Impact Check Processing Results</h2>
    <h3>Announcement: ${tariffAnnouncement}</h3>
    
    <div class="summary-box">
      <h3>📈 Processing Summary</h3>
      <table class="stats-table">
        <tr>
          <td class="stat-cell">
            <div class="stat-number">${processedUsers}</div>
            <div class="stat-label">Users Processed</div>
          </td>
          <td class="stat-cell">
            <div class="stat-number">${processedCodeSets}</div>
            <div class="stat-label">Code Sets Processed</div>
          </td>
          <td class="stat-cell">
            <div class="stat-number">${emailsSent}</div>
            <div class="stat-label">Emails Sent</div>
          </td>
          <td class="stat-cell">
            <div class="stat-number">${errors.length}</div>
            <div class="stat-label">Errors Encountered</div>
          </td>
        </tr>
      </table>
    </div>

    ${errorsHtml}
  </body>
</html>`;
};

export const tariffImpactCheckResultsEmailText = (
  tariffAnnouncement: string,
  impactCheckProcessingResults: TariffImpactCheckProcessingResults
) => {
  const { processedUsers, processedCodeSets, emailsSent, errors } =
    impactCheckProcessingResults;

  // Truncate errors if there are too many (limit to 50 errors max)
  const maxErrors = 50;
  const displayErrors = errors.slice(0, maxErrors);
  const hasMoreErrors = errors.length > maxErrors;
  const truncatedCount = errors.length - maxErrors;

  const errorsText =
    displayErrors.length > 0
      ? `
❌ ERRORS ENCOUNTERED (${errors.length} total):
${displayErrors.map((error, index) => `${index + 1}. ${error}`).join("\n")}
${hasMoreErrors ? `\n... and ${truncatedCount} more errors (truncated for email length)` : ""}
`
      : "✅ NO ERRORS ENCOUNTERED";

  return `📊 TARIFF IMPACT CHECK PROCESSING RESULTS
Announcement: ${tariffAnnouncement}

📈 PROCESSING SUMMARY:
• Users Processed: ${processedUsers}
• Code Sets Processed: ${processedCodeSets}
• Emails Sent: ${emailsSent}
• Errors Encountered: ${errors.length}

${errorsText}`;
};
