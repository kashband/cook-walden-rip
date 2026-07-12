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

/**
 * High-res (6-inch) leaf-off orthoimagery of the section, January 2019.
 * Exported once from TxGIO's StratMap19_NCCIR_CapArea ImageServer and committed
 * to public/imagery/. Bounds must match the export bbox exactly.
 */
export const TXGIO_OVERLAY_URL = `${import.meta.env.BASE_URL}imagery/iaba-2019-txgio.jpg`;
export const TXGIO_OVERLAY_BOUNDS: [[number, number], [number, number]] = [
  [30.43635, -97.6633],
  [30.43825, -97.6611],
];
export const TXGIO_ATTRIBUTION = "2019 imagery: TxGIO StratMap";

/**
 * Placeholder — real IABA contact still unconfirmed (docs/OPEN-QUESTIONS.md).
 * The .example TLD makes it obviously fake in the demo.
 */
export const IABA_CONTACT_EMAIL = "plots@iaba.example";
