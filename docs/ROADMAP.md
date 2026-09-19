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

## ☑ M5 — Person data (2026-07-12; records import replaced the survey)

IABA's internal records workbook (CW.xlsx) supplied what the field survey was for:
`scripts/import_records.py` merges 35 burials (deceased + burial date) and 125
vacant-plot owners into `plots.geojson`, syncs the five post-PDF status changes, and
adds plot 59-D4. Owner-confirmed name corrections live in the script.

**Done:** every occupied plot shows a person, every vacant plot shows its owner, and
the import is re-runnable against future workbook updates. A field walk is now only
needed for validation/photos (stretch, folded into M6+).

## ☑ M6 — Polish & deploy (2026-07-12)

Client-side search over deceased names / owners / plot IDs (pan/zoom to result);
GitHub Pages deployment via Actions (`.github/workflows/deploy.yml`, Vite
`base: "./"`); attribution and "demo data" disclaimers were in place since M3/M4.

**Done (2026-07-12):** live at **https://kashband.github.io/cook-walden-rip/**
($0 hosting). Search finds known plots; deep links like `#/plot/59-D4` load cold.

One-time setup gotcha: the workflow's `GITHUB_TOKEN` can't create the Pages site
(`configure-pages` with `enablement: true` → "Resource not accessible by
integration"), even on a public repo. The site was created once out-of-band
(`gh api repos/<owner>/<repo>/pages -X POST -f build_type=workflow`); after that
the workflow deploys on every push to `main` with no special enablement flag.

## ◐ M7 — Real launch: private hosting + admin-editable database (2026-09-19)

Team approved the demo; taking it live for real. Full runbook in `docs/DEPLOY.md`.

- **Cloudflare Pages** hosting off a **private** repo (replaces public GitHub Pages);
  fresh domain `cookwalden.rip`.
- **Supabase** as the records database: `plots` table + RLS + filtered `public_plots`
  view (schema `supabase/schema.sql`, seed `supabase/seed.sql` from
  `scripts/export_seed.py`). Admin logs in to edit; public reads only the safe view.
  Retires CW.xlsx as source of truth.
- **Code change (pending):** data layer fetches `public_plots` at load and joins it to a
  static geometry file, instead of baking records into the bundle.

**Done when:** the site loads on `cookwalden.rip` from a private repo, an admin can log
in and change a plot and see it update live, and no private field (internal notes, or an
owner on a non-vacant plot) is reachable by the public key.

**Backend foundation done (2026-09-19):** schema, safe view, RLS, seed generator, and the
DEPLOY runbook committed. Remaining: client refactor + the account/domain setup (owner).
