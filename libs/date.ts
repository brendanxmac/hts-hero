import { format, isToday, isYesterday, parseISO } from "date-fns";

export const formatHumanReadableDate = (dateString: string): string => {
  const date = parseISO(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const time = `${hours}:${minutes}`;

  if (isToday(date)) {
    return `Today at ${time}`;
  }

  if (isYesterday(date)) {
    return `Yesterday at ${time}`;
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
