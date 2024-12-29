import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/logo.png";
import ButtonAccount from "./ButtonAccount";

export const AuthenticatedHeader = () => {
  return (
    <header className="shrink sticky top-0 h-16 z-10 bg-black flex items-center justify-between p-4">
      <Link
        className="flex items-center gap-2 shrink-0 "
        href="/"
        title={`${config.appName} homepage`}
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
      <ButtonAccount />
    </header>
  );
};
