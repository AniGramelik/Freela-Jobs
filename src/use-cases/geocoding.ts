import { logger } from "@/lib/logger";

/**
 * Geocodificação abstraída (ADR-0006). O provedor real é D4; até lá o stub
 * resolve o piloto (Colatina/ES).
 */

export type GeocodeResult = { latitude: number; longitude: number } | null;

export interface Geocoder {
  geocode(query: string): Promise<GeocodeResult>;
}

export class StubGeocoder implements Geocoder {
  async geocode(query: string): Promise<GeocodeResult> {
    if (/colat[ií]na/i.test(query)) {
      return { latitude: -19.5386, longitude: -40.6306 };
    }
    logger().warn({ query }, "stub_geocoder_miss");
    return null;
  }
}

export const defaultGeocoder: Geocoder = new StubGeocoder();
