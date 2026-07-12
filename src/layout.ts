/**
 * Placement of the digitized IABA layout (data/reference/layout-spaces.json)
 * onto the ground with a single transform: anchor + rotation + px→m scale.
 *
 * Meter offsets use the same flat-earth approximation as before — accurate to
 * sub-centimeter at the ~200 m scale of the section.
 */
import layoutRaw from "../data/reference/layout-spaces.json?raw";

export interface LayoutSpace {
  lot: number;
  space: string;
  id: string;
  color: string;
  status: string;
  /** [x0, y0, x1, y1] in diagram pixels (4800px-wide render). */
  rect_px: [number, number, number, number];
}

const layoutFile = JSON.parse(layoutRaw) as {
  cell_px: [number, number];
  spaces: LayoutSpace[];
};

export const LAYOUT_SPACES = layoutFile.spaces;
/** Diagram pixel size of one space (70 × 103). */
export const [CELL_PX_W, CELL_PX_H] = layoutFile.cell_px;

/** Pixel center of the layout's bounding box, used as the transform origin. */
const bounds = LAYOUT_SPACES.reduce(
  (b, s) => ({
    x0: Math.min(b.x0, s.rect_px[0]),
    y0: Math.min(b.y0, s.rect_px[1]),
    x1: Math.max(b.x1, s.rect_px[2]),
    y1: Math.max(b.y1, s.rect_px[3]),
  }),
  { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity },
);
const CX = (bounds.x0 + bounds.x1) / 2;
const CY = (bounds.y0 + bounds.y1) / 2;

export interface PlacementParams {
  /** Ground position of the layout's pixel center. */
  anchor: { lat: number; lng: number };
  /** Clockwise rotation of the diagram, degrees (owner: ~120°). */
  rotationDeg: number;
  /** Real-world size of one space (one 70×103 px cell). */
  spaceWidthM: number;
  spaceDepthM: number;
}

/** Owner-calibrated placement (2026-07-07) — matches data/plots.geojson metadata. */
export const DEFAULT_PLACEMENT: PlacementParams = {
  anchor: { lat: 30.437268657968733, lng: -97.66220355069068 },
  rotationDeg: 137,
  spaceWidthM: 1.0,
  spaceDepthM: 3.0,
};

const M_PER_DEG_LAT = 111_320;

export interface PlacedSpace extends Omit<LayoutSpace, "rect_px"> {
  /** Ring of [lat, lng] corners (not closed). */
  corners: [number, number][];
}

export function placeLayout(params: PlacementParams): PlacedSpace[] {
  const { anchor, rotationDeg, spaceWidthM, spaceDepthM } = params;
  const sx = spaceWidthM / CELL_PX_W;
  const sy = spaceDepthM / CELL_PX_H;
  const theta = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const mPerDegLng = M_PER_DEG_LAT * Math.cos((anchor.lat * Math.PI) / 180);

  const toLatLng = (px: number, py: number): [number, number] => {
    const e0 = (px - CX) * sx;
    const n0 = -(py - CY) * sy; // diagram y grows downward
    const e = e0 * cos + n0 * sin;
    const n = -e0 * sin + n0 * cos;
    return [anchor.lat + n / M_PER_DEG_LAT, anchor.lng + e / mPerDegLng];
  };

  return LAYOUT_SPACES.map(({ rect_px: [x0, y0, x1, y1], ...rest }) => ({
    ...rest,
    corners: [toLatLng(x0, y0), toLatLng(x1, y0), toLatLng(x1, y1), toLatLng(x0, y1)],
  }));
}

/** Serialize to the plots.geojson shape defined in CLAUDE.md. */
export function placedToGeoJSON(
  placed: PlacedSpace[],
  params: PlacementParams,
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: placed.map((s) => ({
      type: "Feature",
      properties: { id: s.id, lot: s.lot, space: s.space, status: s.status, color: s.color },
      geometry: {
        type: "Polygon",
        coordinates: [
          [...s.corners, s.corners[0]].map(([lat, lng]) => [lng, lat]),
        ],
      },
    })),
    // Non-standard but handy: keep the placement inputs so the export can be re-derived.
    ...({ metadata: { generator: "cook-walden-rip editor", params } } as object),
  };
}

/** Render colors keyed by diagram color, matching the IABA layout legend. */
export const DIAGRAM_COLORS: Record<string, string> = {
  red: "#b02418",
  darkblue: "#4f71be",
  lightblue: "#9cb0dc",
  white: "#ffffff",
  gray: "#bfbfbf",
  darkgray: "#8a8a8a",
  green: "#9fce63",
};

/** Status → diagram color (owner-confirmed legend, 2026-07-07). */
export const STATUS_COLORS: Record<string, string> = {
  buried: "red",
  occupied: "darkblue",
  vacant: "lightblue",
  unowned: "white",
  bohri: "gray",
  other: "darkgray",
  unusable: "green",
};

/** Legend labels (owner-confirmed semantics, 2026-07-07/12). */
export const STATUS_LABELS: Record<string, string> = {
  buried: "Buried",
  occupied: "Occupied — IABA community",
  vacant: "Vacant — member-owned",
  unowned: "Not IABA-owned",
  bohri: "Bohri community",
  other: "Other community (unconfirmed)",
  unusable: "Tree / bench / unusable",
};
