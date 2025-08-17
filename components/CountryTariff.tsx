// import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
// import { Country, EuropeanUnionCountries } from "../constants/countries";
// import { Tariff } from "./Tariff";
// import { ContentRequirementI } from "./Element";
// import { HtsElement } from "../interfaces/hts";
// import { BaseTariff } from "./BaseTariff";
// import { ContentRequirements, TariffColumn } from "../enums/tariff";
// import { TariffI, TariffSet } from "../interfaces/tariffs";
// import { PrimaryLabel } from "./PrimaryLabel";
// import { Color } from "../enums/style";

// import { TradePrograms, TradeProgramStatus } from "../public/trade-programs";
// import { SecondaryLabel } from "./SecondaryLabel";
// import { Column2CountryCodes } from "../tariffs/tariff-columns";
// import {
//   getTariffs,
//   getEUCountryTotalBaseRate,
//   getContentRequirementTariffSets,
//   getArticleTariffSet,
//   Section232MetalTariffs,
//   getAmountRates,
//   getAmountRatesString,
//   getAdValoremRate,
//   getBaseTariffsForColumn,
// } from "../tariffs/tariffs";

// interface Props {
//   country: Country;
//   htsElement: HtsElement;
//   tariffElement: HtsElement;
//   selectedCountries: Country[];
//   setSelectedCountries: Dispatch<SetStateAction<Country[]>>;
//   contentRequirements: ContentRequirementI<ContentRequirements>[];
// }

// export const CountryTariff = ({
//   country,
//   htsElement,
//   tariffElement,
//   selectedCountries,
//   setSelectedCountries,
//   contentRequirements,
// }: Props) => {
//   const isEUCountry = EuropeanUnionCountries.includes(country.code);
//   const htsCode = htsElement.htsno;
//   const [units, setUnits] = useState<number>(1);
//   const [customsValue, setCustomsValue] = useState<number>(1000);
//   const [tariffColumn, setTariffColumn] = useState<TariffColumn>(
//     Column2CountryCodes.includes(country.code)
//       ? TariffColumn.OTHER
//       : TariffColumn.GENERAL
//   );
//   const columnTariffs = getBaseTariffsForColumn(tariffElement, tariffColumn);
//   const columnHasTariffs = columnTariffs.some((t) => t.tariffs.length > 0);
//   const [applicableTariffs, setApplicableTariffs] = useState<TariffI[]>(
//     getTariffs(country.code, htsCode).filter((t) => {
//       if (isEUCountry) {
//         const totalBaseRate = getEUCountryTotalBaseRate(
//           columnTariffs.flatMap((t) => t.tariffs),
//           customsValue,
//           units
//         );

//         if (totalBaseRate >= 15) {
//           return t.code !== "9903.02.20";
//         } else {
//           return t.code !== "9903.02.19";
//         }
//       }

//       return true;
//     })
//   );

//   const applicableUITariffs: TariffI[] = applicableTariffs.map((t) => ({
//     ...t,
//     exceptions: t.exceptions?.filter((e) =>
//       applicableTariffs.some((t) => t.code === e)
//     ),
//   }));

