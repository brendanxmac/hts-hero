"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import config from "@/config";
import { usePathname, useSearchParams } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import ButtonSignin from "./ButtonSignin";

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const UnauthenticatedTariffsHeader = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header
      className={`sticky top-0 w-full h-16 z-50 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
        scrolled
          ? "bg-base-100/95 backdrop-blur-md border-b border-base-content/10 shadow-sm"
          : "bg-base-100 border-b border-base-content/10"
      }`}
    >
      <nav
        className="w-full max-w-7xl mx-auto flex items-center justify-between"
        aria-label="Global"
      >
        {/* Logo and nav links */}
        <div className="flex items-center gap-8">
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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/duty-calculator"
              className={`text-sm font-medium transition-colors ${
                pathname === "/duty-calculator"
                  ? "text-primary"
                  : "text-base-content/70 hover:text-primary"
              }`}
            >
              Duty Calculator
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors ${
                pathname === "/about"
                  ? "text-primary"
                  : "text-base-content/70 hover:text-primary"
              }`}
            >
              Classification Assistant
            </Link>
            <Link
              href="/tariffs/impact-checker"
              className={`text-sm font-medium transition-colors ${
                pathname === "/tariffs/impact-checker"
                  ? "text-primary"
                  : "text-base-content/70 hover:text-primary"
              }`}
            >
              Tariff Impact Checker
            </Link>
            <Link
              href="/explore"
              className={`text-sm font-medium transition-colors ${
                pathname === "/explore"
                  ? "text-primary"
                  : "text-base-content/70 hover:text-primary"
              }`}
            >
              HTS Explorer
            </Link>
          </div>
        </div>

        {/* Mobile Burger Button */}
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

        {/* Desktop Right Side - CTA & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/about/tariffs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Check Your Tariff Impact
          </Link>
          <ButtonSignin text="Sign In" />
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
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

            {/* Navigation Links */}
            <div className="flex flex-col gap-4 mb-8">
              <Link
                href="/duty-calculator"
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold transition-colors ${
                  pathname === "/duty-calculator"
                    ? "text-primary"
                    : "text-base-content hover:text-primary"
                }`}
              >
                Duty Calculator
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold transition-colors ${
                  pathname === "/about"
                    ? "text-primary"
                    : "text-base-content hover:text-primary"
                }`}
              >
                Classification Assistant
              </Link>
              <Link
                href="/tariffs/impact-checker"
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold transition-colors ${
                  pathname === "/tariffs/impact-checker"
                    ? "text-primary"
                    : "text-base-content hover:text-primary"
                }`}
              >
                Tariff Impact Checker
              </Link>
              <Link
                href="/explore"
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold transition-colors ${
                  pathname === "/explore"
                    ? "text-primary"
                    : "text-base-content hover:text-primary"
                }`}
              >
                HTS Explorer
              </Link>
            </div>

            <div className="divider" />

            {/* CTA & Theme Toggle */}
            <div className="flex flex-col gap-4">
              <Link
                href="/about/tariffs"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all duration-200"
              >
                Check Your Tariff Impact
              </Link>
              <div className="flex items-center gap-3">
                <ButtonSignin text="Sign In" />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default UnauthenticatedTariffsHeader;
