import { LabelledLoader } from "../../components/LabelledLoader";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return <LabelledLoader text={"Thinking"} />;
}
