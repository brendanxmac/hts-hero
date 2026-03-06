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

interface PlaybookDownloadEmailProps {
  downloadUrl: string;
}

const bookCoverUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/book-cover.jpg`

export default function PlaybookDownloadEmail({
  downloadUrl,
}: PlaybookDownloadEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Audit-Ready Classifications Playbook Has Arrived!</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Container className="mx-auto py-4 font-sans max-w-[600px] bg-white">
          <Section className="text-center px-2 mb-6">
            <Heading className="text-2xl font-bold text-gray-900 mb-4">
              Your Free Copy of the Audit-Ready Classifications Playbook Has Arrived!
            </Heading>
            <Text className="text-base text-gray-800 leading-relaxed mt-0 mb-6">
              It&apos;s time to start producing audit-ready classifications that reduce import risk and protect your profits! Click the button below to download your copy. (link expires in 8 hours)
            </Text>

            <Container className="mb-6">
              <Img
                alt="The Audit-Ready Classifications Playbook"
                src={bookCoverUrl}
                width={280}
                height={420}
                className="mx-auto rounded-lg border border-gray-200 shadow-md"
                style={{
                  maxWidth: "280px",
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </Container>

            <Container className="text-center mt-8">
              <Button
                href={downloadUrl}
                className="w-full bg-[#4F46E5] text-white font-bold py-4 text-lg rounded-lg"
              >
                Download Now!
              </Button>
            </Container>

            <Text className="text-sm text-gray-500 mt-6">
              If the button doesn&apos;t work, copy and paste this link into your browser:
            </Text>
            <Text className="text-sm text-[#4F46E5] break-all mt-1">
              {downloadUrl}
            </Text>
          </Section>

          <Section className="px-4 my-10 text-center">
            <Text className="text-sm text-gray-700 my-0 leading-relaxed">
              Questions? Contact us at{" "}
              <a href="mailto:support@htshero.com" className="text-[#4F46E5] font-medium underline">
                support@htshero.com
              </a>
            </Text>
          </Section>

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
