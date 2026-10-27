import { Link, useLocation } from "react-router-dom";
import { pagesList } from "../pagesList";

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const page = pagesList.find((p) => p.path === pathname);
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link to="/">Home</Link></li>
        <li aria-current="page">{page ? page.title : "Page not found"}</li>
      </ol>
    </nav>
  );
}
