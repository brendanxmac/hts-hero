// import Link from "next/link";
// import HeaderLogoOnly from "../../components/HeaderLogoOnly";

// export default function AboutPage() {
//   return (
//     <div className="min-h-screen max-h-screen overflow-hidden">
//       <HeaderLogoOnly />
//       <section className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-6 p-8 bg-base-100">
//         {/* <h3 className="w-full text-xl md:text-2xl font-extrabold tracking-tight text-white ">
//           Welcome to HTS Hero!
//         </h3> */}

//         <div className="w-full space-y-12">
//           <div>
//             <h2 className="w-full text-lg md:text-xl font-semibold text-white">
//               Welcome to HTS Hero!
//             </h2>
//             <h3 className="mt-2 w-full text-3xl md:text-4xl font-extrabold text-white">
//               Which sounds more like you?
//             </h3>
//           </div>
//           <div className="w-full flex flex-col gap-6">
//             <Link
//               href="/about/importer"
//               className="grow btn btn-primary h-60 text-3xl"
//             >
//               Importer looking for HTS Code
//             </Link>

//             <Link
//               href="/about/classifier"
//               className="grow btn btn-secondary h-60 text-3xl"
//             >
//               Classifier looking to speed up my workflow
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

"use client";

import { Suspense } from "react";
import AboutHeader from "../../components/AboutHeader";
import ClassifierHero from "../../components/ClassifierHero";
import ClassifierCTA from "../../components/ClassifierCTA";
import ClassifierFooter from "../../components/ClassifierFooter";
import Pricing from "../../components/Pricing";
import { FAQ } from "../../components/FAQ";
import { classifierFaqList } from "../../constants/faq";
import { AboutPage } from "../../enums/classify";
import { classifyFeatures } from "../../constants/features";
import { Feature } from "../../components/Feature";
import FeaturesListicle from "../../components/FeaturesListicle";
import WithWithout from "../../components/WithWithout";
import FeaturesAccordion from "../../components/FeaturesAccordion";
import FeaturesGrid from "../../components/FeaturesGrid";

export default function Home() {
  return (
    <>
      <Suspense>
        <AboutHeader />
      </Suspense>
      <main>
        <ClassifierHero />
        <WithWithout />
        {/* <FeaturesGrid /> */}
        {/* <div className="hidden sm:block"> */}
        {/* <FeaturesAccordion features={classifyFeatures} /> */}
        {/* </div> */}
        {/* <div className="block sm:hidden"> */}
        <FeaturesListicle />
        {/* </div> */}
        {/* <div className="hidden sm:flex py-32 bg-base-100 flex-col gap-10 md:gap-32">
          {classifyFeatures.map((feature) => (
            <Feature key={feature.title} feature={feature} />
          ))}
        </div> */}
        <Pricing customerType={AboutPage.CLASSIFIER} />
        <ClassifierCTA />
        <FAQ faqItems={classifierFaqList} />
      </main>
      <ClassifierFooter />
    </>
  );
}
