import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { pagesList, SITE_NAME } from "../pagesList";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export default function Navbar({ onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">{SITE_NAME}</NavLink>

        <button className="search-btn" onClick={onSearch} aria-label="Search pages">
          <span>Search</span>
          <kbd>{isMac ? "⌘K" : "Ctrl K"}</kbd>
        </button>

        <button
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <nav id="site-menu" className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          {pagesList.map((p) => (
            <NavLink key={p.path} to={p.path}>{p.title}</NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
