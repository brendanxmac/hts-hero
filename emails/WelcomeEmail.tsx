// emails/WelcomeEmail.tsx
import {
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to HTS Hero!</Preview>
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
              height="40"
              src="https://exviallkczzlrkpaafxq.supabase.co/storage/v1/object/public/content/logo-text-white.svg"
            />
          </Section>

          {/* Warm Welcome */}
          <Section className="text-center mb-8">
            <Heading className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              👋 Welcome{name ? `, ${name}` : ""}!
            </Heading>
            <Text className="text-lg text-gray-700 leading-relaxed mx-auto mb-4">
              You've just joined the hundreds of importers & customs brokers who
              save hours every day with our tools.
            </Text>
            <Text className="text-lg text-gray-700 leading-relaxed mx-auto">
              Let&apos;s get started.
            </Text>
          </Section>

          {/* Service Description */}
          <Section className="mb-10 text-center">
            <Heading className="text-center text-4xl mb-2">🚀</Heading>
            <Heading className="text-center text-2xl font-semibold mb-2 text-gray-900">
              Time Saving Tools for{" "}
              <span className="text-[#617BFF]">Trade Professionals</span>
            </Heading>

            <Section className="text-center">
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                Trade has never been more complicated.
              </Text>
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                The constant changes and increased demands are overwhelming.
              </Text>
              <Text className="text-lg leading-relaxed mb-4 font-bold text-gray-900">
                Our tools help you work{" "}
                <span className="underline text-[#617BFF]">
                  smarter, faster, and with greater confidence.
                </span>
              </Text>
              <Text className="text-lg leading-relaxed mb-4 text-gray-700">
                We understand your daily challenges and provide a much needed
                boost.
              </Text>
            </Section>
          </Section>

          {/* Key Features */}
          <Section className="mb-8 text-center">
            <Heading className="text-4xl mb-2">🛠️</Heading>
            <Heading className="text-2xl font-bold mb-8 text-gray-900">
              Your New Toolkit
            </Heading>

            <div className="flex flex-col gap-6">
              <Section className="bg-[#617BFF]/10 rounded-lg p-6 text-center">
                <Text className="font-bold text-xl mb-3 text-gray-900">
                  ✅ Tariff Impact Checker
                </Text>
                <Text className="leading-relaxed text-lg text-gray-600">
                  Instantly know when and how new tariffs affect your imports.
                </Text>
              </Section>

              <Section className="bg-[#617BFF]/10 rounded-lg p-6 text-center">
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
            </div>
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
