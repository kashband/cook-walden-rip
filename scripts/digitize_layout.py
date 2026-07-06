#!/usr/bin/env python3
"""Digitize data/reference/IABA-Layout.png into per-space statuses + geometry.

The layout is ~62 lots of 16 spaces (8 wide x 2 deep: A1-A4,B1-B4 / C1-C4,D1-D4),
each space color-coded. Orange labels sit at each lot's center. Because cells are
uniform, we locate each lot by its label centroid and sample the 16 cell interiors
around it.

Stages:
  labels  - detect orange lot labels, write a debug image with component indices
            (used once to build LABEL_TO_LOT below)
  cells   - sample + classify every space, write a QA overlay image
  export  - write data/reference/layout-spaces.json (statuses + pixel geometry)

Usage: python3 scripts/digitize_layout.py labels|cells|export
"""

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
PNG = ROOT / "data/reference/IABA-Layout.png"
OUT_JSON = ROOT / "data/reference/layout-spaces.json"
DEBUG_DIR = ROOT / "data/reference/debug"

# ---- Tunables (4800px-wide render) --------------------------------------
# Lot pitch measured from label centroid spacing: 560px wide (8 cells),
# 206px tall (2 cells). Labels sit at the lot center.
CELL_W = 70.0
CELL_H = 103.0
# Measured from solid lot borders (see git history): frame center = label + (8, 15).
LABEL_DX = 8.0
LABEL_DY = 15.0

# Legend colors sampled from the render.
PALETTE = {
    "red": (176, 36, 24),
    "darkblue": (79, 113, 190),
    "lightblue": (156, 176, 220),
    "gray": (191, 191, 191),
    "green": (159, 206, 99),
    "white": (255, 255, 255),
}
ORANGE = (233, 113, 50)
TAN = (248, 203, 173)  # walkway fill — must not classify as a status

# Diagram color -> plot status (legend per owner, 2026-07-05).
COLOR_TO_STATUS = {
    "red": "occupied",
    "darkblue": "occupied",
    "lightblue": "reserved",
    "white": "available",
    "gray": "bohri",
    "green": "unusable",
}

SPACES = [  # (space code, col 0..7, row 0..1)
    *[(f"A{i+1}", i, 0) for i in range(4)],
    *[(f"B{i+1}", i + 4, 0) for i in range(4)],
    *[(f"C{i+1}", i, 1) for i in range(4)],
    *[(f"D{i+1}", i + 4, 1) for i in range(4)],
]

# Label centroid (px, from the `labels` stage) -> real lot number, transcribed by
# reading the lot numbers off the diagram. Detected labels are matched to the
# nearest entry. Left group = lots 01-36, right group = 47-62; 37-46 don't exist.
LOT_CENTROIDS: list[tuple[int, int, int]] = [
    (2328, 621, 2), (2891, 620, 1), (3516, 620, 48), (4080, 621, 47),
    (1206, 826, 6), (1766, 825, 5), (2327, 826, 4), (2890, 825, 3), (3519, 827, 50), (4078, 826, 49),
    (646, 1034, 11), (1205, 1032, 10), (1768, 1032, 9), (2326, 1033, 8), (2887, 1034, 7), (3520, 1032, 52), (4078, 1033, 51),
    (645, 1239, 16), (1206, 1239, 15), (1767, 1239, 14), (2327, 1238, 13), (2888, 1239, 12), (3518, 1239, 54), (4078, 1239, 53),
    (645, 1444, 21), (1204, 1444, 20), (1766, 1445, 19), (2328, 1444, 18), (2888, 1446, 17), (3518, 1445, 56), (4078, 1445, 55),
    (646, 1652, 26), (1206, 1651, 25), (1766, 1650, 24), (2327, 1651, 23), (2888, 1651, 22), (3518, 1651, 58), (4078, 1652, 57),
    (646, 1978, 31), (1206, 1981, 30), (1767, 1977, 29), (2326, 1978, 28), (2887, 1978, 27), (3518, 1977, 60), (4078, 1978, 59),
    (645, 2183, 36), (1206, 2186, 35), (1766, 2186, 34), (2327, 2184, 33), (2890, 2184, 32), (3518, 2184, 62), (4079, 2184, 61),
]

# Dashed/unbuilt lots: geometry only partially drawn; statuses not meaningful.
FUTURE_LOTS = {59, 60, 61, 62}

# Partial lots bordered by opaque white/walkway areas that would otherwise
# classify as phantom spaces. Only the listed spaces exist on the diagram.
_WALKWAY_TRUNCATED = {"A1", "A2", "A3", "A4", "B1", "C1", "C2", "C3", "C4", "D1"}
LOT_SPACES: dict[int, set[str]] = {
    1: {"B1", "B2", "B3", "B4", "C2", "C3", "C4", "D1", "D2", "D3", "D4"},
    2: {"C1", "C2", "C3", "C4"},
    4: _WALKWAY_TRUNCATED,
    8: _WALKWAY_TRUNCATED,
    13: _WALKWAY_TRUNCATED,
    18: _WALKWAY_TRUNCATED,
    23: _WALKWAY_TRUNCATED,
}


def nearest_lot(x: float, y: float) -> int | None:
    best, bd = None, 1e9
    for cx, cy, lot in LOT_CENTROIDS:
        d = (cx - x) ** 2 + (cy - y) ** 2
        if d < bd:
            best, bd = lot, d
    return best if bd < 50**2 else None


def load():
    im = np.array(Image.open(PNG).convert("RGBA")).astype(np.int32)
    return im[..., :3], im[..., 3]


