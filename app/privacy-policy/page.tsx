import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

const current = `Hive Works LLC (Wyoming)
Last Updated: November 29, 2025

This Privacy Policy explains how Hive Works LLC (“Provider,” “we,” “us,” or “our”) collects, uses, and protects your information when you use the HTS Hero platform (“Service”).
By using the Service, you consent to the practices described in this Policy.

1. Who This Policy Covers
This Privacy Policy applies to:
* Visitors to our website
* Individual users
* Business users
* Business teams using the platform

2. Information We Collect
We collect three categories of information:

2.1 Information You Provide
* Account information (name, email)
* Profile Information (address, disclaimers, logo, etc...)
* Classification attempts and inputs (item descriptions, selections, notes, etc...)
* Billing information (Not stored by us and only used by our payment provider)
* Team / Company Profile Information (address, disclaimer, logo, etc...)
*   Only for team / company users, not individual users

2.2 Automatically Collected Information
* IP address
* Browser/device type
* Usage logs
* Authentication metadata

2.3 Information from Business Customers
* Seat assignments
* Billing contacts

3. How We Use Your Information
We use information to:
* Operate the Service
* Improve the platform
* Provide customer support
* Enforce security and prevent fraud
* Comply with legal obligations
We may use anonymized or aggregated data for analytics or product improvement.

4. How We Use AI / LLMs
Our Classify tool uses Large Language Models (“LLMs”) to assist you with yours classifications.
The primary use is providing analysis of HTS elements at each level.
All LLM results are purely for informational purposes and should not be used as legal, customs, regulatory, or compliance advice.
You consent to this processing by using the Service.

5. Data Storage & Security
Your data is encrypted in transit and at rest.
We use best-effort industry practices to safeguard data, but no system is perfectly secure.

6. Sharing of Information
We do not sell your data.
We may share data with:
* Infrastructure providers (hosting, storage, etc...)
* Payment processors
* Email service providers
We may also share information if required by law.

7. Data Retention
We retain your data while your account is active.
Upon account deletion, we delete or anonymize your data within 90 days, except where retention is required by law.

8. Children’s Privacy
HTS Hero is not intended for children under 18.
We do not knowingly collect data from minors.

9. Business Customers
For Business Users who sign a SaaS Agreement, that Agreement may include additional privacy and data handling terms.
If there is a conflict, the SaaS Agreement controls for that Business User.

10. International Transfers
We may process data in the United States or other countries.
By using the Service, you consent to such transfers.

11. Changes to This Policy
We may update this Privacy Policy from time to time.
Material changes will be posted with a new “Last Updated” date.

12. Contact
Hive Works LLC
Email: support@htshero.com
`;

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-2xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Home
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`${current}`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
