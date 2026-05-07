"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import WebinarFormModal from "./WebinarFormModal";

const ADMIN_EMAIL = "brendan@htshero.com";

export default function WebinarAdminButton() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (user?.email !== ADMIN_EMAIL) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary btn-sm gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        New Webinar
      </button>

      <WebinarFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
