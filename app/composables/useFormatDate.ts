import { format } from "@formkit/tempo";

function getDaySuffix(dayNumber: number): string {
  if (dayNumber > 3 && dayNumber < 21) return "th";
  if (dayNumber % 10 === 1) return "st";
  if (dayNumber % 10 === 2) return "nd";
  if (dayNumber % 10 === 3) return "rd";
  return "th";
}

function extractCalendarDate(dateString: string): string | null {
  const normalized = dateString.trim();
  const match = normalized.match(/^(\d{4}-\d{2}-\d{2})/);

  return match?.[1] ?? null;
}

export function formatDate(dateString: string) {
  const calendarDate = extractCalendarDate(dateString);
  if (!calendarDate) return "";

  const [year, month, day] = calendarDate.split("-").map(Number);
  if (!year || !month || !day) return "";

  // Use noon UTC to keep calendar date stable when converting to ET.
  const isoAtNoonUTC = `${calendarDate}T12:00:00.000Z`;
  const dayNumber = Number(
    format({
      date: isoAtNoonUTC,
      format: "D",
      tz: "America/New_York",
      locale: "en-US",
    }),
  );
  const dayWithSuffix = `${dayNumber}${getDaySuffix(dayNumber)}`;
  const weekdayAndMonth = format({
    date: isoAtNoonUTC,
    format: "dddd MMM",
    tz: "America/New_York",
    locale: "en-US",
  });

  return `${weekdayAndMonth} ${dayWithSuffix}`;
}

export function useFormatDate() {
  return {
    formatDate,
  };
}
