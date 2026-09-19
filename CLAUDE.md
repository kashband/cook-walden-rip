# Cook-Walden IABA Cemetery Map

Interactive map of the IABA-owned (Shia mosque) section of Cook-Walden Capital Parks
cemetery, modeled on Chronicle's `.rip` cemetery maps (reference: https://map.chronicle.rip/HIC —
plot polygons over aerial imagery, color-coded by status, click a plot for details).

## Purpose & audience

A **pitch demo for IABA leadership** — a working proof of concept, not production software.
Fake/partial data is acceptable; visual credibility matters. Zero hosting cost is a hard
constraint (static site, deployable to GitHub Pages).

## Key facts

- Cemetery: Cook-Walden Capital Parks, 14501 N Interstate Hwy 35, Pflugerville, TX 78660
- IABA owns **only one section** of the cemetery — only that section is mapped
- Section center coordinates: `30.43730366645736, -97.66220675345387`
- **Official layout diagram in hand** (2026-07-05): `data/reference/IABA-Layout.pdf`
  (+ rendered PNG). 52 lots (01–36, 47–62; 37–46 don't exist) of up to 16 spaces each
  (A1–A4/B1–B4 over C1–C4/D1–D4, 8 wide × 2 deep), color-coded by status. **Digitized**
  to `data/reference/layout-spaces.json` (672 spaces, statuses + pixel geometry) by
  `scripts/digitize_layout.py`, then **placed on the ground by the owner** (2026-07-07:
  rotation 137° CW, 1.0 m × 3.0 m spaces) → `data/plots.geojson`.
- **IABA records workbook in hand** (2026-07-12): `CW.xlsx` (kept OUT of the repo —
  internal doc; lives in the owner's Downloads). Sheets: `All` (159 member-owned
  spaces: owner, used flag, burial date, deceased), `Burials` (35 burials), plus the
  colored grid sheets the PDF was exported from. Space IDs use `4A-2` = our `04-A2`.
  It post-dates the PDF: 4 vacant→used changes + burial `59-D4` in dashed lot 59
  (see `COLOR_OVERRIDES` in the digitizer). Merged into `data/plots.geojson` by
  `scripts/import_records.py` (re-runnable; name corrections inside).

## Locked decisions (2026-07-05, with project owner)

- **Static site, no backend, no auth.** Plot data lives in flat files in the repo;
  updates are file edits.
- **Geo-accurate map:** Leaflet over Esri World Imagery satellite tiles; plots are
  GeoJSON polygons at real lat/lng. (Google tiles are license-prohibited for this use.)
- **Grid authoring:** a dev-only in-app grid generator/editor (`/editor` route) that
  parametrically generates the plot grid and exports GeoJSON — never hand-draw plots.
- **Labeling (updated 2026-07-05):** the real IABA scheme from the layout diagram —
  lot number + space code, plot ID format `"14-B3"` (lot 14, space B3). The earlier
  `A-1` placeholder scheme is obsolete.
- **Purchase flow (updated 2026-07-12):** there is currently **nothing for sale** —
  every vacant (light blue) space is deeded to a community member, and white spaces
  are NOT IABA-owned. Vacant plots display their **owner's name** (approved by owner
  2026-07-12) plus a "Contact IABA" mailto so interested buyers can be connected with
  the owner. Direct-purchase UX only becomes relevant if IABA expands the section.
  Contact email is a placeholder (`src/config.ts`) until IABA provides the real one.

## Going live (decided 2026-09-19; build in progress)

Moving from the public GitHub Pages demo to a real, private-code, admin-editable site.
Runbook: `docs/DEPLOY.md`.

- **Host:** Cloudflare Pages (free, builds a **private** repo on push, custom domain,
  auto HTTPS). Replaces GitHub Pages (which forced the repo public). Domain: a fresh
  one, `cookwalden.rip` (or similar).
- **Data:** Supabase. The mutable **records** (status, owner, person, notes) move into a
  `plots` table; the public site reads only the filtered `public_plots` VIEW (hides
  `internal_notes`, shows `owner` only when vacant). Admins log in to edit. This retires
  CW.xlsx as the source of truth — no spreadsheet in the pipeline. Schema + seed live in
  `supabase/`; `scripts/export_seed.py` regenerates the seed from plots.geojson.
- **Geometry stays static & public:** plot polygons aren't sensitive and never change, so
  they remain a repo file the client joins to the fetched records by `id`. Digitizing/
  placement stays a dev-only task; admins only ever edit records.
- **Privacy boundary = the database view, not the editor.** The public `anon` key can
  only read `public_plots`; the raw table is RLS-locked to authenticated admins. Never
  ship the service_role key or let the site read the base table.
- **Pending code change:** refactor the data layer from "records baked into the bundle"
  to "fetch `public_plots` at load, merge with static geometry." Until then the app still
  runs off the committed plots.geojson.

## Stack

Vite + React + TypeScript · Leaflet (`react-leaflet`) · `@turf/turf` for grid math ·
hash routing (`#/plot/A-12`) so plot pages work on a static host.

## Data model

`data/plots.geojson` — FeatureCollection of plot polygons. Feature properties:

```
id: "14-B3"         // real IABA scheme: lot number + space code
lot: 14, space: "B3"
status: "buried" | "occupied" | "vacant" | "unowned" | "bohri" | "other" | "unusable"
                    // owner-confirmed (2026-07-07): red=buried (not IABA) ·
                    // darkblue=occupied (IABA community, needs person labels) ·
                    // lightblue=vacant (open for IABA community → contact link) ·
                    // white=unowned (likely cemetery-available, not IABA's) ·
                    // gray=bohri (adjacent community) · darkgray=other community
                    // (unconfirmed) · green=tree/bench/obstacle
color: "red" | ...  // original diagram color, kept alongside status
owner?: "MERALI, Taha"          // deed holder — published on VACANT plots only
person?: { name, burial? }      // deceased + ISO burial date, on occupied/buried
photos?: string[]   // future: marker photos from survey
```

Privacy scope (owner-approved 2026-07-12): deceased names + burial dates are public;
owner names are public on vacant plots only. The workbook's Notes column (Deeded/AB/
anecdotes) is internal — never export it.

## Docs

- `docs/DESIGN.md` — architecture, imagery/licensing, grid-generator UX, plot detail spec
- `docs/ROADMAP.md` — milestones M1–M6 with acceptance criteria; check here for current phase
- `docs/OPEN-QUESTIONS.md` — unknowns that need the owner or IABA; check before inventing facts

## Conventions

- Don't present invented data (names, statuses, boundaries) as real — mark demo data clearly.
- Keep everything runnable with `npm install && npm run dev`, no API keys or paid services.
- When a decision here changes, update this file and the relevant doc in the same commit.
