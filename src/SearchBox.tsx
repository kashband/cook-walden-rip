import { useMemo, useState } from "react";
import { STATUS_LABELS } from "./layout";
import { PLOTS, type Plot } from "./plots";

interface Hit {
  plot: Plot;
  label: string;
  sub: string;
}

/** Substring search over deceased names, owners, and plot IDs (in that rank). */
function findHits(query: string): Hit[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  const ranked: { rank: number; hit: Hit }[] = [];
  for (const p of PLOTS) {
    if (p.person?.name.toLowerCase().includes(needle)) {
      ranked.push({
        rank: 0,
        hit: { plot: p, label: p.person.name, sub: `${p.id} · ${STATUS_LABELS[p.status]}` },
      });
    } else if (p.owner?.toLowerCase().includes(needle)) {
      ranked.push({
        rank: 1,
        hit: { plot: p, label: p.owner, sub: `${p.id} · plot owner` },
      });
    } else if (p.id.toLowerCase().includes(needle)) {
      ranked.push({
        rank: 2,
        hit: { plot: p, label: `Plot ${p.id}`, sub: STATUS_LABELS[p.status] ?? p.status },
      });
    }
  }
  ranked.sort((a, b) => a.rank - b.rank || a.hit.plot.id.localeCompare(b.hit.plot.id));
  return ranked.slice(0, 8).map((r) => r.hit);
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => findHits(query), [query]);

  const select = (plot: Plot) => {
    setQuery("");
    window.location.hash = `#/plot/${encodeURIComponent(plot.id)}`;
  };

  return (
    <div className="search-box">
      <input
        type="search"
        placeholder="Search name or plot ID…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hits.length) select(hits[0].plot);
          if (e.key === "Escape") setQuery("");
        }}
        aria-label="Search plots by name or ID"
      />
      {query.trim().length >= 2 && (
        <ul className="search-results">
          {hits.map((h) => (
            <li key={h.plot.id}>
              <button onClick={() => select(h.plot)}>
                <strong>{h.label}</strong>
                <span>{h.sub}</span>
              </button>
            </li>
          ))}
          {hits.length === 0 && <li className="empty">No matches</li>}
        </ul>
      )}
    </div>
  );
}
