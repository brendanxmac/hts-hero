"use client";

import { Suspense } from "react";
// import Register from "../../components/Register";
// import { RegistrationTrigger } from "../../libs/early-registration";
import ExploreCTA from "../../../components/ExploreCTA";
import ExploreFooter from "../../../components/ExploreFooter";
import ExploreHeader from "../../../components/ExploreHeader";
import ExploreHero from "../../../components/ExploreHero";
import ExploreProblem from "../../../components/ExploreProblem";
import ExploreFeaturesAccordion from "../../../components/ExploreFeaturesAccordion";

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
        <Suspense>
          <ExploreFeaturesAccordion />
        </Suspense>
        <ExploreCTA />
      </main>
      <ExploreFooter />
    </>
  );
}
