"use client";
import { Suspense, useState } from "react";
import AboutHeader from "./AboutHeader";
import AboutHero from "./AboutHero";
import AboutProblem from "./AboutProblem";
import AboutFAQ from "./AboutFAQ";
import AboutCTA from "./AboutCTA";
import AboutFooter from "./AboutFooter";
import FeaturesListicle from "../../components/FeaturesListicle";
import Pricing from "../../components/Pricing";
import Register from "../../components/Register";
export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(true);
  return (
    <>
      <Suspense>
        <AboutHeader />
      </Suspense>
      <main>
        <Register
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
        <AboutHero setIsRegisterOpen={setIsRegisterOpen} />
        <AboutProblem />
        {/* <WithWithout /> */}
        <FeaturesListicle />
        <Pricing />
        <AboutFAQ />
        <AboutCTA />
      </main>
      <AboutFooter />
    </>
  );
}
