"use client";

import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import LetsTalkModal from "./LetsTalkModal";

interface BookDemoButtonProps {
  className?: string;
}

export const BookDemoButton = ({ className }: BookDemoButtonProps) => {
  const { user } = useUser();
  const [isBookDemoModalOpen, setIsBookDemoModalOpen] = useState(false);

  const handleBookDemoClick = () => {
    const userEmail = user?.email || "";
    const userName = user?.user_metadata?.full_name || "";

    try {
      trackEvent(MixpanelEvent.CLICKED_TARIFF_TEAM_LETS_TALK, {
        userEmail,
        userName,
        isLoggedIn: !!user,
      });
    } catch (e) {
      console.error("Error tracking book demo click:", e);
    }

    setIsBookDemoModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleBookDemoClick}
        className={
          className ??
          "inline-flex items-center gap-2 px-8 py-2 sm:py-3.5 rounded-xl font-semibold text-base text-primary border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
        }
      >
        Book Demo
      </button>
      <LetsTalkModal
        isOpen={isBookDemoModalOpen}
        onClose={() => setIsBookDemoModalOpen(false)}
      />
    </>
  );
};
