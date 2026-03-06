import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/logo.svg";
import ThemeToggle from "./ThemeToggle";

export const LeadMagnetHeader = () => {
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
