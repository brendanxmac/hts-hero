import { printResults } from "./test-runner"

// Import all test suites — add new test files here
import "./engine-v2/engine.test"
import "./engine-v2/real-data.test"
import "./tariff-watcher.test"
import "./duty-calculator-links.test"
import "../libs/classification-helpers.test"
import "../libs/classification-from-hts-code.test"
import "../libs/can-create-classification.test"

// Print results and exit with appropriate code
printResults()
