import { lazy } from "react";

// ============================================================
// THE ONLY FILE YOU EDIT WHEN ADDING A PAGE
// 1. Save the new .jsx file in src/pages/
// 2. Copy an entry below and change the details
// ============================================================

export const SITE_NAME = "My site";

export const pagesList = [
  {
    title: "Logseq tutorial",
    path: "/logseq",
    description: "Learn Logseq step by step, from first blocks to writing plugins.",
    tags: ["logseq", "tutorial", "productivity", "notes"],
    keywords: ["journal", "pkm", "second brain", "outliner"], // extra words for search
    date: "2026-10-27",
    component: lazy(() => import("./pages/LogseqTutorial")),
  },

  // {
  //   title: "Habit tracker",
  //   path: "/habits",
  //   description: "Tick off daily habits and see your streaks.",
  //   tags: ["tools", "productivity"],
  //   keywords: ["streak", "routine"],
  //   date: "2026-11-05",
  //   component: lazy(() => import("./pages/HabitTracker")),
  // },
];

// Every tag in use, with how many pages have it, most used first.
export function allTags(pages = pagesList) {
  const counts = {};
  pages.forEach((p) =>
    new Set(p.tags.map((t) => t.toLowerCase())).forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    })
  );
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// Pages updated in the last 14 days get a "New" badge.
export const isNew = (page) =>
  page.date && (Date.now() - new Date(page.date + "T00:00:00")) / 864e5 <= 14;
