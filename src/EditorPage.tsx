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
  DEFAULT_PLACEMENT,
  placeLayout,
  placedToGeoJSON,
  DIAGRAM_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  type PlacementParams,
} from "./layout";

const section = JSON.parse(sectionRaw) as GeoJSON.FeatureCollection;
const STORAGE_KEY = "cw-editor-placement";

function loadParams(): PlacementParams {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PLACEMENT, ...JSON.parse(raw) };
  } catch {
    /* corrupted storage — fall back to defaults */
  }
  return DEFAULT_PLACEMENT;
}

function AnchorPicker({ active, onPick }: { active: boolean; onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (active) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function EditorPage() {
  const [params, setParams] = useState<PlacementParams>(loadParams);
  const [picking, setPicking] = useState(false);
  const [nudgeStepM, setNudgeStepM] = useState(0.25);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const placed = useMemo(() => placeLayout(params), [params]);

  const set = (patch: Partial<PlacementParams>) => setParams((p) => ({ ...p, ...patch }));

  /** Move the anchor relative to the layout: along its rotated x-axis and y-axis. */
  const nudge = (alongM: number, acrossM: number) => {
    const theta = (params.rotationDeg * Math.PI) / 180;
    // layout x-axis points to bearing 90+rot, y-axis to bearing 180+rot
    const eastM =
      alongM * Math.cos(theta) + acrossM * Math.sin(theta);
    const northM = -alongM * Math.sin(theta) + acrossM * Math.cos(theta);
    const lat = params.anchor.lat + northM / 111_320;
    const lng =
      params.anchor.lng + eastM / (111_320 * Math.cos((params.anchor.lat * Math.PI) / 180));
    set({ anchor: { lat, lng } });
  };

  const exportGeoJSON = () => {
    const fc = placedToGeoJSON(placed, params);
    const blob = new Blob([JSON.stringify(fc, null, 1)], { type: "application/geo+json" });
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
  ) => (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );

  return (
    <div className="editor">
      <aside className="panel">
        <h2>Layout placement</h2>
        <p className="hint">
          The digitized IABA layout ({placed.length} spaces) is placed with one transform.
          Align it against the 2019 detail layer, then export and commit as{" "}
          <code>data/plots.geojson</code>.
        </p>

        <section>
          <h3>Anchor (layout center)</h3>
          <button className={picking ? "active" : ""} onClick={() => setPicking((v) => !v)}>
            {picking ? "Click the map…" : "Set anchor by clicking map"}
          </button>
          <div className="readout">
            {params.anchor.lat.toFixed(6)}, {params.anchor.lng.toFixed(6)}
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
              <button onClick={() => nudge(0, -nudgeStepM)} title="Layout-up">▲</button>
              <div>
                <button onClick={() => nudge(-nudgeStepM, 0)} title="Layout-left">◀</button>
                <button onClick={() => nudge(nudgeStepM, 0)} title="Layout-right">▶</button>
              </div>
              <button onClick={() => nudge(0, nudgeStepM)} title="Layout-down">▼</button>
            </div>
          </div>
        </section>

        <section>
          <h3>Rotation</h3>
          {num("Rotation (° CW)", params.rotationDeg, (v) => set({ rotationDeg: v }), 0.5)}
          <div className="btn-row">
            {[-5, -1, -0.1, 0.1, 1, 5].map((d) => (
              <button
                key={d}
                onClick={() => set({ rotationDeg: +(params.rotationDeg + d).toFixed(2) })}
              >
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Scale</h3>
          {num("Space width (m)", params.spaceWidthM, (v) => set({ spaceWidthM: v }), 0.05)}
          {num("Space depth (m)", params.spaceDepthM, (v) => set({ spaceDepthM: v }), 0.05)}
        </section>

        <section>
          <h3>Legend (diagram colors)</h3>
          <div className="legend">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="legend-row">
                <span
                  className="swatch"
                  style={{ background: DIAGRAM_COLORS[STATUS_COLORS[status]] ?? "#ffffff" }}
                />
                {label}
              </div>
            ))}
          </div>
        </section>

        <section>
          <button className="primary" onClick={exportGeoJSON}>
            Export plots.geojson
          </button>
          <button onClick={() => setParams(DEFAULT_PLACEMENT)}>Reset to defaults</button>
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
        <AnchorPicker
          active={picking}
          onPick={(lat, lng) => {
            set({ anchor: { lat, lng } });
            setPicking(false);
          }}
        />
        {placed.map((s) => (
          <Polygon
            key={s.id}
            positions={s.corners}
            pathOptions={{
              color: "#1c1917",
              weight: 0.7,
              fillColor: DIAGRAM_COLORS[s.color] ?? "#ffffff",
              fillOpacity: 0.55,
            }}
          >
            <Tooltip sticky>
              {s.id} · {STATUS_LABELS[s.status] ?? s.status}
            </Tooltip>
          </Polygon>
        ))}
        <CircleMarker
          center={[params.anchor.lat, params.anchor.lng]}
          radius={5}
          pathOptions={{ color: "#ef4444", fillOpacity: 0.9 }}
        />
      </MapContainer>
    </div>
  );
}
