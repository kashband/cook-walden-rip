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

## ✕ M7 — Supabase backend (2026-09-19; superseded 2026-10-31)

Designed a Supabase records database (`supabase/schema.sql`: `plots` table, RLS, filtered
`public_plots` view; seed from `scripts/export_seed.py`) plus Cloudflare hosting on a
fresh `cookwalden.rip` domain. **Dropped before it was wired up.** Free Supabase projects
pause after about a week without traffic, it added a second service and account to hand
off, and the data is public anyway. Replaced by the git-backed admin in M8. The design
is preserved on `release/0.1`.

## ◐ M8 — v1 launch: embedded on iaba-austin.org + admin portal (2026-10-31)

v0.1 demo frozen on branch `release/0.1`; v1 work happens on `launch/v1`. Architecture
is in CLAUDE.md under "Going live — v1". **Done when:** the map loads embedded at
https://iaba-austin.org/cemetery/ on phone and desktop; an allow-listed admin can sign
in, edit a plot, and see it live within ~2 minutes; a non-admin can't reach `/admin` or
the save endpoint; and the repo is private.

### Decisions & content
- [x] Hosting: embed (iframe) from Cloudflare Pages on the WordPress page
- [x] Data: stays in repo files, edited through a git-backed admin portal (no Supabase)
- [x] Contact email: `abandali@gmail.com`
- [x] Freeze the demo as `release/0.1`
- [ ] IABA leadership okay to publish names/dates on IABA's own site (owner considers
      the records public already; get the formal nod)
- [ ] Admin allow-list: which emails may sign in (start: abandali@gmail.com?)
- [ ] Launch wording: site title, banner text, replacement for the "Demo" disclaimer

### Code (dev)
- [x] Contact email in `src/config.ts`
- [ ] Remove "Demo" banner/disclaimers; launch copy in the header and detail panel
- [ ] Gate the `#/editor` placement tool to dev builds (today only its link is hidden)
- [ ] Split data: static geometry file + small editable `records` file, joined by `id`
- [ ] Admin portal at `/admin`: same map; clicking a plot opens an edit form (status,
      deceased name, burial date, owner) with validation; "Saved — live in ~1 min"
- [ ] Save endpoint: Cloudflare Pages Function commits the records file to GitHub
      (server-side token; rejects stale saves via the file's SHA)
- [ ] Embed polish: fits the iframe, works on phones, "Open full map" link, page title/meta
- [ ] Remove the Supabase scaffolding (`supabase/`, `scripts/export_seed.py`), kept on
      `release/0.1`
- [ ] Bump `package.json` to 1.0.0

### Accounts & setup (owner, with a step-by-step guide)
- [ ] Cloudflare account → Pages project connected to this repo
- [ ] Cloudflare Access policy protecting `/admin` and the save endpoint (email code login)
- [ ] GitHub token (this repo only, contents read/write) stored as a Cloudflare secret;
      calendar reminder to renew before it expires
- [ ] Send IABA's web admin the iframe snippet for `/cemetery/`
- [ ] After v1 is live: make the repo private, retire the GitHub Pages workflow and turn
      off Pages (until then, every push to `main` redeploys the github.io demo); optionally
      transfer the repo to an IABA GitHub org

### Docs
- [ ] Rewrite `docs/DEPLOY.md` for this setup (Cloudflare Pages + Access + token)
- [ ] One-page "How to edit the cemetery map" guide for the admin
- [ ] Remove the old Supabase guidance; update DESIGN.md (admin portal, embed)

### Verify before announcing
- [ ] Embedded map loads at iaba-austin.org/cemetery/ (desktop + phone), search works
- [ ] Admin edit → visible on the embedded page within ~2 minutes
- [ ] Signed-out visitor gets blocked at `/admin` and at the save endpoint
- [ ] Undo: reverting an edit's commit restores the previous data
