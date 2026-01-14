import {
  getPaddedHtsVersions,
  normalizeHtsFormat,
  getEnrichedHtsElementsFromString,
  transformTextWithHtsDescriptions,
} from "./hts";
import { HtsElement } from "../interfaces/hts";
import Fuse from "fuse.js";

// Test cases for getPaddedHtsVersions function
const paddingTestCases = [
  // ===== 4 DIGIT CODES =====
  {
    input: "2905",
    expected: ["2905.00", "2905.00.00", "2905.00.00.00"],
    description: "4-digit code should generate 6, 8, and 10 digit versions",
  },
  {
    input: "0402",
    expected: ["0402.00", "0402.00.00", "0402.00.00.00"],
    description: "4-digit code starting with 0",
  },
  {
    input: "9701",
    expected: ["9701.00", "9701.00.00", "9701.00.00.00"],
    description: "4-digit code in chapter 97",
  },
  {
    input: "1234",
    expected: ["1234.00", "1234.00.00", "1234.00.00.00"],
    description: "Generic 4-digit code",
  },

  // ===== 6 DIGIT CODES (xxxx.xx) =====
  {
    input: "2905.44",
    expected: ["2905.44.00", "2905.44.00.00"],
    description: "6-digit code should generate 8 and 10 digit versions",
  },
  {
    input: "0402.00",
    expected: ["0402.00.00", "0402.00.00.00"],
    description: "6-digit code with zeros",
  },
  {
    input: "9701.99",
    expected: ["9701.99.00", "9701.99.00.00"],
    description: "6-digit code with high digits",
  },
  {
    input: "1234.56",
    expected: ["1234.56.00", "1234.56.00.00"],
    description: "Generic 6-digit code",
  },

  // ===== 8 DIGIT CODES (xxxx.xx.xx) =====
  {
    input: "2905.44.00",
    expected: ["2905.44.00.00"],
    description: "8-digit code should generate only 10 digit version",
  },
  {
    input: "0402.00.50",
    expected: ["0402.00.50.00"],
    description: "8-digit code with mixed values",
  },
  {
    input: "9701.99.99",
    expected: ["9701.99.99.00"],
    description: "8-digit code with high digits",
  },
  {
    input: "1234.56.78",
    expected: ["1234.56.78.00"],
    description: "Generic 8-digit code",
  },

  // ===== 10 DIGIT CODES (xxxx.xx.xx.xx) - Already full length =====
  {
    input: "2905.44.00.00",
    expected: [],
    description: "10-digit code should return empty array (already full)",
  },
  {
    input: "0402.00.50.00",
    expected: [],
    description: "10-digit code with mixed values",
  },
  {
    input: "9701.99.99.99",
    expected: [],
    description: "10-digit code with high digits",
  },
  {
    input: "1234.56.78.90",
    expected: [],
    description: "Generic 10-digit code",
  },

  // ===== EDGE CASES - INVALID FORMATS (should return empty) =====
  {
    input: "",
    expected: [],
    description: "Empty string should return empty array",
  },
  {
    input: "29",
    expected: [],
    description: "Too short (2 digits) should return empty array",
  },
  {
    input: "290",
    expected: [],
    description: "Too short (3 digits) should return empty array",
  },
  {
    input: "29054",
    expected: [],
    description: "Invalid 5-digit format should return empty array",
  },
  {
    input: "2905.4",
    expected: [],
    description:
      "Invalid 6-char format (missing digit) should return empty array",
  },
  {
    input: "2905.444",
    expected: [],
    description:
      "Invalid 8-char format (extra digit) should return empty array",
  },
  {
    input: "2905.44.0",
    expected: [],
    description:
      "Invalid 9-char format (missing digit) should return empty array",
  },
  {
    input: "2905.44.000",
    expected: [],
    description:
      "Invalid 11-char format (extra digit) should return empty array",
  },
  {
    input: "2905.44.00.0",
    expected: [],
    description:
      "Invalid 12-char format (missing digit) should return empty array",
  },
  {
    input: "2905.44.00.000",
    expected: [],
    description:
      "Invalid 14-char format (extra digit) should return empty array",
  },

  // ===== EDGE CASES - WRONG PERIOD PLACEMENT =====
  {
    input: "29.05.44",
    expected: [],
    description: "Wrong period placement (length 8 but periods in wrong spots)",
  },
  {
    input: "290544.0",
    expected: [],
    description: "Wrong period placement for 8-char string",
  },
  {
    input: "29054.400",
    expected: [],
    description: "Wrong period placement for 9-char string",
  },

  // ===== REAL WORLD EXAMPLES =====
  {
    input: "8471",
    expected: ["8471.00", "8471.00.00", "8471.00.00.00"],
    description: "Real HTS: Automatic data processing machines (heading)",
  },
  {
    input: "8471.30",
    expected: ["8471.30.00", "8471.30.00.00"],
    description: "Real HTS: Laptops (subheading)",
  },
  {
    input: "8471.30.01",
    expected: ["8471.30.01.00"],
    description: "Real HTS: Specific laptop type (8-digit)",
  },
  {
    input: "6110.20",
    expected: ["6110.20.00", "6110.20.00.00"],
    description: "Real HTS: Cotton sweaters",
  },
  {
    input: "0201.10",
    expected: ["0201.10.00", "0201.10.00.00"],
    description: "Real HTS: Beef carcasses",
  },
];

