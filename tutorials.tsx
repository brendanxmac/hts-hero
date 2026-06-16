import { TutorialI } from "./components/Tutorial";

export enum TutorialName {
  EXPLORE = "explore",
  CLASSIFY = "classify",
}

export const exploreTutorial = (
  <iframe
    src="https://www.youtube.com/embed/KZ6zv9ujarY?si=J4OtRKsBFnMC5gKs"
    allowFullScreen
    className="w-full h-full"
  ></iframe>
);

export const classifyTutorial = (
  <iframe
    src="https://www.youtube.com/embed/k9DBN8oxi_U?si=9REwPl7lsRvt_d8j"
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
    paths: ["/classifications"],
  },
];
