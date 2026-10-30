import { ReactNode } from "react"
import { Body, Container, Font, Head, Html, Img, Link, Preview, Section, Text } from "@react-email/components"
import config from "../../config"
import { C, FONT_SANS, logoUrl, SITE } from "./brand"

// Every HTS Hero email: the soft ground, the wordmark, one white card holding the message, and a
// footer saying why it came and how to change that. Light only, 600px wide, inline styles, so it
// reads the same in Gmail, Outlook and Apple Mail.

const FIGTREE = "https://fonts.gstatic.com/s/figtree/v9/_Xms-HUzqDCFdgfMm4S9DaRvzig.woff2"
const SORA = "https://fonts.gstatic.com/s/sora/v17/xMQOuFFYT72X5wkB_18qmnndmSeMmU-NKQJDA8i1P4w.woff2"

export interface EmailFooter {
  // Why this person got it ("You subscribed to US tariff updates.")
  reason: string
  manageUrl?: string
  unsubscribeUrl?: string
}

export const EmailLayout = ({
  preview,
  children,
  footer,
}: {
  // The line inboxes show after the subject
  preview: string
  children: ReactNode
  footer: EmailFooter
}) => (
  <Html lang="en">
    <Head>
      {/* Variable fonts: one file covers every weight, declared as a range so 400 reads as 400.
          Font sets the whole email's face, so only Figtree goes through it; Sora is declared on its
          own for headlines. Inboxes that can't load them use Helvetica. */}
      <Font fontFamily="Figtree" fallbackFontFamily="Helvetica" webFont={{ url: FIGTREE, format: "woff2" }} fontWeight="300 900" fontStyle="normal" />
      <style>{`@font-face { font-family: 'Sora'; font-style: normal; font-weight: 100 800; src: url(${SORA}) format('woff2'); }`}</style>
    </Head>
    <Preview>{preview}</Preview>
    <Body style={{ margin: 0, backgroundColor: C.ground, fontFamily: FONT_SANS, color: C.text }}>
      <Container style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "32px 16px 40px" }}>
        <Section style={{ padding: "0 0 16px" }}>
          <Link href={SITE}>
            <Img src={logoUrl()} alt="HTS Hero" width="170" height="48" style={{ display: "block", height: 48, width: 170 }} />
          </Link>
        </Section>
        <Section style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: "36px 36px 32px" }}>
          {children}
        </Section>
        <Section style={{ padding: "24px 8px 0" }}>
          <Text style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: C.muted }}>{footer.reason}</Text>
          {(footer.manageUrl || footer.unsubscribeUrl) && (
            <Text style={{ margin: "6px 0 0", fontSize: 12, lineHeight: "18px", color: C.muted }}>
              {footer.manageUrl && (
                <Link href={footer.manageUrl} style={{ color: C.muted, textDecoration: "underline" }}>
                  Manage what you get
                </Link>
              )}
              {footer.manageUrl && footer.unsubscribeUrl && " · "}
              {footer.unsubscribeUrl && (
                <Link href={footer.unsubscribeUrl} style={{ color: C.muted, textDecoration: "underline" }}>
                  Unsubscribe
                </Link>
              )}
            </Text>
          )}
          <Text style={{ margin: "12px 0 0", fontSize: 12, lineHeight: "18px", color: C.faint }}>
            HTS Hero · <Link href={SITE} style={{ color: C.faint }}>htshero.com</Link>
            {` · ${config.mailingAddress}`}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
