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

const current = `Effective Date: June 18, 2025

Welcome to HTS Hero ("we," "us," or "our"). By accessing and using our website (https://htshero.com), you agree to comply with the following Terms & Services. Please read these terms carefully.

1. Use of Service

HTS Hero provides tools that simplify tariffs and HTS classification.
Users are welcome to use the platform and the assitance and information it provides at their discretion.
HTS Hero does not guarantee the accuracy or completeness of the results provided.
Any analysis or suggestions provided are for informational purposes only and should be verified by the user before making any decisions.
We do not classify anything for you, we provide you with information that may help you with your own classifications.


2. Payments

- All purchases are final and cannot be reimbursed or refunded.
- If you believe you have encountered an error, please contact us at support@htshero.com.
- Please ensure you review your purchase before completing the transaction.


3. User Responsibilities

By using our website, you agree to:
- Provide accurate information when creating an account or making a purchase (if applicable).
- Refrain from any unlawful use of our services.
- Use all information at your own discretion, and make all decisions based on your own research and judgement


4. Data Collection

We collect and process personal and non-personal data as outlined in our [Privacy Policy](https://htshero.com/privacy-policy). This includes:
- Personal Information: name and email.
- Purchase Information: What was purchased & when.
- Non-Personal Information via browser cookies
None of this data is shared with third parties.

5. Ownership of Content

HTS Hero retains ownership over all content and materials it creates and provides on the platform.
This includes all tools, their outputs, and any proprietary algorithms, systems, or databases used to generate results.
All content provided by HTS Hero, including classification suggestions, remains the intellectual property of HTS Hero.

Your Use Rights:
Users may use the suggestions at their discretion for their personal or business purposes, such as applying an HTS code to a product.
This does not grant users ownership of the platform, its systems, or its methodologies.

Limits of Use:

Users may not:
- Reproduce, redistribute, or repurpose the HTS Hero platform, its data, or its content for commercial use without explicit permission from HTS Hero.
- Reverse-engineer, decompile, or attempt to extract proprietary elements of the platform.


6. Updates to Terms
We reserve the right to update these Terms & Services at any time. If changes are made, users will be notified via the email address provided.


7. Governing Law
These Terms & Services are governed by the laws of the United States of America. Any disputes arising from these terms will be resolved under U.S. jurisdiction.


8. Contact Us
If you have any questions about these Terms & Services, please contact us at: support@htshero.com

Thank you for using HTS Hero.`;

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
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
          Terms and Conditions for {config.appName}
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
