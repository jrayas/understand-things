import { Link } from "react-router-dom";
import { isNew } from "../pagesList";

// One card on the home page. Clicking a tag applies that filter.
export default function PageCard({ page, onTagClick, activeTags }) {
  return (
    <article className="page-card">
      <h2 className="page-card-title">
        <Link to={page.path}>{page.title}</Link>
        {isNew(page) && <span className="badge">New</span>}
      </h2>
      <p className="page-card-desc">{page.description}</p>
      <ul className="page-card-tags" aria-label="Tags">
        {page.tags.map((tag) => (
          <li key={tag}>
            <button
              className="tag-chip"
              aria-pressed={activeTags.includes(tag.toLowerCase())}
              onClick={() => onTagClick(tag.toLowerCase())}
            >
              #{tag}
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
