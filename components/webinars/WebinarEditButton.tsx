"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Webinar } from "@/libs/supabase/webinars";
import WebinarFormModal from "./WebinarFormModal";

const ADMIN_EMAIL = "brendan@htshero.com";

export default function WebinarEditButton({ webinar }: { webinar: Webinar }) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (user?.email !== ADMIN_EMAIL) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost btn-sm gap-1.5 text-base-content/60 hover:text-base-content"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
        </svg>
        Edit
      </button>

      {isOpen && (
        <WebinarFormModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          webinar={webinar}
        />
      )}
    </>
  );
}
