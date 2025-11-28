import { FaqItem, FAQItem } from "./FAQItem";

interface Props {
  faqItems: FAQItem[];
}

export const FAQ = ({ faqItems }: Props) => {
  return (
    <section className="bg-base-100" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
          <div className="pt-3 text-base-content/60">
            Have another question? Feel free to drop us an{" "}
            <a
              href="mailto:support@htshero.com"
              target="_blank"
              className="link text-base-content"
            >
              email
            </a>
            .
          </div>
        </div>

        <ul className="basis-1/2 flex flex-col gap-1">
          {faqItems.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};
