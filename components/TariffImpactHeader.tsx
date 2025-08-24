"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import config from "@/config";
import ButtonSignin from "./ButtonSignin";

const AboutHeader = () => {
  return (
    <header className="bg-base-100">
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link
            className="text-white flex items-center gap-2 shrink-0 "
            href="/tariffs/impact-checker"
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-6"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-extrabold text-lg">{config.appName}</span>
          </Link>
        </div>

        <div className="flex justify-center lg:gap-12 lg:items-center">
          <ButtonSignin text="Check your Imports" />
        </div>
      </nav>
    </header>
  );
};

export default AboutHeader;
