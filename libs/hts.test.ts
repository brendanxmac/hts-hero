import { validateTariffableHtsCode } from "./hts";

// Test cases for isValidTariffableHtsCode function
const testCases = [
  // ===== VALID 8-DIGIT CODES =====

  // Valid 8-digit codes with proper format - numeric only
  {
    input: "04020000",
    expected: true,
    description: "Valid 8-digit numeric HTS code",
  },
  {
    input: "12345678",
    expected: true,
    description: "Valid 8-digit numeric HTS code",
  },
  {
    input: "01234567",
    expected: true,
    description: "Valid 8-digit numeric HTS code starting with 0",
  },
  {
    input: "97999999",
    expected: true,
    description: "Valid 8-digit numeric HTS code ending with 97",
  },

  // Valid 8-digit codes with periods in correct positions
  {
    input: "0402.00.00",
    expected: true,
    description: "Valid 8-digit HTS code with periods",
  },
  {
    input: "1234.56.78",
    expected: true,
    description: "Valid 8-digit HTS code with periods",
  },
  {
    input: "0123.45.67",
    expected: true,
    description: "Valid 8-digit HTS code with periods starting with 0",
  },
  {
    input: "9799.99.99",
    expected: true,
    description: "Valid 8-digit HTS code with periods ending with 97",
  },

  // ===== VALID 10-DIGIT CODES =====

  // Valid 10-digit codes - numeric only
  {
    input: "0402005000",
    expected: true,
    description: "Valid 10-digit numeric HTS code",
  },
  {
    input: "1234567890",
    expected: true,
    description: "Valid 10-digit numeric HTS code",
  },
  {
    input: "0123456789",
    expected: true,
    description: "Valid 10-digit numeric HTS code starting with 0",
  },
  {
    input: "9799999999",
    expected: true,
    description: "Valid 10-digit numeric HTS code ending with 97",
  },

  // Valid 10-digit codes with periods in correct positions
  {
    input: "0402.00.50.00",
    expected: true,
    description: "Valid 10-digit HTS code with periods",
  },
  {
    input: "1234.56.78.90",
    expected: true,
    description: "Valid 10-digit HTS code with periods",
  },
  {
    input: "0123.45.67.89",
    expected: true,
    description: "Valid 10-digit HTS code with periods starting with 0",
  },
  {
    input: "9799.99.99.99",
    expected: true,
    description: "Valid 10-digit HTS code with periods ending with 97",
  },

  // ===== EDGE CASES - VALID =====

  // Chapter boundary tests - valid chapters
  {
    input: "0100.00.00",
    expected: true,
    description: "Chapter 01 - minimum valid chapter",
  },
  {
    input: "9700.00.00",
    expected: true,
    description: "Chapter 97 - maximum valid chapter",
  },
  {
    input: "0101.01.01",
    expected: true,
    description: "Chapter 01 with non-zero subheadings",
  },
  {
    input: "9697.98.99",
    expected: true,
    description: "Chapter 96 with high subheadings",
  },

  // ===== INVALID - WRONG DIGIT COUNT =====

  // Too few digits
  { input: "0402", expected: false, description: "Invalid - only 4 digits" },
  { input: "040200", expected: false, description: "Invalid - only 6 digits" },
  {
    input: "04.02",
    expected: false,
    description: "Invalid - only 4 digits with period",
  },
  {
    input: "0402.00",
    expected: false,
    description: "Invalid - only 6 digits with period",
  },

  // Too many digits
  {
    input: "040200000000",
    expected: false,
    description: "Invalid - 12 digits",
  },
  {
    input: "0402.00.00.00.00",
    expected: false,
    description: "Invalid - 12 digits with periods",
  },

  // 9 digits (between 8 and 10)
  { input: "040200000", expected: false, description: "Invalid - 9 digits" },
  {
    input: "0402.00.000",
    expected: false,
    description: "Invalid - 9 digits with malformed periods",
  },

  // ===== INVALID - CHAPTER OUT OF RANGE =====

  // Chapter 00
  { input: "00020000", expected: false, description: "Invalid - Chapter 00" },
  {
    input: "0002.00.00",
    expected: false,
    description: "Invalid - Chapter 00 with periods",
  },

  // Chapter 98+
  { input: "98020000", expected: false, description: "Invalid - Chapter 98" },
  {
    input: "9802.00.00",
    expected: false,
    description: "Invalid - Chapter 98 with periods",
  },
  { input: "99020000", expected: false, description: "Invalid - Chapter 99" },
  {
    input: "9902.00.00",
    expected: false,
    description: "Invalid - Chapter 99 with periods",
  },

  // ===== INVALID - WRONG FORMAT =====

  // Wrong period placement
  {
    input: "04.02.00.00",
    expected: false,
    description: "Invalid - periods in wrong positions for 8-digit",
  },
  {
    input: "040.2.00.00",
    expected: false,
    description: "Invalid - malformed period placement",
  },
  {
    input: "0402.0.0.00",
    expected: false,
    description: "Invalid - too few digits between periods",
  },
  {
    input: "0402.000.00",
    expected: false,
    description: "Invalid - too many digits between periods",
  },

  // Mixed formats that are invalid
  {
    input: "0402.0000",
    expected: false,
    description: "Invalid - mix of periods and no periods",
  },
  {
    input: "04020.0.00",
    expected: false,
    description: "Invalid - period in wrong position",
  },

  // ===== INVALID - NON-NUMERIC CHARACTERS =====

  // Letters
  {
    input: "0402.00.0A",
    expected: false,
    description: "Invalid - contains letter",
  },
  {
    input: "abcd.ef.gh",
    expected: false,
    description: "Invalid - all letters",
  },
  { input: "040X.00.00", expected: false, description: "Invalid - contains X" },

  // Special characters
  {
    input: "0402-00-00",
    expected: false,
    description: "Invalid - contains hyphens",
  },
  {
    input: "0402/00/00",
    expected: false,
    description: "Invalid - contains slashes",
  },
  {
    input: "0402 00 00",
    expected: false,
    description: "Invalid - contains spaces",
  },
  {
    input: "0402:00:00",
    expected: false,
    description: "Invalid - contains colons",
  },
  {
    input: "0402,00,00",
    expected: false,
    description: "Invalid - contains commas",
  },
  {
    input: "0402;00;00",
    expected: false,
    description: "Invalid - contains semicolons",
  },

  // ===== INVALID - EMPTY AND WHITESPACE =====

  // Empty string
  { input: "", expected: false, description: "Invalid - empty string" },

  // Only whitespace
  { input: " ", expected: false, description: "Invalid - single space" },
  { input: "   ", expected: false, description: "Invalid - multiple spaces" },
  { input: "\t", expected: false, description: "Invalid - tab character" },
  { input: "\n", expected: false, description: "Invalid - newline character" },

  // ===== WHITESPACE HANDLING =====

  // Leading/trailing whitespace (should be handled by trim)
  {
    input: " 0402.00.00 ",
    expected: true,
    description: "Valid - with leading/trailing spaces (trimmed)",
  },
  {
    input: "\t0402.00.00\t",
    expected: true,
    description: "Valid - with leading/trailing tabs (trimmed)",
  },
  {
    input: "\n0402.00.00\n",
    expected: true,
    description: "Valid - with leading/trailing newlines (trimmed)",
  },

  // Internal whitespace (should be invalid)
  {
    input: "04 02.00.00",
    expected: false,
    description: "Invalid - space in middle",
  },
  {
    input: "0402. 00.00",
    expected: false,
    description: "Invalid - space after period",
  },
  {
    input: "0402.00 .00",
    expected: false,
    description: "Invalid - space before period",
  },

  // ===== INVALID - TOO MANY PERIODS =====

  // Extra periods
  {
    input: "0402.00.00.",
    expected: false,
    description: "Invalid - trailing period on 8-digit",
  },
  {
    input: ".0402.00.00",
    expected: false,
    description: "Invalid - leading period",
  },
  {
    input: "0402..00.00",
    expected: false,
    description: "Invalid - double period",
  },
  {
    input: "0402.00.00.00.",
    expected: false,
    description: "Invalid - trailing period on 10-digit",
  },
  {
    input: "0402...00...00",
    expected: false,
    description: "Invalid - multiple consecutive periods",
  },

  // ===== INVALID - MISSING PERIODS =====

  // Partial periods (8-digit codes)
  {
    input: "040200.00",
    expected: false,
    description: "Invalid - only one period in 8-digit code",
  },
  {
    input: "0402.0000",
    expected: false,
    description: "Invalid - only one period in 8-digit code",
  },

  // Partial periods (10-digit codes)
  {
    input: "040200.50.00",
    expected: false,
    description: "Invalid - missing period in 10-digit code",
  },
  {
    input: "0402.005000",
    expected: false,
    description: "Invalid - missing periods in 10-digit code",
  },
  {
    input: "04020050.00",
    expected: false,
    description: "Invalid - only one period in 10-digit code",
  },

  // ===== EDGE CASES - BOUNDARY VALUES =====

  // All zeros
  {
    input: "00000000",
    expected: false,
    description: "Invalid - all zeros (chapter 00)",
  },
  {
    input: "0000.00.00",
    expected: false,
    description: "Invalid - all zeros with periods (chapter 00)",
  },

  // All nines valid
  {
    input: "97999999",
    expected: true,
    description: "Valid - all nines in valid chapter",
  },
  {
    input: "9799.99.99",
    expected: true,
    description: "Valid - all nines with periods in valid chapter",
  },

  // All nines invalid (chapter 99)
  {
    input: "99999999",
    expected: false,
    description: "Invalid - all nines in invalid chapter",
  },
  {
    input: "9999.99.99",
    expected: false,
    description: "Invalid - all nines with periods in invalid chapter",
  },

  // ===== COMPLEX INVALID CASES =====

  // Mixed valid/invalid elements
  {
    input: "0402.00.AB",
    expected: false,
    description: "Invalid - valid start but invalid end",
  },
  {
    input: "AB02.00.00",
    expected: false,
    description: "Invalid - invalid start but valid format otherwise",
  },

  // Unicode and special characters
  {
    input: "０４０２.００.００",
    expected: false,
    description: "Invalid - full-width Unicode digits",
  },
  {
    input: "0402.00.00™",
    expected: false,
    description: "Invalid - trademark symbol",
  },
  {
    input: "0402.00.00€",
    expected: false,
    description: "Invalid - Euro symbol",
  },

  // ===== NULL AND UNDEFINED INPUTS =====
  // Note: TypeScript should prevent these, but worth testing if they somehow get through

  // ===== PERFORMANCE EDGE CASES =====

  // Very long strings
  {
    input: "0402000000000000000000000000000000000000",
    expected: false,
    description: "Invalid - extremely long numeric string",
  },
  {
    input: "0402.00.00.00.00.00.00.00.00.00.00.00.00",
    expected: false,
    description: "Invalid - extremely long with periods",
  },
];

