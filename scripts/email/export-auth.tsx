// Writes the Supabase Auth email templates as HTML, for pasting into the Supabase dashboard
// (Authentication → Email Templates): one file per email, plus the subjects to use.
//
//   npm run email:auth

import { existsSync, mkdirSync, writeFileSync } from "fs"
import { join } from "path"
import { render } from "@react-email/render"
import AuthEmail, { AUTH_EMAILS, type AuthKind } from "../../emails/auth/AuthEmail"

const OUT = join("supabase", "email-templates")

// React Email pads the preview line with invisible characters. They're no use here and can come
// through the Supabase dashboard as garbage.
const INVISIBLE = /[\u00A0\u200B-\u200F\uFEFF]/g
const plain = (html: string) => html.replace(INVISIBLE, "").replace(/·/g, "&middot;")

const main = async () => {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  mkdirSync(OUT, { recursive: true })
  const subjects: string[] = []
  for (const kind of Object.keys(AUTH_EMAILS) as AuthKind[]) {
    const html = await render(<AuthEmail kind={kind} />)
    writeFileSync(join(OUT, `${kind}.html`), plain(html))
    subjects.push(`${kind}: ${AUTH_EMAILS[kind].subject}`)
  }
  writeFileSync(join(OUT, "SUBJECTS.txt"), subjects.join("\n") + "\n")
  console.log(`Wrote ${subjects.length} templates to ${OUT}`)
}

main()
