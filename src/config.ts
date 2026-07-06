/** Center of the IABA-owned section of Cook-Walden Capital Parks, Pflugerville, TX. */
export const SECTION_CENTER: [number, number] = [30.43730366645736, -97.66220675345387];

export const INITIAL_ZOOM = 18;

/** Esri serves imagery up to z19 here; Leaflet upscales beyond that. */
export const MAX_NATIVE_ZOOM = 19;
export const MAX_ZOOM = 21;

export const ESRI_WORLD_IMAGERY_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export const ESRI_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community";
