/**
 * The committed plot inventory (data/plots.geojson), parsed once and shared by
 * the visitor map and the plot detail view.
 */
import plotsRaw from "../data/plots.geojson?raw";

export interface PlotPerson {
  name: string;
  /** Burial date, ISO (from IABA records). */
  burial?: string;
}

export interface Plot {
  id: string;
  lot: number;
  space: string;
  status: string;
  color: string;
  /** Deed holder — published for vacant plots only. */
  owner?: string;
  person?: PlotPerson;
  /** Ring of [lat, lng] corners (not closed). */
  corners: [number, number][];
  /** Centroid [lat, lng] — pan/zoom target. */
  center: [number, number];
}

const fc = JSON.parse(plotsRaw) as GeoJSON.FeatureCollection;

export const PLOTS: Plot[] = fc.features.map((f) => {
  const ring = (f.geometry as GeoJSON.Polygon).coordinates[0].slice(0, -1);
  const corners = ring.map(([lng, lat]) => [lat, lng] as [number, number]);
  const center: [number, number] = [
    corners.reduce((s, c) => s + c[0], 0) / corners.length,
    corners.reduce((s, c) => s + c[1], 0) / corners.length,
  ];
  return { ...(f.properties as Omit<Plot, "corners" | "center">), corners, center };
});

export const PLOT_BY_ID = new Map(PLOTS.map((p) => [p.id, p]));

/** Per-status plot counts, for the legend. */
export const STATUS_COUNTS = PLOTS.reduce<Record<string, number>>((acc, p) => {
  acc[p.status] = (acc[p.status] ?? 0) + 1;
  return acc;
}, {});