// Test runner
console.log("=".repeat(80));
console.log("COMPREHENSIVE TESTS FOR isValidTariffableHtsCode");
console.log("=".repeat(80));
console.log();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

testCases.forEach(({ input, expected, description }, index) => {
  totalTests++;
  const result = validateTariffableHtsCode(input);
  const passed = result === expected;

  if (passed) {
    passedTests++;
  } else {
    failedTests++;
    console.log(`❌ TEST ${index + 1} FAILED:`);
    console.log(`   Input: "${input}"`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Got: ${result}`);
    console.log(`   Description: ${description}`);
    console.log();
  }
});

console.log("=".repeat(80));
console.log("TEST SUMMARY:");
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ${failedTests > 0 ? "❌" : "✅"}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
console.log("=".repeat(80));

if (failedTests === 0) {
  console.log("🎉 ALL TESTS PASSED! The function behavior is preserved.");
} else {
  console.log("⚠️  SOME TESTS FAILED! The function behavior may have changed.");
}

// Additional specific tests for edge cases that might be missed
console.log();
console.log("ADDITIONAL SPECIFIC VALIDATION TESTS:");
console.log("-".repeat(50));

// Test the specific helper functions to ensure they work as expected
const additionalTests = [
  // Test boundary conditions more specifically
  { input: "0100.00.00", expected: true, description: "Boundary: Chapter 01" },
  { input: "9700.00.00", expected: true, description: "Boundary: Chapter 97" },
  { input: "0099.99.99", expected: false, description: "Boundary: Chapter 00" },
  { input: "9800.00.00", expected: false, description: "Boundary: Chapter 98" },

  // Test specific format validations
  { input: "12345678", expected: true, description: "8-digit numeric only" },
  { input: "1234567890", expected: true, description: "10-digit numeric only" },
  { input: "1234.56.78", expected: true, description: "8-digit with periods" },
  {
    input: "1234.56.78.90",
    expected: true,
    description: "10-digit with periods",
  },
];

additionalTests.forEach(({ input, expected, description }, index) => {
  const result = validateTariffableHtsCode(input);
  const passed = result === expected;

  if (passed) {
    console.log(`✅ ${description}: "${input}" -> ${result}`);
  } else {
    console.log(
      `❌ ${description}: "${input}" -> ${result} (expected ${expected})`
    );
  }
});

// Export for potential use in other test files
export { testCases };

// Run using: npx tsx libs/hts.test.ts
