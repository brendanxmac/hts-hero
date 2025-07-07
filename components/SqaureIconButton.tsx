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
          top: rect.top - rect.height - window.scrollY - 25, // 6px below the button
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
        className="bg-primary text-xs text-white px-2 py-1 rounded-md shadow-lg border border-base-300"
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
        `btn btn-xs btn-square shrink-0 text-white hover:text-white hover:shadow-md border-none hover:cursor-pointer`,
        iconOnly
          ? "bg-none hover:bg-none"
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
