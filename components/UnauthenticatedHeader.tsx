"use client";

import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import logo from "@/app/logo.svg";
import config from "@/config";
import { usePathname, useSearchParams } from "next/navigation";

const links: {
  href: string;
  label: string;
}[] = [
  {
    href: "/about/importer",
    label: "Need an HTS Code for your Product?",
  },
];

const cta: JSX.Element = <ButtonSignin extraStyle="btn-primary rounded-md" />;

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const UnauthenticatedHeader = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="h-16 z-10 bg-base-100 flex items-center justify-between p-4 border-b border-base-200">
      <nav
        className="w-full flex items-center justify-between"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
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
            {/* <span className="bg-white px-2 py-1 rounded-md text-black font-semibold text-xs">
              Beta
            </span> */}
          </Link>
          {/* <div className="flex items-center justify-start gap-4">
            <Link href="/explore">
              <button
                className={`btn btn-link px-0 gap-0 ${
                  pathname === "/explore"
                    ? "text-primary underline"
                    : "text-base-content no-underline"
                }`}
              >
                Explore
              </button>
            </Link>
            <Link href="/app">
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
          </div> */}
        </div>

        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
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

        {/* Your links on large screens */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="btn btn-secondary btn-sm font-semibold link link-hover"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA on large screens */}
        {/* <div className="hidden lg:flex lg:justify-end lg:flex-1">{cta}</div> */}
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
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
          <div className="flow-root mt-6">
            <div className="py-4">
              <div className="flex flex-col gap-y-4 items-start">
                {links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="font-semibold link link-hover"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="divider"></div>
            {/* Your CTA on small screens */}
            {/* <div className="flex flex-col">{cta}</div> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default UnauthenticatedHeader;
