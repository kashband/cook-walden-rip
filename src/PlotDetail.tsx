import { IABA_CONTACT_EMAIL } from "./config";
import { DIAGRAM_COLORS, STATUS_COLORS, STATUS_LABELS } from "./layout";
import type { Plot } from "./plots";

/** Visitor-facing explanation per status (owner-confirmed semantics, 2026-07-07). */
const STATUS_COPY: Record<string, string> = {
  buried: "A burial is present here. This space is not part of the IABA community's section.",
  occupied:
    "This space is used by the IABA community. Name and dates will be added after the marker survey.",
  vacant: "This space is vacant and held for the IABA community.",
  unowned: "This space is not owned by the IABA community.",
  bohri: "This space belongs to the adjacent Bohri community.",
  other: "This space likely belongs to another community (unconfirmed).",
  unusable: "Tree, bench, or other obstacle — not a burial space.",
};

export default function PlotDetail({ plot, onClose }: { plot: Plot; onClose: () => void }) {
  const mailto =
    `mailto:${IABA_CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent(`Plot inquiry: ${plot.id}`)}` +
    `&body=${encodeURIComponent(
      `Assalamu alaikum,\n\nI would like to inquire about plot ${plot.id} ` +
        `(lot ${plot.lot}, space ${plot.space}) in the IABA section of Cook-Walden Capital Parks.\n`,
    )}`;

  return (
    <aside className="plot-panel">
      <button className="close" onClick={onClose} aria-label="Close plot details">
        &times;
      </button>
      <h2>Plot {plot.id}</h2>
      <div className="plot-sub">
        Lot {String(plot.lot).padStart(2, "0")} &middot; Space {plot.space}
      </div>
      <div className="status-badge">
        <span
          className="swatch"
          style={{ background: DIAGRAM_COLORS[STATUS_COLORS[plot.status]] ?? "#fff" }}
        />
        {STATUS_LABELS[plot.status] ?? plot.status}
      </div>
      <p className="plot-copy">{STATUS_COPY[plot.status] ?? "No details for this space yet."}</p>

      {plot.person && (
        <div className="person">
          <strong>{plot.person.name}</strong>
          {(plot.person.dob || plot.person.dod) && (
            <div>
              {plot.person.dob ?? "?"} &ndash; {plot.person.dod ?? "?"}
            </div>
          )}
          {plot.person.notes && <div className="notes">{plot.person.notes}</div>}
        </div>
      )}

      {plot.status === "vacant" && (
        <a className="contact" href={mailto}>
          Contact IABA about this plot
        </a>
      )}

      <p className="disclaimer">
        Demo data — statuses come from the IABA layout diagram; positions are approximate.
      </p>
    </aside>
  );
}
