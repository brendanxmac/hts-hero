"use client";

// "Legal text" / "Hide legal text"
export const LegalToggle = ({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    className="self-start text-sm font-medium text-base-content/60 hover:text-base-content underline-offset-2 hover:underline"
    onClick={(e) => {
      e.preventDefault();
      onToggle();
    }}
    aria-expanded={open}
  >
    {open ? "Hide legal text" : "Legal text"}
  </button>
);
