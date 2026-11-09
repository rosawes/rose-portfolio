import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";
import { MAJORS } from "../../domain/majors";
import { type MajorSlug } from "../../domain/types";

export const MAP_W = 960;
export const MAP_H = 470;

/**
 * Projects the world and the seven Majors on the SERVER, so the browser receives a
 * ready-made SVG path instead of downloading map data and doing the math itself.
 */
export function buildWorldMap() {
  const topology = land110 as unknown as Topology<{ land: GeometryCollection }>;
  const landGeo = feature(topology, topology.objects.land);
  const projection = geoNaturalEarth1().fitExtent(
    [
      [8, 8],
      [MAP_W - 8, MAP_H + 70], // let Antarctica run off the bottom edge
    ],
    { type: "Sphere" },
  );
  const landPath = geoPath(projection)(landGeo) ?? "";
  const pins = Object.fromEntries(
    MAJORS.map((m) => {
      const [x, y] = projection([m.lon, m.lat]) ?? [0, 0];
      return [m.slug, { x: (x / MAP_W) * 100, y: (y / MAP_H) * 100 }];
    }),
  ) as Record<MajorSlug, { x: number; y: number }>;
  return { landPath, pins };
}

export function WorldMapBackground({ landPath }: { landPath: string }) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" aria-hidden className="block">
      <path d={landPath} fill="#fce7f3" stroke="#f9a8d4" strokeWidth={0.6} strokeLinejoin="round" />
    </svg>
  );
}
