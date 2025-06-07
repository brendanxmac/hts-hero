"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import config from "@/config";

const HeaderLogoOnly = () => {
  return (
    <header className="h-16 z-10 bg-base-100 flex items-center justify-between p-4 border-b border-base-200">
      <nav
        className="w-full flex items-center justify-between"
        aria-label="Global"
      >
        <div className="flex gap-6 lg:flex-1">
          <Link className="flex items-center gap-2 shrink-0 " href="/explore">
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
        </div>
      </nav>
    </header>
  );
};

export default HeaderLogoOnly;
