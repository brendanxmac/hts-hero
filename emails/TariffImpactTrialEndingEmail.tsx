// emails/WelcomeEmail.tsx
import {
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";

export default function TariffImpactTrialEndingEmail() {
  return (
    <Html>
      <Head />
      <Preview>Upgrade Now & Save 50%!</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Container className="mx-auto py-2 font-sans max-w-[600px] bg-white">
          <Img
            alt="HTS Hero Logo"
            className="py-8 mx-auto"
            width="200"
            height="40"
            style={{
              width: "170px",
              maxWidth: "100%",
              height: "auto",
            }}
            src="https://exviallkczzlrkpaafxq.supabase.co/storage/v1/object/public/content/logo-text-black.png"
          />

          {/* Professional Trial Ending Section */}
          <Section className="text-center mt-0 mb-2 px-4">
            {/* Trial Status */}
            {/* <Text className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Trial Update
            </Text> */}
            <Heading className="text-2xl font-bold text-gray-900 mb-4">
              ⏰ Your Trial Ends <span className="underline">Tomorrow</span>
            </Heading>

            {/* Appreciation */}
            <Text className="text-base text-gray-600 leading-relaxed mb-4 max-w-lg mx-auto">
              We hope you got a chance to see how much time and effort Tariff
              Impact Pro can save you and your clients.
            </Text>

            {/* Special Offer Highlight */}
            <Container className="bg-gray-900 py-6 px-6 mt-10 mb-8 rounded-lg">
              <Text className="text-sm font-medium text-[#617BFF] uppercase tracking-wide mb-2">
                Limited Time Offer
              </Text>
              <Heading className="text-2xl font-bold text-white mb-0">
                Upgrade & Save 50%
              </Heading>
              <Text className="text-sm text-gray-300 mb-6 leading-relaxed mt-2">
                Trade is tough right now and everyone needs a little relief. So
                were offering Tariff Impact Pro at 50% off for a limited time.
              </Text>

              {/* Primary CTA */}
              <Button
                href="https://htshero.com/about/tariffs#pricing"
                className="bg-[#617BFF] text-white font-semibold py-4 px-8 text-lg mb-4"
              >
                Upgrade to Pro - Save 50%
              </Button>

              <Text className="text-sm text-red-500 font-medium">
                ⏰ Offer expires when your trial ends tomorrow!
              </Text>
              {/* Secondary CTA for hesitant users */}
              <Text className="text-sm text-gray-400 mb-2 mt-8">
                Need more time to decide?
              </Text>
              <Button
                href="mailto:support@htshero.com?subject=Trial Extension Request"
                className="text-[#617BFF] font-medium underline text-sm"
              >
                Contact us about extending your trial
              </Button>
            </Container>
          </Section>

          {/* What You'll Lose Section */}
          <Section className="text-center mb-3 mt-6 px-4">
            {/* <Heading className="text-center text-3xl font-bold text-gray-900">
              Upgrade to <span className="text-[#617BFF]">Keep </span> These
              Powerful Features:
            </Heading> */}
            <Heading className="text-4xl font-bold text-gray-900 mb-3">
              <span className="text-[#617BFF]">Save Hours</span> on Tariff
              Checks,
              <br /> <span className="text-[#617BFF]">Be Prepared</span> for
              Tariff Changes
            </Heading>
          </Section>

          {/* What You'll Lose - Get Notified */}
          <Section className="my-6 text-center bg-gray-50 rounded-lg p-6">
            <Heading className="text-center text-xl font-semibold my-0 text-gray-900 mb-3">
              <span className="text-[#617BFF]">Get Notified</span> When New
              Tariffs Affect Your Imports
            </Heading>
            <Text className="text-base text-gray-700 leading-relaxed mx-auto mt-1 mb-4">
              No more automatic emails when new tariff announcements affect any
              of your imports &rarr; you'll have to monitor changes manually
            </Text>
            <Img
              alt="HTS Hero Tariff Impact Notification"
              className="py-0 mx-auto"
              height="120"
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "auto",
              }}
              src="https://exviallkczzlrkpaafxq.supabase.co/storage/v1/object/public/content/tariff-impact-notification.png"
            />
          </Section>
          {/* What You'll Lose - See What's Impacted */}
          <Section className="my-6 text-center bg-gray-50 rounded-lg p-6">
            <Heading className="text-center text-xl font-semibold my-0 text-gray-900 mb-3">
              Know <span className="text-[#617BFF]"> Which Imports</span> Are
              Affected by New Tariffs
            </Heading>
            <Text className="text-base text-gray-700 leading-relaxed mx-auto mt-1 mb-4">
              No more instant answers about which imports are affected by new
              tariff announcements &rarr; back to error-prone manual checks
            </Text>
            <Img
              alt="HTS Hero See What's Affected"
              className="py-0 mx-auto"
              width="400"
              height="200"
              style={{
                width: "100%",
                maxWidth: "600px",
                height: "auto",
              }}
              src="https://exviallkczzlrkpaafxq.supabase.co/storage/v1/object/public/content/see-whats-affected.png"
            />
          </Section>

          <Section className="my-6 text-center bg-gray-50 rounded-lg p-6">
            <Heading className="text-center text-xl font-semibold my-0 text-gray-900 mb-3">
              See Your Landed Cost Changes &{" "}
              <span className="text-[#617BFF]">Find Possible Savings</span>
            </Heading>
            <Text className="text-sm text-gray-700 leading-relaxed mx-auto mt-1 mb-4">
              No more instant access to the latest duty rates, exemptions, and
              possible savings for any import &rarr; back to time-consuming
              manual lookups
            </Text>
            <Img
              alt="HTS Hero Tariff Impact Notification"
              className="py-0 mx-auto"
              width="300"
              height="120"
              style={{
                width: "100%",
                maxWidth: "600px",
                height: "auto",
              }}
              src="https://exviallkczzlrkpaafxq.supabase.co/storage/v1/object/public/content/tariff-wizard.png"
            />
          </Section>

          {/* Urgent Call to Action */}
          <Section className="text-center mb-10 mt-8 p-4">
            <Text className="text-3xl text-gray-900 mb-6 font-bold">
              Keep Your Pro Features & Continue Mastering Tariffs 👇
            </Text>

            <Button
              href="https://htshero.com/about/tariffs#pricing"
              className="bg-[#617BFF] text-white font-medium py-4 rounded-sm text-xl mb-0 w-full"
            >
              Upgrade & Save 50%
            </Button>

            <Text className="text-sm font-medium text-red-500 mb-0">
              ⏰ Offer expires when your trial ends tomorrow
            </Text>
          </Section>

          {/* Support Section */}
          <Section className="text-center">
            <Heading className="text-lg font-semibold text-gray-900 my-0">
              Questions? We're here to help!
            </Heading>
            <Text className="text-gray-600 leading-relaxed text-sm my-0">
              Reach out to us at{" "}
              <Button
                href="mailto:support@htshero.com"
                className="text-[#617BFF] font-semibold underline"
              >
                support@htshero.com
              </Button>{" "}
              {/* or explore our{" "}
              <Button
                href="https://htshero.com/about"
                className="text-[#617BFF] font-semibold"
              >
                getting started guide
              </Button>
              . */}
            </Text>

            <Text className="text-center text-gray-400 text-xs my-1">
              © 2025 HTS Hero. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
