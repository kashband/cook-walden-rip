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
- No official plot records in hand; ground truth comes from the owner physically
  surveying the section (see docs/OPEN-QUESTIONS.md)

## Locked decisions (2026-07-05, with project owner)

- **Static site, no backend, no auth.** Plot data lives in flat files in the repo;
  updates are file edits.
- **Geo-accurate map:** Leaflet over Esri World Imagery satellite tiles; plots are
  GeoJSON polygons at real lat/lng. (Google tiles are license-prohibited for this use.)
- **Grid authoring:** a dev-only in-app grid generator/editor (`/editor` route) that
  parametrically generates the plot grid and exports GeoJSON — never hand-draw plots.
- **Labeling:** placeholder scheme (`A-1`, `A-2`, … per row) until Cook-Walden's real
  numbering is known; plot IDs must be swappable.
- **Purchase flow:** available plots show a "Contact IABA" mailto/tel link with the plot
  ID prefilled. No forms, no payments, no e-commerce.

## Stack

Vite + React + TypeScript · Leaflet (`react-leaflet`) · `@turf/turf` for grid math ·
hash routing (`#/plot/A-12`) so plot pages work on a static host.

## Data model

`data/plots.geojson` — FeatureCollection of plot polygons. Feature properties:

```
id: "A-12"          // placeholder; swappable for real Cook-Walden IDs
row: "A", space: 12
status: "occupied" | "reserved" | "available" | "unknown"
person?: { name, dob?, dod?, notes? }   // only when occupied/reserved
photos?: string[]   // future: marker photos from survey
```

## Docs

- `docs/DESIGN.md` — architecture, imagery/licensing, grid-generator UX, plot detail spec
- `docs/ROADMAP.md` — milestones M1–M6 with acceptance criteria; check here for current phase
- `docs/OPEN-QUESTIONS.md` — unknowns that need the owner or IABA; check before inventing facts

## Conventions

- Don't present invented data (names, statuses, boundaries) as real — mark demo data clearly.
- Keep everything runnable with `npm install && npm run dev`, no API keys or paid services.
- When a decision here changes, update this file and the relevant doc in the same commit.
