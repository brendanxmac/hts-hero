import { CreateEmailOptions, Resend } from "resend";
import config from "@/config";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmails = async (emails: CreateEmailOptions[]) => {
  const CHUNK_SIZE = 100;
  const RATE_LIMIT_DELAY = 500; // 500ms delay = 2 requests per second

  // Split emails into chunks of 100
  const chunks: CreateEmailOptions[][] = [];
  for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
    chunks.push(emails.slice(i, i + CHUNK_SIZE));
  }

  const results = [];

  // Process each chunk with rate limiting
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    try {
      const result = await resend.batch.send(chunk);
      results.push(result);

      // Add delay between requests (except for the last chunk)
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    } catch (error) {
      console.error(`Error sending email chunk ${i + 1}:`, error);
      results.push({ error });
    }
  }

  return results;
};

export const sendEmailFromComponent = async ({
  to,
  subject,
  emailComponent,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  emailComponent: React.ReactNode;
  replyTo?: string | string[];
}) => {
  return resend.emails.send({
    from: config.resend.fromAdmin,
    to,
    subject,
    react: emailComponent,
    ...(replyTo && { replyTo }),
  });
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string | string[];
}) => {
  const { data, error } = await resend.emails.send({
    from: config.resend.fromAdmin,
    to,
    subject,
    text,
    html,
    ...(replyTo && { replyTo }),
  });

  if (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }

  return data;
};
