import {
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfDay,
  differenceInDays,
} from "date-fns";

/**
 * Check if a date is exactly N days ago (as whole days)
 * @param dateString - ISO date string to check
 * @param daysAgo - Number of days ago to check for
 * @returns true if the date is exactly N days ago
 */
export const isExactlyDaysAgo = (
  dateString: string,
  daysAgo: number
): boolean => {
  const date = parseISO(dateString);
  const today = startOfDay(new Date());
  const dateToCheck = startOfDay(date);

  return differenceInDays(today, dateToCheck) === daysAgo;
};

/**
 * Get the start and end of a day that is N days ago
 * @param daysAgo - Number of days ago
 * @returns Object with start and end ISO strings for that day
 */
export const getDayRange = (
  daysAgo: number
): { start: string; end: string } => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - daysAgo);

  const start = startOfDay(targetDate);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

/**
 * Get the exact date string (YYYY-MM-DD) for N days ago
 * Use this for comparing against DATE fields in Supabase to avoid timezone issues
 * @param daysAgo - Number of days ago
 * @returns Date string in YYYY-MM-DD format
 */
export const getExactDateDaysAgo = (daysAgo: number): string => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - daysAgo);

  // Format as YYYY-MM-DD to match DATE field format
  return targetDate.toISOString().split("T")[0];
};

export const formatHumanReadableDate = (dateString: string): string => {
  const date = parseISO(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const time = `${displayHours}:${minutes} ${ampm}`;

  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 2) {
    return "Just Now";
  }

  if (isToday(date)) {
    return `Today, ${time}`;
  }

  if (isYesterday(date)) {
    return `Yesterday, ${time}`;
  }

  // Get the day of the month with the appropriate suffix
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  // Format the date as "Month Dayth"
  return format(date, `MMMM d'${suffix}'`);
};
