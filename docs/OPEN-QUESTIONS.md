# Open questions

Unknowns that need the project owner or IABA. **Do not invent answers to these** —
build around them (placeholder data, clearly marked) until resolved.

## Layout diagram (data/reference/IABA-Layout.pdf)
- [ ] **Legend meanings** — the diagram color-codes spaces with 5 colors (dark red,
      dark blue, light blue, gray, green) but the legend text isn't extractable from
      the PDF. Owner must state what each color means (occupied / reserved / sold /
      available / blocked…?).
- [ ] Lots 59–62 are drawn dashed — future/unbuilt lots? Lot 58 is partial.
- [ ] Exact rotation: owner says ~120° clockwise aligns the diagram with the ground;
      calibrate precisely in the editor against the 2019 imagery.
- [ ] How current is the diagram (as-of date?), and who maintains the authoritative
      copy — will IABA share updates as plots sell?
- [ ] Physical space dimensions (assumed ~1.2 m × 3.0 m; the diagram has no scale bar).

## Section geometry
- [ ] Exact boundary of the IABA-owned section — we have a center coordinate, not
      edges. Eyeball from imagery for M1; confirm on the ground or from Cook-Walden
      paperwork later.

## Records
- [ ] Which spaces map to which *people* (names/dates for occupied plots) — the layout
      diagram has statuses only; person data still needs records or the field survey.

## Contact & pitch
- [ ] Correct IABA contact (email/phone) for the "Contact IABA about this plot" link.
- [ ] Who at IABA is the audience for the pitch demo, and what would make it land?

## Privacy & propriety
- [ ] Is IABA/the community comfortable publishing deceased names + plot locations on
      a public site? (Chronicle does this, and headstones are public, but get a nod
      before deploying beyond localhost — especially for recent burials.)
- [ ] Any sensitivity about marking specific plots "available for purchase" publicly
      before IABA blesses the project?

## Resolved
(move answered questions here with the answer and date)
- 2026-07-05 — Stack/architecture/scope decisions locked; see CLAUDE.md.
- 2026-07-05 — **A real layout document exists**: owner produced IABA-Layout.pdf
  (committed under data/reference/). Resolves: real numbering scheme (lot 01–62 +
  space A1–D4), total plot count (~992 spaces), layout structure (lot blocks 8×2 with
  walkways, not uniform rows), and per-space status color-coding.
- 2026-07-05 — Row orientation: rows do not align to north; diagram-to-ground rotation
  is ~120° CW per owner (exact bearing to be calibrated in the editor).
