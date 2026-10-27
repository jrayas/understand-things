import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";
import SearchPalette from "./SearchPalette";
import { pagesList, SITE_NAME } from "../pagesList";

export default function Layout() {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // Tab title and scroll position update on every page change.
  useEffect(() => {
    const page = pagesList.find((p) => p.path === pathname);
    document.title = page ? `${page.title} | ${SITE_NAME}` : pathname === "/" ? SITE_NAME : `Page not found | ${SITE_NAME}`;
    window.scrollTo(0, 0);
  }, [pathname]);

  // Cmd+K (Mac) or Ctrl+K (Windows) opens the search from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="site">
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>
        Skip to content
      </a>
      <Navbar onSearch={() => setSearchOpen(true)} />
      <main id="main" tabIndex={-1} className="site-main">
        {pathname !== "/" && <Breadcrumbs />}
        <Outlet />
      </main>
      <Footer />
      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
