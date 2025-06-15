import { TutorialI } from "./components/Tutorial";

export enum TutorialName {
  EXPLORE = "explore",
  CLASSIFY = "classify",
}

export const exploreTutorial = (
  <iframe
    src="https://www.youtube.com/embed/3CcVBsW9jkg?si=7T7D4hrR3_OYhMLT"
    allowFullScreen
    className="w-full h-full"
  ></iframe>
);

export const classifyTutorial = (
  <iframe
    src="https://www.youtube.com/embed/1O4U7D6DK90?si=KOWj3Vp270uAU_Rt"
    allowFullScreen
    className="w-full h-full"
  ></iframe>
);

export const tutorials: TutorialI[] = [
  {
    name: TutorialName.EXPLORE,
    element: exploreTutorial,
    paths: ["/explore"],
  },
  {
    name: TutorialName.CLASSIFY,
    element: classifyTutorial,
    paths: ["/app"],
  },
];
