import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://htshero.com
// - Name: HTS Hero
// - Contact information: support@htshero.com
// - Description: An HTS code lookup tool to help people find an HTS code for any product
// - Ownership: Users are free to use the resulting classification results from their searches as they please with no strings attached. Tokens, which are used as a means of currency / credit balance to conduct searches cannot be reimbursed. All sales are final
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://htshero.com/privacy-policy
// - Governing Law: United States of America
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning.

const current = `Hive Works LLC (Wyoming)
Last Updated: November 25, 2025

Welcome to HTS Hero, a software platform operated by Hive Works LLC, a Wyoming limited liability company (“Provider,” “we,” “us,” or “our”).
These Terms of Service (“Terms”) govern your access to and use of the HTS Hero website, platform, and related services (“Service”).

By accessing or using the Service, you agree to these Terms.

If you are accessing the Service on behalf of a company or organization (“Business User”), you represent that you are authorized to bind that entity to these Terms.

1. Who These Terms Apply To
These Terms apply to:
* Visitors browsing HTS Hero
* Free users
* Trial users
* Users on individual subscription plans
* Users of subscribed businesses

For users of subscribed businesses the terms of the Order Form & SaaS Subscription Agreement control in the event of any conflict with these Terms.

2. Eligibility
You must be at least 18 years old to use the Service.

3. Account Registration
You must create an account to use most features.
You agree to:
* Provide accurate information
* Keep your login credentials secure
* Be responsible for all activity under your account
Provider may suspend accounts for suspicious or abusive activity.

4. Subscription Plans & Billing
We offer monthly and annual subscription plans.

4.1 Billing & Renewals
Subscriptions automatically renew unless canceled before the renewal date.
You authorize us to charge your payment method on file.
If you believe you have encountered an error, please contact us at support@htshero.com.
Please ensure you review your purchase before completing the transaction.

4.2 Cancellation
You may cancel your subscription at any time in your account settings.
Your access continues until the end of the billing period.

4.3 No Refunds
All fees are non-refundable, including for partial periods.

5. Acceptable Use
You agree not to:
* Use the Service for unlawful purposes
* Attempt to bypass security measures
* Use the Service to make incorrect classifications intentionally
* Copy, reverse engineer, or resell the Service
* Upload harmful, abusive, or fraudulent content
* Use or misrepresent suggestions or analysis results as legal, customs, regulatory, or compliance advice

6. Classification, Tariffs, & Customs Disclaimer
HTS Hero is an assistive/analysis software tool. It does not replace individual or professional judgment.

You acknowledge and agree that:
* We do not provide legal, customs, regulatory, or compliance advice
* We do not provide or advize classifications, we assist you in performing your own classifications
* We do not provide or advize tariffs, we assist you in performing your own research and analysis of tariffs
* We do not guarantee the accuracy or completeness of classification assistance or tariff results
* You are solely responsible for classification decisions and any actions taken based on interactions with the Service
* You will perform your own due diligence and research before making any decisions based on the Service
* We are not liable for any customs outcomes, duties, penalties, or delays arising from your use of the Service or any actions taken based on the Service

This disclaimer applies to all users.

7. Intellectual Property
All software, models, UI, prompts, and documentation are owned by Provider.
You may not copy or modify the Service.

8. Privacy
Your use of the Service is subject to our Privacy Policy, available at:
https://www.htshero.com/privacy-policy
The Privacy Policy explains how we collect, use, and protect your data.

9. Third-Party Services & AI Processing
HTS Hero may use third-party services, for activities such as:
* Hosting
* Authentication
* Data Storage
* Request Processing

We apply appropriate safeguards, but cannot control third-party systems.
By using the Service, you consent to this processing.

10. Service Availability
We aim for ≥99% uptime, but availability may be affected by:
* Internet outages
* Hosting provider disruptions
* Maintenance windows
* Security incidents
We are not liable for interruptions beyond our reasonable control.

11. Limitation of Liability
To the fullest extent permitted by law:

11.1 Maximum Liability
Provider’s total cumulative liability for any claim arising from these Terms shall not exceed the amount you paid to Provider in the 6 months prior to the claim.
If you are a free user, liability is limited to $10.

11.2 Excluded Damages
Provider is not liable for:
* Lost profits
* Duty assessments
* Customs penalties
* Shipment delays
* Loss of goods
* Business interruption
* Regulatory consequences
* Indirect, special, punitive, or consequential damages

11.3 Classification Shield
Provider is not responsible for any customs or regulatory outcomes resulting from classifications performed while using the Service.

12. Termination
We may suspend or terminate your account for violations of these Terms.
You may terminate at any time by canceling your subscription.
Sections that reasonably should survive termination (e.g., liability limits) do survive.

13. Governing Law
These Terms are governed by the laws of the State of Wyoming, without regard to conflicts of law.

14. Changes to These Terms
We may update these Terms periodically.
Material changes will be posted on our website with a new “Last Updated” date.


15. Contact
Hive Works LLC
Email: support@htshero.com
`;

export const metadata = getSEOTags({
  title: `Terms of Service | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
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
          </svg>
          Home
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          {config.appName} Terms of Service
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {current}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
