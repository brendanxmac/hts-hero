"use client";
import { Suspense, useEffect, useState } from "react";
import AboutHeader from "./AboutHeader";
import AboutHero from "./AboutHero";
import AboutProblem from "./AboutProblem";
import AboutFAQ from "./AboutFAQ";
import AboutCTA from "./AboutCTA";
import AboutFooter from "./AboutFooter";
import FeaturesListicle from "../../components/FeaturesListicle";
import Pricing from "../../components/Pricing";
import Register from "../../components/Register";
import { RegistrationTrigger } from "../../libs/early-registration";
import WithWithout from "../../components/WithWithout";

export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registrationTrigger, setRegistrationTrigger] =
    useState<RegistrationTrigger>();

  useEffect(() => {
    if (!window.name) {
      window.name = crypto.randomUUID(); // Generate a unique ID
    }
  }, []);

  return (
    <>
      <Suspense>
        <AboutHeader />
      </Suspense>
      <main>
        <Register
          triggerButton={registrationTrigger}
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
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
