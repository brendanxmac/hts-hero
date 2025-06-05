"use client";

import { Suspense, useEffect, useState } from "react";
import AboutHeader from "./AboutHeader";
import AboutHero from "./AboutHero";
import AboutCTA from "./AboutCTA";
import AboutFooter from "./AboutFooter";
import FeaturesListicle from "../../components/FeaturesListicle";
import Pricing from "../../components/Pricing";
import Register from "../../components/Register";
import { RegistrationTrigger } from "../../libs/early-registration";
import WithWithout from "../../components/WithWithout";

export default function Home() {
  const [ref, setRef] = useState<string | null>();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registrationTrigger, setRegistrationTrigger] = useState<
    RegistrationTrigger | undefined
  >(undefined);

  useEffect(() => {
    if (!window.name) {
      window.name = crypto.randomUUID(); // Generate a unique ID
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        setRef(ref);
      }
    }
  }, []);

  useEffect(() => {
    if (ref) {
      setIsRegisterOpen(true);
      setRegistrationTrigger(RegistrationTrigger.referral);
    }
  }, [ref]);

  return (
    <>
      <Suspense>
        <AboutHeader page="classifiers" />
      </Suspense>
      <main>
        <Register
          triggerButton={registrationTrigger}
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          source={ref}
        />
        <AboutHero
          setIsRegisterOpen={setIsRegisterOpen}
          setRegistrationTrigger={setRegistrationTrigger}
        />
        {/* <AboutProblem /> */}
        <WithWithout />
        <FeaturesListicle
          setIsRegisterOpen={setIsRegisterOpen}
          setRegistrationTrigger={setRegistrationTrigger}
        />
        <Pricing
          setIsRegisterOpen={setIsRegisterOpen}
          setRegistrationTrigger={setRegistrationTrigger}
        />
        {/* <AboutFAQ /> */}
        <AboutCTA
          setIsRegisterOpen={setIsRegisterOpen}
          setRegistrationTrigger={setRegistrationTrigger}
        />
      </main>
      <AboutFooter />
    </>
  );
}
