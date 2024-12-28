import { useEffect, useState } from "react";
import { useHtsContext } from "../context/hts-context";
import { HorizontalAlignment } from "../enums/style";
import { getHtsCode } from "../libs/hts";
import { PrimaryInformation } from "./PrimaryInformation";
import { SecondaryInformation } from "./SecondaryInformation";
import { HtsLayerSelection } from "../interfaces/hts";
import { LabelledLoader } from "./LabelledLoader";

export const SearchResultSummary = () => {
  const { productDescription } = useHtsContext();
  const [loading, setLoading] = useState(false);
  const [htsCode, setHtsCode] = useState("");
  const [tariff, setTarrif] = useState("");
  const [description, setDescription] = useState("");

  const getFullClassificationDescription = (results: HtsLayerSelection[]) => {
    const numElements = results.length - 1;
    let fullDescription = "";

    results.map((result, i) => {
      if (result.element.htsno) {
        if (i < numElements) {
          fullDescription =
            fullDescription +
            `${result.element.htsno ? `${result.element.htsno}: ` : ""}` +
            result.element.description +
            "\n\n";
        } else {
          fullDescription =
            fullDescription +
            `${result.element.htsno ? `${result.element.htsno}: ` : ""}` +
            result.element.description;
        }
      }
    });

    return `${fullDescription}`;
  };

  useEffect(() => {
    console.log("Product Description changed");
    console.log(productDescription);
    async function fetchStuff() {
      setLoading(true);
      // setTimeout(() => {
      //   console.log("Done");
      //   setLoading(false);
      // }, 4000);
      const results = await getHtsCode(productDescription);

      setDescription(getFullClassificationDescription(results));

      for (let i = results.length - 1; i > 0; i--) {
        if (results[i].element.general) {
          const { htsno, general, footnotes } = results[i].element;
          console.log(`Tarrif for ${htsno}: ${general}`);
          setHtsCode(htsno);

          if (footnotes.length) {
            setTarrif(`${general} + ${footnotes[0].value}`);
            console.log(`Footnotes:`);
            console.log(footnotes);
          } else {
            setTarrif(general);
          }
        }
      }
      setLoading(false);
    }
    // fetchStuff();
  }, [productDescription]);

  if (loading) {
    return <LabelledLoader text="" />;
  } else {
    return (
      <div className="w-full max-w-4xl flex flex-col gap-5 p-4">
        <div className="flex gap-4 flex-col items-start sm:flex-row sm:justify-between">
          <div className="bg-neutral-900 rounded-md p-4">
            <PrimaryInformation label="HTS Code" heading={htsCode || ""} />
          </div>

          <div className="bg-neutral-900 rounded-md p-4">
            <PrimaryInformation
              label="Tariff"
              heading={tariff || ""}
              textAlign={HorizontalAlignment.LEFT}
            />
          </div>
        </div>
        {/* <SecondaryInformation
          label="Selection Logic"
          heading={description || ""}
        /> */}
      </div>
    );
  }
};
