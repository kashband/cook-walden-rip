import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import sectionRaw from "../data/section.geojson?raw";
import {
  SECTION_CENTER,
  INITIAL_ZOOM,
  MAX_NATIVE_ZOOM,
  MAX_ZOOM,
  ESRI_WORLD_IMAGERY_URL,
  ESRI_ATTRIBUTION,
} from "./config";

const section = JSON.parse(sectionRaw) as GeoJSON.FeatureCollection;

const sectionStyle = {
  color: "#fbbf24",
  weight: 2,
  dashArray: "6 4",
  fillColor: "#fbbf24",
  fillOpacity: 0.06,
};

export default function App() {
  return (
    <div className="app">
      <header className="banner">
        <h1>Cook-Walden &mdash; IABA Section</h1>
        <span className="tag">Demo &middot; boundary approximate</span>
      </header>
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
        <GeoJSON data={section} style={sectionStyle} />
      </MapContainer>
    </div>
  );
}