// Test runner
console.log("=".repeat(80));
console.log("COMPREHENSIVE TESTS FOR getPaddedHtsVersions");
console.log("=".repeat(80));
console.log();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

paddingTestCases.forEach(({ input, expected, description }, index) => {
  totalTests++;
  const result = getPaddedHtsVersions(input);

  // Compare arrays
  const passed =
    result.length === expected.length &&
    result.every((val, idx) => val === expected[idx]);

  if (passed) {
    passedTests++;
    console.log(`✅ TEST ${index + 1}: ${description}`);
    console.log(`   Input: "${input}"`);
    console.log(`   Output: [${result.map((r) => `"${r}"`).join(", ")}]`);
    console.log();
  } else {
    failedTests++;
    console.log(`❌ TEST ${index + 1} FAILED: ${description}`);
    console.log(`   Input: "${input}"`);
    console.log(`   Expected: [${expected.map((e) => `"${e}"`).join(", ")}]`);
    console.log(`   Got:      [${result.map((r) => `"${r}"`).join(", ")}]`);
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
  console.log("🎉 ALL TESTS PASSED!");
} else {
  console.log("⚠️  SOME TESTS FAILED!");
  process.exit(1);
}

// Additional verification tests for specific scenarios mentioned in the requirements
console.log();
console.log("=".repeat(80));
console.log("SPECIFIC REQUIREMENT VERIFICATION:");
console.log("=".repeat(80));
console.log();

// Verify the exact example from the requirements
const exampleInput = "2905.44";
const exampleResult = getPaddedHtsVersions(exampleInput);
console.log(`Input: "${exampleInput}"`);
console.log(`Generated versions in order:`);
exampleResult.forEach((version, idx) => {
  console.log(`  ${idx + 1}. "${version}"`);
});

const expectedOrder = ["2905.44.00", "2905.44.00.00"];
const orderCorrect =
  exampleResult.length === 2 &&
  exampleResult[0] === expectedOrder[0] &&
  exampleResult[1] === expectedOrder[1];

console.log();
if (orderCorrect) {
  console.log('✅ VERIFIED: "2905.44" correctly generates:');
  console.log('   1st try: "2905.44.00" (8-digit)');
  console.log('   2nd try: "2905.44.00.00" (10-digit)');
} else {
  console.log("❌ FAILED: Order verification failed!");
  process.exit(1);
}

// ============================================================================
// NORMALIZATION TESTS
// ============================================================================

const normalizationTestCases = [
  // ===== MALFORMED CODES THAT NEED FIXING =====
  {
    input: "8428.90.0310",
    expected: "8428.90.03.10",
    description:
      "Missing period in 10-digit code (xxxx.xx.xxxx → xxxx.xx.xx.xx)",
  },
  {
    input: "8471.30.0100",
    expected: "8471.30.01.00",
    description: "Missing period in 10-digit code",
  },
  {
    input: "0402.00.5000",
    expected: "0402.00.50.00",
    description: "Missing period in 10-digit code with zeros",
  },
  {
    input: "8428900310",
    expected: "8428.90.03.10",
    description: "No periods at all in 10-digit code",
  },
  {
    input: "84289003",
    expected: "8428.90.03",
    description: "No periods at all in 8-digit code",
  },
  {
    input: "842890",
    expected: "8428.90",
    description: "No periods at all in 6-digit code",
  },
  {
    input: "8428",
    expected: "8428",
    description: "4-digit code (no change needed)",
  },
  {
    input: "8428.900310",
    expected: "8428.90.03.10",
    description: "Missing two periods in 10-digit code",
  },
  {
    input: "842890.0310",
    expected: "8428.90.03.10",
    description: "Period in wrong position",
  },
  {
    input: "84.28.90.03.10",
    expected: "8428.90.03.10",
    description: "Extra period at start (too many periods)",
  },

  // ===== ALREADY CORRECT FORMATS (SHOULD STAY THE SAME) =====
  {
    input: "8428.90.03.10",
    expected: "8428.90.03.10",
    description: "Already correct 10-digit format",
  },
  {
    input: "8428.90.03",
    expected: "8428.90.03",
    description: "Already correct 8-digit format",
  },
  {
    input: "8428.90",
    expected: "8428.90",
    description: "Already correct 6-digit format",
  },
  {
    input: "2905.44.00.00",
    expected: "2905.44.00.00",
    description: "Already correct 10-digit format with zeros",
  },
  {
    input: "0402.00.50.00",
    expected: "0402.00.50.00",
    description: "Already correct 10-digit format starting with 0",
  },

  // ===== EDGE CASES =====
  {
    input: "",
    expected: "",
    description: "Empty string returns empty",
  },
  {
    input: "123",
    expected: "123",
    description: "Invalid 3-digit returns original",
  },
  {
    input: "12345",
    expected: "12345",
    description: "Invalid 5-digit returns original",
  },
  {
    input: "1234567",
    expected: "1234567",
    description: "Invalid 7-digit returns original",
  },
  {
    input: "123456789",
    expected: "123456789",
    description: "Invalid 9-digit returns original",
  },
  {
    input: "12345678901",
    expected: "12345678901",
    description: "Invalid 11-digit returns original",
  },

  // ===== REAL WORLD MALFORMED EXAMPLES =====
  {
    input: "6110.20.2075",
    expected: "6110.20.20.75",
    description: "Real HTS: Cotton sweaters malformed",
  },
  {
    input: "0201.10.0500",
    expected: "0201.10.05.00",
    description: "Real HTS: Beef carcasses malformed",
  },
  {
    input: "8471.30.0100",
    expected: "8471.30.01.00",
    description: "Real HTS: Laptops malformed",
  },
  {
    input: "9027.81.0000",
    expected: "9027.81.00.00",
    description: "Real HTS: Instruments malformed",
  },
];

console.log();
console.log("=".repeat(80));
console.log("COMPREHENSIVE TESTS FOR normalizeHtsFormat");
console.log("=".repeat(80));
console.log();

let normTotalTests = 0;
let normPassedTests = 0;
let normFailedTests = 0;

normalizationTestCases.forEach(({ input, expected, description }, index) => {
  normTotalTests++;
  const result = normalizeHtsFormat(input);
  const passed = result === expected;

  if (passed) {
    normPassedTests++;
    console.log(`✅ TEST ${index + 1}: ${description}`);
    console.log(`   Input: "${input}" → Output: "${result}"`);
    console.log();
  } else {
    normFailedTests++;
    console.log(`❌ TEST ${index + 1} FAILED: ${description}`);
    console.log(`   Input: "${input}"`);
    console.log(`   Expected: "${expected}"`);
    console.log(`   Got:      "${result}"`);
    console.log();
  }
});

console.log("=".repeat(80));
console.log("NORMALIZATION TEST SUMMARY:");
console.log(`Total Tests: ${normTotalTests}`);
console.log(`Passed: ${normPassedTests} ✅`);
console.log(`Failed: ${normFailedTests} ${normFailedTests > 0 ? "❌" : "✅"}`);
console.log(
  `Success Rate: ${((normPassedTests / normTotalTests) * 100).toFixed(2)}%`
);
console.log("=".repeat(80));

if (normFailedTests > 0) {
  console.log("⚠️  SOME NORMALIZATION TESTS FAILED!");
  process.exit(1);
}

// Verify the specific example from the requirements
console.log();
console.log("=".repeat(80));
console.log("SPECIFIC NORMALIZATION REQUIREMENT VERIFICATION:");
console.log("=".repeat(80));
console.log();

const malformedExample = "8428.90.0310";
const normalizedResult = normalizeHtsFormat(malformedExample);
console.log(`Input: "${malformedExample}"`);
console.log(`Normalized: "${normalizedResult}"`);

if (normalizedResult === "8428.90.03.10") {
  console.log(
    '✅ VERIFIED: "8428.90.0310" correctly normalizes to "8428.90.03.10"'
  );
} else {
  console.log("❌ FAILED: Normalization verification failed!");
  process.exit(1);
}

// ============================================================================
// ENRICHED HTS ELEMENTS & TEXT TRANSFORMATION TESTS
// ============================================================================

// Create mock HTS elements for testing
const mockHtsElements: HtsElement[] = [
  {
    uuid: "1",
    htsno: "2905.44.00.00",
    description: "Erythritol",
    indent: "0",
    chapter: 29,
    footnotes: [],
  } as HtsElement,
  {
    uuid: "2",
    htsno: "8428.90.03.00",
    description: "Bucket elevators",
    indent: "0",
    chapter: 84,
    footnotes: [],
  } as HtsElement,
  {
    uuid: "3",
    htsno: "8428.90.05.00",
    description: "Belt conveyors",
    indent: "0",
    chapter: 84,
    footnotes: [],
  } as HtsElement,
  {
    uuid: "4",
    htsno: "8428.90.10.00",
    description: "Other conveyors",
    indent: "0",
    chapter: 84,
    footnotes: [],
  } as HtsElement,
  {
    uuid: "5",
    htsno: "9027.81.00.00",
    description: "Mass spectrometers",
    indent: "0",
    chapter: 90,
    footnotes: [],
  } as HtsElement,
];

// Create Fuse index for mock elements
const mockFuse = new Fuse(mockHtsElements, {
  keys: ["htsno"],
  threshold: 0.3,
  includeScore: true,
});

console.log();
console.log("=".repeat(80));
console.log(
  "TESTS FOR getEnrichedHtsElementsFromString & transformTextWithHtsDescriptions"
);
console.log("=".repeat(80));
console.log();

let enrichedTotalTests = 0;
let enrichedPassedTests = 0;
let enrichedFailedTests = 0;

// Test 1: Single code transformation
(() => {
  enrichedTotalTests++;
  const text = "See heading 2905.44 for more details.";
  const enriched = getEnrichedHtsElementsFromString(
    text,
    mockHtsElements,
    mockFuse
  );
  const transformed = transformTextWithHtsDescriptions(text, enriched);

  const expectedTransformed =
    "See heading 2905.44.00.00 (Erythritol) for more details.";
  const passed =
    transformed === expectedTransformed && enriched.codeMappings.length === 1;

  if (passed) {
    enrichedPassedTests++;
    console.log("✅ TEST 1: Single code transformation");
    console.log(`   Input: "${text}"`);
    console.log(`   Output: "${transformed}"`);
    console.log();
  } else {
    enrichedFailedTests++;
    console.log("❌ TEST 1 FAILED: Single code transformation");
    console.log(`   Input: "${text}"`);
    console.log(`   Expected: "${expectedTransformed}"`);
    console.log(`   Got: "${transformed}"`);
    console.log();
  }
})();

// Test 2: Multiple codes transformation
(() => {
  enrichedTotalTests++;
  const text = "Compare 2905.44 with 9027.81 specifications.";
  const enriched = getEnrichedHtsElementsFromString(
    text,
    mockHtsElements,
    mockFuse
  );
  const transformed = transformTextWithHtsDescriptions(text, enriched);

  const expectedTransformed =
    "Compare 2905.44.00.00 (Erythritol) with 9027.81.00.00 (Mass spectrometers) specifications.";
  const passed =
    transformed === expectedTransformed && enriched.codeMappings.length === 2;

  if (passed) {
    enrichedPassedTests++;
    console.log("✅ TEST 2: Multiple codes transformation");
    console.log(`   Input: "${text}"`);
    console.log(`   Output: "${transformed}"`);
    console.log();
  } else {
    enrichedFailedTests++;
    console.log("❌ TEST 2 FAILED: Multiple codes transformation");
    console.log(`   Input: "${text}"`);
    console.log(`   Expected: "${expectedTransformed}"`);
    console.log(`   Got: "${transformed}"`);
    console.log();
  }
})();

// Test 3: Code mapping tracks original and verified codes
(() => {
  enrichedTotalTests++;
  const text = "The code 2905.44 maps to something.";
  const enriched = getEnrichedHtsElementsFromString(
    text,
    mockHtsElements,
    mockFuse
  );

  const mapping = enriched.codeMappings[0];
  const passed =
    mapping.originalCode === "2905.44" &&
    mapping.verifiedCode === "2905.44.00.00" &&
    mapping.element?.htsno === "2905.44.00.00" &&
    mapping.startIndex === 9 &&
    mapping.endIndex === 16;

  if (passed) {
    enrichedPassedTests++;
    console.log("✅ TEST 3: Code mapping tracks original and verified codes");
    console.log(
      `   Original: "${mapping.originalCode}" → Verified: "${mapping.verifiedCode}"`
    );
    console.log(`   Position: ${mapping.startIndex}-${mapping.endIndex}`);
    console.log();
  } else {
    enrichedFailedTests++;
    console.log(
      "❌ TEST 3 FAILED: Code mapping tracks original and verified codes"
    );
    console.log(`   Got mapping:`, mapping);
    console.log();
  }
})();

// Test 4: Malformed code gets normalized and transformed
(() => {
  enrichedTotalTests++;
  const text = "Check code 9027.81.0000 for instruments.";
  const enriched = getEnrichedHtsElementsFromString(
    text,
    mockHtsElements,
    mockFuse
  );
  const transformed = transformTextWithHtsDescriptions(text, enriched);

  const expectedTransformed =
    "Check code 9027.81.00.00 (Mass spectrometers) for instruments.";
  const passed = transformed === expectedTransformed;

  if (passed) {
    enrichedPassedTests++;
    console.log("✅ TEST 4: Malformed code gets normalized and transformed");
    console.log(`   Input: "${text}"`);
    console.log(`   Output: "${transformed}"`);
    console.log();
  } else {
    enrichedFailedTests++;
    console.log(
      "❌ TEST 4 FAILED: Malformed code gets normalized and transformed"
    );
    console.log(`   Input: "${text}"`);
    console.log(`   Expected: "${expectedTransformed}"`);
    console.log(`   Got: "${transformed}"`);
    console.log();
  }
})();

// Test 5: Text with no HTS codes returns unchanged
(() => {
  enrichedTotalTests++;
  const text = "This is regular text with no codes.";
  const enriched = getEnrichedHtsElementsFromString(
    text,
    mockHtsElements,
    mockFuse
  );
  const transformed = transformTextWithHtsDescriptions(text, enriched);

  const passed = transformed === text && enriched.codeMappings.length === 0;

  if (passed) {
    enrichedPassedTests++;
    console.log("✅ TEST 5: Text with no HTS codes returns unchanged");
    console.log(`   Input: "${text}"`);
    console.log(`   Output: "${transformed}"`);
    console.log();
  } else {
    enrichedFailedTests++;
    console.log("❌ TEST 5 FAILED: Text with no HTS codes returns unchanged");
    console.log(`   Input: "${text}"`);
    console.log(`   Got: "${transformed}"`);
    console.log();
  }
})();

// Test 6: Unknown code is left as-is
(() => {
  enrichedTotalTests++;
  const text = "See 1234.56 for unknown items.";
  const enriched = getEnrichedHtsElementsFromString(
    text,
    mockHtsElements,
    mockFuse
  );
  const transformed = transformTextWithHtsDescriptions(text, enriched);

  // Code 1234.56 doesn't exist in our mock elements, so it should be left unchanged
  const passed = transformed === text;

  if (passed) {
    enrichedPassedTests++;
    console.log("✅ TEST 6: Unknown code is left as-is");
    console.log(`   Input: "${text}"`);
    console.log(`   Output: "${transformed}"`);
    console.log();
  } else {
    enrichedFailedTests++;
    console.log("❌ TEST 6 FAILED: Unknown code is left as-is");
    console.log(`   Input: "${text}"`);
    console.log(`   Expected: "${text}"`);
    console.log(`   Got: "${transformed}"`);
    console.log();
  }
})();

// Test 7: Enriched result contains all unique elements
(() => {
  enrichedTotalTests++;
  const text = "Items 2905.44 and 9027.81 and 2905.44 again.";
  const enriched = getEnrichedHtsElementsFromString(
    text,
    mockHtsElements,
    mockFuse
  );

  // Should have 3 code mappings but only 2 unique elements
  const passed =
    enriched.codeMappings.length === 3 && enriched.elements.length === 2;

  if (passed) {
    enrichedPassedTests++;
    console.log("✅ TEST 7: Enriched result contains all unique elements");
    console.log(
      `   Code mappings: ${enriched.codeMappings.length} (includes duplicates)`
    );
    console.log(`   Unique elements: ${enriched.elements.length}`);
    console.log();
  } else {
    enrichedFailedTests++;
    console.log(
      "❌ TEST 7 FAILED: Enriched result contains all unique elements"
    );
    console.log(`   Expected: 3 mappings, 2 elements`);
    console.log(
      `   Got: ${enriched.codeMappings.length} mappings, ${enriched.elements.length} elements`
    );
    console.log();
  }
})();

console.log("=".repeat(80));
console.log("ENRICHED/TRANSFORMATION TEST SUMMARY:");
console.log(`Total Tests: ${enrichedTotalTests}`);
console.log(`Passed: ${enrichedPassedTests} ✅`);
console.log(
  `Failed: ${enrichedFailedTests} ${enrichedFailedTests > 0 ? "❌" : "✅"}`
);
console.log(
  `Success Rate: ${((enrichedPassedTests / enrichedTotalTests) * 100).toFixed(2)}%`
);
console.log("=".repeat(80));

if (enrichedFailedTests > 0) {
  console.log("⚠️  SOME ENRICHED/TRANSFORMATION TESTS FAILED!");
  process.exit(1);
}

// Final summary
console.log();
console.log("=".repeat(80));
console.log("OVERALL TEST SUMMARY:");
console.log("=".repeat(80));
const allTestsTotal = totalTests + normTotalTests + enrichedTotalTests;
const allTestsPassed = passedTests + normPassedTests + enrichedPassedTests;
console.log(`Total Tests: ${allTestsTotal}`);
console.log(`Passed: ${allTestsPassed} ✅`);
console.log(
  `Success Rate: ${((allTestsPassed / allTestsTotal) * 100).toFixed(2)}%`
);

if (allTestsPassed === allTestsTotal) {
  console.log("🎉 ALL TESTS PASSED!");
} else {
  process.exit(1);
}

// Export for potential use in other test files
export { paddingTestCases, normalizationTestCases };

// Run using: npx tsx libs/hts-padding.test.ts
