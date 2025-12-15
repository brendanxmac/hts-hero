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
  { href: "#tools", label: "Why HTS Hero?" },
  { href: "#use-cases", label: "Use Cases" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const toolLinks = [
  {
    href: "/classifications",
    emoji: "🎯",
    title: "Classification Assistant",
    subtitle: "AI-powered classification assistance",
    hoverBg: "hover:bg-secondary/10",
    iconBg: "bg-secondary/20",
    hoverText: "group-hover:text-secondary",
  },
  {
    href: "/duty-calculator",
    emoji: "💰",
    title: "Duty & Tariff Calculator",
    subtitle: "Duties & tariffs for any import",
    hoverBg: "hover:bg-primary/10",
    iconBg: "bg-primary/20",
    hoverText: "group-hover:text-primary",
  },
  {
    href: "/tariffs/impact-checker",
    emoji: "✓",
    title: "Tariff Impact Checker",
    subtitle: "Check if new tariffs affect your imports",
    hoverBg: "hover:bg-accent/10",
    iconBg: "bg-accent/20",
    hoverText: "group-hover:text-accent",
  },
  {
    href: "/explore",
    emoji: "🔍",
    title: "HTS Explorer",
    subtitle: "Quickly find any HTS element",
    hoverBg: "hover:bg-neutral/10",
    iconBg: "bg-neutral/20",
    hoverText: "group-hover:text-neutral",
  },
];

const LandingHeader = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  // Add scroll listener for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close tools dropdown on scroll (but not mobile menu)
  useEffect(() => {
    const handleClose = () => {
      setIsToolsDropdownOpen(false);
    };
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
    <>
      <header
        className={`sticky top-0 w-full h-16 z-50 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
          scrolled
            ? "bg-base-100/95 backdrop-blur-md border-b border-base-content/10 shadow-sm"
            : "bg-base-100/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
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
              {/* Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
                >
                  Tools
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isToolsDropdownOpen ? "" : "-rotate-180"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Tools Dropdown Menu */}
                {isToolsDropdownOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsToolsDropdownOpen(false)}
                    />
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 w-72 sm:w-80 bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Arrow */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-base-100 border-l border-t border-base-content/10 rotate-45" />

                      <div className="relative p-2">
                        {/* <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider px-3 py-2">
                          Choose a tool
                        </p> */}

                        {toolLinks.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            onClick={() => setIsToolsDropdownOpen(false)}
                            className={`flex items-center gap-3 p-3 rounded-xl ${tool.hoverBg} transition-colors group`}
                          >
                            <div
                              className={`w-10 h-10 rounded-lg ${tool.iconBg} flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}
                            >
                              {tool.emoji}
                            </div>
                            <div className="flex flex-col">
                              <div
                                className={`text-left font-semibold text-base-content ${tool.hoverText} transition-colors`}
                              >
                                {tool.title}
                              </div>
                              <div className="text-left text-xs text-base-content/60">
                                {tool.subtitle}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

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
      </header>

      {/* Mobile Menu - Rendered outside header to avoid sticky/fixed conflicts */}
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
            <div className="mb-6">
              <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider mb-3">
                Tools
              </p>
              <div className="flex flex-col gap-2">
                {toolLinks.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-base-200 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center text-lg flex-shrink-0">
                      {tool.emoji}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-left font-semibold text-sm text-base-content">
                        {tool.title}
                      </div>
                      <div className="text-left text-xs text-base-content/60">
                        {tool.subtitle}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
    </>
  );
};

export default LandingHeader;
