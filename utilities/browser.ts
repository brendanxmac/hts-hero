export const getTabId = (): string => {
  if (!window.name) {
    window.name = crypto.randomUUID(); // Generate a unique ID
  }
  return window.name;
};
