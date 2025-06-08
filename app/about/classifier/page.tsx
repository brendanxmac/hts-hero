"use client";

import { Suspense, useEffect, useState } from "react";
import ClassifierHeader from "../../../components/ClassifierHeader";
import ClassifierHero from "../../../components/ClassifierHero";
import ClassifierCTA from "../../../components/ClassifierCTA";
import ClassifierFooter from "../../../components/ClassifierFooter";
import Pricing from "../../../components/Pricing";
import WithWithout from "../../../components/WithWithout";
import ItsFree from "../../../components/ItsFree";
import FeaturesListicle from "../../../components/FeaturesListicle";
import { BuyAttempt } from "../../api/buy-attempt/route";
import ClassifierFAQ from "../../../components/ClassifierFAQ";

export default function Home() {
  // const [ref, setRef] = useState<string | null>();
  // const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  // const [registrationTrigger, setRegistrationTrigger] = useState<
  //   RegistrationTrigger | undefined
  // >(undefined);

  useEffect(() => {
    if (!window.name) {
      window.name = crypto.randomUUID(); // Generate a unique ID
    }
    // if (typeof window !== "undefined") {
    //   const params = new URLSearchParams(window.location.search);
    //   const ref = params.get("ref");
    //   if (ref) {
    //     setRef(ref);
    //   }
    // }
  }, []);

  // useEffect(() => {
  //   if (ref) {
  //     setIsRegisterOpen(true);
  //     setRegistrationTrigger(RegistrationTrigger.referral);
  //   }
  // }, [ref]);

  const [buyAttempt, setBuyAttempt] = useState<BuyAttempt | null>(null);
  const [showItsFree, setShowItsFree] = useState(false);

  return (
    <>
      <Suspense>
        <ClassifierHeader page="classifier" />
      </Suspense>
      <main>
        {/* <Register
          triggerButton={registrationTrigger}
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          source={ref}
        /> */}
        <ItsFree
          buyAttempt={buyAttempt}
          isOpen={showItsFree}
          onClose={() => setShowItsFree(false)}
        />
        <ClassifierHero
          setIsRegisterOpen={() => {}}
          setRegistrationTrigger={() => {}}
        />
        {/* <AboutProblem /> */}
        <WithWithout />
        <FeaturesListicle
          setIsRegisterOpen={() => {}}
          setRegistrationTrigger={() => {}}
        />
        <Pricing
          customerType="classifier"
          setBuyAttempt={setBuyAttempt}
          setShowItsFree={setShowItsFree}
        />
        <ClassifierFAQ />
        <ClassifierCTA />
      </main>
      <ClassifierFooter />
    </>
  );
}
