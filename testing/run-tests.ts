import { printResults } from "./test-runner"

// Import all test suites — add new test files here
import "./tariffs.test"
import "../libs/classification-helpers.test"
import "../libs/classification-from-hts-code.test"
import "../libs/can-create-classification.test"

// Print results and exit with appropriate code
printResults()
