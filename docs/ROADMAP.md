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

**Rework needed (2026-07-05):** the real layout (data/reference/IABA-Layout.pdf) is
lot-based — ~62 lots of 8×2 spaces with walkways, staggered edges, IDs like `14-B3` —
not uniform lettered rows. The generator must produce that structure (likely driven by
a transcribed lot-arrangement table) instead of a single rows×cols grid.

**Done when:** the generated lots visually align with grave rows in the imagery and
export to `data/plots.geojson` with real IDs.

## ☐ M2.5 — Digitize the layout diagram

Extract per-space status colors from data/reference/IABA-Layout.png with a Python/PIL
script (uniform cells → sample fill color per space; lot numbers transcribed by hand),
producing machine-readable statuses keyed by real plot ID. Blocked on the owner
confirming the 5-color legend (docs/OPEN-QUESTIONS.md).

**Done when:** every space in lots 01–58 has a status from the diagram, spot-checked
against the PDF, merged into `data/plots.geojson`.

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