def find_labels(rgb, alpha):
    d = np.abs(rgb - np.array(ORANGE)).sum(axis=2)
    mask = (d < 90) & (alpha > 200)
    lab, n = ndimage.label(mask)
    out = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(xs) < 800:  # noise / anti-aliased fragments
            continue
        out.append((float(xs.mean()), float(ys.mean()), len(xs)))
    # reading order: coarse rows (100px bands), then x
    out.sort(key=lambda c: (round(c[1] / 100), c[0]))
    return out


def classify_patch(rgb, alpha, x0, y0, x1, y1):
    """Modal palette color of a cell interior, ignoring text/label/transparent px."""
    patch = rgb[y0:y1, x0:x1].reshape(-1, 3)
    a = alpha[y0:y1, x0:x1].reshape(-1)
    if len(patch) == 0:
        return "absent"
    opaque = a > 200
    if opaque.mean() < 0.5:
        return "absent"
    px = patch[opaque]
    dark = px.max(axis=1) < 110  # black text/grid
    orange = np.abs(px - np.array(ORANGE)).sum(axis=1) < 150
    # per-channel match: warm light grays in "bohri" cells must not count as tan
    tan = (np.abs(px - np.array(TAN)) < 25).all(axis=1)
    px = px[~dark & ~orange & ~tan]
    if len(px) < 0.3 * len(patch):
        return "absent"
    names = list(PALETTE)
    refs = np.array([PALETTE[n] for n in names])
    dists = np.abs(px[:, None, :] - refs[None, :, :]).sum(axis=2)
    nearest = dists.argmin(axis=1)
    ok = dists.min(axis=1) < 180
    if ok.mean() < 0.5:
        return "unknown"
    counts = np.bincount(nearest[ok], minlength=len(names))
    return names[int(counts.argmax())]


def lot_cells(cx, cy):
    """16 (space, x0, y0, x1, y1) cell rects for a lot centered at (cx, cy)."""
    cx += LABEL_DX
    cy += LABEL_DY
    inset = 0.18
    for space, col, row in SPACES:
        x0 = cx + (col - 4) * CELL_W
        y0 = cy + (row - 1) * CELL_H
        yield (
            space,
            int(x0 + CELL_W * inset),
            int(y0 + CELL_H * inset),
            int(x0 + CELL_W * (1 - inset)),
            int(y0 + CELL_H * (1 - inset)),
            (x0, y0, x0 + CELL_W, y0 + CELL_H),
        )


def stage_labels():
    rgb, alpha = load()
    labels = find_labels(rgb, alpha)
    im = Image.open(PNG).convert("RGB")
    draw = ImageDraw.Draw(im)
    for i, (x, y, area) in enumerate(labels):
        draw.ellipse([x - 6, y - 6, x + 6, y + 6], fill="magenta")
        draw.text((x + 10, y - 40), str(i), fill="magenta", font_size=40)
        print(i, round(x), round(y), area)
    DEBUG_DIR.mkdir(exist_ok=True)
    im.save(DEBUG_DIR / "labels.png")
    print(f"{len(labels)} labels -> {DEBUG_DIR / 'labels.png'}")


def stage_cells(export=False):
    rgb, alpha = load()
    labels = find_labels(rgb, alpha)
    im = Image.open(PNG).convert("RGB")
    draw = ImageDraw.Draw(im)
    qa_colors = {**{k: tuple(v) for k, v in PALETTE.items()}, "absent": None, "unknown": (255, 0, 255)}
    records = []
    for x, y, _ in labels:
        lot = nearest_lot(x, y)
        if lot is None:
            print(f"WARNING: unmatched label at {x:.0f},{y:.0f}")
            continue
        allowed = LOT_SPACES.get(lot)
        for space, sx0, sy0, sx1, sy1, rect in lot_cells(x, y):
            if allowed is not None and space not in allowed:
                continue
            color = classify_patch(rgb, alpha, sx0, sy0, sx1, sy1)
            if color != "absent":
                status = "future" if lot in FUTURE_LOTS else COLOR_TO_STATUS.get(color, "unknown")
                records.append(
                    {
                        "lot": lot,
                        "space": space,
                        "id": f"{lot:02d}-{space}",
                        "color": color,
                        "status": status,
                        "rect_px": [round(v, 1) for v in rect],
                    }
                )
            qc = qa_colors[color]
            if qc:
                draw.rectangle([sx0, sy0, sx1, sy1], outline=(255, 0, 255), width=2)
                draw.rectangle([sx0 + 8, sy0 + 8, sx1 - 8, sy1 - 8], fill=qc)
    DEBUG_DIR.mkdir(exist_ok=True)
    im.save(DEBUG_DIR / "cells-qa.png")
    print(f"{len(records)} spaces -> {DEBUG_DIR / 'cells-qa.png'}")
    if export:
        from collections import Counter

        counts = Counter(r["status"] for r in records)
        OUT_JSON.write_text(
            json.dumps(
                {
                    "source": "IABA-Layout.pdf digitized by scripts/digitize_layout.py",
                    "image": "IABA-Layout.png",
                    "image_size": [4800, 3709],
                    "cell_px": [CELL_W, CELL_H],
                    "status_counts": dict(counts),
                    "spaces": sorted(records, key=lambda r: (r["lot"], r["space"])),
                },
                indent=1,
            )
        )
        print(f"wrote {OUT_JSON}")
        print(dict(counts))


if __name__ == "__main__":
    stage = sys.argv[1] if len(sys.argv) > 1 else "labels"
    if stage == "labels":
        stage_labels()
    elif stage == "cells":
        stage_cells()
    elif stage == "export":
        stage_cells(export=True)
    else:
        sys.exit(f"unknown stage {stage}")
