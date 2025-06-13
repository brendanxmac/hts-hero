"use client";

import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/logo.png";
import ButtonAccount from "./ButtonAccount";
import ButtonSupport from "./ButtonSupport";
import { usePathname } from "next/navigation";
import ButtonGuide from "./ButtonGuide";
import { useGuide } from "@/contexts/GuideContext";
import { GuideName } from "@/types/guides";

export const AuthenticatedHeader = () => {
  const pathname = usePathname();
  const { showGuide } = useGuide();

  return (
    <header className="h-16 z-10 bg-base-100 flex items-center justify-between p-4 border-b border-base-200">
      <div className="flex gap-6">
        <Link className="flex items-center gap-2 shrink-0" href="/explore">
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

        <div className="flex items-center justify-start gap-4">
          <Link
            href="/explore"
            className={`btn btn-link px-0 gap-0 ${
              pathname === "/explore"
                ? "text-primary underline"
                : "text-base-content no-underline"
            }`}
          >
            Explorer
          </Link>
          <Link
            href="/app"
            className={`btn btn-link px-0 gap-0 ${
              pathname === "/app"
                ? "text-primary underline"
                : "text-base-content no-underline"
            }`}
          >
            Code Finder
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ButtonGuide onClick={() => showGuide(GuideName.CLASSIFY)} />
        <ButtonSupport />
        <ButtonAccount />
      </div>
    </header>
  );
};
