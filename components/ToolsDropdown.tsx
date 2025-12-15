"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export const toolLinks = [
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

interface ToolsDropdownProps {
  className?: string;
}

export const ToolsDropdown = ({ className = "" }: ToolsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => setIsOpen(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm font-medium text-base-content/70 hover:text-primary transition-colors"
      >
        Tools
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "" : "-rotate-180"}`}
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

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown Menu */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 w-72 sm:w-80 bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-base-100 border-l border-t border-base-content/10 rotate-45" />

            <div className="relative p-2">
              {toolLinks.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setIsOpen(false)}
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
  );
};

interface MobileToolsMenuProps {
  onLinkClick?: () => void;
}

export const MobileToolsMenu = ({ onLinkClick }: MobileToolsMenuProps) => {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider mb-3">
        Tools
      </p>
      <div className="flex flex-col gap-2">
        {toolLinks.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            onClick={onLinkClick}
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
  );
};

export default ToolsDropdown;

