# Cook-Walden IABA Cemetery Map

Interactive map of the IABA-owned (Shia mosque) section of Cook-Walden Capital Parks
cemetery, modeled on Chronicle's `.rip` cemetery maps (reference: https://map.chronicle.rip/HIC —
plot polygons over aerial imagery, color-coded by status, click a plot for details).

## Purpose & audience

Started as a **pitch demo for IABA leadership** (v0.1, frozen on branch `release/0.1`,
still served at kashband.github.io/cook-walden-rip). Leadership approved it; we are now
building **v1, the live community site**, embedded at https://iaba-austin.org/cemetery/.
It's a small community tool, not a high-traffic product: favor the **least-effort,
fewest-services** option, and make editing the data easy for a non-technical admin.
Zero hosting cost is still a hard constraint.

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

- **Static site, data in repo files.** Plot data lives in flat files in the repo;
  updates are file edits. (v1 adds an admin login + one tiny save endpoint that edits
  those files for you — see "Going live" below. Still no database.)
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
  Contact email: `abandali@gmail.com` (`src/config.ts`, owner-provided 2026-10-31).

## Going live — v1 (decided 2026-10-31, owner)

Work happens on `launch/v1`; the v1 launch checklist is milestone M8 in
`docs/ROADMAP.md`.

- **Hosting = embed.** The app is hosted on **Cloudflare Pages** (free, builds a
  **private** repo on every push, auto HTTPS). IABA's web admin embeds it with an
  iframe on the WordPress page https://iaba-austin.org/cemetery/ (WP Engine +
  Elementor). Code updates go live automatically, with no re-upload by IABA. No custom
  domain is needed (`cookwalden.rip` is dropped).
- **Data stays in the repo; no database.** Supabase was designed (M7) and then
  **dropped**: free projects pause after about a week without traffic, and it's one more
  service and account to hand off. The records are already public on the map, so they
  don't need a database's access rules; they just need a controlled way to edit them.
- **Admin portal (git-backed):** the admin opens `/admin` on the Cloudflare URL (not
  inside the iframe; logins don't work reliably in embeds), signs in with an emailed
  code (**Cloudflare Access**, free, allow-list of emails), clicks a plot, edits it, and
  saves. A small **Cloudflare Pages Function** commits the updated records file to
  GitHub with a server-side token, and Cloudflare rebuilds the site in about a minute.
  No one runs a manual redeploy. Every edit is a commit, so the history and undo are
  free.
- **Data split (planned):** static, never-edited geometry (polygons + `metadata.params`)
  vs a small `records` file (status, owner, person) that the admin portal edits. The
  client joins the two by `id`. Placing or digitizing new spaces stays a dev-only task.
- **What stays private:** the repo (Cloudflare reads it privately), the GitHub token
  (a Cloudflare secret, never in the bundle), and CW.xlsx (never committed). The
  workbook's internal Notes are out of scope for v1: anything in the records file
  ships to browsers.

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
- `docs/ROADMAP.md` — milestones M1–M8 with acceptance criteria; **M8 = v1 launch
  checklist**; check here for current phase
- `docs/DEPLOY.md` — hosting/setup runbook (Supabase parts are obsolete; being rewritten
  for the git-backed admin)
- `docs/OPEN-QUESTIONS.md` — unknowns that need the owner or IABA; check before inventing facts

## Conventions

- Don't present invented data (names, statuses, boundaries) as real — mark demo data clearly.
- Keep everything runnable with `npm install && npm run dev`, no API keys or paid services.
  (Production-only secrets, like the admin save token, live in Cloudflare; local dev
  must work without them.)
- When a decision here changes, update this file and the relevant doc in the same commit.
