"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import config from "@/config";
import ButtonSignin from "./ButtonSignin";
import ThemeToggle from "./ThemeToggle";
import { ToolsDropdown, MobileToolsMenu } from "./ToolsDropdown";

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const AboutHeader = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const links: {
    href: string;
    label: string;
  }[] = [
    {
      href: `#features`,
      label: "Features",
    },
    {
      href: `#pricing`,
      label: "Pricing",
    },
    {
      href: `#faq`,
      label: "FAQ",
    },
  ];

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <>
      <header className="bg-base-100 border-b border-base-content/10">
        <nav
          className="container flex items-center justify-between px-8 py-4 mx-auto"
          aria-label="Global"
        >
          {/* Your logo/name on large screens */}
          <div className="flex items-center gap-6 lg:flex-1">
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

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <ToolsDropdown />
              <Link
                href="/blog"
                className={`link link-hover font-bold ${
                  pathname.startsWith("/blog")
                    ? "text-primary"
                    : "text-base-content"
                }`}
              >
                Blog
              </Link>
            </div>
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
                className="link link-hover font-bold"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA on large screens */}
          <div className="hidden lg:flex lg:justify-end lg:flex-1 lg:gap-2 lg:items-center">
            <ButtonSignin />
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Mobile menu - Rendered outside header */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
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
              {links.map((link) => (
                <Link
                  href={link.href}
                  key={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-semibold text-base-content hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="divider" />

            {/* CTA on small screens */}
            <div className="flex gap-2 items-center">
              <ButtonSignin />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AboutHeader;
