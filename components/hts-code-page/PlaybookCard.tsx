import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

// The page-level call to action for the free classifications playbook

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content`;

const INSIDE = [
  "Step-by-step classification methodology",
  "Audit defense strategies & documentation templates",
  "Common classification mistakes to avoid",
  "GRI application guide with real examples",
  "7 FREE tools and templates to boost your classifications",
];

export function PlaybookCard() {
  return (
    <section className={`${ui.card} overflow-hidden`}>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative w-32 sm:w-36 aspect-[2/3] rounded-md overflow-hidden border border-base-300 shrink-0">
            <Image
              src={`${STORAGE_BASE}/book-cover.jpg`}
              alt="The Audit-Ready Classifications Playbook"
              fill
              sizes="(max-width: 640px) 128px, 144px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <span className={ui.kicker}>Free · Playbook + 7 Bonuses</span>
            <h2 className={ui.sectionTitle}>The Audit-Ready Classifications Playbook</h2>
            <p className={ui.body}>
              Learn how to create HTS classifications that reduce import risk and defend profits — faster than ever.
            </p>
            <div>
              <Link
                href="/the-audit-ready-classifications-playbook"
                className={`${ui.button({ variant: "primary", size: "lg" })} mt-1`}
              >
                Download Free Playbook
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-base-300 bg-base-200 flex flex-col justify-center">
          <p className={`${ui.label} mb-4`}>What&apos;s inside</p>
          <ul className="flex flex-col gap-3">
            {INSIDE.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-base text-base-content">
                <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
