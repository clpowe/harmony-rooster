import { format } from "@formkit/tempo";

function getDaySuffix(dayNumber: number): string {
  if (dayNumber > 3 && dayNumber < 21) return "th";
  if (dayNumber % 10 === 1) return "st";
  if (dayNumber % 10 === 2) return "nd";
  if (dayNumber % 10 === 3) return "rd";
  return "th";
}

export function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return "";

  // Use noon UTC to keep calendar date stable when converting to ET.
  const isoAtNoonUTC = `${dateString}T12:00:00.000Z`;
  const dayNumber = Number(
    format({
      date: isoAtNoonUTC,
      format: "D",
      tz: "America/New_York",
      locale: "en-US",
    }),
  );
  const dayWithSuffix = `${dayNumber}${getDaySuffix(dayNumber)}`;

  return format({
    date: isoAtNoonUTC,
    format: `dddd MMM ${dayWithSuffix}`,
    tz: "America/New_York",
    locale: "en-US",
  });
}
