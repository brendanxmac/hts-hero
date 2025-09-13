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
          <Section className="bg-black rounded-md w-full text-center mb-4">
            <Img
              alt="HTS Hero Logo"
              className="py-8 mx-auto"
              height="40"
              src="https://exviallkczzlrkpaafxq.supabase.co/storage/v1/object/public/content/logo-text-white.svg"
            />
          </Section>
          {/* Warm Welcome */}
          <Section className="text-center">
            <Heading className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
              👋 Welcome{name ? `, ${name}` : ""}!
            </Heading>
            <Text className="text-base text-gray-600 leading-relaxed mx-auto">
              You've just joined hundreds of importers & customs brokers who
              save hours every day with our tools, and we're thrilled to have
              you.
            </Text>
            <Text className="text-base text-gray-600 leading-relaxed mx-auto mt-6">
              Let&apos;s get started.
            </Text>
          </Section>

          {/* Service Description */}
          <Section className="mb-8 text-center text-gray-900 text-base">
            <br />
            <Heading className="text-center text-2xl font-semibold mb-4">
              🚀
            </Heading>
            <Heading className="text-center text-2xl font-semibold mb-8">
              Time Saving Tools for{" "}
              <span className="text-[#617BFF]">Trade Professionals</span>
            </Heading>

            <Section className="bg-gray-50 rounded-lg p-6 text-black text-center">
              <Text className="text-base font-medium leading-relaxed my-3">
                Workloads in trade have never been higher.
              </Text>
              <Text className="text-base font-medium leading-relaxed my-3">
                The constant changes and increased complexity are overwhelming.
              </Text>
              <Text className="text-base text-black leading-relaxed my-3 font-bold">
                Our tools help you work{" "}
                <span className="underline text-[#617BFF]">
                  smarter, faster, and with greater confidence.
                </span>
              </Text>
              <Text className="text-base font-medium leading-relaxed my-3">
                We help you escape the endless workload and find clarity in the
                chaos.
              </Text>
            </Section>
          </Section>

          {/* Key Features */}
          <Section className="mb-4 rounded-md p-4 pb-8 text-gray-900">
            <Heading className="text-2xl font-bold mb-0 text-center">
              🛠️
            </Heading>
            <Heading className="text-2xl font-bold mb-6 text-center">
              Your New Toolkit
            </Heading>

            <div className="flex flex-col gap-4">
              <Section className="bg-gray-50 rounded-lg p-4 text-gray-900 text-center">
                <Text className="font-bold text-lg mb-2 text-gray-900">
                  ✅ Tariff Impact Checker
                </Text>
                <Text className="leading-relaxed text-sm font-medium text-gray-600">
                  Instantly know when and how new tariffs affect your imports
                  and discover potential savings.
                </Text>
              </Section>

              <Section className="bg-gray-50 rounded-lg p-4 text-gray-900 text-center">
                <Text className="font-bold text-lg mb-2 text-gray-900">
                  🎯 Classification Assistant
                </Text>
                <Text className="leading-relaxed text-sm font-medium text-gray-600">
                  Classify anything in minutes with the platform designed to
                  make customs brokers unreasonably productive.
                </Text>
              </Section>

              <Section className="bg-gray-50 rounded-lg p-4 text-gray-900 text-center">
                <Text className="font-bold text-lg mb-2 text-gray-900">
                  📊 Tariff Wizard
                </Text>
                <Text className="leading-relaxed text-sm font-medium text-gray-600">
                  Find the duty rate and exemptions for any item, from any
                  country, in seconds.
                </Text>
              </Section>
            </div>

            {/* Call to Action */}
            <Section className="text-center mb-8 my-4 bg-gradient-to-br from-[#617BFF] to-[#4C63D2] rounded-2xl py-6">
              <Button
                href="https://htshero.com"
                className="bg-[#617BFF] text-white font-bold py-3 px-4 mx-auto max-w-sm rounded-xl text-base"
              >
                Get Started →
              </Button>
            </Section>
          </Section>

          {/* Support Section */}
          <Section className="text-center">
            <Heading className="text-lg font-semibold text-gray-900 mb-0 mt-8">
              Questions? We're here to help!
            </Heading>
            <Text className="text-gray-600 leading-relaxed my-0">
              Reach out to us at{" "}
              <Button
                href="mailto:support@htshero.com"
                className="text-[#617BFF] font-semibold"
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
          </Section>

          <Section className="my-0">
            <Text className="text-center text-gray-400 text-xs">
              © 2025 HTS Hero. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
