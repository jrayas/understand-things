import { SITE_NAME } from "../pagesList";

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} {SITE_NAME}</p>
    </footer>
  );
}
