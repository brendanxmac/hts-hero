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
    if (user) {
      return text || "🚀 Launch App";
    }

    return "Sign In";
  };

  const getRedirectUrl = () => {
    if (pathname === "/about/tariffs") {
      return "/tariffs/impact-checker";
    }

    if (pathname === "/about") {
      return "/app";
    }

    if (user) {
      return config.auth.callbackUrl;
    }

    return config.auth.loginUrl;
  };

  return (
    <Link
      href={getRedirectUrl()}
      className={`btn btn-primary btn-sm ${extraStyle ? extraStyle : ""}`}
    >
      {/* <div className="flex gap-2 items-center"> */}
      {/* {pathname !== "/app" && <p className="text-lg">⚡️</p>} */}
      <p>{getButtonText()}</p>
      {/* </div> */}
      {/* {user?.user_metadata?.avatar_url ? (
          <img
            src={user?.user_metadata?.avatar_url}
            alt={user?.user_metadata?.name || "Account"}
            className="w-6 h-6 rounded-full shrink-0"
            referrerPolicy="no-referrer"
            width={24}
            height={24}
          />
        ) : (
          <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
            {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)}
          </span>
        )}
        {user?.user_metadata?.name || user?.email || "Account"} */}
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
