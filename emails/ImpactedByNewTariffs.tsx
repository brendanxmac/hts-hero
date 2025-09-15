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

interface ImpactedByNewTariffsEmailProps {
  tariffName: string;
  userImportListName: string;
  affectedImportsCount: number;
  tariffCodeSetId: string;
  htsCodeSetId: string;
}

export default function ImpactedByNewTariffsEmail({
  tariffName = "New Steel and Aluminum Tariffs",
  userImportListName = "My Import Portfolio",
  affectedImportsCount = 5,
  tariffCodeSetId = "tariff-123",
  htsCodeSetId = "hts-456",
}: ImpactedByNewTariffsEmailProps) {
  const impactCheckerUrl = `https://htshero.com/tariffs/impact-checker?tariffAnnouncement=${tariffCodeSetId}&htsCodeSet=${htsCodeSetId}`;

  return (
    <Html>
      <Head />
      <Preview>
        {`🚨 New Tariffs Affect ${affectedImportsCount} of your Imports - View Impact Details`}
      </Preview>
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

          {/* Alert Section with Border */}
          <Section className="text-center px-4 mb-8 border-4 border-[#4F46E5] rounded-lg bg-white shadow-lg">
            <Heading className="text-2xl font-bold text-gray-900 mb-2">
              🚨 New Tariff Impact Alert
            </Heading>

            <Text className="text-base text-gray-800 leading-relaxed mt-2 mb-4">
              We've identified that{" "}
              <span className="font-bold text-red-600">
                {affectedImportsCount} of your imports are affected
              </span>{" "}
              by new tariffs.
            </Text>

            {/* <Heading className="text-lg font-bold text-gray-900 leading-relaxed mb-3">
              Your Impact Summary
            </Heading> */}

            {/* Impact Summary Grid */}
            <Container className="bg-gray-900 border-2 border-gray-600 rounded-lg py-6 mb-6">
              {/* Tariff Announcement */}
              <Container className="mb-4 pb-4 border-b-2 border-gray-500">
                <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 my-0">
                  TARIFF ANNOUNCEMENT
                </Text>
                <Text className="text-xl font-semibold text-white my-0">
                  {tariffName}
                </Text>
              </Container>

              {/* Import List */}
              <Container className="mb-4 pb-4 border-b-2 border-gray-500">
                <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 my-0">
                  IMPORT LIST
                </Text>
                <Text className="text-xl font-semibold text-white my-0">
                  {userImportListName}
                </Text>
              </Container>

              {/* Affected Count */}
              <Container className="mb-0">
                <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-0 mb-2">
                  IMPORTS AFFECTED
                </Text>
                <Container className="w-fit bg-red-500 px-4 py-0 rounded-lg">
                  <Text className="text-2xl text-white font-semibold my-0">
                    {affectedImportsCount}{" "}
                    {affectedImportsCount === 1 ? "import" : "imports"}
                  </Text>
                </Container>
              </Container>
            </Container>
            {/* CTA Button */}
            <Container className="text-center mt-6">
              <Button
                href={impactCheckerUrl}
                className="bg-[#4F46E5] text-white font-bold py-4 px-8 text-lg rounded-lg border-2 border-[#3730A3]"
              >
                See Affected Imports →
              </Button>
            </Container>
          </Section>

          {/* Benefits Section */}
          <Section className="px-2 mb-2 mt-8 text-center">
            <Heading className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Tired of Tariff Chaos?
            </Heading>

            <Container className="mt-0">
              <Text className="text-lg text-gray-800 mb-4 font-medium">
                <span className="text-green-500 font-bold text-xl mr-3">✓</span>
                See which of your imports are affected by new tariff
                announcements
              </Text>

              <Text className="text-lg text-gray-800 mb-4 font-medium">
                <span className="text-green-500 font-bold text-xl mr-3">✓</span>
                Quickly know how new tariffs change your landed costs
              </Text>

              <Text className="text-lg text-gray-800 mb-4 font-medium">
                <span className="text-green-500 font-bold text-xl mr-3">✓</span>
                Discover ways to save on your import costs
              </Text>
            </Container>

            {/* CTA Button */}
            <Container className="text-center mt-6">
              <Button
                href={impactCheckerUrl}
                className="bg-[#4F46E5] text-white font-bold py-4 px-8 text-lg rounded-lg border-2 border-[#3730A3]"
              >
                Upgrade to Pro →
              </Button>
            </Container>
          </Section>

          {/* Support Section */}
          <Section className="px-4 my-8 bg-gray-100 border-2 border-gray-200 rounded-lg p-6 text-center">
            <Text className="text-lg text-gray-800 my-0 font-medium">
              If you have questions about this notification or need assistance,
              our support team is here to help!
              <br />
              <br />
              Contact us at{" "}
              <Button
                href="mailto:support@htshero.com"
                className="text-[#4F46E5] font-bold underline text-lg"
              >
                support@htshero.com
              </Button>
            </Text>
          </Section>

          {/* Disclaimers */}
          <Section className="text-center px-4 mb-4">
            <Text className="text-xs text-gray-600 leading-relaxed mb-3">
              Data Source Disclaimer: We obtain our tariff information from
              official government sources, but we do not guarantee the full
              accuracy of our tariff impact checks, especially if some time has
              passed since you initially received this email.
            </Text>
            <Text className="text-xs text-gray-600 leading-relaxed mb-0">
              Liability Disclaimer HTS Hero is not responsible for any actions
              taken based on the information displayed. Please verify all tariff
              information with official sources or contact a customs broker
              before making business decisions.
            </Text>
          </Section>

          {/* Footer */}
          <Section className="text-center">
            <Text className="text-center text-gray-500 text-sm my-2 font-medium">
              © 2025 HTS Hero. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
