"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/logo.svg";
import config from "@/config";
import { useUser } from "../contexts/UserContext";
import ButtonAccount from "./ButtonAccount";
import ButtonSignin from "./ButtonSignin";
import ThemeToggle from "./ThemeToggle";

// Navigation links for the landing page sections
const navLinks = [
  { href: "#tools", label: "Tools" },
  { href: "#use-cases", label: "Use Cases" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const LandingHeader = () => {
  const { user } = useUser();
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

  // Close mobile menu on route change or scroll
  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener("scroll", handleClose);
    return () => window.removeEventListener("scroll", handleClose);
  }, []);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 w-full h-16 z-50 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
        scrolled
          ? "bg-base-100/95 backdrop-blur-md border-b border-base-content/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav
        className="w-full max-w-7xl mx-auto flex items-center justify-between"
        aria-label="Global"
      >
        {/* Logo */}
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
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
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

        {/* Desktop Right Side - Auth & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {user ? <ButtonAccount /> : <ButtonSignin text="Sign In" />}
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
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-base font-semibold text-base-content hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="divider" />

            {/* Auth & Theme Toggle */}
            <div className="flex items-center gap-3">
              {user ? <ButtonAccount /> : <ButtonSignin text="Sign In" />}
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
