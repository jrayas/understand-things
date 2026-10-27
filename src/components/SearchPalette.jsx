import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pagesList, allTags } from "../pagesList";

// Type to search titles, descriptions, tags and keywords.
// Start with # to search tags only; tags open the filtered home page.
export default function SearchPalette({ onClose }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.startsWith("#")) {
      const t = q.slice(1);
      return allTags()
        .filter(([tag]) => tag.includes(t))
        .map(([tag, count]) => ({ kind: "tag", label: `#${tag}`, sub: `${count} page${count === 1 ? "" : "s"}`, go: `/?tag=${encodeURIComponent(tag)}` }));
    }
    const pages = pagesList
      .filter((p) => !q || [p.title, p.description, ...p.tags, ...(p.keywords || [])].join(" ").toLowerCase().includes(q))
      .map((p) => ({ kind: "page", label: p.title, sub: p.description, go: p.path }));
    const tags = q
      ? allTags().filter(([tag]) => tag.includes(q)).map(([tag, count]) => ({ kind: "tag", label: `#${tag}`, sub: `${count} page${count === 1 ? "" : "s"}`, go: `/?tag=${encodeURIComponent(tag)}` }))
      : [];
    return [...pages, ...tags];
  }, [query]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const open = (r) => { navigate(r.go); onClose(); };

  function onKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); open(results[active]); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  }

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette-input"
          type="search"
          placeholder="Search pages, or type # for tags"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          aria-activedescendant={results[active] ? `pr-${active}` : undefined}
        />
        <ul id="palette-results" className="palette-results" role="listbox" ref={listRef}>
          {results.map((r, i) => (
            <li
              key={r.kind + r.go}
              id={`pr-${i}`}
              role="option"
              aria-selected={i === active}
              className="palette-item"
              onMouseEnter={() => setActive(i)}
              onClick={() => open(r)}
            >
              <span className="palette-label">{r.label}</span>
              <span className="palette-sub">{r.sub}</span>
            </li>
          ))}
          {!results.length && <li className="palette-empty">Nothing matches “{query}”. Try another word or a #tag.</li>}
        </ul>
        <p className="palette-hint">↑ ↓ to move · Enter to open · Esc to close</p>
      </div>
    </div>
  );
}