//   const [tariffSets, setTariffSets] = useState<TariffSet[]>([]);
//   const [showInactive, setShowInactive] = useState<boolean>(false);
//   const [isSpecialProgramOpen, setIsSpecialProgramOpen] =
//     useState<boolean>(false);
//   const [selectedSpecialProgram, setSelectedSpecialProgram] = useState<any>({
//     symbol: "none",
//     name: "None",
//     description: "No special program",
//   });
//   const specialProgramDropdownRef = useRef<HTMLDivElement>(null);
//   const isOtherColumnCountry = Column2CountryCodes.includes(country.code);
//   const specialTariffProgramSymbols = getBaseTariffsForColumn(
//     tariffElement,
//     TariffColumn.SPECIAL
//   ).reduce((acc, t) => {
//     t.tariffs.forEach((t) => {
//       t.programs?.forEach((p) => {
//         if (!acc.includes(p)) {
//           acc.push(p);
//         }
//       });
//     });
//     return acc;
//   }, []);
//   const specialTariffPrograms = specialTariffProgramSymbols
//     .map((p) => TradePrograms.find((t) => t.symbol === p))
//     .filter(Boolean)
//     .filter(
//       (p) =>
//         p.status === TradeProgramStatus.ACTIVE &&
//         (p.qualifyingCountries?.includes(country.code) ||
//           (!p.qualifyingCountries && p.requiresReview))
//     );
//   // const footnotesForColumn: Footnote[] = [
//   //   ...tariffElement.footnotes,
//   //   ...htsElement.footnotes,
//   // ].reduce((acc, footnote) => {
//   //   if (
//   //     footnote.columns.includes(tariffColumn) ||
//   //     footnote.columns.some(
//   //       (c) =>
//   //         c !== TariffColumn.GENERAL &&
//   //         c !== TariffColumn.SPECIAL &&
//   //         c !== TariffColumn.OTHER
//   //     )
//   //   ) {
//   //     if (!acc.some((f) => f.value === footnote.value)) {
//   //       acc.push(footnote);
//   //     }
//   //   }
//   //   return acc;
//   // }, []);

//   useEffect(() => {
//     setApplicableTariffs(
//       getTariffs(country.code, htsCode).filter((t) => {
//         if (isEUCountry) {
//           const totalBaseRate = getEUCountryTotalBaseRate(
//             columnTariffs.flatMap((t) => t.tariffs),
//             customsValue,
//             units
//           );

//           if (totalBaseRate >= 15) {
//             return t.code !== "9903.02.20";
//           } else {
//             return t.code !== "9903.02.19";
//           }
//         }

//         return true;
//       })
//     );
//   }, [units, customsValue]);

//   useEffect(() => {
//     const contentRequirementAt100 = contentRequirements.find(
//       (r) => r.value === 100
//     );
//     const contentRequirementsNotAt0 = contentRequirements.filter(
//       (r) => r.value > 0
//     );

//     if (contentRequirementAt100) {
//       setTariffSets(
//         getContentRequirementTariffSets(applicableUITariffs, [
//           contentRequirementAt100,
//         ])
//       );
//     } else {
//       const contentRequirementSets = getContentRequirementTariffSets(
//         applicableUITariffs,
//         contentRequirementsNotAt0
//       );
//       setTariffSets([
//         getArticleTariffSet(
//           applicableUITariffs,
//           Section232MetalTariffs,
//           contentRequirements
//         ),
//         ...contentRequirementSets,
//       ]);
//     }
//   }, [applicableTariffs, contentRequirements]);

