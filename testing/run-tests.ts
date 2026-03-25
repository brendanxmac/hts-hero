import { printResults } from "./test-runner"

// Import all test suites — add new test files here
import "./tariffs.test"
import "../libs/classification-helpers.test"
import "../libs/can-create-classification.test"
import "../app/classifications/[id]/loadClassificationLogic.test"

// Print results and exit with appropriate code
printResults()
