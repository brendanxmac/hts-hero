"use client";

import { Suspense } from "react";
import AboutHeader from "../../../components/AboutHeader";
import ClassifierHero from "../../../components/ClassifierHero";
import ClassifierCTA from "../../../components/ClassifierCTA";
import ClassifierFooter from "../../../components/ClassifierFooter";
import Pricing from "../../../components/Pricing";
import WithWithout from "../../../components/WithWithout";
import FeaturesListicle from "../../../components/FeaturesListicle";
import { FAQ } from "../../../components/FAQ";
import { classifierFaqList } from "../../../constants/faq";
import { AboutPage } from "../../../enums/classify";

export default function Home() {
  // const [ref, setRef] = useState<string | null>();
  // const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  // const [registrationTrigger, setRegistrationTrigger] = useState<
  //   RegistrationTrigger | undefined
  // >(undefined);

  // useEffect(() => {
  // if (!window.name) {
  // window.name = crypto.randomUUID(); // Generate a unique ID
  // }
  // if (typeof window !== "undefined") {
  //   const params = new URLSearchParams(window.location.search);
  //   const ref = params.get("ref");
  //   if (ref) {
  //     setRef(ref);
  //   }
  // }
  // }, []);

  // useEffect(() => {
  //   if (ref) {
  //     setIsRegisterOpen(true);
  //     setRegistrationTrigger(RegistrationTrigger.referral);
  //   }
  // }, [ref]);

  // const [buyAttempt, setBuyAttempt] = useState<BuyAttempt | null>(null);
  // const [showItsFree, setShowItsFree] = useState(false);

  return (
    <>
      <Suspense>
        <AboutHeader page={AboutPage.CLASSIFIER} />
      </Suspense>
      <main>
        <ClassifierHero />
        {/* <AboutProblem /> */}
        <WithWithout />
        <FeaturesListicle />
        <Pricing customerType={AboutPage.CLASSIFIER} />
        <FAQ faqItems={classifierFaqList} />
        <ClassifierCTA />
      </main>
      <ClassifierFooter />
    </>
  );
}
