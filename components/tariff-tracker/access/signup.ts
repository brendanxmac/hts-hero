import config from "@/config";

// The sign-up page, coming back to `redirect` (a path on this site) once the account exists
export const signupHref = (redirect: string) =>
  `${config.auth.loginUrl}?sign-up=true&redirect=${encodeURIComponent(redirect)}`;

// The page as it is now, to come back to after signing up
export const currentPath = () =>
  typeof window === "undefined" ? "/tariff-tracker" : `${window.location.pathname}${window.location.search}`;
