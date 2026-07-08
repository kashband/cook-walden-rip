# Roadmap

Status legend: ☐ not started · ◐ in progress · ☑ done

## ☑ M1 — Map shell (2026-07-05)

Vite + React + TS app; Leaflet map with Esri World Imagery, centered on the IABA
section (`30.43730366645736, -97.66220675345387`); section boundary polygon rendered
from `data/section.geojson` (initial boundary eyeballed from imagery is fine).

**Done when:** `npm run dev` shows satellite imagery of the section with a visible
boundary outline, on desktop and phone-sized viewports.

## ☑ M2 — Grid generator (2026-07-07)

`/editor` dev route places the digitized layout with one similarity transform: anchor
lat/lng, rotation, space width/depth in meters (diagram px→m scale); nudge controls;
GeoJSON export. (Parametric generation was made obsolete by M2.5.)

**Done (2026-07-07):** owner aligned the layout on the map (rotation 137° CW,
1.0 m × 3.0 m spaces) and exported `data/plots.geojson` (671 plots); transform params
kept in the file's metadata. Editor defaults now match the calibration.

## ☑ M2.5 — Digitize the layout diagram (2026-07-05)

`scripts/digitize_layout.py` samples every space's fill color from the 4800px render
(lot labels located by color, frames measured from solid borders, partial lots
whitelisted) → `data/reference/layout-spaces.json`: 671 spaces with statuses + pixel
rects. QA overlay verified against the original; zero unclassified cells.
Counts (owner-confirmed statuses, 2026-07-07): 278 unowned / 129 vacant / 100 buried /
64 bohri / 48 other / 30 occupied / 22 unusable.

## ☑ M3 — Plot layer (2026-07-07)

Visitor map renders `plots.geojson` color-coded by status (diagram colors), with an
always-visible legend (status + count) and hover tooltips (ID + status).

**Done:** all seven statuses distinguishable at section zoom; legend matches the data.

## ☑ M4 — Plot detail (2026-07-07)

`#/plot/<id>` routes; detail sidebar (desktop) / bottom sheet (mobile); status badge,
per-status explanation, person info when present, prefilled "Contact IABA" mailto on
**vacant** plots (the community's actual inventory — white "available" spaces turned
out not to be IABA-owned). Contact email is a placeholder pending the real one.

**Done:** clicking any plot flies to it and opens its detail; the URL is shareable
(reload lands on the same plot); a vacant plot's contact link opens a prefilled email.

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
