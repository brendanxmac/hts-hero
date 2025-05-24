import { formatHumanReadableDate } from "./date";

// Get today's date in ISO format
const today = new Date().toISOString();

// Get yesterday's date in ISO format
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayISO = yesterday.toISOString();

// Test cases
const testCases = [
  { input: today, description: "Today" },
  { input: yesterdayISO, description: "Yesterday" },
  { input: "2024-01-01T00:00:00Z", description: "January 1st" },
  { input: "2024-01-02T00:00:00Z", description: "January 2nd" },
  { input: "2024-01-03T00:00:00Z", description: "January 3rd" },
  { input: "2024-01-04T00:00:00Z", description: "January 4th" },
  { input: "2024-01-11T00:00:00Z", description: "January 11th" },
  { input: "2024-01-12T00:00:00Z", description: "January 12th" },
  { input: "2024-01-13T00:00:00Z", description: "January 13th" },
  { input: "2024-01-21T00:00:00Z", description: "January 21st" },
  { input: "2024-01-22T00:00:00Z", description: "January 22nd" },
  { input: "2024-01-23T00:00:00Z", description: "January 23rd" },
  { input: "2024-01-31T00:00:00Z", description: "January 31st" },
  { input: "2024-02-29T00:00:00Z", description: "February 29th" },
  { input: "2024-03-15T00:00:00Z", description: "March 15th" },
  { input: "2024-04-20T00:00:00Z", description: "April 20th" },
  { input: "2024-05-30T00:00:00Z", description: "May 30th" },
  { input: "2024-06-21T00:00:00Z", description: "June 21st" },
  { input: "2024-07-22T00:00:00Z", description: "July 22nd" },
  { input: "2024-08-23T00:00:00Z", description: "August 23rd" },
];

console.log("Date Formatting Examples:");
console.log("------------------------");
testCases.forEach(({ input, description }) => {
  console.log(`Input: ${input}`);
  console.log(`Output: ${formatHumanReadableDate(input)}`);
  console.log(`Expected: ${description}`);
  console.log("------------------------");
});

// run using -- npx tsx libs/date.test.ts
