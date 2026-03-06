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

export const LeadMagnetHeader = () => {
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
      <header className="w-full h-16 z-50 bg-base-100 p-3 border-b border-base-content/20 flex items-center">
        <nav
          className="w-full h-full grid grid-cols-[1fr_auto_1fr] items-center gap-4"
          aria-label="Global"
        >
          <div className="hidden md:flex gap-6 justify-self-start">
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
          </div>

          <h2 className="text-center text-sm xs:text-lg md:text-xl font-bold justify-self-center col-start-2">The <span className="text-primary">Audit-Ready Classifications</span> Playbook</h2>

          <div className="hidden md:flex gap-2 items-center justify-self-end">
            <ThemeToggle />
          </div>
        </nav>
      </header>
    </>
  );
};
