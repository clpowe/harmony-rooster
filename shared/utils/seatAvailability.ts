/** Normalize capacity data before using it in controls, labels, or meter widths. */
export function getSeatAvailability(available: number, capacity: number) {
  const normalizedCapacity = Number.isFinite(capacity) ? Math.max(0, Math.floor(capacity)) : 0;
  const normalizedAvailable = Number.isFinite(available)
    ? Math.min(normalizedCapacity, Math.max(0, Math.floor(available)))
    : 0;
  const occupied = normalizedCapacity - normalizedAvailable;
  const percentOccupied = normalizedCapacity > 0 ? (occupied / normalizedCapacity) * 100 : 0;
  const isFull = normalizedAvailable === 0;
  const isLimited = normalizedAvailable > 0 && normalizedAvailable <= 3;

  return {
    available: normalizedAvailable,
    capacity: normalizedCapacity,
    occupied,
    percentOccupied,
    isFull,
    isLimited,
    state: isFull ? "full" : isLimited ? "limited" : "open",
    label: isFull
      ? "No seats left"
      : `${normalizedAvailable} ${normalizedAvailable === 1 ? "seat" : "seats"} left`,
    description:
      normalizedCapacity > 0
        ? `${normalizedAvailable} of ${normalizedCapacity} seats available; ${occupied} filled`
        : "No seats available",
  };
}
