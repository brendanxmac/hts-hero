import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, DocumentTextIcon, ScaleIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import { CLASSIFICATION_EXAMPLES } from "@/constants/classification-examples";
import { mono } from "@/components/ui/font";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";

// Real classifications from the assistant, each opening its shared page with the full evidence:
// the GRI reasoning, the legal notes and the CROSS rulings behind the code.

const EVIDENCE = [
  { Icon: ShieldCheckIcon, label: "GRI analysis" },
  { Icon: DocumentTextIcon, label: "Legal notes" },
  { Icon: ScaleIcon, label: "CROSS rulings" },
];

export const Examples = () => (
  <section id="examples" className={`${mk.band} ${mk.bandMuted} scroll-mt-20`} aria-labelledby="examples-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Examples" title={<>Not just codes. <span className={mk.accent}>Proof.</span></>} id="examples-title" center>
        Every classification comes with the GRI reasoning, the legal notes and the CROSS rulings behind it, so you can explain and defend
        it. Open one to see the evidence.
      </SectionIntro>

      <ul className="m-0 mt-8 flex list-none flex-wrap justify-center gap-2 p-0">
        {EVIDENCE.map(({ Icon, label }) => (
          <li key={label} className="inline-flex items-center gap-1.5 rounded-full bg-base-100 px-3.5 py-1.5 text-sm font-semibold text-base-content/80 ring-1 ring-base-300">
            <Icon className="h-4 w-4 text-primary" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {CLASSIFICATION_EXAMPLES.map((example) => (
          <Link
            key={example.shareToken}
            href={`/c/${example.shareToken}`}
            className={`${mk.card} group flex flex-col overflow-hidden transition-colors hover:border-primary/50`}
          >
            <div className="flex h-48 items-center justify-center bg-tt-soft p-5">
              <Image
                src={example.image}
                alt=""
                width={600}
                height={400}
                className="max-h-full w-auto rounded-lg object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <p className="m-0 text-sm leading-relaxed text-base-content/80">{example.description}</p>
              <div className="mt-auto flex items-end justify-between gap-3 border-t border-base-300 pt-4">
                <span className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">HTS code</span>
                  <span className={`${mono.className} text-xl font-bold text-base-content`}>{example.htsCode}</span>
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary">
                  See the evidence
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center">
        <a href="#try-classify" className={`${mk.buttonPrimary} h-14 px-8 text-lg`}>
          Classify your product
          <ArrowRightIcon className="h-5 w-5" aria-hidden />
        </a>
      </p>
    </div>
  </section>
);
