// Regex that gets whatever is inside the parentheses of special text, if exists
export const getStringBetweenParenthesis = (special: string) => {
  const regex = /\(([^)]+)\)/;
  const match = special.match(regex);
  // We also add a space after each comma
  return match ? match[1].replace(/,/g, ", ") : null;
};

// Regex that gets the prefix of the special text
export const getTextBeforeOpeningParenthesis = (special: string) => {
  const regex = /^[^(]+/;
  const match = special.match(regex);
  return match ? match[0].trim() : special;
};
