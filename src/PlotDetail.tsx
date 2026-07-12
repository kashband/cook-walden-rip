import { IABA_CONTACT_EMAIL } from "./config";
import { DIAGRAM_COLORS, STATUS_COLORS, STATUS_LABELS } from "./layout";
import type { Plot } from "./plots";

/** Visitor-facing explanation per status (owner-confirmed, 2026-07-07/12). */
const STATUS_COPY: Record<string, string> = {
  buried: "A burial is present here.",
  occupied: "This space is used by the IABA community.",
  vacant:
    "This space is vacant and owned by a member of the IABA community. " +
    "If you are interested in it, IABA can connect you with the owner.",
  unowned: "This space is not owned by the IABA community.",
  bohri: "This space belongs to the adjacent Bohri community.",
  other: "This space likely belongs to another community (unconfirmed).",
  unusable: "Tree, bench, or other obstacle — not a burial space.",
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function PlotDetail({ plot, onClose }: { plot: Plot; onClose: () => void }) {
  const mailto =
    `mailto:${IABA_CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent(`Plot inquiry: ${plot.id}`)}` +
    `&body=${encodeURIComponent(
      `Assalamu alaikum,\n\nI would like to inquire about plot ${plot.id} ` +
        `(lot ${plot.lot}, space ${plot.space}) in the IABA section of Cook-Walden Capital Parks.\n`,
    )}`;

  const copy =
    plot.status === "buried" && !plot.person
      ? "A burial is present here. It is not in the IABA community's records."
      : STATUS_COPY[plot.status] ?? "No details for this space yet.";

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
      <p className="plot-copy">{copy}</p>

      {plot.person && (
        <div className="person">
          <strong>{plot.person.name}</strong>
          {plot.person.burial && <div>Buried {formatDate(plot.person.burial)}</div>}
        </div>
      )}

      {plot.owner && (
        <div className="person">
          <div className="owner-label">Owned by</div>
          <strong>{plot.owner}</strong>
        </div>
      )}

      {plot.status === "vacant" && (
        <a className="contact" href={mailto}>
          Contact IABA about this plot
        </a>
      )}

      <p className="disclaimer">
        Demo — statuses, owners, and burial records come from IABA&rsquo;s internal records
        (2026); positions are approximate.
      </p>
    </aside>
  );
}
