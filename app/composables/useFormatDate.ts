export function formatDate(dateString: string) {
  // Use noon UTC so the calendar date is stable in ET regardless of DST
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return "";
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12));
  const tz = "America/New_York";

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: tz,
  }).format(utcNoon);
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: tz,
  }).format(utcNoon);
  const dayNumber = Number(
    new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: tz }).format(
      utcNoon,
    ),
  );

  const suffix = dayNumber > 3 && dayNumber < 21
    ? "th"
    : dayNumber % 10 === 1
      ? "st"
      : dayNumber % 10 === 2
        ? "nd"
        : dayNumber % 10 === 3
          ? "rd"
          : "th";
  return `${dayName} ${monthName} ${dayNumber}${suffix}`;
}
