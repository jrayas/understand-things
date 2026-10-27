// The row of tag buttons. It only shows and reports choices;
// the page using it decides what to filter.
export default function TagFilter({ tags, selected, onToggle, onClear, total }) {
  return (
    <div className="tag-filter" role="group" aria-label="Filter pages by tag">
      <button className="tag-btn" aria-pressed={selected.length === 0} onClick={onClear}>
        All <span className="tag-count">{total}</span>
      </button>
      {tags.map(([tag, count]) => (
        <button key={tag} className="tag-btn" aria-pressed={selected.includes(tag)} onClick={() => onToggle(tag)}>
          {tag} <span className="tag-count">{count}</span>
        </button>
      ))}
    </div>
  );
}
