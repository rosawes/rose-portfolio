/**
 * The seven Abbott World Marathon Majors: public reference facts (not personal data).
 * Coordinates are approximate city centers, used only to place pins on the map.
 */
import { type MajorSlug } from "./types";

export interface MajorInfo {
  slug: MajorSlug;
  name: string;
  city: string;
  country: string;
  /** Typical month the race is held. */
  usualMonth: string;
  lat: number;
  lon: number;
}

export const MAJORS: MajorInfo[] = [
  { slug: "tokyo", name: "Tokyo Marathon", city: "Tokyo", country: "Japan", usualMonth: "March", lat: 35.68, lon: 139.69 },
  { slug: "boston", name: "Boston Marathon", city: "Boston", country: "USA", usualMonth: "April", lat: 42.36, lon: -71.06 },
  { slug: "london", name: "London Marathon", city: "London", country: "UK", usualMonth: "April", lat: 51.51, lon: -0.13 },
  { slug: "sydney", name: "Sydney Marathon", city: "Sydney", country: "Australia", usualMonth: "August/September", lat: -33.87, lon: 151.21 },
  { slug: "berlin", name: "Berlin Marathon", city: "Berlin", country: "Germany", usualMonth: "September", lat: 52.52, lon: 13.4 },
  { slug: "chicago", name: "Chicago Marathon", city: "Chicago", country: "USA", usualMonth: "October", lat: 41.88, lon: -87.63 },
  { slug: "nyc", name: "New York City Marathon", city: "New York", country: "USA", usualMonth: "November", lat: 40.71, lon: -74.01 },
];

export function majorBySlug(slug: MajorSlug): MajorInfo {
  return MAJORS.find((m) => m.slug === slug)!;
}
