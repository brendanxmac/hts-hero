"use client";

import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/logo.png";
import ButtonAccount from "./ButtonAccount";
import ButtonSupport from "./ButtonSupport";

export const AuthenticatedHeader = () => {
  // const pathname = usePathname();

  return (
    <header className="h-16 z-10 bg-base-100 flex items-center justify-between p-4 border-b border-base-200">
      <div className="flex gap-4">
        <Link
          className="flex items-center gap-2 shrink-0"
          href="/explore"
          title={`${config.appName} homepage`}
        >
          <Image
            src={logo}
            alt={`${config.appName} logo`}
            className="w-6"
            priority={true}
            width={32}
            height={32}
          />
          <span className="text-white font-extrabold text-lg">
            {config.appName}
          </span>
        </Link>

        {/* <div className="flex items-center justify-start gap-4">
          <Link href="/explore">
            <button
              className={`btn btn-link px-0 gap-0 hover:scale-105 transition-all duration-100 ease-in-out ${
                pathname === "/explore"
                  ? "text-primary underline"
                  : "text-base-content no-underline"
              }`}
            >
              Explore
            </button>
          </Link>
          <Link href="/classify">
            <button
              className={`btn btn-link px-0 gap-0 hover:scale-105 transition-all duration-100 ease-in-out ${
                pathname === "/classify"
                  ? "text-primary underline"
                  : "text-base-content no-underline"
              }`}
            >
              Classify
            </button>
          </Link>
        </div> */}
      </div>

      <div className="flex items-center gap-2">
        <ButtonSupport />
        <ButtonAccount />
      </div>
    </header>
  );
};
