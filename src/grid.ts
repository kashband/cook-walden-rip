/**
 * Parametric plot-grid generation.
 *
 * Uses a flat-earth approximation for meter offsets, which is accurate to
 * well under a centimeter at the ~200 m scale of the section — no need for
 * full geodesic math.
 */

export interface GridParams {
  /** Anchor corner of cell A-1 (the grid grows along-bearing and across-bearing from here). */
  origin: { lat: number; lng: number };
  /** Direction along a row in degrees clockwise from north; space numbers increase this way. */
  bearingDeg: number;
  rows: number;
  cols: number;
  /** Plot width in meters, measured along the row. */
  plotWidthM: number;
  /** Plot length in meters, measured across the row (head to foot). */
  plotLengthM: number;
  /** Gap between adjacent plots within a row. */
  colGapM: number;
  /** Gap between rows (walkways). */
  rowGapM: number;
}

export interface Cell {
  id: string;
  row: string;
  space: number;
  /** Closed ring of [lat, lng] corners (first corner not repeated; Leaflet closes it). */
  corners: [number, number][];
}

export const DEFAULT_GRID_PARAMS: GridParams = {
  // NW area of the marker block inside the section boundary.
  origin: { lat: 30.43752, lng: -97.66235 },
  // Rows likely run perpendicular to the Qibla facing (~45° NE from Austin).
  bearingDeg: 135,
  rows: 8,
  cols: 15,
  plotWidthM: 1.2,
  plotLengthM: 3.0,
  colGapM: 0,
  rowGapM: 0.6,
};

const M_PER_DEG_LAT = 111_320;

function offsetMeters(
  origin: { lat: number; lng: number },
  eastM: number,
  northM: number,
): [number, number] {
  const lat = origin.lat + northM / M_PER_DEG_LAT;
  const lng = origin.lng + eastM / (M_PER_DEG_LAT * Math.cos((origin.lat * Math.PI) / 180));
  return [lat, lng];
}

/** A..Z, then AA, AB, … for row 26+. */
export function rowLetter(index: number): string {
  let label = "";
  let i = index;
  do {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  } while (i >= 0);
  return label;
}

export function generateGrid(params: GridParams): Cell[] {
  const { origin, bearingDeg, rows, cols, plotWidthM, plotLengthM, colGapM, rowGapM } = params;
  const theta = (bearingDeg * Math.PI) / 180;
  // Unit vectors in (east, north) meters.
  const along = { e: Math.sin(theta), n: Math.cos(theta) };
  const across = { e: Math.sin(theta + Math.PI / 2), n: Math.cos(theta + Math.PI / 2) };

  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    const acrossDist = r * (plotLengthM + rowGapM);
    for (let c = 0; c < cols; c++) {
      const alongDist = c * (plotWidthM + colGapM);
      const corner = (dAlong: number, dAcross: number): [number, number] =>
        offsetMeters(
          origin,
          (alongDist + dAlong) * along.e + (acrossDist + dAcross) * across.e,
          (alongDist + dAlong) * along.n + (acrossDist + dAcross) * across.n,
        );
      cells.push({
        id: `${rowLetter(r)}-${c + 1}`,
        row: rowLetter(r),
        space: c + 1,
        corners: [
          corner(0, 0),
          corner(plotWidthM, 0),
          corner(plotWidthM, plotLengthM),
          corner(0, plotLengthM),
        ],
      });
    }
  }
  return cells;
}

/** Serialize cells to the plots.geojson shape defined in CLAUDE.md (status defaults to "unknown"). */
export function cellsToGeoJSON(cells: Cell[], params: GridParams): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: cells.map((cell) => ({
      type: "Feature",
      properties: {
        id: cell.id,
        row: cell.row,
        space: cell.space,
        status: "unknown",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [...cell.corners, cell.corners[0]].map(([lat, lng]) => [lng, lat]),
        ],
      },
    })),
    // Non-standard but handy: keep the generator inputs so a grid can be re-derived.
    ...({ metadata: { generator: "cook-walden-rip editor", params } } as object),
  };
}
