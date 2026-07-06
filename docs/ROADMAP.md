# Roadmap

Status legend: ☐ not started · ◐ in progress · ☑ done

## ☑ M1 — Map shell (2026-07-05)

Vite + React + TS app; Leaflet map with Esri World Imagery, centered on the IABA
section (`30.43730366645736, -97.66220675345387`); section boundary polygon rendered
from `data/section.geojson` (initial boundary eyeballed from imagery is fine).

**Done when:** `npm run dev` shows satellite imagery of the section with a visible
boundary outline, on desktop and phone-sized viewports.

## ◐ M2 — Grid generator (editor built 2026-07-05; lot-based rework + alignment pending)

`/editor` dev route per docs/DESIGN.md: origin click, bearing, plot size, gaps; live
regeneration; nudge controls; GeoJSON export.

**Rework (2026-07-05):** the real layout is lot-based, and M2.5 produced exact
per-space pixel geometry — so parametric generation is obsolete. Instead, the editor
places the whole digitized layout with one similarity transform: anchor lat/lng,
rotation (~120° CW per owner), and space width/depth in meters (diagram px→m scale).

**Done when:** the transformed layout visually aligns with grave rows in the imagery
and exports to `data/plots.geojson` with real IDs + statuses.

## ☑ M2.5 — Digitize the layout diagram (2026-07-05)

`scripts/digitize_layout.py` samples every space's fill color from the 4800px render
(lot labels located by color, frames measured from solid borders, partial lots
whitelisted) → `data/reference/layout-spaces.json`: 671 spaces with statuses + pixel
rects. QA overlay verified against the original; zero unclassified cells.
Counts: 278 available / 177 reserved / 130 occupied / 64 bohri / 22 unusable.

## ☐ M3 — Plot layer

Visitor map renders `plots.geojson` color-coded by status, with legend and hover
tooltips (ID + name). Seed the file with plausible demo statuses, clearly fake names.

**Done when:** all four statuses are visibly distinguishable at section zoom and the
legend matches.

## ☐ M4 — Plot detail

`#/plot/<id>` routes; detail panel (desktop sidebar / mobile bottom sheet); status
badge, person info, prefilled "Contact IABA" mailto for available plots.

**Done when:** clicking any plot opens its detail, the URL is shareable (reload lands
on the same plot), and an available plot's contact link opens a prefilled email.

## ☐ M5 — Survey pass (field work + data entry)

Owner walks the section to verify the digitized layout against the ground and collect
person data (names/dates from markers) for occupied plots. Update `plots.geojson`
accordingly. Stretch: tap-to-cycle status in the editor so the survey can be done on a
phone standing at the grave.

**Done when:** the demo section of the data reflects reality well enough to show IABA
without embarrassment (see docs/OPEN-QUESTIONS.md re: publishing names).

## ☐ M6 — Polish & deploy

Client-side name search (pan/zoom to result); GitHub Pages deployment; attribution and
"demo data" disclaimers.

**Done when:** a public URL loads the map cold on a phone, search finds a known plot,
and total hosting cost is $0.
