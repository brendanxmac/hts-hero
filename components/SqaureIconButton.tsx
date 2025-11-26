import { classNames } from "../utilities/style";
import { useRef, useState, useLayoutEffect } from "react";
import ReactDOM from "react-dom";

interface Props {
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  tooltip?: string;
  color?: "primary" | "secondary" | "accent" | "error";
  transparent?: boolean;
  iconOnly?: boolean;
}

export default function SquareIconButton({
  icon,
  disabled,
  onClick,
  color = "primary",
  transparent = false,
  tooltip,
  iconOnly = false,
}: Props) {
  // TooltipPortal implementation
  function TooltipPortal({
    children,
    anchorRef,
  }: {
    children: React.ReactNode;
    anchorRef: React.RefObject<HTMLElement>;
  }) {
    const [coords, setCoords] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);

    useLayoutEffect(() => {
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top - rect.height - window.scrollY + 5,
          left: rect.left + window.scrollX + rect.width / 2,
          width: rect.width,
        });
      }
    }, [anchorRef.current]);

    if (!coords) return null;
    return ReactDOM.createPortal(
      <div
        style={{
          position: "absolute",
          top: coords.top,
          left: coords.left,
          transform: "translateX(-50%)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
        className="text-xs px-2 py-1 bg-base-100 rounded-md shadow-xl border-2 border-base-content"
      >
        {children}
      </div>,
      document.body
    );
  }

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const button = (
    <button
      ref={buttonRef}
      disabled={disabled}
      className={classNames(
        `btn btn-sm btn-square shrink-0 border-none hover:cursor-pointer`,
        iconOnly
          ? "bg-transparent hover:bg-transparent shadow-none"
          : transparent
            ? `bg-none hover:bg-${color}/80`
            : `bg-${color} hover:btn-secondary`
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      {icon}
    </button>
  );

  if (tooltip) {
    return (
      <div>
        {button}
        {showTooltip && (
          <TooltipPortal anchorRef={buttonRef}>{tooltip}</TooltipPortal>
        )}
      </div>
    );
  }

  return button;
}
