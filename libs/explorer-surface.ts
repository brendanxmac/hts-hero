export type ExplorerSurface =
  | "explore_page"
  | "duty_calculator_modal"
  | "classification_modal"
  | "keyboard_shortcut";

export function resolveExplorerSurface(
  explicit: ExplorerSurface | undefined,
  pathname: string | null | undefined
): ExplorerSurface {
  if (explicit) return explicit;
  if (pathname?.startsWith("/explore")) return "explore_page";
  if (pathname?.startsWith("/duty-calculator")) return "duty_calculator_modal";
  if (pathname?.startsWith("/classifications")) return "classification_modal";
  return "explore_page";
}
