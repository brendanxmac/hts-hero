"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import config from "@/config";
import ButtonSignin from "./ButtonSignin";
import ThemeToggle from "./ThemeToggle";

const links = [
  {
    href: "/tariff-finder",
    text: "Tariff Finder",
  },
  {
    href: "#pending-tariffs",
    text: "Pending Tariffs",
  },
  {
    href: "#pricing",
    text: "Pricing",
  },
  {
    href: "#faq",
    text: "FAQ",
  },
];

const TariffAboutHeader = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="bg-base-100 border-b border-base-content/10">
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto"
        aria-label="Global"
      >
        {/* Logo on the left */}
        <div className="flex lg:flex-1">
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
        </div>

        {/* Hamburger menu button for mobile */}
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

        {/* Navigation links on large screens */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link link-hover font-bold hover:text-primary"
            >
              {link.text}
            </Link>
          ))}
        </div>

        {/* CTA on large screens */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1 lg:gap-2 lg:items-center">
          <ButtonSignin text="Check your Imports" />
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
        >
          {/* Logo and close button */}
          <div className="flex items-center justify-between">
            <Link className="flex items-center gap-2 shrink-0 " href="/explore">
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

          {/* Navigation links on mobile */}
          <div className="flow-root mt-6">
            <div className="py-4">
              <div className="flex flex-col gap-y-4 items-start">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="link link-hover font-bold hover:text-primary"
                  >
                    {link.text}
                  </Link>
                ))}
              </div>
            </div>
            <div className="divider"></div>
            {/* CTA on mobile */}
            <div className="flex gap-2 items-center">
              <ButtonSignin text="Check your Imports" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TariffAboutHeader;
