export const TariffImpactInputHelp = () => (
  <div className="container mx-auto max-w-6xl px-4 py-8">
    {/* Header Section */}
    <header className="text-center mb-8">
      <h2 className="text-3xl md:text-4xl font-bold mb-3">
        How to Enter HTS Codes
      </h2>
      <p className="text-base-content/70">
        A comprehensive guide to using the HTS code input tool
      </p>
    </header>

    {/* Supported Formats Section */}
    <section className="mb-10">
      <div className="divider divider-start">
        <span className="text-lg font-semibold">Supported Formats</span>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-start gap-3">
          <p className="text-base-content leading-relaxed">
            Both <span className="font-semibold text-primary">8-digit</span> and{" "}
            <span className="font-semibold text-primary">10-digit</span> HTS
            codes are supported, with or without decimal points
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 8-Digit Codes Card */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg">8-Digit Codes</h3>
            <div className="space-y-3">
              <div className="mockup-code bg-base-100 text-base-content/80">
                <pre data-prefix=">" className="text-primary">
                  <code>38089410</code>
                </pre>
                <pre data-prefix="" className="text-base-content/60 text-xs">
                  <code> Without decimals</code>
                </pre>
              </div>
              <div className="mockup-code bg-base-100 text-base-content/80">
                <pre data-prefix=">" className="text-primary">
                  <code>3808.94.10</code>
                </pre>
                <pre data-prefix="" className="text-base-content/60 text-xs">
                  <code> With decimals</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 10-Digit Codes Card */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg">10-Digit Codes</h3>
            <div className="space-y-3">
              <div className="mockup-code bg-base-100 text-base-content/80">
                <pre data-prefix=">" className="text-secondary">
                  <code>3808941000</code>
                </pre>
                <pre data-prefix="" className="text-base-content/60 text-xs">
                  <code> Without decimals</code>
                </pre>
              </div>
              <div className="mockup-code bg-base-100 text-base-content/80">
                <pre data-prefix=">" className="text-secondary">
                  <code>3808.94.10.00</code>
                </pre>
                <pre data-prefix="" className="text-base-content/60 text-xs">
                  <code> With decimals</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Multiple Codes Section */}
    <section className="mb-10">
      <div className="divider divider-start">
        <span className="text-lg font-semibold">Multiple Code Entry</span>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-start gap-3">
          <p className="text-base-content leading-relaxed">
            Enter multiple codes using any separator below, or{" "}
            <span className="font-semibold text-primary">
              paste directly from spreadsheet columns
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Comma Separated */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge badge-primary badge-outline">CSV</span>
              <span className="font-medium">Comma Separated</span>
            </div>
            <div className="mockup-code bg-base-100 text-base-content/80">
              <pre data-prefix="$">
                <code>3808.94.10.00, 0202.20.80.00, 1204.00.00</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Newline Separated */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge badge-secondary badge-outline">
                NEWLINE
              </span>
              <span className="font-medium">Newline Separated</span>
            </div>
            <div className="mockup-code bg-base-100 text-base-content/80">
              <pre data-prefix="1">
                <code>3808.94.10.00</code>
              </pre>
              <pre data-prefix="2">
                <code>0202.20.80.00</code>
              </pre>
              <pre data-prefix="3">
                <code>1204.00.00</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Space Separated */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge badge-accent badge-outline">SPACE</span>
              <span className="font-medium">Space Separated</span>
            </div>
            <div className="mockup-code bg-base-100 text-base-content/80">
              <pre data-prefix="$">
                <code>3808.94.10.00 0202.20.80.00 1204.00.00</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Mixed Separated */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge badge-neutral badge-outline">MIXED</span>
              <span className="font-medium">Mixed Separators</span>
            </div>
            <div className="mockup-code bg-base-100 text-base-content/80">
              <pre data-prefix="1">
                <code>3808.94.10.00, 0202.20.80.00</code>
              </pre>
              <pre data-prefix="2">
                <code>1204.00.00 0804.50.80.10</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Pro Tips Section */}
    <section>
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-primary shrink-0 w-7 h-7 mt-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-3 text-primary">Pro Tips</h4>
            <ul className="space-y-2 text-sm text-base-content/80">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Copy and paste cells directly from spreadsheets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Click any code in the results table to view full HTS and
                  tariff details
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Mix and match separator formats in the same input</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Decimal points are optional but improve readability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Invalid codes will be clearly marked in the results</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
);
