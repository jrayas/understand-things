import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>This address doesn't match any page. It may have moved, or there may be a typo.</p>
      <Link to="/" className="tag-btn">Go to the home page</Link>
    </div>
  );
}
