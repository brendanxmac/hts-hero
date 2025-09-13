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
      <Preview>Trial Activated!</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Container className="mx-auto py-8 font-sans max-w-[600px] bg-white">
          {/* Header with Logo */}
          <Section className="bg-black rounded-lg w-full text-center mb-8">
            <Img
              alt="HTS Hero Logo"
              className="py-8 mx-auto"
              width="200"
              height="40"
              style={{
                width: "200px",
                maxWidth: "100%",
                height: "auto",
              }}
              src="https://exviallkczzlrkpaafxq.supabase.co/storage/v1/object/public/content/logo-with-text.png"
            />
          </Section>

          {/* Warm Welcome */}

          <Section className="bg-[#617BFF]/10 rounded-lg p-6 text-center">
            <Text className="text-base text-gray-700 leading-relaxed mx-auto mb-0">
              You just activated a 7 day free trial of:
            </Text>
            <Heading className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
              Tariff Impact Checker Pro
            </Heading>

            <Text className="text-sm text-gray-700 leading-relaxed mx-auto mb-0">
              Here&apos;s what you get:
            </Text>
          </Section>

          {/* Get Notified */}
          <Section className="my-16 text-center">
            {/* <Heading className="text-center text-3xl mb-2">🔔</Heading> */}
            <Heading className="text-center text-2xl font-semibold my-0 text-gray-900">
              <span className="text-[#617BFF]">Get Notified</span> When Tariff
              Changes Affect your Imports
            </Heading>
            <Text className="text-base text-gray-700 leading-relaxed mx-auto mt-1 mb-4">
              Recieve email notifications when new tariff announcements affect
              your imports
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
          {/* See What's Impacted */}
          <Section className="my-16 text-center">
            {/* <Heading className="text-center text-3xl mb-2">✅</Heading> */}
            <Heading className="text-center text-2xl font-semibold my-0 text-gray-900">
              See Which Imports Are{" "}
              <span className="text-[#617BFF]">Affected</span>
            </Heading>
            <Text className="text-base text-gray-700 leading-relaxed mx-auto mt-1 mb-4">
              Instantly know which imports are affected by tariff updates
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
          {/* Tariff Wizard */}
          <Section className="my-10 text-center">
            {/* <Heading className="text-center text-3xl mb-2">🔔</Heading> */}
            <Heading className="text-center text-2xl font-semibold my-0 text-gray-900">
              Your Personal{" "}
              <span className="text-[#617BFF]">Tariff Wizard</span>
            </Heading>
            <Text className="text-base text-gray-700 leading-relaxed mx-auto mt-1 mb-4">
              Instantly find duty rates and possible savings for any import
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

          {/* Call to Action */}
          <Section className="text-center mb-10 mt-16">
            {/* TODO: add a button that goes to a tutorial and or how to page */}
            <Button
              href="https://htshero.com"
              className="bg-[#617BFF] text-white font-medium py-4 px-12 mx-auto rounded-xl text-lg"
            >
              Check your Imports →
            </Button>
          </Section>

          {/* Support Section */}
          <Section className="text-center">
            <Heading className="text-xl font-semibold text-gray-900 my-2">
              Questions? We're here to help!
            </Heading>
            <Text className="text-gray-600 leading-relaxed text-base">
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

            <Text className="text-center text-gray-400 text-sm">
              © 2025 HTS Hero. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
