import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { classNames } from "../utilities/styles";
import axios from "axios";
import { HsHeading, HtsRaw, HtsWithParentReference } from "../interfaces/hts";
import { getHTSChapterData, findBestHtsCode } from "../libs/hts";
import { getHSHeadings, OpenAIModel } from "../libs/openai";
import { setIndexInArray } from "../utilities/data";

export default function SearchBar() {
  const [isProductDescription, setIsProductDescription] = useState(false);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#202020] h-full flex items-center">
        <div className="z-10 w-full flex flex-col gap-5 flex-1 items-center justify-items-center">
          <h2 className="text-white font-bold text-xl md:text-3xl">
            Enter Product Description
          </h2>
          <div className="w-[80%] justify-center flex gap-2 items-center">
            <input
              type="text"
              name="product-description"
              id="product-description"
              className="flex-1 h-9 max-w-xl text-sm md:text-base bg-[#313131] placeholder-[#A6A6A6] p-2 rounded-lg text-white shadow-sm focus:outline-none"
              placeholder="e.g. Stainless steel water bottle for dogs to drink from while travelling..."
              required
              onInput={(e) => {
                setIsProductDescription(Boolean(e.currentTarget.value));
                console.log(e.currentTarget.value);
              }}
            />
            <button
              type="button"
              disabled={!isProductDescription}
              onClick={() => {
                console.log("button clicked");
                (async () => {
                  try {
                    const productDescription =
                      "Stainless steel water bottle for animals to drink from on the go with their owner";
                    // await promptUser("Enter a product description: ")
                    console.log("Finding best HTS Code...");
                    const hsHeadingsResponse = await getHSHeadings(
                      productDescription,
                      OpenAIModel.FOUR
                    );
                    const hsHeadings =
                      hsHeadingsResponse.choices[0].message.content;

                    if (hsHeadings) {
                      // TODO: Need to update this to do it for all the headings... (Maybe)
                      const parsed: HsHeading[] = JSON.parse(hsHeadings);
                      // Grab the whole chapter json for this heading from the live dataset.
                      const heading = parsed[0].heading;
                      const chapter = heading.substring(0, 2);
                      console.log(`First Heading: ${heading}`);
                      // TODO: See about skipping right to the heading level somehow... instead of
                      //    starting at the chapter level...

                      const htsChapterJson = await getHTSChapterData<HtsRaw>(
                        chapter
                      );
                      const htsChapterJsonWithIndex: HtsWithParentReference[] =
                        setIndexInArray(htsChapterJson);

                      // TODO: Sliding Window to find best Code
                      const htsSelectionProgression = await findBestHtsCode(
                        productDescription,
                        "",
                        htsChapterJsonWithIndex,
                        0
                      );

                      console.log(
                        htsSelectionProgression.map((s) => ({
                          code: s.element.htsno,
                          tariff: s.element.general,
                          footnotes: s.element.footnotes,
                          logic: s.logic,
                        }))
                      );

                      for (
                        let i = htsSelectionProgression.length - 1;
                        i > 0;
                        i--
                      ) {
                        if (htsSelectionProgression[i].element.general) {
                          // todo: see if this accounts for all cases / edge cases
                          console.log(
                            `Got Tarrif at ${htsSelectionProgression[i].element.htsno}`
                          );
                          console.log(
                            htsSelectionProgression[i].element.general
                          );
                          if (
                            htsSelectionProgression[i].element.footnotes.length
                          ) {
                            console.log(`Element has footnotes:`);
                            console.log(
                              htsSelectionProgression[i].element.footnotes
                            );
                          }
                        }
                      }

                      // TODO: get the total tariff for this item
                      //   const hsCode = htsSelectionProgression[
                      //     htsSelectionProgression.length - 1
                      //   ].element.htsno.substring(0, 7);
                      //   const htsUsItcResponse = await searchKeyword(hsCode);
                      //   console.log(
                      //     `Searching https://hts.usitc.gov/reststop/search?keyword=${hsCode}...`
                      //   );
                      //   const htsCodes = htsUsItcResponse.data;
                      // get total tariff -- assume import from china
                      // does final code have rate?
                    }
                  } catch (error) {
                    // Handle errors
                    if (axios.isAxiosError(error)) {
                      console.error(
                        "Axios error:",
                        error.response?.data || error.message
                      );
                    } else {
                      console.error("Unexpected error:", error);
                    }
                  }
                })();
              }}
              className={classNames(
                isProductDescription ? "bg-white" : "bg-[#313131]",
                "h-9 w-9 rounded-lg  flex items-center justify-center text-sm font-medium"
              )}
            >
              <MagnifyingGlassIcon
                className={classNames(
                  isProductDescription ? "text-[#202020]" : "text-gray-400",
                  "h-5 w-5"
                )}
              />
            </button>
          </div>
          <h6 className="text-xs text-center font-medium text-[#999999]">
            HTS Hero may make mistakes. Use with discretion.
          </h6>
        </div>
      </div>
      <div className="z-0 absolute bottom-0 flex justify-center items-center h-screen w-screen">
        <div
          className="absolute bottom-0 h-48 w-full bg-[#40C969]
            rounded-tl-full rounded-tr-full blur-3xl"
        ></div>
      </div>
      {/* <div className="absolute -bottom-52 rounded-full overflow-y-hidden h-96 w-full bg-[#40C969] blur-3xl"></div> */}
    </div>
  );
}
