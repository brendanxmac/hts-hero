import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://htshero.com
// - Name: HTS Hero
// - Description: An HTS code lookup tool to help people find the right HTS code any product
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: brendan@htshero.com

// Please write a simple privacy policy for my site. Add the current date.  Do not add or explain your reasoning. Answer:

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
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Effective Date: January 12, 2025

At HTS Hero ("we," "us," or "our"), we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website (https://htshero.com).

1. Information We Collect

Personal Information:
We may collect the following personal information when you interact with our site:
- Name
- Email address
- Payment information
- Product descriptions

Non-Personal Information:
We also collect non-personal information through the use of cookies to improve your experience and analyze website performance.

2. How We Use Your Information
We use the information collected for the following purposes:
- To process orders and payments
- To communicate with you regarding your account or transactions
- To improve our website and services

3. Data Sharing
We do not share your personal or non-personal information with any third parties.

4. Children's Privacy
Our website is not intended for children under the age of 13, and we do not knowingly collect personal information from children.

5. Updates to This Privacy Policy
We may update this Privacy Policy from time to time. If we make changes, we will notify you via the email address provided.

6. Contact Us
If you have any questions about this Privacy Policy, please contact us at: support@htshero.com

By using HTS Hero, you consent to the terms of this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
