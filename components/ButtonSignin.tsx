/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import config from "@/config";
import { usePathname } from "next/navigation";

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
const ButtonSignin = ({ extraStyle }: { extraStyle?: string }) => {
  const getButtonText = (pathname: string) => {
    if (pathname === "/app") {
      return "Sign In";
    }

    return "Get HTS Hero";
  };

  const getRedirectUrl = (pathname: string) => {
    if (pathname === "/app") {
      return config.auth.loginUrl;
    }

    return config.auth.callbackUrl;
  };
  const pathname = usePathname();

  return (
    <Link
      href={getRedirectUrl(pathname)}
      className={`btn btn-primary btn-sm ${extraStyle ? extraStyle : ""}`}
    >
      <div className="flex gap-2 items-center">
        {pathname !== "/app" && <p className="text-lg">⚡️</p>}
        <p>{getButtonText(pathname)}</p>
      </div>
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
