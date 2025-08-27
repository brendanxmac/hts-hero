export const TariffImpactInputHelp = () => (
  <div className="flex flex-col p-6 max-w-4xl mx-auto">
    {/* Header */}
    <div className="text-center pb-4">
      <h2 className="text-2xl md:text-3xl text-white font-bold mb-2">
        📋 How to Enter HTS Codes into this Tool
      </h2>
      <p className="text-sm text-base-content/70">
        A quick guide on how to get the most out of this tool
      </p>
    </div>

    {/* Single Code Formats */}
    <div className="space-y-4">
      <div className="divider">
        <span className="text-sm font-semibold">
          What HTS Code Formats are Supported?
        </span>
      </div>
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span className="font-bold">
          Both 8 & 10 digit HTS codes are supported with or without decimal
          points
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 8 Digit Codes */}
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-4">
            <h3 className="card-title text-base flex items-center gap-2">
              8-Digit Codes
            </h3>
            <div className="space-y-2">
              <div className="bg-base-100 rounded-lg p-3">
                <code className="text-sm font-mono text-accent">38089410</code>
                <span className="text-xs text-base-content/60 ml-2">
                  (no decimals)
                </span>
              </div>
              <div className="bg-base-100 rounded-lg p-3">
                <code className="text-sm font-mono text-accent">
                  3808.94.10
                </code>
                <span className="text-xs text-base-content/60 ml-2">
                  (with decimals)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 10 Digit Codes */}
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-4">
            <h3 className="card-title text-base flex items-center gap-2">
              10-Digit Codes
            </h3>
            <div className="space-y-2">
              <div className="bg-base-100 rounded-lg p-3">
                <code className="text-sm text-accent">3808941000</code>
                <span className="text-xs text-base-content/60 ml-2">
                  (no decimals)
                </span>
              </div>
              <div className="bg-base-100 rounded-lg p-3">
                <code className="text-sm text-accent">3808.94.10.00</code>
                <span className="text-xs text-base-content/60 ml-2">
                  (with decimals)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Multiple Codes Section */}
    <div className="mt-8">
      <div className="divider">
        <span className="text-sm font-semibold">
          How can I Enter Multiple Codes at Once?
        </span>
      </div>

      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div className="flex flex-col">
          <p className="font-bold">
            You can enter multiple codes using any of the following separators,{" "}
            <span className="underline">
              or by copy and pasting cells directly from a spreadsheet column.
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Comma Separated */}
        <div className="collapse collapse-arrow bg-base-200 border border-base-300">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title text-sm font-medium flex items-center gap-2">
            <span className="badge badge-outline">CSV</span>
            Comma Separated List
          </div>
          <div className="collapse-content">
            <div className="bg-base-100 rounded-lg p-3 mt-2">
              <code className="text-sm text-success break-all">
                3808.94.10.00, 0202.20.80.00, 1204.00.00
              </code>
            </div>
          </div>
        </div>

        {/* Newline Separated */}
        <div className="collapse collapse-arrow bg-base-200 border border-base-300">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title text-sm font-medium flex items-center gap-2">
            <span className="badge badge-outline">NEWLINE</span>
            Newline Separated List
          </div>
          <div className="collapse-content">
            <div className="bg-base-100 rounded-lg p-3 mt-2">
              <code className="text-sm text-success whitespace-pre-line">
                {`3808.94.10.00
                  0202.20.80.00
                  1204.00.00`}
              </code>
            </div>
          </div>
        </div>

        {/* Space Separated */}
        <div className="collapse collapse-arrow bg-base-200 border border-base-300">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title text-sm font-medium flex items-center gap-2">
            <span className="badge badge-outline">SPACE</span>
            Space Separated List
          </div>
          <div className="collapse-content">
            <div className="bg-base-100 rounded-lg p-3 mt-2">
              <code className="text-sm text-success break-all">
                3808.94.10.00 0202.20.80.00 1204.00.00
              </code>
            </div>
          </div>
        </div>

        {/* Mixed Separated */}
        <div className="collapse collapse-arrow bg-base-200 border border-base-300">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title text-sm font-medium flex items-center gap-2">
            <span className="badge badge-outline">MIX</span>
            Mixed Separated List
          </div>
          <div className="collapse-content">
            <div className="bg-base-100 rounded-lg p-3 mt-2">
              <code className="text-sm text-success whitespace-pre-line">
                {`3808.94.10.00, 0202.20.80.00
                  1204.00.00 0804.50.80.10`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer Tips */}
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20 mt-8">
      <div className="flex items-start gap-3">
        <div className="text-primary">💡</div>
        <div>
          <h4 className="font-semibold mb-1 text-white">Pro Tips:</h4>
          <ul className="text-sm text-base-content/70 text-white space-y-1">
            <li>• You can copy & paste cells directly from spreadsheets</li>
            <li>
              • See the full HTS & Tariff details for any element by clicking it
              in results table
            </li>
            <li>
              • You can mix and match any separator formats in the same input
            </li>
            <li>• Decimal points are optional but help with readability</li>
            <li>• Invalid codes will be clearly marked in the results</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);
