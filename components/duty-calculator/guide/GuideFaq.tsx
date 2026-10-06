import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";

// The page's top questions, with its header in a sticky left column and a link to the full FAQ
export const GuideFaq = ({ faqs }: { faqs: { question: string; answer: string }[] }) => (
  <section id="faq" className="scroll-mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
    <SectionHeader kicker="Questions" title="Frequently asked questions" className="lg:sticky lg:top-6 lg:self-start">
      Something else? <a href="mailto:support@htshero.com" className={ui.link}>Ask us</a>.
    </SectionHeader>
    <div className="flex min-w-0 flex-col gap-4">
      <FaqList faqs={faqs} />
      <Link href="/duty-calculator/faq" className={`${ui.link} inline-flex w-fit items-center gap-1 text-sm`}>
        See all questions
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  </section>
);
