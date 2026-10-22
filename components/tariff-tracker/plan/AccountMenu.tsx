"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "@headlessui/react";
import { ArrowRightOnRectangleIcon, CreditCardIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import * as ui from "@/components/ui/styles";
import { useUser } from "@/contexts/UserContext";
import { useTrackerAccess } from "../access/accessContext";
import { currentPath } from "../access/signup";

import { openBillingPortal } from "./billing";

// Who's signed in, with billing (a plan now or before: invoices, card, resubscribing) and signing
// out; a sign-in link for everyone else

const itemClass = (active: boolean) =>
  `flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-base-content ${active ? "bg-base-200" : ""}`;

export const AccountMenu = () => {
  const { signOut } = useUser();
  const { signedIn, email, access } = useTrackerAccess();
  const router = useRouter();

  if (!signedIn) {
    return (
      // The page to come back to is read when clicked: it's the browser's address, which the server
      // doesn't know, so it can't be in the server-rendered link
      <Link
        href={`${config.auth.loginUrl}?redirect=${encodeURIComponent("/tariff-tracker")}`}
        onClick={(e) => {
          e.preventDefault();
          router.push(`${config.auth.loginUrl}?redirect=${encodeURIComponent(currentPath())}`);
        }}
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
      <Menu.Items className={`${ui.popover} absolute bottom-full left-0 z-30 mb-2 w-56 focus:outline-hidden`}>
        {(access.kind === "paid" || access.pastPlan) && (
          <Menu.Item>
            {({ active }) => (
              <button type="button" className={itemClass(active)} onClick={() => openBillingPortal()}>
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
