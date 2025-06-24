import Link from "next/link";

const Arrow = ({ extraStyle }: { extraStyle: string }) => {
  return (
    <svg
      className={`shrink-0 w-12 fill-neutral-content opacity-70 ${extraStyle}`}
      viewBox="0 0 138 138"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M72.9644 5.31431C98.8774 43.8211 83.3812 88.048 54.9567 120.735C54.4696 121.298 54.5274 122.151 55.0896 122.639C55.6518 123.126 56.5051 123.068 56.9922 122.506C86.2147 88.9044 101.84 43.3918 75.2003 3.80657C74.7866 3.18904 73.9486 3.02602 73.3287 3.44222C72.7113 3.85613 72.5484 4.69426 72.9644 5.31431Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M56.5084 121.007C56.9835 118.685 57.6119 115.777 57.6736 115.445C59.3456 106.446 59.5323 97.67 58.4433 88.5628C58.3558 87.8236 57.6824 87.2948 56.9433 87.3824C56.2042 87.4699 55.6756 88.1435 55.7631 88.8828C56.8219 97.7138 56.6432 106.225 55.0203 114.954C54.926 115.463 53.5093 121.999 53.3221 123.342C53.2427 123.893 53.3688 124.229 53.4061 124.305C53.5887 124.719 53.8782 124.911 54.1287 125.015C54.4123 125.13 54.9267 125.205 55.5376 124.926C56.1758 124.631 57.3434 123.699 57.6571 123.487C62.3995 120.309 67.4155 116.348 72.791 113.634C77.9171 111.045 83.3769 109.588 89.255 111.269C89.9704 111.475 90.7181 111.057 90.9235 110.342C91.1288 109.626 90.7117 108.878 89.9963 108.673C83.424 106.794 77.3049 108.33 71.5763 111.223C66.2328 113.922 61.2322 117.814 56.5084 121.007Z"
        />
      </g>
    </svg>
  );
};
const Step = ({ emoji, text }: { emoji: string; text: string }) => {
  return (
    <div className="w-full lg:w-48 flex flex-col gap-2 items-center justify-center">
      <span className="text-4xl">{emoji}</span>
      <h3 className="font-bold text-white">{text}</h3>
    </div>
  );
};

const Problem = () => {
  return (
    <section className="bg-base-300 text-neutral-content">
      <div className="max-w-7xl mx-auto px-8 py-16 lg:py-32 text-center">
        <h2 className="text-white max-w-3xl mx-auto font-extrabold text-4xl lg:text-5xl tracking-tight mb-16">
          How does it work?
        </h2>
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 sm:gap-3">
          <div className="flex flex-col justify-center items-center">
            <Step emoji="🎁" text="You Sell Classification" />
            <p className="text-neutral-400 text-xs italic">
              At a very affordable price
            </p>
          </div>

          <Arrow extraStyle="max-lg:-scale-x-100 lg:-rotate-90" />

          <div className="flex flex-col justify-center items-center">
            <Step emoji="✅" text="Client gets HTS Hero" />
            <p className="text-neutral-400 text-xs italic">
              Linked to your business with optional co-branding
            </p>
          </div>

          <Arrow extraStyle="lg:-scale-x-100 lg:-rotate-90" />

          <div className="flex flex-col justify-center items-center">
            <Step emoji="🎉" text="Client Finds Code" />
            <p className="text-neutral-400 text-xs italic">
              With expert help & tech support a click away
            </p>
          </div>

          <Arrow extraStyle="max-lg:-scale-x-100 lg:-rotate-90" />

          <div className="flex flex-col justify-center items-center">
            <Step emoji="🚀" text="We Promote Your Offers" />
            <p className="text-neutral-400 text-xs italic">
              So clients see what else you can help with
            </p>
          </div>
        </div>

        {/* <div className="flex flex-col justify-center items-center gap-6 mt-10 lg:mt-24">
          <p className="text-white max-w-3xl mx-auto text-xl font-bold opacity-90 leading-relaxed">
            More clients, more upsells, premium service
          </p>
          <div className="flex items-center justify-center gap-1 w-full animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-neutral-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              />
            </svg>

            <Link
              className="text-center text-sm text-neutral-300 tracking-tight"
              href="/about/partner#features"
            >
              What could this mean for your business?
            </Link>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-neutral-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              />
            </svg>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default Problem;
