import Link from "next/link";

const GRI = "font-semibold text-secondary";
const NOTE = "font-medium text-primary";
const CODE = "font-mono font-extrabold text-base-content";

export const GRIDefenseHero = () => {
    const FullView = () => (
        <div className="space-y-6 text-sm leading-relaxed text-base-content/80">
            {/* Intro */}
            <p>
                Under <span className={GRI}>GRI 1</span>, classification is determined by the terms of the headings and relevant section or chapter notes.
            </p>

            {/* Candidate 8708 */}
            <div className="pl-4 border-l-2 border-primary/30 space-y-2">
                <p className="font-semibold text-base-content">
                    <span className={CODE}>8708</span> — Parts and accessories of motor vehicles 8701–8705
                </p>
                <ul className="space-y-1.5 pl-1 text-base-content/75">
                    <li>• Brake pad = typical part of a motor vehicle braking system.</li>
                    <li>• <span className={NOTE}>Section XVII, Note 3</span>: parts must be suitable solely or principally with vehicles of Ch. 86–88. Brake pads for passenger vehicles meet this.</li>
                    <li>• <span className={NOTE}>Section XVII, Note 2</span>: lists exclusions; brake pads are not excluded.</li>
                    <li>• <span className={NOTE}>Chapter 87, Note 1</span>: confirms scope for motor vehicles; brake pads are integral parts.</li>
                    <li className="font-medium italic pt-3">→ Heading 8708 directly intended for this good.</li>
                </ul>
            </div>

            {/* Candidate 6914 */}
            <div className="pl-4 border-l-2 border-base-300/50 space-y-2">
                <p className="font-semibold text-base-content">
                    <span className={CODE}>6914</span> — Other ceramic articles
                </p>
                <ul className="space-y-1.5 pl-1 text-base-content/75">
                    <li>• <span className={NOTE}>Chapter 69, Note 1</span>: limits to fired ceramic products — true for ceramic brake pads.</li>
                    <li>• <span className={NOTE}>Chapter 69, Note 2(e)</span>: excludes articles of Ch. 82; Section XVII provides a more specific framework for vehicle parts.</li>
                    <li>• Residual heading; 6914 is more general than 8708 for this item.</li>
                </ul>
            </div>

            {/* Candidate 8113 */}
            <div className="pl-4 border-l-2 border-base-300/50 space-y-2">
                <p className="font-semibold text-base-content">
                    <span className={CODE}>8113.00.00</span> — Cermets and articles thereof
                </p>
                <ul className="space-y-1.5 pl-1 text-base-content/75">
                    <li>• <span className={NOTE}>Section XV, Note 4</span>: defines cermets (metallic + ceramic, sintered metal carbides). Description does not clearly establish cermet status.</li>
                    <li>• <span className={NOTE}>Section XV, Note 1(g)</span>: excludes “other articles of Section XVII.” Vehicle parts are excluded from Section XV — cannot classify in 8113.</li>
                    <li className="font-medium pt-3">→ Vehicle parts should not be classified in 8113.</li>
                </ul>
            </div>

            {/* Application */}
            <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                    Application of <span className={GRI}>GRI 1</span> and <span className={GRI}>GRI 3(a)</span>
                </p>
                <ul className="space-y-1.5 pl-1">
                    <li>• Under <span className={GRI}>GRI 1</span>: <span className={CODE}>8708</span> is primary — specifically covers parts of 8701–8705; item is a brake pad for 8703.</li>
                    <li>• <span className={CODE}>6914</span> is generic; under <span className={GRI}>GRI 3(a)</span>, 8708 is more specific to function and use.</li>
                    <li>• <span className={CODE}>8113</span> excluded by <span className={NOTE}>Section XV Note 1(g)</span> when article is a vehicle part.</li>
                </ul>
            </div>

            {/* GRI 3(b) */}
            <div className="space-y-1.5 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                    <span className={GRI}>GRI 3(b)</span> controlling aspect
                </p>
                <p>
                    The controlling aspect is function and use as a brake pad for passenger motor vehicles, not material composition. <span className={CODE}>8708</span> aligns with this; 6914 and 8113 are material-based and more generic or excluded.
                </p>
            </div>

            {/* Conclusion */}
            <p className="font-medium text-base-content pt-2">
                Therefore, <span className={CODE}>8708</span> appears to be the most suitable match under the GRIs and relevant legal notes.
            </p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto relative mb-10 md:mb-12">
            <div className="relative rounded-2xl border border-base-300/60 bg-base-100 overflow-hidden shadow-lg shadow-base-content/[0.04]">
                <div className="h-0.5 bg-gradient-to-r from-primary/60 via-secondary/60 to-primary/60" />

                <div className="px-5 py-6 md:px-8 md:py-8">
                    {/* Item + See Full Classification */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-base-300/60">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-base-content/50 mb-1.5">
                                Item
                            </p>
                            <p className="text-lg md:text-xl lg:text-2xl font-semibold text-base-content leading-snug">
                                Ceramic brake pads for passenger vehicles, copper-free formulation
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-5">


                        <p className="text-xs lg:text-base font-semibold uppercase tracking-wider text-base-content/50 mb-1.5">
                            GRI & Legal Note Analysis
                        </p>

                    </div>

                    <FullView />

                    <br />

                    <div className="w-full flex items-center justify-center">
                        <Link
                            href="/c/nPP4hl_4vxY"
                            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-content transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-primary/20"
                        >
                            See Full Analysis
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}