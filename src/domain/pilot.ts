/** Recorte do piloto (ticket 09). O gate é config de lançamento, não de schema. */

export const PILOT_CITY = "Colatina";
export const PILOT_STATE = "ES";

function normalizeCity(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function isWithinPilot(
  city: string,
  state: string,
  gateEnabled: boolean,
): boolean {
  if (!gateEnabled) return true;
  return (
    normalizeCity(city) === normalizeCity(PILOT_CITY) &&
    state.trim().toUpperCase() === PILOT_STATE
  );
}

export function pilotGateEnabled(): boolean {
  return (process.env.PILOT_GATE ?? "on") !== "off";
}
