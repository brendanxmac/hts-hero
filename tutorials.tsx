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
    src="https://www.youtube.com/embed/HSo8h_DCEZ0?si=ZP6ERGpSwl1jbUlb"
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
