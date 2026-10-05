// "Free (A,AU,BH) 3.5% (JP)" -> [{ rate: "Free", programs: ["A", "AU", "BH"] }, { rate: "3.5%", programs: ["JP"] }];
// null when the text isn't in that shape
export const specialRates = (special: string) => {
  const groups = Array.from(special.matchAll(/([^()]+?)\s*\(([^)]+)\)/g));
  if (!groups.length || groups.map((g) => g[0]).join("").replace(/\s/g, "") !== special.replace(/\s/g, "")) return null;
  return groups.map((g) => ({ rate: g[1].trim(), programs: g[2].split(",").map((p) => p.trim()).filter(Boolean) }));
};
