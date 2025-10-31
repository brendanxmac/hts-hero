import Link from "next/link";

const TariffHero = () => {
  return (
    <section className="flex justify-center items-center w-full bg-base-300 text-base-content px-6 pt-10 lg:pt-16">
      <div className="w-full flex flex-col max-w-7xl lg:min-w-5xl gap-4 sm:gap-8">
        <div className="flex flex-col gap-2 md:gap-4 text-center lg:text-left lg:flex-1 items-center">
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-6xl tracking-tight max-w-3xl text-center mx-auto">
            Find the Best Tariff Rate for Any Import in{" "}
            <span className="text-yellow-400">Seconds</span>
            {/* Tariff Rates & Exemptions for Any Import in{" "} */}
            {/* Check Tariff Rates and Discover Savings in{" "} */}
          </h1>
          {/* <p className="text-sm md:text-lg lg:text-xl text-neutral-300 leading-relaxed max-w-5xl mx-auto md:my-4">
            See the tariffs, find ways to save, & get notified when new tariffs
            affect your imports
          </p> */}

          <div className="flex justify-center lg:justify-start mt-4">
            <Link
              className="btn btn-wide bg-yellow-400 text-base-300 hover:bg-yellow-500"
              href="/tariffs/impact-checker"
            >
              Check your Imports!
            </Link>
          </div>

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>
        <div className="flex justify-center sm:rounded-2xl overflow-hidden mx-auto">
          <video
            className="w-full max-h-[55vh] border border-neutral-content/20 rounded-md md:rounded-2xl"
            autoPlay
            muted
            loop
            controls
            controlsList="nofullscreen noplaybackrate nodownload"
            playsInline
            disablePictureInPicture
            src="/tariffs-hero.mp4"
          ></video>
        </div>

        {/* <div className="flex flex-col w-full h-fit gap-4 lg:gap-10 text-text-default max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {tariffFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`${feature.styles} rounded-3xl flex flex-col gap-2 sm:gap-6 w-full h-[22rem] lg:h-[25rem] pt-6 overflow-hidden border-2 border-base-content/30`}
              >
                <div className="px-6 flex items-center gap-3">
                  <div className="rounded-full h-6 w-6 md:h-7 md:w-7 bg-primary text-base-300 text-sm md:text-base font-semibold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <h3 className="text-lg sm:text-xl tracking-tight text-white font-semibold">
                    {feature.title}
                  </h3>
                </div>

                {index === 0 && currentStep === 1 && (
                  <div className="overflow-hidden h-full flex items-stretch">
                    <div className="w-full bg-base-200 rounded-t-box h-full py-4 px-6">
                      <p className="font-medium uppercase tracking-wide text-base-content/60 text-sm mb-3">
                        HTS Code:
                      </p>
                      <div className="relative textarea py-4 h-full bg-base-100 border-base-content/10 text-base-content mr-2">
                        <div className="text-base md:text-lg font-medium text-white">
                          {singleCodePartial}
                          <span className={`w-[1px] h-5 text-primary`}>|</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {index === 0 && currentStep !== 1 && (
                  <div className="overflow-hidden h-full flex items-stretch">
                    <div className="w-full bg-base-200 rounded-t-box h-full py-4 px-6">
                      <p className="font-medium uppercase tracking-wide text-base-content/60 text-sm mb-3">
                        HTS Code:
                      </p>
                      <div className="relative textarea py-4 h-full bg-base-100 border-base-content/10 text-base-content mr-2">
                        <div className="text-base md:text-lg font-medium text-white">
                          {demoHtsCode}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {index === 1 && (
                  <div className="overflow-hidden h-full flex items-stretch">
                    <div className="w-full bg-base-200 rounded-t-box h-full py-4 px-6">
                      <p className="font-medium uppercase tracking-wide text-base-content/60 text-sm mb-3">
                        Country of Origin:
                      </p>
                      <div className="h-full flex flex-col gap-2">
                        {displayedCountries.length > 0 ? (
                          displayedCountries.map((country) => (
                            <div
                              key={country.code}
                              className="bg-base-100 border border-base-content/30 rounded-md px-4 py-3 flex items-center gap-3 opacity-0 animate-opacity"
                              style={{
                                animationFillMode: "forwards",
                              }}
                            >
                              <span className="text-2xl leading-none">
                                {country.flag}
                              </span>
                              <span className="text-white font-medium text-base">
                                {country.name}
                              </span>
                              <svg
                                className="w-5 h-5 text-primary ml-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ))
                        ) : (
                          <div className="text-base-content/40 text-sm italic">
                            Selecting countries...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {index === 2 && (
                  <div className="overflow-hidden h-full flex">
                    <div className="w-full bg-base-200 rounded-t-box h-full py-3 px-4">
                      <p className="font-medium uppercase tracking-wide text-base-content/60 text-xs mb-2">
                        Tariff Rates:
                      </p>
                      <div className="w-full h-full flex flex-col overflow-hidden">
                        {step3Active && selectedCountries.length > 0 ? (
                          <div className="overflow-y-auto grid grid-cols-1 gap-2">
                            {selectedCountries.map((country) => {
                              const items = getTariffItemsForCountry(
                                country.code
                              );
                              const total = getTotalRate(items);

                              return (
                                <div
                                  key={`row-${country.code}`}
                                  className="bg-base-100 border border-base-content/30 rounded-md h-16 flex-shrink-0"
                                >
                                  <div className="px-3 py-2 flex items-center justify-between h-full">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-base leading-none">
                                        {country.flag}
                                      </span>
                                      <span className="text-white font-medium text-sm truncate">
                                        {country.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-white font-bold text-base leading-none">
                                        {total}%
                                      </span>
                                      <button className="btn btn-xs btn-outline">
                                        show details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-base-content/40 text-sm italic">
                              Waiting for countries...
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default TariffHero;
