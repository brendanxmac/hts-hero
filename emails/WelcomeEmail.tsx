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

export default function WelcomeEmail() {
  return (
    <Html>
      <Head />
      <Preview>Welcome to HTS Hero!</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Container className="mx-auto py-4 font-sans max-w-[600px] bg-white">
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

          {/* Warm Welcome */}
          <Section className="text-center mb-8">
            <Heading className="text-2xl font-bold text-[#617BFF] mb-4 tracking-tight">
              Welcome! 👋
            </Heading>
            <Text className="text-lg text-gray-700 leading-relaxed mx-auto mb-4">
              We&apos;re thrilled to have you here.
            </Text>
            <Text className="text-lg text-gray-700 leading-relaxed mx-auto mb-4">
              Hundreds of importers & customs brokers save hours every day with
              our tools, and we&apos;re excited to help you do the same.
            </Text>
          </Section>

          {/* Service Description */}
          <Section className="mb-10 text-center">
            <Heading className="text-center text-4xl mb-2">🚀</Heading>
            <Heading className="text-center text-3xl font-semibold mb-2 text-gray-900">
              Time Saving Tools for{" "}
              <span className="text-[#617BFF]">Trade Professionals</span>
            </Heading>

            <Section className="text-center">
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                Trade has never been more complicated.
              </Text>
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                The nonstop changes and increased regulation is overwhelming.
              </Text>
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                Spreadsheets and old systems aren&apos;t cutting it anymore.
              </Text>
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                You&apos;re being asked to chop down a tree with a dull axe in
                half the time.
              </Text>
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                We believe trade professionals deserve better...
              </Text>
              <Text className="text-lg leading-relaxed mb-4 font-bold text-gray-900">
                So we&apos;re building tools that help you work{" "}
                <span className="underline text-[#617BFF]">
                  smarter, faster, and with greater confidence.
                </span>
              </Text>
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                The industry needs a better way and we&apos;re paving that path.
              </Text>
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                As trade changes, the only mistake is not changing with it.
              </Text>
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                Upgrade your tools, conquer uncertainty, and lead the industry.
              </Text>
            </Section>
          </Section>

          {/* Key Features */}
          <Section className="mb-8 text-center">
            <Heading className="text-4xl mb-2">🛠️</Heading>
            <Heading className="text-3xl font-bold mb-8 text-gray-900">
              Your New Toolkit
            </Heading>

            <Section className="bg-[#617BFF]/10 rounded-lg p-6 text-center mb-6">
              <Text className="font-bold text-xl mb-3 text-gray-900">
                ✅ Tariff Impact Checker
              </Text>
              <Text className="leading-relaxed text-lg text-gray-600">
                Instantly know when and how new tariffs affect your imports.
              </Text>
            </Section>

            <Section className="bg-[#617BFF]/10 rounded-lg p-6 text-center mb-6">
              <Text className="font-bold text-xl mb-3 text-gray-900">
                🎯 Classification Assistant
              </Text>
              <Text className="leading-relaxed text-lg text-gray-600">
                Classify anything in minutes & delight your clients.
              </Text>
            </Section>

            <Section className="bg-[#617BFF]/10 rounded-lg p-6 text-center">
              <Text className="font-bold text-xl mb-3 text-gray-900">
                📊 Tariff Wizard
              </Text>
              <Text className="leading-relaxed text-lg text-gray-600">
                Find duty rates and possible savings for any import.
              </Text>
            </Section>
          </Section>

          {/* Call to Action */}
          <Section className="text-center mb-10 mt-8">
            <Button
              href="https://htshero.com"
              className="bg-[#617BFF] text-white font-bold py-4 px-12 mx-auto rounded-xl text-lg"
            >
              Get Started →
            </Button>
          </Section>

          {/* Support Section */}
          <Section className="text-center">
            <Heading className="text-xl font-semibold text-gray-900">
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
