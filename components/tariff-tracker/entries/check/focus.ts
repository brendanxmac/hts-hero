// Each step of the entry audit opens with its input focused, ready to type or tick: the element
// marked data-autofocus (or the first control inside it). A step with none, or whose input is still
// loading, focuses its title instead, for screen readers.

const CONTROLS = 'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const focusStepInput = (root: HTMLElement | null) => {
  if (!root) return false;
  const marked = root.querySelector<HTMLElement>("[data-autofocus]");
  const target = marked && (marked.matches(CONTROLS) ? marked : marked.querySelector<HTMLElement>(CONTROLS));
  if (target) {
    target.focus({ preventScroll: true });
    return true;
  }
  return false;
};

export const focusStep = (root: HTMLElement | null) => {
  if (focusStepInput(root)) return;
  // An input that focused itself as it mounted keeps it
  if (root && root !== document.activeElement && root.contains(document.activeElement)) return;
  document.getElementById("tt-onboarding-title")?.focus({ preventScroll: true });
};
