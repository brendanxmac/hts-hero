"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  type SetStateAction,
} from "react";
import { usePathname } from "next/navigation";
import { BreadcrumbsProvider, useBreadcrumbs } from "./BreadcrumbsContext";
import Modal from "../components/Modal";
import { Explore } from "../components/Explore";
import type { NavigatableElement } from "../components/Elements";
import type { ExplorerSurface } from "../libs/explorer-surface";

interface ExploreModalContextValue {
  openExplore: (
    explorerSurface?: ExplorerSurface,
    initialBreadcrumbs?: NavigatableElement[] | null
  ) => void;
  closeExplore: () => void;
}

const ExploreModalContext = createContext<ExploreModalContextValue | null>(
  null
);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * Registers the modal-scoped setBreadcrumbs so openExplore can apply an explicit
 * trail without wrapping the entire app in BreadcrumbsProvider.
 */
function ModalBreadcrumbSetter({
  register,
}: {
  register: MutableRefObject<
    Dispatch<SetStateAction<NavigatableElement[]>> | null
  >;
}): null {
  const { setBreadcrumbs } = useBreadcrumbs();
  useLayoutEffect(() => {
    register.current = setBreadcrumbs;
    return () => {
      register.current = null;
    };
  }, [setBreadcrumbs, register]);
  return null;
}


export function ExploreModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [explorerSurface, setExplorerSurface] =
    useState<ExplorerSurface>("keyboard_shortcut");
  const exploreSearchInputRef = useRef<HTMLInputElement | null>(null);
  const setModalBreadcrumbsRef = useRef<Dispatch<
    SetStateAction<NavigatableElement[]>
  > | null>(null);
  const pathname = usePathname();

  const openExplore = useCallback(
    (
      surface: ExplorerSurface = "keyboard_shortcut",
      crumbs?: NavigatableElement[] | null
    ) => {
      setExplorerSurface(surface);
      if (crumbs != null && crumbs.length > 0) {
        setModalBreadcrumbsRef.current?.(crumbs);
      }
      setIsOpen(true);
    },
    []
  );

  const closeExplore = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "s") return;
      if (pathname?.startsWith("/explore")) return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      if (isOpen) {
        exploreSearchInputRef.current?.focus();
        return;
      }
      openExplore("keyboard_shortcut");
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pathname, openExplore, isOpen]);

  return (
    <>
      <ExploreModalContext.Provider value={{ openExplore, closeExplore }}>
        {children}
      </ExploreModalContext.Provider>

      <BreadcrumbsProvider>
        <ModalBreadcrumbSetter register={setModalBreadcrumbsRef} />
        {isOpen && (
          <Modal isOpen={isOpen} setIsOpen={setIsOpen} size="viewport">
            <Explore
              explorerSurface={explorerSurface}
              onSearchInputMount={(el) => {
                exploreSearchInputRef.current = el;
              }}
            />
          </Modal>
        )}
      </BreadcrumbsProvider>
    </>
  );
}

export function useExploreModal(): ExploreModalContextValue {
  const ctx = useContext(ExploreModalContext);
  if (!ctx) {
    throw new Error("useExploreModal must be used within ExploreModalProvider");
  }
  return ctx;
}
