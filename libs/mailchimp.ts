import axios from "axios"
import crypto from "crypto"

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
const MAILCHIMP_BASE_URL = process.env.MAILCHIMP_BASE_URL
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID

function getMd5Hash(value: string): string {
  return crypto.createHash("md5").update(value.toLowerCase()).digest("hex")
}

/**
 * Adds or updates a Mailchimp audience member and applies tags.
 * Uses PUT to /lists/{id}/members/{hash} which is idempotent —
 * it creates the member if they don't exist, or updates them if they do,
 * so duplicate audience members are never created.
 */
export async function addOrUpdateMailchimpContact(
  email: string,
  tags: string[],
) {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_BASE_URL || !MAILCHIMP_AUDIENCE_ID) {
    throw new Error(
      "Missing Mailchimp environment variables. Ensure MAILCHIMP_API_KEY, MAILCHIMP_BASE_URL, and MAILCHIMP_AUDIENCE_ID are set.",
    )
  }

  const subscriberHash = getMd5Hash(email)
  const authHeader = {
    Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
    "Content-Type": "application/json",
  }

  try {
    await axios.put(
      `${MAILCHIMP_BASE_URL}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`,
      {
        email_address: email,
        status_if_new: "subscribed",
      },
      { headers: authHeader },
    )

    if (tags.length > 0) {
      await axios.post(
        `${MAILCHIMP_BASE_URL}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}/tags`,
        {
          tags: tags.map((tag) => ({ name: tag, status: "active" })),
        },
        { headers: authHeader },
      )
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const detail = error.response?.data?.detail || error.response?.data?.title
      console.error(
        `Mailchimp API error (${status}): ${detail || error.message}`,
      )
      throw new Error(
        `Mailchimp API error (${status}): ${detail || error.message}`,
      )
    }
    throw error
  }
}
