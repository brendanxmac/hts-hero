import { printResults } from "./test-runner"

// Import all test suites — add new test files here
import "./engine-v2/engine.test"
import "./engine-v2/real-data.test"
import "./engine-v2/rate-parsing.test"
import "./tariff-tracker.test"
import "./tariff-tracker-plan.test"
import "./tariff-tracker-onboarding.test"
import "./tariff-tracker-opportunities.test"
import "./tariff-tracker-insights.test"
import "./tariff-updates-match.test"
import "./adcvd-parse.test"
import "./adcvd-match.test"
import "./chart-kit.test"
import "./part-colors.test"
import "./duty-calculator-links.test"
import "./mcp.test"
import "./sitemap.test"
import "./country-pages.test"
import "./excludes-base-duty.test"
import "./countries-hub.test"
import "../libs/classification-helpers.test"
import "../libs/classification-from-hts-code.test"
import "../libs/can-create-classification.test"

// Print results and exit with appropriate code
printResults()
