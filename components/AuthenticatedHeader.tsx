"use client";

import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/logo.png";
import ButtonAccount from "./ButtonAccount";
import ButtonSupport from "./ButtonSupport";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { getTutorialFromPathname, Tutorial, TutorialI } from "./Tutorial";

export const AuthenticatedHeader = () => {
  const pathname = usePathname();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorial, setTutorial] = useState<TutorialI | null>(null);

  useEffect(() => {
    const tutorial = getTutorialFromPathname(pathname);
    setTutorial(tutorial);
  }, [pathname]);

  return (
    <header className="h-16 z-10 bg-base-100 flex items-center justify-between p-4 border-b border-base-content/20">
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
            Explore
          </Link>
          <Link
            href="/app"
            className={`btn btn-link px-0 gap-0 ${
              pathname === "/app"
                ? "text-primary underline"
                : "text-base-content no-underline"
            }`}
          >
            Classify
          </Link>
          <Link href="/tariffs">
            <button
              className={`btn btn-link px-0 gap-0 ${
                pathname === "/tariffs"
                  ? "text-primary underline"
                  : "text-base-content no-underline"
              }`}
            >
              Tariff Impact Checker
            </button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {tutorial && (
          <button
            className="btn btn-sm"
            onClick={() => setShowTutorial(true)}
            data-tooltip-id="tooltip"
          >
            <PlayIcon className="w-5 h-5" />
            Tutorial
          </button>
        )}
        <ButtonSupport />
        <ButtonAccount />
      </div>
      {tutorial && (
        <Tutorial
          tutorial={tutorial}
          showTutorial={showTutorial}
          setShowTutorial={setShowTutorial}
        />
      )}
      {/* <Modal isOpen={showTutorial} setIsOpen={setShowTutorial}>
        <div className="w-full h-full aspect-video">
          {pathname === "/explore" ? exploreTutorial : classifyTutorial}
        </div>
      </Modal> */}
    </header>
  );
};
