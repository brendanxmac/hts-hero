import { printResults } from "./test-runner"

// Import all test suites — add new test files here
import "./tariffs.test"
import "../libs/classification-helpers.test"
import "../libs/classification-from-hts-code.test"
import "../libs/can-create-classification.test"
import "../libs/invoice-transforms.test"
import "../libs/trade-documents.test"
import "../libs/export-templates.test"
import "../libs/datalab-extract.test"

// Print results and exit with appropriate code
printResults()
