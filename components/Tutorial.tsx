import Modal from "./Modal";
import { TutorialName, tutorials } from "../tutorials";

export interface TutorialI {
  name: TutorialName;
  element: JSX.Element;
  paths?: string[];
}

interface Props {
  showTutorial: boolean;
  setShowTutorial: (showTutorial: boolean) => void;
  tutorial: TutorialI;
}

export const getTutorialFromPathname = (pathname: string) => {
  return tutorials.find((tutorial) => tutorial.paths?.includes(pathname));
};

export const Tutorial = ({
  showTutorial,
  setShowTutorial,
  tutorial,
}: Props) => {
  const { element } = tutorial;

  return (
    <Modal isOpen={showTutorial} setIsOpen={setShowTutorial}>
      <div className="w-full h-[80vh] min-h-[500px]">
        <div className="w-full h-full aspect-video">{element}</div>
      </div>
    </Modal>
  );
};
