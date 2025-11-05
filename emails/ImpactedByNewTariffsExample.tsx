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

export default function ImpactedByNewTariffsEmailExample() {
  const impactCheckerUrl = `https://htshero.com/tariffs/impact-checker`;

  return (
    <Html>
      <Head />
      <Preview>See Affected Imports 👉</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Container className="mx-auto py-4 font-sans max-w-[600px] bg-white">
          <Img
            alt="HTS Hero Logo"
            className="py-4 mx-auto"
            width="170"
            height="30"
            style={{
              width: "auto",
              height: "30px",
            }}
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/logo-text-black.png`}
          />

          {/* Demo Example Notice */}
          <Section className="text-center px-2 mb-6">
            <Container
              className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg"
              style={{
                backgroundColor: "#fff7ed",
                borderLeft: "4px solid #fb923c",
                padding: "16px",
                borderTopRightRadius: "8px",
                borderBottomRightRadius: "8px",
              }}
            >
              <Text
                className="text-orange-800 text-sm font-medium my-0 leading-relaxed"
                style={{
                  color: "#9a3412",
                  fontSize: "14px",
                  fontWeight: "500",
                  margin: "0",
                  lineHeight: "1.5",
                }}
              >
                ⚠️ <span className="font-bold">DEMONSTRATION ONLY</span> - This
                is a fake tariff impact alert. None of your imports are
                affected. This is just an example of what you can expect when
                your imports are affected in the future.
              </Text>
            </Container>
          </Section>

          {/* Alert Section with Border */}
          <Section className="text-center px-2 mb-8">
            <Heading className="text-2xl font-bold text-gray-900 mb-4">
              🚨 New Tariff Impact Alert
            </Heading>

            <Text className="text-base text-gray-800 leading-relaxed mt-0 mb-6">
              We've identified that{" "}
              <span className="font-bold text-red-600">5 of your imports</span>{" "}
              are affected by the new tariff announcement.
            </Text>

            {/* <Heading className="text-lg font-bold text-gray-900 leading-relaxed mb-3">
              Your Impact Summary
            </Heading> */}

            {/* Impact Summary Grid */}
            <Container className="bg-[#617BFF]/10 rounded-lg p-6 mb-6">
              {/* Tariff Announcement */}
              <Container className="mb-4 pb-2">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 my-0">
                  TARIFF ANNOUNCEMENT
                </Text>
                <Text className="text-lg font-bold text-black my-0 leading-tight">
                  Fake Tariff Announcement
                </Text>
              </Container>

              {/* Import List */}
              <Container className="mb-4 pb-2">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 my-0">
                  IMPORT LIST
                </Text>
                <Text className="text-lg font-bold text-black my-0 leading-tight">
                  Fake Import List
                </Text>
              </Container>

              {/* Affected Count */}
              <Container className="mb-0">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-0 mb-2">
                  IMPORTS AFFECTED
                </Text>
                <Container className="w-fit bg-red-600 px-3 py-1 rounded">
                  <Text className="text-lg text-white font-bold my-0 leading-none">
                    5 imports
                  </Text>
                </Container>
              </Container>
            </Container>
            {/* CTA Button */}
            <Container className="text-center mt-8">
              <Button
                href={impactCheckerUrl}
                className="w-full bg-[#4F46E5] text-white font-bold py-4 text-lg rounded-lg"
              >
                See Affected Imports →
              </Button>
            </Container>
          </Section>

          {/* Benefits Section */}
          {/* <Section className="px-6 mb-6 mt-12 text-center">
            <Heading className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Tired of Tariff Chaos?
            </Heading>

            <Container className="mt-0">
              <Text className="text-lg text-gray-800 mb-5 font-medium leading-relaxed">
                <span className="text-green-500 font-bold text-xl mr-3">✓</span>
                See which of your imports are affected by new tariff
                announcements
              </Text>

              <Text className="text-lg text-gray-800 mb-5 font-medium leading-relaxed">
                <span className="text-green-500 font-bold text-xl mr-3">✓</span>
                Quickly know how new tariffs change your landed costs
              </Text>

              <Text className="text-lg text-gray-800 mb-6 font-medium leading-relaxed">
                <span className="text-green-500 font-bold text-xl mr-3">✓</span>
                Discover ways to save on your import costs
              </Text>
            </Container>

            <Container className="text-center mt-8">
              <Button
                href={impactCheckerUrl}
                className="bg-[#4F46E5] text-white font-bold py-4 px-10 text-lg rounded-lg border-2 border-[#3730A3]"
              >
                Upgrade to Pro →
              </Button>
            </Container>
          </Section> */}

          {/* Support Section */}
          <Section className="px-4 my-10 text-center">
            <Text className="text-sm text-gray-700 my-0 leading-relaxed">
              Questions about this notification? Contact our support team at{" "}
              <Button
                href="mailto:support@htshero.com"
                className="text-[#4F46E5] font-medium underline"
              >
                support@htshero.com
              </Button>
            </Text>
          </Section>

          {/* Disclaimers */}
          <Section className="text-center px-4 mb-6">
            <Text className="text-xs text-gray-500 leading-relaxed mb-3">
              <span className="font-medium">Data Source Disclaimer:</span>{" "}
              Tariff information is obtained from official government sources.
              We do not guarantee full accuracy, especially if time has passed
              since receiving this email.
            </Text>
            <Text className="text-xs text-gray-500 leading-relaxed mb-0">
              <span className="font-medium">Liability Disclaimer:</span> HTS
              Hero is not responsible for actions taken based on this
              information. Please verify with official sources or consult a
              customs broker before making taking action.
            </Text>
          </Section>

          {/* Footer */}
          <Section className="text-center pt-6">
            <Text className="text-center text-gray-400 text-xs my-2">
              © 2025 HTS Hero. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
