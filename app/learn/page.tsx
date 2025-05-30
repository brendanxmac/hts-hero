"use client";

import { Suspense } from "react";
// import Register from "../../components/Register";
// import { RegistrationTrigger } from "../../libs/early-registration";
import ExploreCTA from "./ExploreCTA";
import ExploreFooter from "./ExploreFooter";
import ExploreHeader from "./ExploreHeader";
import ExploreHero from "./ExploreHero";
import ExploreProblem from "./ExploreProblem";
import ExploreFeaturesAccordion from "./ExploreFeaturesAccordion";

export default function Home() {
  // const [ref, setRef] = useState<string | null>();
  // const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  // const [registrationTrigger, setRegistrationTrigger] = useState<
  //   RegistrationTrigger | undefined
  // >(undefined);

  // useEffect(() => {
  //   if (!window.name) {
  //     window.name = crypto.randomUUID(); // Generate a unique ID
  //   }
  //   if (typeof window !== "undefined") {
  //     const params = new URLSearchParams(window.location.search);
  //     const ref = params.get("ref");
  //     if (ref) {
  //       setRef(ref);
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   if (ref) {
  //     setIsRegisterOpen(true);
  //     setRegistrationTrigger(RegistrationTrigger.referral);
  //   }
  // }, [ref]);

  return (
    <>
      <Suspense>
        <ExploreHeader />
      </Suspense>
      <main>
        <ExploreHero />
        <ExploreProblem />
        <ExploreFeaturesAccordion />
        <ExploreCTA />
      </main>
      <ExploreFooter />
    </>
  );
}
