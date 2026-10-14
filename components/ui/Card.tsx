"use client";

import { createContext, ReactNode, useContext } from "react";
import * as ui from "@/components/ui/styles";

// One card made of sections (DESIGN_SYSTEM "Cards and sections"). A card never sits inside
// another card: a panel that is a card on its own (ui.card) becomes one of the card's sections
// when it's placed inside CardSections, with a 1px rule between each section and the next.
//
//   <section className={ui.cardOverflowVisible}>
//     <header>…</header>
//     <CardSections>
//       <DutyBreakdown />      ← a card elsewhere, a section here
//       <div className={ui.cardSection}><Notice /></div>
//     </CardSections>
//   </section>
//
// A panel that can be either takes its class from useCardClass() instead of ui.card.

const InCard = createContext(false);

// Whether this is inside a card's sections (so it must not draw a card of its own)
export const useInCard = () => useContext(InCard);

// ui.card on its own; nothing inside a card's sections
export const useCardClass = (overflowVisible = false) => {
  const inCard = useContext(InCard);
  return inCard ? "" : overflowVisible ? ui.cardOverflowVisible : ui.card;
};

// A card's body: each child is a section, divided from the one above it by a rule (an empty
// child takes no room and draws no rule)
export const CardSections = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <InCard.Provider value={true}>
    <div className={`flex flex-col divide-y divide-base-300 [&>:empty]:hidden ${className}`}>{children}</div>
  </InCard.Provider>
);

// Sections side by side inside a card (a table and its sidebar): stacked with a rule between them
// on small screens, a full-height vertical rule between them from lg. Each column stretches to the
// row's height, so something that should stay in view (a sidebar) is sticky inside its column.
export const CardRow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`grid grid-cols-1 divide-y divide-base-300 lg:divide-x lg:divide-y-0 ${className}`}>{children}</div>
);
