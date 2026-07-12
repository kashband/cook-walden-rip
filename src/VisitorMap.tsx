import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ImageOverlay,
  LayersControl,
  Polygon,
  Tooltip,
  useMap,
} from "react-leaflet";
import sectionRaw from "../data/section.geojson?raw";
import {
  SECTION_CENTER,
  INITIAL_ZOOM,
  MAX_NATIVE_ZOOM,
  MAX_ZOOM,
  ESRI_WORLD_IMAGERY_URL,
  ESRI_ATTRIBUTION,
  TXGIO_OVERLAY_URL,
  TXGIO_OVERLAY_BOUNDS,
  TXGIO_ATTRIBUTION,
} from "./config";
import { DIAGRAM_COLORS, STATUS_COLORS, STATUS_LABELS } from "./layout";
import { PLOTS, PLOT_BY_ID, STATUS_COUNTS, type Plot } from "./plots";
import PlotDetail from "./PlotDetail";
import SearchBox from "./SearchBox";

const section = JSON.parse(sectionRaw) as GeoJSON.FeatureCollection;

const sectionStyle = {
  color: "#fbbf24",
  weight: 2,
  dashArray: "6 4",
  fillColor: "#fbbf24",
  fillOpacity: 0.06,
};

function FlyToPlot({ plot }: { plot?: Plot }) {
  const map = useMap();
  useEffect(() => {
    if (plot) map.flyTo(plot.center, Math.max(map.getZoom(), 20), { duration: 0.6 });
  }, [plot, map]);
  return null;
}

function Legend() {
  return (
    <div className="map-legend">
      {Object.entries(STATUS_LABELS).map(([status, label]) => (
        <div key={status} className="legend-row">
          <span
            className="swatch"
            style={{ background: DIAGRAM_COLORS[STATUS_COLORS[status]] ?? "#fff" }}
          />
          {label} ({STATUS_COUNTS[status] ?? 0})
        </div>
      ))}
    </div>
  );
}

export default function VisitorMap({ selectedId }: { selectedId?: string }) {
  const selected = selectedId ? PLOT_BY_ID.get(selectedId) : undefined;

  return (
    <div className="viewer">
      <div className="map-wrap">
        <MapContainer
          className="map"
          center={SECTION_CENTER}
          zoom={INITIAL_ZOOM}
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
            <LayersControl.Overlay name="2019 6-inch detail (TxGIO)">
              <ImageOverlay
                url={TXGIO_OVERLAY_URL}
                bounds={TXGIO_OVERLAY_BOUNDS}
                attribution={TXGIO_ATTRIBUTION}
              />
            </LayersControl.Overlay>
          </LayersControl>
          <GeoJSON data={section} style={sectionStyle} />
          {PLOTS.map((p) => {
            const isSelected = p.id === selectedId;
            return (
              <Polygon
                key={p.id}
                positions={p.corners}
                pathOptions={{
                  color: isSelected ? "#fbbf24" : "#1c1917",
                  weight: isSelected ? 2.5 : 0.6,
                  fillColor: DIAGRAM_COLORS[STATUS_COLORS[p.status]] ?? "#ffffff",
                  fillOpacity: isSelected ? 0.85 : 0.55,
                }}
                eventHandlers={{
                  click: () => {
                    window.location.hash = `#/plot/${encodeURIComponent(p.id)}`;
                  },
                }}
              >
                <Tooltip sticky>
                  {p.id} &middot; {STATUS_LABELS[p.status] ?? p.status}
                </Tooltip>
              </Polygon>
            );
          })}
          <FlyToPlot plot={selected} />
        </MapContainer>
        <SearchBox />
        <Legend />
      </div>
      {selected && (
        <PlotDetail
          plot={selected}
          onClose={() => {
            window.location.hash = "#/";
          }}
        />
      )}
      {selectedId && !selected && (
        <aside className="plot-panel">
          <button
            className="close"
            onClick={() => {
              window.location.hash = "#/";
            }}
            aria-label="Close plot details"
          >
            &times;
          </button>
          <h2>Plot not found</h2>
          <p className="plot-copy">
            No plot with ID <code>{selectedId}</code> exists in the current data.
          </p>
        </aside>
      )}
    </div>
  );
}
