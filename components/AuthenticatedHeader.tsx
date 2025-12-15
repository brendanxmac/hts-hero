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
import ThemeToggle from "./ThemeToggle";
import { ToolsDropdown, MobileToolsMenu } from "./ToolsDropdown";

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
    <>
      <header className="w-full h-16 z-10 bg-base-100 flex items-center justify-between p-4 border-b border-base-content/20">
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
              <ToolsDropdown />
              {/* <Link
                href="/blog"
                className={`btn btn-link px-0 gap-0 ${
                  pathname.startsWith("/blog")
                    ? "text-primary underline"
                    : "text-base-content no-underline"
                }`}
              >
                Blog
              </Link> */}
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
            <div className="hidden md:flex md:justify-end md:flex-1 gap-2 items-center">
              <ButtonSupport />
              <ButtonAccount />
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu - Rendered outside header */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-base-content/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs px-6 py-4 overflow-y-auto bg-base-100 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Link
                className="flex items-center gap-2 shrink-0"
                href="/"
                onClick={() => setIsOpen(false)}
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

            {/* Tools Section */}
            <MobileToolsMenu onLinkClick={() => setIsOpen(false)} />

            {/* Navigation Links */}
            <div className="flex flex-col gap-4 mb-8">
              <Link
                href="/blog"
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold transition-colors ${
                  pathname.startsWith("/blog")
                    ? "text-primary"
                    : "text-base-content hover:text-primary"
                }`}
              >
                Blog
              </Link>
            </div>

            <div className="divider" />

            {/* CTA & Buttons */}
            <div className="flex flex-col gap-4">
              {tutorial && (
                <button
                  className="btn btn-sm btn-neutral"
                  onClick={() => {
                    setShowTutorial(true);
                    setIsOpen(false);
                  }}
                  data-tooltip-id="tooltip"
                >
                  <PlayIcon className="w-5 h-5" />
                  Tutorial
                </button>
              )}
              <div className="flex items-center gap-2">
                <ButtonSupport />
                <ButtonAccount />
                <ThemeToggle />
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
    </>
  );
};
