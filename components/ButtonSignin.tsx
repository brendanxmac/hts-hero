/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import config from "@/config";
import { useUser } from "../contexts/UserContext";
import { usePathname } from "next/navigation";

interface Props {
  text?: string;
  extraStyle?: string;
}

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
const ButtonSignin = ({ text, extraStyle }: Props) => {
  const pathname = usePathname();
  const { user } = useUser();

  const getButtonText = () => {
    return text || "Launch App ->";
  };

  const getRedirectUrl = () => {
    if (pathname === "/about/tariff-impact-checker") {
      return "/tariffs/impact-checker";
    }

    if (pathname === "/about/tariffs") {
      return "/tariff-calculator";
    }

    if (pathname === "/about") {
      return "/classifications";
    }

    if (user) {
      return config.auth.callbackUrl;
    }

    return config.auth.loginUrl;
  };

  return (
    <Link
      href={getRedirectUrl()}
      className={`btn btn-sm btn-primary ${extraStyle ? extraStyle : ""}`}
    >
      <p>{getButtonText()}</p>
    </Link>
  );

  // return (
  //   <Link
  //     className={`btn btn-primary btn-sm ${extraStyle ? extraStyle : ""}`}
  //     href={config.auth.loginUrl}
  //   >
  //     {text}
  //   </Link>
  // );
};

export default ButtonSignin;
