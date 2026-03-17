import Link from "next/link";

interface ClassificationExample {
  description: string;
  htsCode: string;
  shareToken: string;
}

const EXAMPLES: ClassificationExample[] = [
  {
    description: "Ceramic brake pads for passenger vehicles, semi-metallic compound with copper-free formulation",
    htsCode: "6813.20.0060",
    shareToken: "placeholder",
  },
  {
    description: "Men's 100% cotton crew-neck t-shirt, knitted",
    htsCode: "6109.10.0012",
    shareToken: "placeholder",
  },
  {
    description: "Stainless steel double-wall vacuum insulated water bottle, 32oz capacity with leak-proof lid and powder-coated exterior finish",
    htsCode: "7323.93.0085",
    shareToken: "placeholder",
  },
  {
    description: "Corrugated cardboard shipping boxes, single-wall",
    htsCode: "4819.10.0040",
    shareToken: "placeholder",
  },
  {
    description: "Bamboo cutting board with juice groove and integrated handle, finished with food-safe mineral oil treatment for commercial kitchen use",
    htsCode: "4419.19.1100",
    shareToken: "placeholder",
  },
  {
    description: "Lithium-ion battery pack for residential solar energy storage, 10kWh capacity",
    htsCode: "8507.60.0020",
    shareToken: "placeholder",
  },
  {
    description: "Glazed ceramic floor tile, 12×12 inches",
    htsCode: "6908.90.0054",
    shareToken: "placeholder",
  },
  {
    description: "Single-mode optical fiber patch cables with LC connectors, 3 meter length, OS2 rated for 10G Ethernet backbone infrastructure in data centers",
    htsCode: "8544.70.0000",
    shareToken: "placeholder",
  },
  {
    description: "Children's interlocking plastic building block set, 500 pieces",
    htsCode: "9503.00.0090",
    shareToken: "placeholder",
  },
  {
    description: "Organic freeze-dried instant coffee",
    htsCode: "2101.11.2140",
    shareToken: "placeholder",
  },
  {
    description: "CNC machined aluminum enclosure for electronic equipment, anodized finish with precision-milled ventilation slots and EMI shielding",
    htsCode: "7616.99.5190",
    shareToken: "placeholder",
  },
  {
    description: "Industrial rubber conveyor belt, heat-resistant, 36 inches wide with reinforced textile plies for aggregate mining operations",
    htsCode: "4010.12.5000",
    shareToken: "placeholder",
  },
  {
    description: "Bluetooth active noise-cancelling over-ear headphones with built-in microphone",
    htsCode: "8518.30.2000",
    shareToken: "placeholder",
  },
  {
    description: "Titanium dental implant abutment",
    htsCode: "9021.29.0080",
    shareToken: "placeholder",
  },
  {
    description: "Women's 100% cashmere crew-neck pullover sweater, knitted, with ribbed cuffs and hem, imported from Scotland",
    htsCode: "6110.12.2040",
    shareToken: "placeholder",
  },
  {
    description: "LED grow lights for indoor vertical farming, full spectrum 600W with daisy-chain capability",
    htsCode: "9405.42.0000",
    shareToken: "placeholder",
  },
];

function ExampleCard({ example }: { example: ClassificationExample }) {
  return (
    <Link
      href={`/c/${example.shareToken}`}
      className="group block break-inside-avoid mb-5 relative rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02]"
    >
      {/* Glow - always visible */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-secondary/15 via-primary/10 to-secondary/15 blur-xl transition-all duration-300 group-hover:from-secondary/25 group-hover:via-primary/20 group-hover:to-secondary/25 group-hover:-inset-1" />

      {/* Card surface */}
      <div className="relative rounded-2xl border border-secondary/20 bg-base-100 overflow-hidden shadow-lg shadow-secondary/[0.08] transition-all duration-300 group-hover:shadow-xl group-hover:shadow-secondary/[0.12] group-hover:border-secondary/35">
        {/* Top accent gradient - full brightness */}
        <div className="h-1 bg-gradient-to-r from-secondary via-primary/70 to-secondary" />

        <div className="p-5 sm:p-6">
          {/* Product description */}
          <p className="text-[13px] font-medium sm:text-sm leading-relaxed text-base-content/90 mb-5">
            {example.description}
          </p>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-secondary/15 to-transparent mb-4" />

          {/* HTS Code display */}
          <div className="flex items-end justify-between gap-3">
            <div>
              {/* <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary/80 mb-1.5">
                HTS Code
              </span> */}
              <span className="text-[22px] sm:text-2xl font-bold tracking-wider text-primary transition-colors duration-300 group-hover:text-secondary">
                {example.htsCode}
              </span>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10 transition-all duration-300 group-hover:bg-secondary/20 shrink-0 mb-0.5">
              <svg
                className="w-4 h-4 text-secondary transition-all duration-300 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ClassificationExamplesSection() {
  return (
    <section className="relative pb-20 md:pb-28 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/[0.08] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/[0.08] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6">
        {/* Section header with animated arrow */}
        <div className="flex flex-col items-center mb-12 md:mb-16">
          <div className="inline-flex items-center px-5 py-2 mb-6">
            <span className="text-lg md:text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              See a Real Example
            </span>
          </div>

          {/* <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-base-content mb-4 text-center">
            See What Others Have
            <span className="text-secondary"> Classified</span>
          </h2>
          <p className="text-base sm:text-lg text-base-content/50 max-w-2xl mx-auto leading-relaxed text-center mb-8">
            Browse real classifications completed by customs brokers and importers using HTS Hero
          </p> */}

          {/* Animated bouncing arrow */}
          <div className="examples-bounce-arrow flex flex-col items-center gap-1">
            <svg
              className="w-6 h-6 text-secondary/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <svg
              className="w-6 h-6 text-secondary/40 -mt-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
          {EXAMPLES.map((example, i) => (
            <ExampleCard key={i} example={example} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .examples-bounce-arrow {
          animation: bounceDown 2s ease-in-out infinite;
        }

        @keyframes bounceDown {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(8px);
            opacity: 0.6;
          }
        }
      `}</style>
    </section>
  );
}
