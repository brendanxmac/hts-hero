import { TutorialI } from "./components/Tutorial";

export enum TutorialName {
  EXPLORE = "explore",
  CLASSIFY = "classify",
}

export const exploreTutorial = (
  <iframe
    src="https://www.loom.com/embed/92565bde8dae4062ad1031f21e77291c?sid=2457a064-c453-4376-a420-57820e3a9cc6"
    allowFullScreen
    className="w-full h-full"
  ></iframe>
);

export const classifyTutorial = (
  <iframe
    src="https://www.loom.com/embed/f90db0d0ac5a431983c838a620011f91?sid=cf9d39e8-3d9b-464c-af01-f4be9def45ef"
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
