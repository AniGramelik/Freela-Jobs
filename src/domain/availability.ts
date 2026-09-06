/** Regras puras de disponibilidade (ticket 13). */

export type AvailabilityShift = "MORNING" | "AFTERNOON" | "NIGHT";

export const AVAILABLE_NOW_TTL_MS = 8 * 60 * 60 * 1_000; // 8 h

export function availableNowExpiry(now: Date): Date {
  return new Date(now.getTime() + AVAILABLE_NOW_TTL_MS);
}

export function isAvailableNow(until: Date | null, now: Date): boolean {
  return until !== null && until.getTime() > now.getTime();
}

export function isValidWeekday(weekday: number): boolean {
  return Number.isInteger(weekday) && weekday >= 0 && weekday <= 6;
}

const SHIFTS: AvailabilityShift[] = ["MORNING", "AFTERNOON", "NIGHT"];

export function isValidShift(shift: string): shift is AvailabilityShift {
  return (SHIFTS as string[]).includes(shift);
}
