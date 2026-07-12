# Design

## Overview

A static, geo-accurate interactive map of the IABA section of Cook-Walden Capital Parks
(Pflugerville, TX). Users see the section from above on satellite imagery, with every
plot drawn as a colored polygon: who is buried where, what's reserved, and what's
available to inquire about. Modeled on Chronicle's cemetery maps (e.g.
https://map.chronicle.rip/HIC): aerial base layer, color-coded plot polygons, click a
plot → detail view, deceased search.

Section center: `30.43730366645736, -97.66220675345387`.

## Architecture

```
Vite + React + TypeScript (static build)
├── Leaflet via react-leaflet         — map shell
│   └── Esri World Imagery tiles      — satellite base layer
├── data/plots.geojson                — plot polygons + status/person properties
├── data/section.geojson              — IABA section boundary
├── #/plot/<id> hash routes           — shareable per-plot pages on a static host
└── /editor dev route                 — grid generator (authoring tool, not for visitors)
```

No backend, no database, no auth, no API keys. All state a visitor sees comes from
committed flat files. "Editing" the cemetery = editing GeoJSON (via the editor's export
or by hand) and committing.

## Imagery & licensing

- **Base layer: Esri World Imagery** (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`).
  Free with attribution ("Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics…").
  Current-state imagery (~30 cm effective here): shows recent burials, but headstones
  are soft blobs at plot zoom.
- **Detail layer: TxGIO StratMap 2019 6-inch orthoimagery** (public domain, leaf-off).
  A one-time high-res crop of the section was exported from the
  `StratMap/StratMap19_NCCIR_CapArea` ImageServer and committed as
  `public/imagery/iaba-2019-txgio.jpg`, rendered as a toggleable Leaflet ImageOverlay
  pinned to its exact export bbox (see `TXGIO_OVERLAY_BOUNDS` in `src/config.ts`).
  Individual grave markers are clearly visible — this is the alignment reference for
  the grid editor. Caveat: it predates ~2019 burials, so it shows fewer graves than
  the Esri layer; occupancy truth comes from the survey, not imagery.
  (The StratMap21 flight does not cover this location; check newer CapArea flights
  when TxGIO publishes them.)
- **Do not use Google Maps/Earth tiles** — their license prohibits use outside Google's
  own APIs and prohibits this kind of overlay reuse.
- **Future upgrade:** a drone orthophoto of just the IABA section, georeferenced and
  served the same way as the TxGIO overlay.

## Reference layout (data/reference/IABA-Layout.pdf)

Owner-provided official diagram of the section (added 2026-07-05; rendered PNG
alongside). Structure: 52 numbered lots (01–36, 47–62; 37–46 don't exist), each up to
16 spaces in a fixed pattern — top row `A1 A2 A3 A4 B1 B2 B3 B4`, bottom row
`C1 C2 C3 C4 D1 D2 D3 D4`. Plot ID = `{lot}-{space}` (e.g. `14-B3`). Lots 59–62 are
dashed (likely future). The diagram is rotated relative to the ground: ~120° clockwise
brings it into alignment. This document is the source of truth for IDs and statuses;
imagery is only for georeferencing, and the field survey adds person data.

Legend (owner-confirmed semantics, 2026-07-07/12; counts per CW.xlsx, 2026-07-12):
dark red = **buried** (101; all but one predate/aren't from the IABA community) ·
dark blue = **occupied** by IABA community (34) · light blue = **vacant**,
member-deeded (125) · white = **unowned**, likely cemetery-available but not IABA's
(278) · gray = **bohri**, adjacent community (64) · dark gray = **other** community,
unconfirmed (48, not in the legend) · green = **unusable** obstacles between graves
(22). The PDF is a stale snapshot — `COLOR_OVERRIDES` in the digitizer applies the
five post-PDF changes recorded in the workbook (four 2025 burials on vacant spaces +
burial 59-D4 in dashed lot 59). `scripts/digitize_layout.py export` validates
per-color counts against the workbook legend.

### Records workbook (CW.xlsx, 2026-07-12 — kept out of the repo)

IABA's internal tracking sheet; the PDF diagram was exported from its grid tabs.
`All` lists every member-owned space (owner, used flag, burial date, deceased,
notes), `Burials` lists burials. IDs are `4A-2` ↔ map `04-A2`.
`scripts/import_records.py <path>` re-syncs statuses from the digitized layout and
merges owner/person data into `data/plots.geojson` — re-run it whenever IABA sends
an updated workbook. Name corrections confirmed by the owner live in its
`CORRECTIONS` dict. The Notes column (Deeded/AB/anecdotes) is internal — never
exported. Owner names are published on vacant plots only.

**Digitized** by `scripts/digitize_layout.py` (labels stage → cells QA stage →
export): finds the 52 orange lot labels, measures the 560×206 px lot frames from
solid borders, samples each space's fill color, and writes
`data/reference/layout-spaces.json` — 671 spaces with `{id, lot, space, color,
status, rect_px}`. The pixel rects mean the map grid is produced by a single
diagram→ground transform (anchor + rotation + px→m scale), not parametric generation.

## Grid generator (`/editor`)

The hardest, most iterative part of the project. Cemetery plots are regular rectangles
laid out in rows, so we generate them parametrically instead of drawing hundreds of
polygons by hand.

Inputs (form + on-map interaction):

1. **Origin corner** — click on the map to place the grid's anchor point
2. **Bearing** — rotation of the grid in degrees (rows rarely align to true north)
3. **Rows × columns** — counts
4. **Plot size** — width × length in meters (default ≈ 1.2 m × 3.0 m, a standard grave)
5. **Gaps** — optional walkway spacing between rows / between blocks of columns

Behavior:

- Grid regenerates live as parameters change (flat-earth meter offsets in `src/grid.ts`
  — accurate to sub-centimeter at this scale, no turf dependency needed)
- Nudge controls: arrow-key/button offsets for origin, fine bearing adjustment, so the
  grid can be visually aligned against visible graves in the imagery
- Cells get placeholder IDs (`A-1` … row letter + space number) at generation time
- Stretch (M5): tap a cell to cycle its status — turns the editor into an on-site
  survey tool on a phone
- **Export** button downloads `plots.geojson`; the user commits it. The editor never
  writes files itself — the repo stays the single source of truth.

The editor route ships in the dev build only (or behind an obvious `?editor` flag);
visitors never see it.

## Visitor-facing map

- Opens centered/zoomed on the IABA section, section boundary outlined
- Plot polygons color-coded by status, reusing the official diagram's colors so the
  map reads as "the IABA layout, live on the ground":

  | Status    | Diagram color | Meaning                                    |
  |-----------|---------------|--------------------------------------------|
  | buried    | dark red      | burial present (all but 59-D4 not IABA)    |
  | occupied  | dark blue     | IABA community burial (name + date shown)  |
  | vacant    | light blue    | member-deeded, unused — owner shown        |
  | unowned   | white         | not IABA-owned (likely cemetery inventory) |
  | bohri     | light gray    | adjacent Bohri community                   |
  | other     | dark gray     | probably another community (unconfirmed)   |
  | unusable  | green         | tree / bench / obstacle                    |

- Legend always visible (status + count); hover shows plot ID + status tooltip
- Click/tap → flies to the plot and opens its detail panel

## Plot detail view

Sidebar panel on desktop, bottom sheet on mobile, addressable as `#/plot/14-B3`.

- Plot ID, lot/space, status badge, per-status explanation copy
- **Occupied/buried with records:** deceased name + burial date; photos later
- **Vacant:** owner name ("Owned by …") + "Contact IABA about this plot" — `mailto:`
  link with subject/body prefilled with the plot ID (email placeholder until IABA
  provides the real contact). Nothing is for sale outright; IABA connects interested
  buyers with the owner. No forms, no payments.
- All statuses carry a "demo data" disclaimer

## Search

Simple client-side name search over `plots.geojson` properties (a text input filtering
occupied/reserved plots; selecting a result pans/zooms to the plot and opens its
detail). Cheap because the whole dataset is already in memory.

## Future phases (explicitly out of POC scope)

- GPS walk-to-grave (browser geolocation + heading toward plot centroid)
- Import of real Cook-Walden/IABA records; real plot numbering
- Drone orthophoto base layer
- Google Sheet–backed status editing for non-technical maintainers
- Photo galleries / memorial content per plot
- Real purchase/inquiry workflow (forms, notifications)
