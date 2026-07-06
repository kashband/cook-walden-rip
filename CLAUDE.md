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
  (+ rendered PNG). ~62 lots of 16 spaces each (A1–A4/B1–B4 over C1–C4/D1–D4, 8 wide ×
  2 deep), color-coded by status. The diagram must be rotated ~120° clockwise to align
  with the ground. Legend meanings + dashed lots 59–62 unconfirmed — see
  docs/OPEN-QUESTIONS.md. Person-level burial records still come from the owner's survey.

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
- **Purchase flow:** available plots show a "Contact IABA" mailto/tel link with the plot
  ID prefilled. No forms, no payments, no e-commerce.

## Stack

Vite + React + TypeScript · Leaflet (`react-leaflet`) · `@turf/turf` for grid math ·
hash routing (`#/plot/A-12`) so plot pages work on a static host.

## Data model

`data/plots.geojson` — FeatureCollection of plot polygons. Feature properties:

```
id: "14-B3"         // real IABA scheme: lot number + space code
lot: 14, space: "B3"
status: "occupied" | "reserved" | "available" | "unknown"
                    // enum provisional: the layout legend has 5 colors, meanings
                    // pending owner confirmation (docs/OPEN-QUESTIONS.md)
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
