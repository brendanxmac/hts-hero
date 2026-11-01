import AuthEmail from "../../auth/AuthEmail"

// Preview only: the copy is in emails/auth/AuthEmail.tsx (sent by Supabase, see `npm run email:auth`)
export default function Preview() {
  return <AuthEmail kind="reset" />
}
