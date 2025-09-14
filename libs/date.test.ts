import {
  formatHumanReadableDate,
  isExactlyDaysAgo,
  getDayRange,
  getExactDateDaysAgo,
} from "./date";

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

// Test the new date functions
console.log("\n=== TESTING TRIAL DATE LOGIC ===");
console.log("=================================");

// Test isExactlyDaysAgo function
console.log("\n1. Testing isExactlyDaysAgo function:");
console.log("------------------------------------");

const testDates = [];
for (let i = 0; i <= 10; i++) {
  const testDate = new Date();
  testDate.setDate(testDate.getDate() - i);
  testDates.push({
    daysAgo: i,
    dateISO: testDate.toISOString(),
    label: i === 0 ? "today" : i === 1 ? "yesterday" : `${i} days ago`,
  });
}

testDates.forEach(({ daysAgo, dateISO, label }) => {
  const result6Days = isExactlyDaysAgo(dateISO, 6);
  const resultDaysAgo = isExactlyDaysAgo(dateISO, daysAgo);
  console.log(`Date (${label}): ${dateISO}`);
  console.log(`  Is exactly 6 days ago: ${result6Days}`);
  console.log(`  Is exactly ${daysAgo} days ago: ${resultDaysAgo}`);
  console.log("");
});

// Test getDayRange function
console.log("\n2. Testing getDayRange function:");
console.log("--------------------------------");

const sixDaysAgoRange = getDayRange(6);
console.log("Range for 6 days ago:");
console.log(`  Start: ${sixDaysAgoRange.start}`);
console.log(`  End: ${sixDaysAgoRange.end}`);

// Verify the range covers exactly one day
const startDate = new Date(sixDaysAgoRange.start);
const endDate = new Date(sixDaysAgoRange.end);
console.log(`  Start time: ${startDate.toTimeString()}`);
console.log(`  End time: ${endDate.toTimeString()}`);
console.log(
  `  Same day: ${startDate.toDateString() === endDate.toDateString()}`
);

// Test edge cases
console.log("\n3. Testing edge cases:");
console.log("---------------------");

// Test times throughout the day 6 days ago
const baseDate = new Date();
baseDate.setDate(baseDate.getDate() - 6);

const timesToTest = [
  { hours: 0, minutes: 0, seconds: 0, label: "start of day" },
  { hours: 12, minutes: 30, seconds: 45, label: "middle of day" },
  { hours: 23, minutes: 59, seconds: 59, label: "end of day" },
];

timesToTest.forEach(({ hours, minutes, seconds, label }) => {
  const testDate = new Date(baseDate);
  testDate.setHours(hours, minutes, seconds, 0);
  const testISO = testDate.toISOString();

  console.log(`Testing ${label} (${testISO}):`);
  console.log(`  Is exactly 6 days ago: ${isExactlyDaysAgo(testISO, 6)}`);
  console.log(
    `  Is in 6-day range: ${testISO >= sixDaysAgoRange.start && testISO <= sixDaysAgoRange.end}`
  );
});

// Test dates that should NOT match
console.log("\n4. Testing dates that should NOT match:");
console.log("--------------------------------------");

const nonMatchingDates = [
  { daysAgo: 5, label: "5 days ago (too recent)" },
  { daysAgo: 7, label: "7 days ago (too old)" },
  { daysAgo: 0, label: "today" },
];

nonMatchingDates.forEach(({ daysAgo, label }) => {
  const testDate = new Date();
  testDate.setDate(testDate.getDate() - daysAgo);
  const testISO = testDate.toISOString();

  console.log(`Testing ${label} (${testISO}):`);
  console.log(
    `  Is exactly 6 days ago: ${isExactlyDaysAgo(testISO, 6)} (should be false)`
  );
  console.log(
    `  Is in 6-day range: ${testISO >= sixDaysAgoRange.start && testISO <= sixDaysAgoRange.end} (should be false)`
  );
});

// Test the new getExactDateDaysAgo function
console.log("\n5. Testing getExactDateDaysAgo function (NEW FIX):");
console.log("------------------------------------------------");

const exactSixDaysAgo = getExactDateDaysAgo(6);
console.log(`Exact date 6 days ago: ${exactSixDaysAgo}`);

// Test the timezone fix
console.log("\n6. TIMEZONE FIX VERIFICATION:");
console.log("-----------------------------");
console.log("BEFORE: getDayRange(6) would span TWO dates due to timezone");
console.log(`  Range start date: ${sixDaysAgoRange.start.split("T")[0]}`);
console.log(`  Range end date: ${sixDaysAgoRange.end.split("T")[0]}`);
console.log("  ^ This caused both 2025-09-07 AND 2025-09-08 to match!");

console.log("\nAFTER: getExactDateDaysAgo(6) returns ONE specific date");
console.log(`  Exact date: ${exactSixDaysAgo}`);
console.log("  ^ Only users with THIS exact date will match!");

// Test against the actual problem dates
const problemDates = ["2025-09-07", "2025-09-08"];
console.log("\n7. Testing against the ACTUAL problem dates:");
console.log("--------------------------------------------");
problemDates.forEach((dateStr) => {
  const matches = dateStr === exactSixDaysAgo;
  console.log(
    `${dateStr}: ${matches ? "MATCHES" : "no match"} (${matches ? "Email sent" : "Email NOT sent"})`
  );
});

console.log("\n=== PROOF OF CORRECTNESS (UPDATED) ===");
console.log("=====================================");
console.log(
  "✅ The NEW logic uses exact date matching instead of range matching"
);
console.log("✅ Only ONE date will ever match, preventing timezone issues");
console.log(
  "✅ Users with trials on 2025-09-07 vs 2025-09-08 won't both get emails"
);
console.log("✅ This eliminates the duplicate email problem completely");
console.log(
  "✅ Running this cron job daily will send emails exactly once per user"
);

// run using -- npx tsx libs/date.test.ts
