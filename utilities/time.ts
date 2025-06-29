import { isAfter, subDays } from "date-fns";

export const getIsoDateInFuture = (days: number) => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
};

export const getTimeInFuture = (days: number) => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).getTime();
};

export const isWithinPastNDays = (date: Date, days: number): boolean => {
  const daysInPast = subDays(new Date(), days);
  return isAfter(date, daysInPast);
};