//   useEffect(() => {
//     if (selectedSpecialProgram && selectedSpecialProgram.symbol === "none") {
//       if (isOtherColumnCountry) {
//         setTariffColumn(TariffColumn.OTHER);
//       } else {
//         setTariffColumn(TariffColumn.GENERAL);
//       }
//     } else {
//       setTariffColumn(TariffColumn.SPECIAL);
//     }
//   }, [selectedSpecialProgram]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         specialProgramDropdownRef.current &&
//         !specialProgramDropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsSpecialProgramOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="flex flex-col p-3 border-2 border-base-content/50 bg-base-300 rounded-md gap-4">
//       {/* Header with Buttons */}
//       <div className="w-full flex justify-between items-center">
//         <div className="flex gap-3 items-center">
//           <h2 className="text-white text-2xl font-bold">{country.flag}</h2>
//           <h2 className="text-white text-xl font-bold">{country.name}</h2>
//         </div>
//         <div className="flex gap-2">
//           <button
//             className="btn btn-xs btn-primary"
//             onClick={() => setShowInactive(!showInactive)}
//           >
//             {showInactive ? "Hide Inactive Tariffs" : "Show All Tariffs"}
//           </button>
//           <button
//             className="btn btn-xs btn-primary"
//             onClick={() => {
//               setTariffSets([
//                 getArticleTariffSet(
//                   applicableUITariffs,
//                   [],
//                   contentRequirements
//                 ),
//                 ...getContentRequirementTariffSets(
//                   applicableUITariffs,
//                   contentRequirements
//                 ),
//               ]);
//               setSelectedSpecialProgram({
//                 symbol: "none",
//                 name: "None",
//                 description: "No special program",
//               });
//               setTariffColumn(TariffColumn.GENERAL);
//             }}
//           >
//             Reset
//           </button>
//           <button
//             className="btn btn-xs btn-square btn-primary"
//             onClick={() =>
//               setSelectedCountries(
//                 selectedCountries.filter((c) => c.code !== country.code)
//               )
//             }
//           >
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M18 6L6 18M6 6L18 18"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* Special Tariff Program Selection */}
//       {!isOtherColumnCountry && specialTariffPrograms.length > 0 && (
//         <div className="flex flex-col gap-2">
//           <div className="flex flex-col gap-1">
//             <SecondaryLabel
//               value="Potential Special Tariff Programs"
//               color={Color.WHITE}
//             />
//             {/* <TertiaryText value="Select a special tariff program to see how it effects duty" /> */}
//           </div>
//           <div
//             className="relative w-full max-w-lg"
//             ref={specialProgramDropdownRef}
//           >
//             <div
//               className="w-full px-3 py-1 border-2 border-base-content/10 rounded-lg cursor-pointer bg-base-300 flex gap-3 items-center justify-between hover:bg-primary/20 transition-colors min-h-10"
//               onClick={() => setIsSpecialProgramOpen(!isSpecialProgramOpen)}
//             >
//               <div className="flex-1 flex items-center">
//                 {selectedSpecialProgram ? (
//                   <p className="text-white font-semibold">
//                     {selectedSpecialProgram.name}
//                     {selectedSpecialProgram.symbol &&
//                       selectedSpecialProgram.symbol !== "none" && (
//                         <span className="text-accent">
//                           {" "}
//                           ({selectedSpecialProgram.symbol})
//                         </span>
//                       )}
//                   </p>
//                 ) : (
//                   <span className="text-sm">Select Special Tariff Program</span>
//                 )}
//               </div>
//               <svg
//                 className={`w-4 h-4 transition-transform text-base-content/70 ${isSpecialProgramOpen ? "" : "rotate-180"}`}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M19 9l-7 7-7-7"
//                 />
//               </svg>
//             </div>

