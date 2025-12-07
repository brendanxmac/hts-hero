"use client";

import { ClassifyPage } from "../enums/classify";
import { Classification } from "./Classification";

interface Props {
  setPage: (page: ClassifyPage) => void;
}

export const Classify = ({ setPage }: Props) => {
  return <Classification setPage={setPage} />;
};
