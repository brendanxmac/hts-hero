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
import React from "react";

interface TeamRequestConfirmationEmailProps {
  name: string;
  productName: string;
  email: string;
}

export default function TeamRequestConfirmationEmail({
  name = "there",
  productName = "Tariff Pro",
  email,
}: TeamRequestConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>🎉 Your Demo of {productName} for Teams!</Preview>
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

          {/* Greeting */}
          <Section className="px-4 mb-6">
            <Text className="text-base text-gray-800 leading-relaxed">
              Hi {name},
            </Text>
            <Text className="text-base text-gray-800 leading-relaxed">
              Thank you for your interest in{" "}
              <span className="font-bold">{productName} for Teams</span>!
            </Text>
            <Text className="text-base text-gray-800 leading-relaxed">
              We&apos;ve received your request and are looking forward to your
              demo call.
            </Text>
          </Section>

          {/* Features Section */}
          <Section className="px-4 mb-6">
            <Container
              className="rounded-lg p-6"
              style={{
                background: "#000",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Heading
                className="text-white text-xl font-bold mb-4"
                style={{
                  color: "#ffffff",
                  marginTop: "0",
                }}
              >
                Here&apos;s what we&apos;ll cover on our call:
              </Heading>
              <Text
                className="text-white text-base mb-3 pl-5"
                style={{
                  color: "#ffffff",
                  position: "relative",
                  marginBottom: "12px",
                  paddingLeft: "20px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "0",
                    color: "#fbbf24",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </span>
                Your team&apos;s specific needs and how {productName} can help
              </Text>
              <Text
                className="text-white text-base mb-3 pl-5"
                style={{
                  color: "#ffffff",
                  position: "relative",
                  marginBottom: "12px",
                  paddingLeft: "20px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "0",
                    color: "#fbbf24",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </span>
                Support, onboarding, & pricing options
              </Text>
              <Text
                className="text-white text-base mb-3 pl-5"
                style={{
                  color: "#ffffff",
                  position: "relative",
                  marginBottom: "12px",
                  paddingLeft: "20px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "0",
                    color: "#fbbf24",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </span>
                A demo of the product
              </Text>
              <Text
                className="text-white text-base pl-5"
                style={{
                  color: "#ffffff",
                  position: "relative",
                  marginBottom: "0",
                  paddingLeft: "20px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "0",
                    color: "#fbbf24",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </span>
                Any other questions you have
              </Text>
            </Container>
          </Section>

          {/* CTA Section */}
          <Section className="px-4 mb-6">
            <Text className="text-lg font-bold text-gray-900 leading-relaxed">
              If you <span className="underline">didn&apos;t</span> already book
              your demo call, you can do that here:
            </Text>
            <Container className="text-center mt-4">
              <Button
                href={`https://calendly.com/brendan-htshero/30min?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`}
                className="w-full bg-[#617BFF] text-white font-bold py-4 text-base rounded-lg"
              >
                Book Your Demo Call →
              </Button>
            </Container>
          </Section>

          {/* Additional Info */}
          <Section className="px-4 mb-2">
            <Text className="text-base text-gray-800 leading-relaxed">
              Otherwise, feel free to explore{" "}
              <Button
                href="https://htshero.com"
                className="text-[#617BFF] font-medium underline"
              >
                all our tools
              </Button>{" "}
              in the meantime.
            </Text>
            <Text className="text-base text-gray-800 leading-relaxed">
              If you have any urgent questions, don&apos;t hesitate to reach
              out!
            </Text>
            <Text className="text-base text-gray-800 leading-relaxed mb-0">
              Looking forward to connecting soon!
            </Text>
          </Section>

          {/* Signature */}
          <Section className="px-4 mb-8">
            <Text className="text-base text-gray-800 leading-relaxed mt-4 mb-0">
              Best,
              <br />
              <span className="font-bold">Brendan</span>
              <br />
              Founder | HTS Hero
              <br />
              <Button
                href="tel:+12065651468"
                className="text-[#617BFF] font-medium underline"
              >
                +1 (206) 565-1468
              </Button>
              <br />
              <Button
                href="mailto:brendan@htshero.com"
                className="text-[#617BFF] font-medium underline"
              >
                brendan@htshero.com
              </Button>
            </Text>
          </Section>

          {/* Footer */}
          <Section
            className="text-center pt-6 mt-10"
            style={{
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <Text className="text-center text-gray-400 text-sm my-2">
              © 2025 HTS Hero. All rights reserved.
            </Text>
            <Text className="text-center text-gray-500 text-sm my-2">
              Questions? Reply to this email or contact us at{" "}
              <Button
                href="mailto:support@htshero.com"
                className="text-[#617BFF] font-medium underline"
              >
                support@htshero.com
              </Button>
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