//             {isSpecialProgramOpen && (
//               <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-60 overflow-hidden">
//                 <div className="max-h-48 overflow-y-auto">
//                   {[
//                     {
//                       symbol: "none",
//                       name: "None",
//                       description: "No special program",
//                     },
//                     ...specialTariffPrograms,
//                   ].map((program, index) => (
//                     <div
//                       key={index}
//                       className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
//                         selectedSpecialProgram?.symbol === program.symbol
//                           ? "bg-primary/10 border-l-2 border-primary"
//                           : "hover:bg-primary/20"
//                       }`}
//                       onClick={() => {
//                         setSelectedSpecialProgram(
//                           program.symbol === "none"
//                             ? {
//                                 symbol: "none",
//                                 name: "None",
//                                 description: "No special program",
//                               }
//                             : program
//                         );
//                         setIsSpecialProgramOpen(false);
//                       }}
//                     >
//                       <div className="flex flex-col">
//                         <span className="text-base-content font-medium">
//                           {program.name}
//                           {program.symbol && program.symbol !== "none" && (
//                             <span className="text-base-content">
//                               {" "}
//                               ({program.symbol})
//                             </span>
//                           )}
//                         </span>
//                         {"description" in program && program.description && (
//                           <span className="text-sm text-base-content">
//                             {program.description}
//                           </span>
//                         )}
//                       </div>
//                       {selectedSpecialProgram?.symbol === program.symbol && (
//                         <svg
//                           className="w-4 h-4 text-primary"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M5 13l4 4L19 7"
//                           />
//                         </svg>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {isEUCountry &&
//         columnTariffs
//           .flatMap((t) => t.tariffs)
//           .some((t) => t.type === "amount") && (
//           <div className="flex flex-wrap gap-2">
//             {columnTariffs &&
//               columnTariffs.flatMap((t) => t.tariffs).length > 0 &&
//               (htsElement.units.length > 0 || tariffElement.units.length > 0) &&
//               columnTariffs
//                 .flatMap((t) => t.tariffs)
//                 .some((t) => t.type === "amount") && (
//                 <div>
//                   <label className="label">
//                     <span className="label-text">
//                       {htsElement.units.length > 0 ||
//                       tariffElement.units.length > 0
//                         ? `${[...htsElement.units, ...tariffElement.units]
//                             .reduce((acc, unit) => {
//                               if (!acc.includes(unit)) {
//                                 acc.push(unit);
//                               }
//                               return acc;
//                             }, [])
//                             .join(",")}`
//                         : ""}
//                     </span>
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     className="input input-bordered w-full max-w-xs"
//                     value={units}
//                     onChange={(e) => {
//                       setUnits(Number(e.target.value));
//                     }}
//                   />
//                 </div>
//               )}
//             <div>
//               <label className="label">
//                 <span className="label-text">Customs Value (USD)</span>
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 className="input input-bordered w-full max-w-xs"
//                 value={customsValue}
//                 onChange={(e) => {
//                   setCustomsValue(Number(e.target.value));
//                 }}
//               />
//             </div>
//             <div className="flex flex-col">
//               <label className="label">
//                 <span className="label-text">
//                   General Ad Valorem Equivalent Rate
//                 </span>
//               </label>
//               <div className="flex flex-col">
//                 <PrimaryLabel
//                   value={`${getEUCountryTotalBaseRate(
//                     columnTariffs.flatMap((t) => t.tariffs),
//                     customsValue,
//                     units
//                   ).toFixed(3)}
//               %`}
//                   color={Color.PRIMARY}
//                 />
//                 <p>
//                   <sup>
//                     &ge; 15% means reciprocal tariff exclusion for EU countries
//                   </sup>
//                 </p>
//                 {/* <TertiaryText value="Used for EU countries to see if general ad valorem equivalent rate exceeds 15% for reciprocal tariff determination" /> */}
//               </div>
//             </div>
//             <div className="flex flex-col items-end">
//               {columnTariffs
//                 .flatMap((t) => t.tariffs)
//                 .filter((t) => t.type === "amount").length > 0 && (
//                 <div>
//                   {getAmountRates(columnTariffs.flatMap((t) => t.tariffs)).map(
//                     (t) => (
//                       <div key={`${t}-${units}-${customsValue}`}>
//                         <p>{`${t} * ${units || 1} / ${customsValue} * 100 = ${(
//                           ((t * (units || 1)) / customsValue) *
//                           100
//                         ).toFixed(4)}%`}</p>
//                       </div>
//                     )
//                   )}
//                 </div>
//               )}
//               {columnTariffs
//                 .flatMap((t) => t.tariffs)
//                 .filter((t) => t.type === "percent")
//                 .map((t) => (
//                   <div
//                     key={`${t.raw}-${units}-${customsValue}`}
//                     className="flex w-full justify-between"
//                   >
//                     <p>+</p>
//                     <p>{t.value}%</p>
//                   </div>
//                 ))}
//               <div className="w-full border-t border-base-content/50 my-2" />
//               <div className="flex w-full justify-end">
//                 <p>
//                   {getEUCountryTotalBaseRate(
//                     columnTariffs.flatMap((t) => t.tariffs),
//                     customsValue,
//                     units
//                   ).toFixed(3)}
//                   %
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//       {/* Tariff Sets */}
//       <div className={"w-full flex flex-col gap-4"}>
//         {tariffSets.map((tariffSet, i) => (
//           <div
//             key={`tariff-set-${i}`}
//             className="flex flex-col gap-4 rounded-md border-base-content/20"
//           >
//             <SecondaryLabel
//               value={`${tariffSet.name} Tariff`}
//               color={Color.WHITE}
//             />

