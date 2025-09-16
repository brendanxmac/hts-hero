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

export default function TariffImpactTrialSartedEmail() {
  return (
    <Html>
      <Head />
      <Preview>
        Upload your Imports & Start Mastering Tariffs with Tariff Impact Pro
      </Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Container className="mx-auto py-4 font-sans max-w-[600px] bg-white">
          <Img
            alt="HTS Hero Logo"
            className="py-8 mx-auto mb-0 pb-4"
            width="200"
            height="40"
            style={{
              width: "170px",
              maxWidth: "100%",
              height: "auto",
            }}
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/logo-text-black.png`}
          />

          <Section className="p-4 text-center mt-0">
            <Heading className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              🚀 Trial Activated!
            </Heading>

            <Text className="text-base mb-0 text-gray-600">
              You have full access to{" "}
              <span className="text-[#617BFF] font-bold underline">
                Tariff Impact Pro
              </span>{" "}
              for the next 7 days, including all the benefits listed below.
            </Text>
          </Section>

          <Heading className="text-center text-4xl font-bold text-gray-900 my-10">
            Tariffs <span className="text-[#617BFF]">Made Easy</span>
          </Heading>

          {/* Get Notified */}
          <Section className="my-8 text-center bg-[#617BFF]/10 rounded-lg px-4 py-8">
            <Heading className="text-center text-2xl font-semibold my-0 text-gray-900">
              <span className="text-[#617BFF]">Get Notified</span> When New
              Tariffs Affect your Imports
            </Heading>
            <Text className="text-sm text-gray-700 leading-relaxed mx-auto mt-1 mb-4">
              Recieve emails when new tariff announcements affect any of your
              imports
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
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/tariff-impact-notification.png`}
            />
          </Section>
          {/* See What's Impacted */}
          <Section className="my-8 text-center bg-[#617BFF]/10 rounded-lg px-4 py-8">
            {/* <Heading className="text-center text-3xl mb-2">✅</Heading> */}
            <Heading className="text-center text-2xl font-semibold my-0 text-gray-900">
              See Which Imports{" "}
              <span className="text-[#617BFF]">Are Affected</span> by New
              Tariffs
            </Heading>
            <Text className="text-sm text-gray-700 leading-relaxed mx-auto mt-1 mb-4">
              announcements
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
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/see-whats-affected.png`}
            />
          </Section>

          <Section className="my-8 text-center bg-[#617BFF]/10 rounded-lg px-4 py-8">
            <Heading className="text-center text-2xl font-semibold my-0 text-gray-900">
              <span className="text-[#617BFF]">Instantly</span> See The Impact
              On Your Bottom Line
            </Heading>
            <Text className="text-sm text-gray-700 leading-relaxed mx-auto mt-1 mb-4">
              Find the latest duty rates, exemptions, and possible savings for
              any import, from any country
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
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/tariff-wizard.png`}
            />
          </Section>

          {/* Call to Action */}
          <Section className="text-center mb-10 mt-6">
            {/* TODO: add a button that goes to a tutorial and or how to page */}
            <Button
              href="https://htshero.com/tariffs/impact-checker"
              className="bg-[#617BFF] text-white font-medium py-3 px-20 mx-auto rounded-xl text-lg"
            >
              Get Started →
            </Button>
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
