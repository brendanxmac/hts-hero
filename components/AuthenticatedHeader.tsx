"use client";

import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/logo.svg";
import ButtonAccount from "./ButtonAccount";
import ButtonSupport from "./ButtonSupport";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getTutorialFromPathname, Tutorial, TutorialI } from "./Tutorial";
import { PlayIcon } from "@heroicons/react/16/solid";

export const AuthenticatedHeader = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorial, setTutorial] = useState<TutorialI | null>(null);

  useEffect(() => {
    const tutorial = getTutorialFromPathname(pathname);
    setTutorial(tutorial);
  }, [pathname]);

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="w-full h-16 z-10 bg-base-300 flex items-center justify-between p-4 border-b border-base-content/20">
      <nav
        className="w-full flex items-center justify-between"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex gap-6 lg:flex-1">
          <Link className="flex items-center gap-2 shrink-0" href="/">
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

          <div className="hidden md:flex items-center justify-start gap-4">
            <Link
              href="/explore"
              className={`btn btn-link px-0 gap-0 ${
                pathname === "/explore"
                  ? "text-primary underline"
                  : "text-base-content no-underline"
              }`}
            >
              Tariff Finder
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
            <Link href="/tariffs/impact-checker">
              <button
                className={`btn btn-link px-0 gap-0 ${
                  pathname === "/tariffs/impact-checker"
                    ? "text-primary underline"
                    : "text-base-content no-underline"
                }`}
              >
                Tariff Impact Checker
              </button>
            </Link>
          </div>
        </div>

        {/* Burger button to open menu on mobile */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {/* Your links on large screens */}
          <div className="hidden md:flex md:justify-center md:gap-4 md:items-center">
            {tutorial && (
              <button
                className="btn btn-sm btn-neutral"
                onClick={() => setShowTutorial(true)}
                data-tooltip-id="tooltip"
              >
                <PlayIcon className="w-5 h-5" />
                Tutorial
              </button>
            )}
          </div>

          {/* CTA on large screens */}
          <div className="hidden md:flex md:justify-end md:flex-1 gap-4 items-center">
            <ButtonSupport />
            <ButtonAccount />
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      {isOpen && (
        <div className="relative z-50">
          <div
            className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 md:max-w-sm md:ring-1 md:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
          >
            {/* Your logo/name on small screens */}
            <div className="flex items-center justify-between">
              <Link className="flex items-center gap-2 shrink-0" href="/">
                <Image
                  src={logo}
                  alt={`${config.appName} logo`}
                  className="w-8"
                  priority={true}
                  width={32}
                  height={32}
                />
                <span className="font-extrabold text-lg">{config.appName}</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Your links on small screens */}
            <div className="flow-root mt-6">
              <div className="py-4">
                <div className="flex flex-col gap-y-4 items-start">
                  <Link
                    href="/explore"
                    className={`font-semibold link link-hover ${
                      pathname === "/explore"
                        ? "text-primary underline"
                        : "text-base-content no-underline"
                    }`}
                  >
                    Tariff Finder
                  </Link>
                  <Link
                    href="/app"
                    className={`font-semibold link link-hover ${
                      pathname === "/app"
                        ? "text-primary underline"
                        : "text-base-content no-underline"
                    }`}
                  >
                    Classify
                  </Link>
                  <Link
                    href="/tariffs/impact-checker"
                    className={`font-semibold link link-hover ${
                      pathname === "/tariffs/impact-checker"
                        ? "text-primary underline"
                        : "text-base-content no-underline"
                    }`}
                  >
                    Tariff Impact Checker
                  </Link>
                </div>
              </div>
              <div className="divider"></div>
              {/* Your CTA on small screens */}
              <div className="w-full flex gap-2 justify-between items-center">
                {tutorial && (
                  <button
                    className="grow btn btn-sm btn-neutral"
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
            </div>
          </div>
        </div>
      )}
      {tutorial && (
        <Tutorial
          tutorial={tutorial}
          showTutorial={showTutorial}
          setShowTutorial={setShowTutorial}
        />
      )}
    </header>
  );
};
