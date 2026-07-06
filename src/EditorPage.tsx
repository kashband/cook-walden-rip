import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ImageOverlay,
  LayersControl,
  Polygon,
  Tooltip,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import sectionRaw from "../data/section.geojson?raw";
import {
  SECTION_CENTER,
  MAX_NATIVE_ZOOM,
  MAX_ZOOM,
  ESRI_WORLD_IMAGERY_URL,
  ESRI_ATTRIBUTION,
  TXGIO_OVERLAY_URL,
  TXGIO_OVERLAY_BOUNDS,
  TXGIO_ATTRIBUTION,
} from "./config";
import {
  DEFAULT_GRID_PARAMS,
  generateGrid,
  cellsToGeoJSON,
  type GridParams,
} from "./grid";

const section = JSON.parse(sectionRaw) as GeoJSON.FeatureCollection;
const STORAGE_KEY = "cw-editor-grid-params";

function loadParams(): GridParams {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_GRID_PARAMS, ...JSON.parse(raw) };
  } catch {
    /* corrupted storage — fall back to defaults */
  }
  return DEFAULT_GRID_PARAMS;
}

function OriginPicker({ active, onPick }: { active: boolean; onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (active) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function EditorPage() {
  const [params, setParams] = useState<GridParams>(loadParams);
  const [picking, setPicking] = useState(false);
  const [nudgeStepM, setNudgeStepM] = useState(0.25);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const cells = useMemo(() => generateGrid(params), [params]);

  const set = (patch: Partial<GridParams>) => setParams((p) => ({ ...p, ...patch }));

  /** Move the origin relative to the grid: along the row bearing and across it. */
  const nudge = (alongM: number, acrossM: number) => {
    const theta = (params.bearingDeg * Math.PI) / 180;
    const eastM = alongM * Math.sin(theta) + acrossM * Math.sin(theta + Math.PI / 2);
    const northM = alongM * Math.cos(theta) + acrossM * Math.cos(theta + Math.PI / 2);
    const lat = params.origin.lat + northM / 111_320;
    const lng =
      params.origin.lng + eastM / (111_320 * Math.cos((params.origin.lat * Math.PI) / 180));
    set({ origin: { lat, lng } });
  };

  const exportGeoJSON = () => {
    const fc = cellsToGeoJSON(cells, params);
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/geo+json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "plots.geojson";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const num = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    step = 1,
    min = 0,
  ) => (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );

  return (
    <div className="editor">
      <aside className="panel">
        <h2>Grid generator</h2>
        <p className="hint">
          Align the grid against visible grave rows (enable the 2019 detail layer), then export
          and commit as <code>data/plots.geojson</code>.
        </p>

        <section>
          <h3>Origin (corner of A-1)</h3>
          <button className={picking ? "active" : ""} onClick={() => setPicking((v) => !v)}>
            {picking ? "Click the map… (esc: click again)" : "Set origin by clicking map"}
          </button>
          <div className="readout">
            {params.origin.lat.toFixed(6)}, {params.origin.lng.toFixed(6)}
          </div>
          <div className="nudge">
            <span>Nudge</span>
            <select value={nudgeStepM} onChange={(e) => setNudgeStepM(Number(e.target.value))}>
              <option value={0.1}>0.1 m</option>
              <option value={0.25}>0.25 m</option>
              <option value={1}>1 m</option>
              <option value={5}>5 m</option>
            </select>
            <div className="nudge-grid">
              <button onClick={() => nudge(0, -nudgeStepM)} title="Up a row">▲</button>
              <div>
                <button onClick={() => nudge(-nudgeStepM, 0)} title="Back along row">◀</button>
                <button onClick={() => nudge(nudgeStepM, 0)} title="Forward along row">▶</button>
              </div>
              <button onClick={() => nudge(0, nudgeStepM)} title="Down a row">▼</button>
            </div>
          </div>
        </section>

        <section>
          <h3>Orientation</h3>
          {num("Bearing (° along row)", params.bearingDeg, (v) => set({ bearingDeg: v }), 0.5)}
          <div className="btn-row">
            {[-5, -1, -0.1, 0.1, 1, 5].map((d) => (
              <button key={d} onClick={() => set({ bearingDeg: +(params.bearingDeg + d).toFixed(2) })}>
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Layout</h3>
          {num("Rows", params.rows, (v) => set({ rows: Math.max(1, Math.round(v)) }))}
          {num("Spaces per row", params.cols, (v) => set({ cols: Math.max(1, Math.round(v)) }))}
          {num("Plot width (m)", params.plotWidthM, (v) => set({ plotWidthM: v }), 0.05)}
          {num("Plot length (m)", params.plotLengthM, (v) => set({ plotLengthM: v }), 0.05)}
          {num("Gap in row (m)", params.colGapM, (v) => set({ colGapM: v }), 0.05)}
          {num("Gap between rows (m)", params.rowGapM, (v) => set({ rowGapM: v }), 0.05)}
        </section>

        <section>
          <div className="readout">
            {cells.length} plots &middot; footprint{" "}
            {(params.cols * (params.plotWidthM + params.colGapM)).toFixed(1)} m ×{" "}
            {(params.rows * (params.plotLengthM + params.rowGapM)).toFixed(1)} m
          </div>
          <button className="primary" onClick={exportGeoJSON}>
            Export plots.geojson
          </button>
          <button onClick={() => setParams(DEFAULT_GRID_PARAMS)}>Reset to defaults</button>
        </section>

        <a href="#/">&larr; Back to map</a>
      </aside>

      <MapContainer
        className="map"
        center={SECTION_CENTER}
        zoom={19}
        maxZoom={MAX_ZOOM}
        zoomControl
      >
        <TileLayer
          url={ESRI_WORLD_IMAGERY_URL}
          attribution={ESRI_ATTRIBUTION}
          maxNativeZoom={MAX_NATIVE_ZOOM}
          maxZoom={MAX_ZOOM}
        />
        <LayersControl position="topright">
          <LayersControl.Overlay checked name="2019 6-inch detail (TxGIO)">
            <ImageOverlay
              url={TXGIO_OVERLAY_URL}
              bounds={TXGIO_OVERLAY_BOUNDS}
              attribution={TXGIO_ATTRIBUTION}
            />
          </LayersControl.Overlay>
        </LayersControl>
        <GeoJSON
          data={section}
          style={{ color: "#fbbf24", weight: 1.5, dashArray: "6 4", fillOpacity: 0 }}
        />
        <OriginPicker
          active={picking}
          onPick={(lat, lng) => {
            set({ origin: { lat, lng } });
            setPicking(false);
          }}
        />
        {cells.map((cell) => (
          <Polygon
            key={cell.id}
            positions={cell.corners}
            pathOptions={{ color: "#38bdf8", weight: 1, fillOpacity: 0.05 }}
          >
            <Tooltip sticky>{cell.id}</Tooltip>
          </Polygon>
        ))}
        <CircleMarker
          center={[params.origin.lat, params.origin.lng]}
          radius={5}
          pathOptions={{ color: "#ef4444", fillOpacity: 0.9 }}
        />
      </MapContainer>
    </div>
  );
}
