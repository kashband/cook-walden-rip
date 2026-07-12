# Open questions

Unknowns that need the project owner or IABA. **Do not invent answers to these** —
build around them (placeholder data, clearly marked) until resolved.

## Layout diagram & records
- [ ] **Dark gray — which community?** Owner says "probably another community,
      similar to Bohri" (lots 31, 36 and halves of 30/35, 48 spaces). Confirm who,
      so status `other` can get a proper name.
- [ ] Lots 60–62 are drawn dashed — future/unbuilt lots? Lot 58 is partial. (Lot 59
      already has one burial, 59-D4, so the "future" row is at least partly real.)
- [ ] Who maintains the authoritative copy of CW.xlsx — will IABA share updates as
      spaces change hands, so `scripts/import_records.py` can be re-run?
- [ ] First names Zeenat vs "Zeneth" (6C-3) — surname confirmed SHAFIGHI, but the two
      sheets also disagree on the first name; kept `Zeenat` (All sheet).

## Section geometry
- [ ] Exact boundary of the IABA-owned section — we have a center coordinate, not
      edges. Eyeball from imagery for M1; confirm on the ground or from Cook-Walden
      paperwork later. (59-D4 renders right at the eyeballed boundary edge — a good
      spot-check for both.)

## Contact & pitch
- [ ] Correct IABA contact (email/phone) for the "Contact IABA about this plot" link.
- [ ] Who at IABA is the audience for the pitch demo, and what would make it land?

## Privacy & propriety
- [ ] Owner OK'd deceased names + vacant-plot owner names (2026-07-12) for the demo;
      get IABA's own nod before deploying beyond localhost.

## Resolved
(move answered questions here with the answer and date)
- 2026-07-05 — Stack/architecture/scope decisions locked; see CLAUDE.md.
- 2026-07-05 — **A real layout document exists**: owner produced IABA-Layout.pdf
  (committed under data/reference/). Resolves: real numbering scheme (lot 01–62 +
  space A1–D4), total plot count (~992 spaces), layout structure (lot blocks 8×2 with
  walkways, not uniform rows), and per-space status color-coding.
- 2026-07-05 — Row orientation: rows do not align to north; diagram-to-ground rotation
  is ~120° CW per owner (exact bearing to be calibrated in the editor).
- 2026-07-05 — **Legend confirmed by owner**: dark red = occupied (buried), dark blue =
  used, light blue = vacant (held), white = available, gray = Bohri (another community's
  lots), green = tree/bench/unusable. Lot count corrected: 52 lots (01–36, 47–62);
  37–46 don't exist. Digitized: 671 spaces in data/reference/layout-spaces.json
  (278 available / 177 reserved / 130 occupied / 64 bohri / 22 unusable).
- 2026-07-07 — **Status semantics refined by owner**: red = buried, NOT IABA community
  · dark blue = used by IABA community (needs person labels) · light blue = vacant for
  IABA community (the actual inventory — contact link goes here) · white = likely
  cemetery-available but not IABA-owned · light gray = Bohri (adjacent community) ·
  dark gray = probably another community (unconfirmed) · green = obstacles between
  graves. Statuses renamed accordingly: buried/occupied/vacant/unowned/bohri/other/
  unusable. Resolves "Buried vs Used" and (mostly) the dark-gray question.
- 2026-07-07 — **Placement calibrated by owner** in the editor: rotation 137° CW,
  1.0 m × 3.0 m spaces, anchor 30.437269, -97.662204 → data/plots.geojson (M2 done).
  Resolves exact rotation and space dimensions.
- 2026-07-12 — **IABA records workbook (CW.xlsx) obtained and reconciled.** All 159
  member-space IDs map 1:1 to the map's convention (`4A-2` ↔ `04-A2`); 48/48 lots'
  grid colors match the digitization. Resolves:
  - *Vacant 128 vs 129*: our 129 was correct; the workbook shows 125 after four 2025
    burials (15-A4, 15-B2, 24-A1, 28-C3) — PDF legend "128" was a stale tally.
  - *Person data*: 35 burials + 125 vacant-plot owners imported by
    `scripts/import_records.py` (owner-confirmed name corrections inside: Essam
    SHARAFUDDIN is the deceased at 48-A1; SHAFIGHI / Masoomeh / Mohamedali / MOADDEB
    spellings).
  - *"AB" in Notes*: title held in Abbas Bandali's name; actual ownership is the
    Owner column. Ignored per owner.
  - *No open inventory*: every vacant space is member-deeded → no purchase flow;
    vacant plots show their owner instead (see CLAUDE.md).
  - *59-D4*: real burial (MOHAMMADI, Mahmoud, 2025-10-09) in dashed lot 59; added to
    the map as `buried` with the person shown, per owner.
  - *Deceased-name privacy (demo scope)*: OK to publish deceased names and
    vacant-plot owner names for now.