//             <div className="flex flex-col gap-2">
//               {columnHasTariffs &&
//                 columnTariffs
//                   .filter((t) => {
//                     if (
//                       selectedSpecialProgram &&
//                       selectedSpecialProgram.symbol !== "none"
//                     ) {
//                       return t.tariffs.some((t) =>
//                         t.programs?.includes(selectedSpecialProgram.symbol)
//                       );
//                     }
//                     return true;
//                   })
//                   .flatMap((t) => t.tariffs)
//                   .map((t, i) => (
//                     <BaseTariff
//                       key={`${htsElement.htsno}-${t.raw}-${i}`}
//                       index={i}
//                       htsElement={tariffElement}
//                       tariff={t}
//                     />
//                   ))}
//               {tariffSet.tariffs
//                 .filter((t) => !tariffSet.exceptionCodes.has(t.code))
//                 .map((tariff) => (
//                   <Tariff
//                     key={tariff.code}
//                     showInactive={showInactive}
//                     tariff={tariff}
//                     setIndex={i}
//                     tariffSets={tariffSets}
//                     setTariffSets={setTariffSets}
//                     column={tariffColumn}
//                   />
//                 ))}
//             </div>
//             <div className="-mt-3 w-full flex justify-between items-end gap-2">
//               <h2 className="text-white font-bold">Total:</h2>
//               <div className="flex gap-2">
//                 {columnTariffs
//                   .flatMap((t) => t.tariffs)
//                   .filter((t) => t.type === "amount").length > 0 && (
//                   <div className="flex gap-2">
//                     <p className="text-xl font-bold text-primary transition duration-100">
//                       {getAmountRatesString(
//                         columnTariffs.flatMap((t) => t.tariffs)
//                       )}
//                     </p>
//                     <p className="text-xl font-bold text-primary transition duration-100">
//                       +
//                     </p>
//                   </div>
//                 )}
//                 <p className="text-xl font-bold text-primary transition duration-100">
//                   {getAdValoremRate(
//                     tariffColumn,
//                     tariffSet.tariffs,
//                     columnTariffs.flatMap((t) => t.tariffs)
//                   )}
//                   %
//                 </p>
//               </div>
//             </div>
//             {columnTariffs.flatMap((t) => t.parsingFailures).length > 0 && (
//               <div className="flex flex-col gap-2 p-4 border-2 border-red-500 rounded-md">
//                 <h2 className="text-white font-bold">
//                   {`Error Parsing ${tariffElement.htsno}'s Base Tariff(s):`}
//                 </h2>
//                 <ul className="flex flex-col gap-2 list-disc list-outside">
//                   {columnTariffs
//                     .flatMap((t) => t.parsingFailures)
//                     .map((t, i) => (
//                       <li
//                         key={`${tariffElement.htsno}-${t}-${i}`}
//                         className="ml-6 text-red-500 font-bold text-lg"
//                       >
//                         {t}
//                       </li>
//                     ))}
//                 </ul>

//                 <p className="text-base-content">
//                   Please send{" "}
//                   <a
//                     href="mailto:support@htshero.com"
//                     className="text-primary font-bold"
//                   >
//                     support
//                   </a>{" "}
//                   a screenshot of this error.
//                 </p>
//                 <p className="text-base-content">
//                   All tariffs are still presented so you can manually add them
//                   them while we work on the fix
//                 </p>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Footnotes */}
//       {/* {footnotesForColumn.length > 0 && (
//         <div className="flex flex-col gap-2">
//           <SecondaryLabel value="Footnotes" />
//           <ul className="flex flex-col gap-2 ml-5">
//             {footnotesForColumn.map((footnote: Footnote, i) => (
//               <li
//                 key={`${tariffElement.htsno}-${footnote}-${i}`}
//                 className="list-disc list-outside"
//               >
//                 <SecondaryText value={footnote.value} color={Color.WHITE} />
//                 <TertiaryText
//                   value={`Applies to: ${footnote.columns.join(", ")} column(s)`}
//                 />
//               </li>
//             ))}
//           </ul>
//         </div>
//       )} */}
//     </div>
//   );
// };
