# Roadmap

Status legend: ☐ not started · ◐ in progress · ☑ done

## ☑ M1 — Map shell (2026-07-05)

Vite + React + TS app; Leaflet map with Esri World Imagery, centered on the IABA
section (`30.43730366645736, -97.66220675345387`); section boundary polygon rendered
from `data/section.geojson` (initial boundary eyeballed from imagery is fine).

**Done when:** `npm run dev` shows satellite imagery of the section with a visible
boundary outline, on desktop and phone-sized viewports.

## ☐ M2 — Grid generator

`/editor` dev route per docs/DESIGN.md: origin click, bearing, rows/cols, plot size,
gaps; live regeneration; nudge controls; placeholder IDs; GeoJSON export.

**Done when:** a grid can be visually aligned with actual grave rows in the imagery and
exported as `data/plots.geojson` with stable IDs.

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

Owner walks the section, photographs markers, reconstructs real rows/statuses/names.
Update `plots.geojson` accordingly. Stretch: tap-to-cycle status in the editor so the
survey can be done on a phone standing at the grave.

**Done when:** the demo section of the data reflects reality well enough to show IABA
without embarrassment (see docs/OPEN-QUESTIONS.md re: publishing names).

## ☐ M6 — Polish & deploy

Client-side name search (pan/zoom to result); GitHub Pages deployment; attribution and
"demo data" disclaimers.

**Done when:** a public URL loads the map cold on a phone, search finds a known plot,
and total hosting cost is $0.
