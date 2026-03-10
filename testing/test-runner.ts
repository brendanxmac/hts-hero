export interface TestResult {
  name: string
  passed: boolean
  error?: string
}

export interface TestSuite {
  name: string
  results: TestResult[]
}

const suites: TestSuite[] = []
let currentSuite: TestSuite | null = null

export const describe = (name: string, fn: () => void) => {
  currentSuite = { name, results: [] }
  suites.push(currentSuite)
  fn()
  currentSuite = null
}

export const it = (name: string, fn: () => void) => {
  if (!currentSuite) throw new Error("it() must be called inside describe()")
  try {
    fn()
    currentSuite.results.push({ name, passed: true })
  } catch (e: any) {
    currentSuite.results.push({
      name,
      passed: false,
      error: e.message || String(e),
    })
  }
}

export const expect = <T>(actual: T) => ({
  toBe: (expected: T) => {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    }
  },
  toEqual: (expected: T) => {
    const a = JSON.stringify(actual)
    const e = JSON.stringify(expected)
    if (a !== e) {
      throw new Error(`Expected ${e}, got ${a}`)
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`)
    }
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`)
    }
  },
  toBeGreaterThan: (expected: number) => {
    if ((actual as number) <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`)
    }
  },
  toBeGreaterThanOrEqual: (expected: number) => {
    if ((actual as number) < expected) {
      throw new Error(`Expected ${actual} to be >= ${expected}`)
    }
  },
  toContain: (expected: any) => {
    if (!Array.isArray(actual) || !actual.includes(expected)) {
      throw new Error(`Expected array to contain ${JSON.stringify(expected)}`)
    }
  },
  toContainCode: (code: string) => {
    if (
      !Array.isArray(actual) ||
      !(actual as any[]).some((t: any) => t.code === code)
    ) {
      throw new Error(`Expected array to contain tariff with code "${code}"`)
    }
  },
  not: {
    toContain: (expected: any) => {
      if (Array.isArray(actual) && actual.includes(expected)) {
        throw new Error(`Expected array NOT to contain ${JSON.stringify(expected)}`)
      }
    },
    toContainCode: (code: string) => {
      if (
        Array.isArray(actual) &&
        (actual as any[]).some((t: any) => t.code === code)
      ) {
        throw new Error(`Expected array NOT to contain tariff with code "${code}"`)
      }
    },
  },
  toHaveLength: (expected: number) => {
    if (!Array.isArray(actual) || actual.length !== expected) {
      const len = Array.isArray(actual) ? actual.length : "N/A"
      throw new Error(`Expected length ${expected}, got ${len}`)
    }
  },
  toBeUndefined: () => {
    if (actual !== undefined) {
      throw new Error(`Expected undefined, got ${JSON.stringify(actual)}`)
    }
  },
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error(`Expected defined value, got undefined`)
    }
  },
})

export const printResults = () => {
  let totalPassed = 0
  let totalFailed = 0
  const failures: { suite: string; test: string; error: string }[] = []

  console.log("\n" + "=".repeat(70))
  console.log("  TARIFF CALCULATOR TEST RESULTS")
  console.log("=".repeat(70) + "\n")

  for (const suite of suites) {
    const passed = suite.results.filter((r) => r.passed).length
    const failed = suite.results.filter((r) => !r.passed).length
    totalPassed += passed
    totalFailed += failed

    const status = failed === 0 ? "✅" : "❌"
    console.log(`${status} ${suite.name} (${passed}/${suite.results.length})`)

    for (const result of suite.results) {
      if (result.passed) {
        console.log(`   ✅ ${result.name}`)
      } else {
        console.log(`   ❌ ${result.name}`)
        console.log(`      → ${result.error}`)
        failures.push({
          suite: suite.name,
          test: result.name,
          error: result.error!,
        })
      }
    }
    console.log()
  }

  console.log("=".repeat(70))
  console.log(
    `  TOTAL: ${totalPassed + totalFailed} tests | ${totalPassed} passed | ${totalFailed} failed`
  )
  console.log("=".repeat(70))

  if (failures.length > 0) {
    console.log("\n❌ FAILURES:\n")
    failures.forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.suite}] ${f.test}`)
      console.log(`     ${f.error}\n`)
    })
    process.exit(1)
  } else {
    console.log("\n✅ All tests passed!\n")
    process.exit(0)
  }
}
