"use client";

import Link from "next/link";
import { Menu } from "@headlessui/react";
import { ArrowRightOnRectangleIcon, CreditCardIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import config from "@/config";
import * as ui from "@/components/ui/styles";
import { useUser } from "@/contexts/UserContext";
import { useTrackerAccess } from "../access/accessContext";
import { currentPath } from "../access/signup";

// Who's signed in, with billing and signing out; a sign-in link for everyone else
const openBilling = async () => {
  const res = await fetch("/api/stripe/create-portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnUrl: window.location.href }),
  });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (body.url) window.location.href = body.url;
  else toast.error(body.error ?? "Billing isn't available right now.");
};

const itemClass = (active: boolean) =>
  `flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-base-content ${active ? "bg-base-200" : ""}`;

export const AccountMenu = () => {
  const { signOut } = useUser();
  const { signedIn, email, access } = useTrackerAccess();

  if (!signedIn) {
    return (
      <Link
        href={`${config.auth.loginUrl}?redirect=${encodeURIComponent(currentPath())}`}
        className={`${ui.button({ variant: "ghost", size: "sm" })} w-full justify-start`}
      >
        <UserCircleIcon className="h-4 w-4" aria-hidden />
        Sign in
      </Link>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className={`${ui.button({ variant: "ghost", size: "sm" })} w-full justify-start`}>
        <UserCircleIcon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{email}</span>
      </Menu.Button>
      <Menu.Items className={`${ui.popover} absolute bottom-full left-0 z-30 mb-2 w-56 focus:outline-none`}>
        {access.kind === "paid" && (
          <Menu.Item>
            {({ active }) => (
              <button type="button" className={itemClass(active)} onClick={openBilling}>
                <CreditCardIcon className="h-4 w-4" aria-hidden />
                Billing
              </button>
            )}
          </Menu.Item>
        )}
        <Menu.Item>
          {({ active }) => (
            <button
              type="button"
              className={itemClass(active)}
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};
