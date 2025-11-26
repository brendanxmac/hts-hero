"use client";

import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import logo from "@/app/logo.svg";
import config from "@/config";
import { usePathname, useSearchParams } from "next/navigation";
import { PlayIcon } from "@heroicons/react/24/solid";
import { getTutorialFromPathname, Tutorial, TutorialI } from "./Tutorial";

const cta: JSX.Element = <ButtonSignin text="Sign In" />;

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const UnauthenticatedHeader = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorial, setTutorial] = useState<TutorialI | null>(null);

  useEffect(() => {
    const tutorial = getTutorialFromPathname(pathname);
    setTutorial(tutorial);
  }, [pathname]);

  const links: {
    href: string;
    label: string;
  }[] = [
    {
      href: "/explore",
      label: "Tariff Finder",
    },
    {
      href: "/app",
      label: "Classification Assistant",
    },
    {
      href: "/tariffs/impact-checker",
      label: "Tariff Impact Checker",
    },
    {
      href: "/about/tariffs",
      label:
        pathname === "/explore"
          ? "Learn More"
          : "Want to Find the Best Tariff Rates?",
    },
    {
      href: "/about",
      label: pathname === "/app" ? "Learn More" : "Want to Classify Quicker?",
    },
  ];

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="w-full h-16 z-10 bg-base-100 flex items-center justify-between p-4 border-b border-base-content/20">
      <nav
        className="w-full flex items-center justify-between"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex gap-6 lg:flex-1">
          <Link className="flex items-center gap-2 shrink-0 " href="/">
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
            <Link href="/about/tariffs">
              <button
                className={`btn btn-link px-0 gap-0 ${
                  pathname === "/explore"
                    ? "text-primary underline"
                    : "text-base-content no-underline"
                }`}
              >
                Tariff Finder
              </button>
            </Link>
            <Link href="/about">
              <button
                className={`btn btn-link px-0 gap-0 ${
                  pathname === "/app"
                    ? "text-primary underline"
                    : "text-base-content no-underline"
                }`}
              >
                Classify
              </button>
            </Link>
            <Link href="/about/tariff-impact-checker">
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
                className="btn btn-sm"
                onClick={() => setShowTutorial(true)}
                data-tooltip-id="tooltip"
              >
                <PlayIcon className="w-5 h-5" />
                Tutorial
              </button>
            )}
            <Link
              className="btn btn-sm btn-primary font-semibold link link-hover"
              href="/about"
            >
              {pathname === "/explore"
                ? "Want Effortless Tariffs?"
                : "Want Quicker Classifications?"}
            </Link>
          </div>

          {/* CTA on large screens */}
          <div className="hidden md:flex md:justify-end md:flex-1">{cta}</div>
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
              <Link className="flex items-center gap-2 shrink-0 " href="/">
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
            <div className="mt-6">
              <div className="py-4">
                <div className="flex flex-col gap-y-4 items-start">
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
                  {links.map((link) => (
                    <Link
                      href={link.href}
                      key={link.href}
                      className={`font-semibold link link-hover ${
                        pathname === link.href
                          ? "text-primary underline"
                          : "text-base-content no-underline"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="divider"></div>
              {/* Your CTA on small screens */}
              <div className="flex flex-col">{cta}</div>
            </div>
          </div>
        </div>
      )}
      {tutorial && (
        <Tutorial
          showTutorial={showTutorial}
          setShowTutorial={setShowTutorial}
          tutorial={tutorial}
        />
      )}
    </header>
  );
};

export default UnauthenticatedHeader;
