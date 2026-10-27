import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { pagesList } from "./pagesList";

// Routes are built from pagesList, so you never need to edit this file.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        {pagesList.map(({ path, component: Page }) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<p className="loading">Loading…</p>}>
                <Page />
              </Suspense>
            }
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
