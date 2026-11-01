import ProductTourEmail from "../../onboarding/ProductTourEmail"

// Preview only, never sent: the copy is in emails/onboarding/ProductTourEmail.tsx
export default function Preview() {
  return <ProductTourEmail {...ProductTourEmail.PreviewProps} step={3} />
}
