import { useState, useEffect } from "react";
import { Classification } from "../interfaces/hts";
import { fetchClassifications } from "../libs/classification";
import { ClassifyPage } from "../enums/classify";

interface Props {
  setPage: (page: ClassifyPage) => void;
}

export const Classifications = ({ setPage }: Props) => {
  const [classifications, setClassifications] = useState<Classification[]>([]);

  useEffect(() => {
    const getClassifications = async () => {
      const classifications = await fetchClassifications();
      console.log(classifications);
      setClassifications(classifications);
    };
    getClassifications();
  }, []);

  useEffect(() => {
    console.log(classifications);
  }, [classifications]);

  return (
    <div className="h-full w-fullbg-red-500 max-w-3xl">
      {classifications &&
        classifications.map((classification, index) => (
          <div key={`classification-${index}`}>
            <h1>{classification.articleDescription}</h1>
          </div>
        ))}
      <button
        className="btn btn-primary"
        onClick={() => setPage(ClassifyPage.CLASSIFY)}
      >
        Classify
      </button>
    </div>
  );
};
