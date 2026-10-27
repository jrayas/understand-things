import { useSearchParams } from "react-router-dom";
import { pagesList, allTags } from "../pagesList";
import TagFilter from "../components/TagFilter";
import PageCard from "../components/PageCard";

// "all": a page must have every chosen tag (narrows the list).
// "any": a page needs at least one chosen tag (widens the list).
const MATCH = "all";

export default function Home() {
  // Chosen tags live in the address, e.g. #/?tag=tutorial&tag=notes,
  // so filtered lists can be bookmarked, shared and undone with Back.
  const [params, setParams] = useSearchParams();
  const selected = params.getAll("tag");

  const setSelected = (tags) => {
    const next = new URLSearchParams();
    tags.forEach((t) => next.append("tag", t));
    setParams(next);
  };
  const toggle = (tag) =>
    setSelected(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);

  const sorted = [...pagesList].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const visible = sorted.filter((page) => {
    if (!selected.length) return true;
    const tags = page.tags.map((t) => t.toLowerCase());
    return MATCH === "all" ? selected.every((t) => tags.includes(t)) : selected.some((t) => tags.includes(t));
  });

  return (
    <div className="home">
      <h1>All pages</h1>
      <TagFilter tags={allTags()} selected={selected} onToggle={toggle} onClear={() => setSelected([])} total={pagesList.length} />

      <p className="result-count" aria-live="polite">
        {selected.length
          ? `${visible.length} of ${pagesList.length} pages tagged ${selected.map((t) => "#" + t).join(MATCH === "all" ? " and " : " or ")}`
          : `${pagesList.length} page${pagesList.length === 1 ? "" : "s"}`}
      </p>

      {visible.length ? (
        <div className="page-grid">
          {visible.map((page) => (
            <PageCard key={page.path} page={page} onTagClick={toggle} activeTags={selected} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>No pages have all of these tags.</p>
          <button className="tag-btn" onClick={() => setSelected([])}>Show all pages</button>
        </div>
      )}
    </div>
  );
}
