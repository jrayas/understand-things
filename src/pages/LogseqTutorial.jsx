import { useState, useEffect, useRef, useMemo } from "react";

// Logseq tutorial (beginner, intermediate, advanced and expert) — a self-contained JSX island.
// Click-through steps, keyboard arrows supported, light/dark aware.

const STEPS = [
  {
    topic: "Blocks, pages & journals",
    title: "Everything is a block",
    body: "Logseq is an outliner. Every line you type is a block with a bullet beside it. Press Enter for a new block, Tab to indent it under the one above, and Shift+Tab to move it back out.",
    keys: [["Enter", "new block"], ["Tab", "indent"], ["Shift+Tab", "outdent"]],
    example: [
      { d: 0, t: "Holiday planning" },
      { d: 1, t: "Book flights" },
      { d: 1, t: "Find a hotel" },
      { d: 2, t: "Near the old town, under £120 a night" },
    ],
    tip: "Click a bullet to zoom into that block and hide everything else.",
  },
  {
    topic: "Blocks, pages & journals",
    title: "Start in today's journal",
    body: "When you open Logseq you land on today's journal page. It's the best place to write anything — meeting notes, ideas, tasks — without first deciding where it belongs. Older days sit underneath as you scroll.",
    example: [
      { d: 0, t: "Oct 27th, 2026", head: true },
      { d: 1, t: "Called the dentist — appointment on Friday" },
      { d: 1, t: "Idea: weekly review every Sunday evening" },
    ],
    tip: "Just write. Links (next steps) will organise it for you later.",
  },
  {
    topic: "Blocks, pages & journals",
    title: "Create a page",
    body: "A page is simply a named collection of blocks. Use the search (Ctrl/Cmd+K), type a name that doesn't exist yet, and choose to create it. Pages are stored as plain Markdown files on your computer.",
    keys: [["Ctrl/Cmd+K", "search or create"]],
    example: [
      { d: 0, t: "Reading list", head: true },
      { d: 1, t: "Atomic Habits" },
      { d: 1, t: "The Design of Everyday Things" },
    ],
    tip: "Your notes live in a folder you choose, so they're yours — no account needed.",
  },
  {
    topic: "Blocks, pages & journals",
    title: "Turn blocks into tasks",
    body: "Start a block with TODO and it becomes a checkbox. Ctrl/Cmd+Enter cycles it through TODO → DOING → DONE. You can also add dates with /scheduled or /deadline.",
    keys: [["Ctrl/Cmd+Enter", "cycle task state"]],
    example: [
      { d: 0, t: "TODO Renew passport", task: "todo" },
      { d: 0, t: "DOING Draft the quarterly report", task: "doing" },
      { d: 0, t: "DONE Pay the electricity bill", task: "done" },
    ],
  },
  {
    topic: "Links, tags & graph view",
    title: "Link pages with [[ ]]",
    body: "Wrap any word or phrase in double square brackets to link it to a page of that name. If the page doesn't exist, Logseq creates it the moment you click it.",
    keys: [["[[", "start a link"]],
    example: [
      { d: 0, t: "Lunch with [[Priya]] about the [[Website redesign]]" },
    ],
    tip: "Link generously. A link costs nothing and makes notes far easier to find.",
  },
  {
    topic: "Links, tags & graph view",
    title: "Tags are links too",
    body: "#tag does exactly the same as [[tag]] — it links to a page. Use #[[two words]] for multi-word tags. Tags tend to suit categories, while [[ ]] reads better inside a sentence.",
    example: [
      { d: 0, t: "Try the sourdough recipe at the weekend #cooking #[[to try]]" },
    ],
  },
  {
    topic: "Links, tags & graph view",
    title: "Find it all in backlinks",
    body: "Open any page and scroll to the bottom: the Linked References section lists every block anywhere that links to it. This is how a journal entry from months ago shows up on the right page automatically.",
    example: [
      { d: 0, t: "Priya", head: true },
      { d: 1, t: "Linked references", muted: true },
      { d: 2, t: "Oct 27th — Lunch with Priya about the Website redesign" },
      { d: 2, t: "Oct 12th — Send Priya the draft budget" },
    ],
    tip: "Unlinked references show mentions you haven't linked yet — one click links them.",
  },
  {
    topic: "Links, tags & graph view",
    title: "See the bigger picture",
    body: "Open Graph view from the left sidebar to see every page as a dot and every link as a line. Clusters reveal themes you didn't plan. Each page also has its own small graph in the right sidebar.",
    graph: true,
  },
  {
    topic: "Queries, templates & plugins",
    title: "Ask questions with queries",
    body: "A query collects matching blocks from your whole graph. Type {{query }} with a condition inside. Simple queries combine with and, or and not.",
    example: [
      { d: 0, t: "{{query (and (task TODO DOING) [[Website redesign]])}}", code: true },
      { d: 1, t: "→ every open task linked to Website redesign", muted: true },
    ],
    tip: "Start small: {{query (task TODO)}} lists all your to-dos in one place.",
  },
  {
    topic: "Queries, templates & plugins",
    title: "Reuse structure with templates",
    body: "Write a block you'd like to reuse, right-click its bullet and choose Make a template. Later, type /template in any block and pick it to insert a fresh copy.",
    keys: [["/template", "insert a template"]],
    example: [
      { d: 0, t: "Meeting notes", muted: true },
      { d: 1, t: "Attendees::" },
      { d: 1, t: "Agenda" },
      { d: 1, t: "Actions" },
    ],
  },
  {
    topic: "Queries, templates & plugins",
    title: "Extend with plugins and themes",
    body: "Go to Settings → Features and turn on Plugins. A Marketplace option then appears in the top-right menu, where you can install plugins (calendars, extra shortcuts) and themes in one click.",
    tip: "Add plugins one at a time. If something misbehaves, you'll know which to disable.",
  },
  {
    topic: "You're ready",
    title: "Your first week",
    body: "Write in the journal every day, link people and projects as you go, and mark actions with TODO. At the end of the week, open a project page and read its backlinks — that's when Logseq clicks.",
    done: true,
  },
];


// What each step asks the learner to try, and how we know they've done it.
const PRACTICE = [
  { ask: "Type something, press Enter, type again, then press Tab to indent it.", ok: (b) => b.some((x) => x.d > 0 && x.t.trim()) },
  { ask: "Write anything that's on your mind today.", ok: (b) => b.some((x) => x.t.trim().length > 3) },
  { ask: "Give your page a first block, then indent a second block under it.", ok: (b) => b.length > 1 && b.some((x) => x.d > 0 && x.t.trim()) },
  { ask: "Type TODO Buy milk, then press Ctrl/Cmd+Enter until it says DONE — or tick the box.", ok: (b) => b.some((x) => /^DONE\s/.test(x.t)) },
  { ask: "Mention a person or project in [[double brackets]]. Click away to see it become a link.", ok: (b) => b.some((x) => /\[\[.+?\]\]/.test(x.t)) },
  { ask: "Add a #tag to a block, e.g. Bake bread #cooking.", ok: (b) => b.some((x) => /#\w/.test(x.t)) },
  { ask: "Link the same page from two different blocks and watch its backlinks appear.", ok: (b) => Object.values(backlinks(b)).some((v) => v.length > 1), show: "backlinks" },
  { ask: "Link at least two pages. The graph below draws itself from what you type.", ok: (b) => pagesIn(b).length >= 2, show: "graph" },
  { ask: "Add a couple of TODO blocks, then a block containing {{query (task TODO)}}.", ok: (b) => b.some((x) => parseQuery(x.t) && runQuery(x, b).length > 0) },
  { ask: "Type /template in an empty block and press Enter.", ok: (b) => b.some((x) => x.t.startsWith("Attendees::")) },
  { ask: "Nothing to type here — but the sandbox is yours to play with.", ok: () => true },
  { ask: "Free sandbox: try everything you've learnt in one place.", ok: (b) => b.length > 2 },
];


// ================= INTERMEDIATE =================
const INTER_STEPS = [
  { topic: "Properties & aliases", title: "Add properties to a block",
    body: "Properties are key:: value pairs that describe a block or page — like type, author or status. Put them on an indented line under the block. They make your notes searchable by meaning, not just words.",
    keys: [["key:: value", "add a property"]],
    example: [{ d: 0, t: "The Hobbit" }, { d: 1, t: "type:: book", prop: true }, { d: 1, t: "author:: [[J. R. R. Tolkien]]", prop: true }],
    tip: "Property values can be links too, so author:: [[Tolkien]] puts the book on Tolkien's page." },
  { topic: "Properties & aliases", title: "Give a page nicknames with alias::",
    body: "Add alias:: on a page's first block and every link to the nickname counts as a link to that page. Handy for people (Bob → Robert Smith) or abbreviations (ML → Machine learning).",
    example: [{ d: 0, t: "Robert Smith", head: true }, { d: 1, t: "alias:: Bob, Rob", prop: true }],
    tip: "Separate several aliases with commas." },
  { topic: "Block references & embeds", title: "Reference a block with (( ))",
    body: "Every block can be referenced elsewhere. Type (( and search for a block, and its live text appears inline. Edit the original and every reference updates. In the practice box, blocks are numbered so you can type ((1)).",
    keys: [["((", "search blocks to reference"]],
    tip: "Right-click a bullet → Copy block ref to get its reference quickly." },
  { topic: "Block references & embeds", title: "Embed a block or page",
    body: "A reference shows one line; an embed shows the block with all its children, and you can edit them in place. Use {{embed ((block))}} for a block or {{embed [[Page]]}} for a whole page.",
    example: [{ d: 0, t: "{{embed [[Packing list]]}}", code: true }],
    tip: "Embeds are great for a dashboard page that pulls in the lists you use every day." },
  { topic: "Advanced queries & scheduling", title: "Schedules and deadlines",
    body: "Type /scheduled or /deadline on a task to attach a date. Logseq then shows it in today's journal when it's due. In the practice box you can simply type SCHEDULED or DEADLINE followed by a date.",
    keys: [["/scheduled", "pick a start date"], ["/deadline", "pick a due date"]],
    example: [{ d: 0, t: "TODO Renew car insurance", task: "todo" }, { d: 1, t: "DEADLINE: <2026-11-03 Tue>", muted: true }] },
  { topic: "Advanced queries & scheduling", title: "Query by property",
    body: "Once blocks have properties you can gather them: {{query (property type book)}} lists every book in your graph, wherever you wrote it.",
    example: [{ d: 0, t: "{{query (property type book)}}", code: true }] },
  { topic: "Advanced queries & scheduling", title: "Combine conditions",
    body: "Join filters with and, or and not. (and (task TODO) [[Priya]]) finds open tasks about Priya; (not [[Archive]]) leaves archived things out. Queries refresh by themselves as you write.",
    example: [{ d: 0, t: "{{query (and (task TODO DOING) [[Priya]])}}", code: true }],
    tip: "Logseq also has advanced Datalog queries for the truly ambitious — simple ones cover most needs." },
  { topic: "Namespaces, flashcards & whiteboards", title: "Organise with namespaces",
    body: "A slash in a page name creates a hierarchy: [[Work/Projects]] and [[Work/Meetings]] both sit under Work. The parent page lists its children automatically.",
    example: [{ d: 0, t: "Planning call — see [[Work/Projects]] and [[Work/Meetings]]" }] },
  { topic: "Namespaces, flashcards & whiteboards", title: "Learn with flashcards",
    body: "Tag a block #card and its child blocks become the answer. Open Flashcards from the left sidebar and Logseq quizzes you using spaced repetition, showing hard cards more often.",
    example: [{ d: 0, t: "What is the capital of Australia? #card" }, { d: 1, t: "Canberra" }] },
  { topic: "Namespaces, flashcards & whiteboards", title: "Think visually on whiteboards",
    body: "Whiteboards are an infinite canvas. Drag blocks and pages onto them, draw arrows and shapes, and arrange ideas spatially. Everything stays linked to your notes. Create one from Whiteboards in the left sidebar.",
    tip: "Shift-drag a block from the sidebar onto a whiteboard to place it." },
  { topic: "You're ready", title: "Build your own system",
    body: "You now know the tools power users rely on. Try a small dashboard page: an embed of your reading list, a query of open tasks, and a link to a flashcard deck. Grow it a little each week.",
    done: true },
];

const INTER_PRACTICE = [
  { ask: "Indent under Atomic Habits and type type:: book.", seed: [["Atomic Habits", 0], ["", 1]], ok: (b) => b.some((x) => /^type::\s*\S/.test(x.t)) },
  { ask: "Add alias:: Bob, then write a block that links to [[Bob]].", page: "Robert Smith", show: "alias", seed: [["", 0]],
    ok: (b) => { const a = aliasesOf(b); return a.length > 0 && b.some((x) => linksOf(x.t).some((l) => a.includes(l))); } },
  { ask: "In block 2, type ((1)) and click away to see block 1 appear.", numbers: true, seed: [["Bananas are berries, but strawberries aren't", 0], ["", 0]],
    ok: (b) => b.some((x, i) => [...x.t.matchAll(/\(\((\d+)\)\)/g)].some((m) => Number(m[1]) - 1 !== i && b[Number(m[1]) - 1]?.t)) },
  { ask: "In block 4, type {{embed ((1))}} to embed the whole packing list.", numbers: true, seed: [["Packing list", 0], ["Passport", 1], ["Charger", 1], ["", 0]],
    ok: (b) => b.some((x) => { const m = x.t.match(/\{\{embed \(\((\d+)\)\)\}\}/); return m && b[Number(m[1]) - 1]; }) },
  { ask: "Type TODO Pay rent DEADLINE 2026-11-01 (or any date).", show: "agenda", seed: [["", 0]], ok: (b) => b.some((x) => stateOf(x.t) && dateOf(x.t)) },
  { ask: "In the last block, type {{query (property type book)}}.", seed: [["Atomic Habits", 0], ["type:: book", 1], ["Dune", 0], ["type:: novel", 1], ["Sapiens", 0], ["type:: book", 1], ["", 0]],
    ok: (b) => b.some((x) => parseQuery(x.t)?.props.length && runQuery(x, b).length > 0) },
  { ask: "Type {{query (and (task TODO) [[Priya]])}} — only one task should match.", seed: [["TODO Email [[Priya]] the agenda", 0], ["TODO Book the dentist", 0], ["DONE Send [[Priya]] the budget", 0], ["", 0]],
    ok: (b) => b.some((x) => { const q = parseQuery(x.t); return q && q.states && q.pages.length && runQuery(x, b).length > 0; }) },
  { ask: "Link two pages that share a parent, e.g. [[Work/Projects]] and [[Work/Meetings]].", show: "ns", seed: [["", 0]],
    ok: (b) => Object.values(nsTree(b)).some((kids) => kids.length >= 2) },
  { ask: "Type a question ending in #card, press Enter, Tab, then type the answer. Review it below.", show: "cards", seed: [["", 0]],
    ok: (b) => cardsOf(b).some((c) => c.answer.length) },
  { ask: "Write a few ideas, then drag the notes around the board below.", show: "board", seed: [["", 0]], ok: (b) => b.filter((x) => x.t.trim()).length >= 2 },
  { ask: "Free sandbox: properties, refs, dates, queries — mix them all.", numbers: true, show: "agenda", seed: [["", 0]], ok: (b) => b.length > 2 },
];

// ---------- intermediate helpers ----------
const PROP = /^([\w-]+)::\s*(.*)$/;
function propsOf(blocks) {
  const out = {};
  blocks.forEach((b, i) => {
    const m = b.t.match(PROP);
    if (!m) return;
    for (let j = i - 1; j >= 0; j--) if (blocks[j].d < b.d) {
      (out[blocks[j].id] ||= {})[m[1].toLowerCase()] = m[2].trim();
      break;
    }
  });
  return out;
}
const aliasesOf = (blocks) => blocks.flatMap((b) => { const m = b.t.match(/^alias::\s*(.+)$/i); return m ? m[1].split(",").map((s) => s.trim()).filter(Boolean) : []; });
const dateOf = (t) => { const m = t.match(/(SCHEDULED|DEADLINE):?\s*<?(\d{4}-\d{2}-\d{2})[^>\s]*>?/); return m ? { kind: m[1], date: m[2], raw: m[0] } : null; };
function daysAway(iso) {
  const d = new Date(iso + "T00:00:00"), n = new Date(); n.setHours(0, 0, 0, 0);
  const diff = Math.round((d - n) / 864e5);
  return diff === 0 ? "today" : diff === 1 ? "tomorrow" : diff === -1 ? "yesterday" : diff > 0 ? `in ${diff} days` : `${-diff} days ago`;
}
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
function nsTree(blocks) {
  const tree = {};
  pagesIn(blocks).filter((p) => p.includes("/")).forEach((p) => { const [root, ...rest] = p.split("/"); (tree[root] ||= []).push(rest.join("/")); });
  return tree;
}
function cardsOf(blocks) {
  return blocks.map((b, i) => {
    if (!/#card\b/.test(b.t)) return null;
    const answer = [];
    for (let j = i + 1; j < blocks.length && blocks[j].d > b.d; j++) if (blocks[j].t.trim()) answer.push(blocks[j].t);
    return { id: b.id, q: b.t.replace(/#card\b/, "").trim(), answer };
  }).filter(Boolean);
}


// ================= ADVANCED =================
const ADV_STEPS = [
  { topic: "Advanced Datalog queries", title: "Meet the Datalog query",
    body: "Simple queries cover a lot, but advanced queries talk to Logseq's database directly using Datalog. They live between #+BEGIN_QUERY and #+END_QUERY. :find says what to return, and each line in :where is a condition a block must meet.",
    example: [
      { d: 0, t: "#+BEGIN_QUERY", code: true },
      { d: 0, t: '{:title "Open tasks"', code: true },
      { d: 0, t: ' :query [:find (pull ?b [*]) :where [?b :block/marker ?m] [(contains? #{"TODO"} ?m)]]}', code: true },
      { d: 0, t: "#+END_QUERY", code: true },
    ],
    tip: "Read ?b as 'some block' and ?m as 'its task marker'. Variables starting with ? get matched for you." },
  { topic: "Advanced Datalog queries", title: "Join blocks to pages",
    body: "Blocks point to the pages they link via :block/refs, and every page has a lowercase :block/name. Chaining two conditions on the same ?p variable joins them — this is what makes Datalog powerful.",
    example: [{ d: 0, t: '[?b :block/refs ?p] [?p :block/name "priya"]', code: true }] },
  { topic: "Advanced Datalog queries", title: "Shape the results",
    body: ":result-transform runs a function over the results before they're shown — sorting by priority, filtering, or limiting. Add :collapsed? true to keep a long query folded until you need it.",
    example: [{ d: 0, t: ':result-transform (fn [r] (sort-by (fn [b] (get b :block/priority "Z")) r))', code: true }],
    tip: "Copy queries from the Logseq docs and community forum, then tweak one line at a time." },
  { topic: "Custom CSS, themes & config.edn", title: "Restyle Logseq with custom.css",
    body: "Settings → General → Custom theme → Edit custom.css opens a stylesheet that loads on top of Logseq. Themes from the Marketplace are just bigger versions of this file, so you can override any of them.",
    keys: [["Settings → General", "edit custom.css"]],
    tip: "Right-click → Inspect (after enabling developer mode) shows the class name of anything you want to restyle." },
  { topic: "Custom CSS, themes & config.edn", title: "Tune behaviour with config.edn",
    body: "Settings → Edit config.edn opens Logseq's main configuration file, written in EDN (curly braces, :keywords). It controls things the settings screen doesn't show, like the journal title format or whether tasks use TODO/DOING or LATER/NOW.",
    tip: "One missing } breaks the file, so change one setting at a time. Logseq warns you if the file can't be read." },
  { topic: "Workflows (PARA, Zettelkasten, GTD)", title: "PARA: organise by actionability",
    body: "PARA sorts everything into four buckets: Projects (with a deadline), Areas (ongoing responsibilities), Resources (topics of interest) and Archive (inactive). In Logseq this maps neatly onto namespaces.",
    example: [{ d: 0, t: "[[Projects/Kitchen renovation]] [[Areas/Health]] [[Resources/Cooking]]" }] },
  { topic: "Workflows (PARA, Zettelkasten, GTD)", title: "Zettelkasten: atomic, linked notes",
    body: "Write one idea per note in your own words, then link it to related ideas. Over time the links — not folders — become the structure. Logseq's blocks and backlinks are almost purpose-built for this.",
    tip: "A note with no links is an orphan. Ask yourself: what does this idea remind me of?" },
  { topic: "Workflows (PARA, Zettelkasten, GTD)", title: "GTD: capture, clarify, do",
    body: "Getting Things Done means capturing everything into an inbox, then turning each item into a next action with a context — where or with what you can do it. In Logseq, the journal is your inbox and tags like #errands or #computer are contexts.",
    example: [{ d: 0, t: "TODO Buy light bulbs #errands", task: "todo" }, { d: 0, t: "TODO Update CV #computer", task: "todo" }] },
  { topic: "Sync, Git backup & keyboard power moves", title: "Sync between devices",
    body: "Your graph is a folder of Markdown files, so any file-sync service can share it: iCloud Drive (best on Apple devices), Syncthing (free, peer-to-peer) or Logseq Sync (built-in, encrypted, for supporters). Avoid editing the same page on two devices at once — that's how conflicts happen.",
    tip: "Wait for sync to finish before opening Logseq on the other device." },
  { topic: "Sync, Git backup & keyboard power moves", title: "Back up with Git",
    body: "In the desktop app, Settings → Version control → Enable Git auto commit saves a snapshot of your graph every few minutes. You can view a page's history and roll back mistakes. Push the folder to a private GitHub repository for an off-site backup.",
    example: [{ d: 0, t: "git remote add origin git@github.com:you/notes.git", code: true }, { d: 0, t: "git push -u origin main", code: true }],
    tip: "Keep the repository private — your notes are personal." },
  { topic: "Sync, Git backup & keyboard power moves", title: "Keyboard power moves",
    body: "Experienced users barely touch the mouse. Moving and folding blocks, and two-key sequences like g j (go to journals) or t r (toggle right sidebar), save hundreds of clicks a day. Press g s in Logseq to see every shortcut.",
    keys: [["g s", "show all shortcuts"], ["t w", "toggle wide mode"]] },
  { topic: "You're ready", title: "Make Logseq yours",
    body: "You can now query your graph like a database, restyle and reconfigure the app, run a proper workflow, and keep everything safely backed up. The best system is the one you keep using — refine it gently over time.",
    done: true },
];

const DL_SEED = `#+BEGIN_QUERY
{:title "Open tasks"
 :query [:find (pull ?b [*])
         :where
         [?b :block/marker ?m]
         [(contains? #{"TODO"} ?m)]]}
#+END_QUERY`;
const DL_SEED2 = `#+BEGIN_QUERY
{:title "Tasks about Priya"
 :query [:find (pull ?b [*])
         :where
         [?b :block/marker ?m]
         [(contains? #{"TODO" "DOING" "DONE"} ?m)]
         [?b :block/refs ?p]
         [?p :block/name "????"]]}
#+END_QUERY`;
const DL_SEED3 = `#+BEGIN_QUERY
{:title "Open tasks by priority"
 :query [:find (pull ?b [*])
         :where
         [?b :block/marker ?m]
         [(contains? #{"TODO" "DOING"} ?m)]]
 ;; :result-transform (fn [r] (sort-by (fn [b] (get b :block/priority "Z")) r))
 }
#+END_QUERY`;
const CSS_SEED = `/* Change a colour and watch the preview */
:root {
  --ls-primary-background-color: #ffffff;
}
.page-ref { color: #0d7a75; }
.bullet { background: #5b716f; }
.block-content { font-size: 15px; }`;
const EDN_SEED = `{:preferred-workflow :todo
 :journal/page-title-format "MMM do, yyyy"
 :start-of-week 6
 :feature/enable-whiteboards? true}`;

const ADV_PRACTICE = [
  { kind: "datalog", seed: DL_SEED, ask: 'Add "DOING" inside #{ } so the query also finds tasks in progress.', ok: (q) => q.markers.includes("TODO") && q.markers.includes("DOING") },
  { kind: "datalog", seed: DL_SEED2, ask: 'Replace ???? with priya to keep only blocks that link to Priya.', ok: (q) => q.page === "priya" },
  { kind: "datalog", seed: DL_SEED3, ask: "Delete the ;; before :result-transform to sort by priority (A first).", ok: (q) => q.sorted },
  { kind: "css", seed: CSS_SEED, ask: "Change any colour or the font size, e.g. make links purple.", ok: (css) => css.replace(/\s/g, "") !== CSS_SEED.replace(/\s/g, "") },
  { kind: "edn", seed: EDN_SEED, ask: "Switch :todo to :now, and try a title format like \"EEEE, d MMMM yyyy\".", ok: (c) => c.workflow === "now" && c.format !== "MMM do, yyyy" },
  { ask: "Link pages in at least three PARA buckets, e.g. [[Projects/Garden]], [[Areas/Finance]], [[Resources/Recipes]].", show: "para", seed: [["", 0]],
    ok: (b) => ["Projects", "Areas", "Resources", "Archive"].filter((k) => nsTree(b)[k]).length >= 3 },
  { ask: "Write three one-idea notes (top-level blocks), each linking to at least one [[idea]].", show: "zettel", seed: [["", 0]],
    ok: (b) => { const n = b.filter((x) => x.d === 0 && x.t.trim()); return n.length >= 3 && n.every((x) => linksOf(x.t).length); } },
  { ask: "Capture tasks with contexts, e.g. TODO Buy stamps #errands and TODO Reply to Sam #computer.", show: "gtd", seed: [["", 0]],
    ok: (b) => Object.keys(contextsOf(b)).length >= 2 },
  { ask: "Nothing to type here — sync is set up outside Logseq.", ok: () => true },
  { ask: "Nothing to type here — try it in the desktop app's settings.", ok: () => true },
  { kind: "keys", ask: "Click the box, then press each shortcut. Mac and Windows keys both work." },
  { ask: "Free sandbox: everything you've learnt, all at once.", numbers: true, show: "gtd", seed: [["", 0]], ok: (b) => b.length > 2 },
];

// ---------- advanced helpers ----------
const FAKE_GRAPH = [
  { t: "Email [[Priya]] the agenda", m: "TODO", pr: "B", refs: ["priya"] },
  { t: "Draft the quarterly report", m: "DOING", pr: "A", refs: ["work"] },
  { t: "Book the dentist", m: "TODO", pr: "C", refs: [] },
  { t: "Send [[Priya]] the budget", m: "DONE", pr: "A", refs: ["priya"] },
  { t: "Review [[Priya]]'s slides", m: "DOING", pr: "C", refs: ["priya"] },
  { t: "Fix the leaking tap", m: "TODO", pr: "A", refs: ["home"] },
];
function evalDatalog(src) {
  const code = src.split("\n").filter((l) => !l.trim().startsWith(";;")).join("\n");
  const err = (e) => ({ error: e, markers: [], page: null, sorted: false, rows: [] });
  const open = (code.match(/[[{(]/g) || []).length, close = (code.match(/[\]})]/g) || []).length;
  if (open !== close) return err(`Brackets don't balance (${open} opening, ${close} closing).`);
  if (!/\[\?b :block\/marker \?m\]/.test(code)) return err("Missing [?b :block/marker ?m].");
  const mk = code.match(/contains\?\s*#\{([^}]*)\}\s*\?m/);
  const markers = mk ? [...mk[1].matchAll(/"([A-Z]+)"/g)].map((x) => x[1]) : [];
  const pm = code.match(/\[\?p :block\/name "([^"]*)"\]/);
  const page = pm && /\[\?b :block\/refs \?p\]/.test(code) ? pm[1] : null;
  const sorted = /:result-transform[\s\S]*sort-by[\s\S]*:block\/priority/.test(code);
  let rows = FAKE_GRAPH.filter((r) => markers.includes(r.m) && (!page || r.refs.includes(page)));
  if (sorted) rows = [...rows].sort((a, c) => a.pr.localeCompare(c.pr));
  const title = (code.match(/:title "([^"]*)"/) || [])[1];
  return { markers, page, sorted, rows, title };
}
function scopeCss(css, scope) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/([^{}]+)\{/g, (_, sel) =>
    sel.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (s === ":root" ? scope : `${scope} ${s}`)).join(", ") + " {");
}
function parseEdn(src) {
  const kw = (k) => (src.match(new RegExp(`:${k}\\s+:?"?([^"\\s}]+)"?`)) || [])[1];
  const fmt = (src.match(/:journal\/page-title-format\s+"([^"]*)"/) || [])[1] || "MMM do, yyyy";
  const open = (src.match(/\{/g) || []).length, close = (src.match(/\}/g) || []).length;
  return { workflow: kw("preferred-workflow") || "todo", format: fmt, week: Number(kw("start-of-week") ?? 6),
    boards: kw("feature/enable-whiteboards\\?") !== "false", error: open !== close ? "Curly braces don't balance — Logseq would refuse to load this." : null };
}
function formatDate(d, f) {
  const day = d.getDate();
  const ord = day + ([11, 12, 13].includes(day) ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th"));
  const long = (o) => d.toLocaleDateString("en-GB", o);
  const map = { yyyy: d.getFullYear(), MMMM: long({ month: "long" }), MMM: long({ month: "short" }), MM: String(d.getMonth() + 1).padStart(2, "0"),
    EEEE: long({ weekday: "long" }), EEE: long({ weekday: "short" }), dd: String(day).padStart(2, "0"), do: ord, d: day };
  return f.replace(/yyyy|MMMM|MMM|MM|EEEE|EEE|dd|do|d/g, (t) => map[t]);
}
function contextsOf(blocks) {
  const out = {};
  blocks.filter((b) => stateOf(b.t) && stateOf(b.t) !== "DONE").forEach((b) =>
    linksOf(b.t).forEach((c) => (out[c] ||= []).push(b)));
  return out;
}
const KEY_TARGETS = [
  { label: "Move block up", combos: ["Mod+Shift+ArrowUp", "Alt+Shift+ArrowUp"], show: "Cmd+Shift+↑ (Mac) · Alt+Shift+↑ (Windows)" },
  { label: "Move block down", combos: ["Mod+Shift+ArrowDown", "Alt+Shift+ArrowDown"], show: "Cmd+Shift+↓ (Mac) · Alt+Shift+↓ (Windows)" },
  { label: "Collapse a block", combos: ["Mod+ArrowUp"], show: "Ctrl/Cmd+↑" },
  { label: "Expand a block", combos: ["Mod+ArrowDown"], show: "Ctrl/Cmd+↓" },
  { label: "Go to journals", seq: "g j", show: "g then j" },
  { label: "Toggle right sidebar", seq: "t r", show: "t then r" },
];


// ================= EXPERT =================
const EXP_STEPS = [
  { topic: "Writing your own plugin", title: "Anatomy of a plugin",
    body: "A plugin is a small web app: a package.json, an index.html and some JavaScript that imports @logseq/libs. Everything starts in logseq.ready(main). From there you register commands, read and write blocks, and add UI.",
    example: [{ d: 0, t: "my-plugin/", code: true }, { d: 1, t: "package.json  — name, version, \"main\": \"index.html\"", code: true }, { d: 1, t: "index.html    — loads index.js", code: true }, { d: 1, t: "index.js      — import \"@logseq/libs\"; logseq.ready(main)", code: true }],
    tip: "logseq.Editor works with blocks and pages, logseq.App with the app, logseq.UI with messages and dialogs." },
  { topic: "Writing your own plugin", title: "Add buttons and handlers",
    body: "logseq.App.registerUIItem puts HTML into the toolbar. A data-on-click attribute calls a function you expose with logseq.provideModel. This pairing is how most plugin buttons work.",
    tip: "logseq.useSettingsSchema adds a settings page for your plugin with almost no code." },
  { topic: "Writing your own plugin", title: "The development loop",
    body: "Turn on Settings → Advanced → Developer mode. Then Plugins → Load unpacked plugin and choose your folder. After editing, reload the plugin from the Plugins page. Open the developer console with Ctrl+Shift+I (Cmd+Opt+I on Mac) to see logs and errors.",
    keys: [["npm i @logseq/libs", "install the SDK"], ["Ctrl+Shift+I / Cmd+Opt+I", "developer tools"]],
    tip: "Start from the official logseq-plugin-samples repository rather than an empty folder." },
  { topic: "Datalog rules, inputs & custom views", title: "Reusable logic with rules",
    body: "Rules name a set of conditions so you can reuse them. Define them under :rules, pass them in with :in $ %, then call them like a function in :where. Rules keep long queries readable.",
    example: [{ d: 0, t: ':rules [[(open ?b) [?b :block/marker ?m] [(contains? #{"TODO" "DOING"} ?m)]]]', code: true }] },
  { topic: "Datalog rules, inputs & custom views", title: "Dynamic dates with :inputs",
    body: ":inputs feeds values into the query — most usefully relative dates like :today, :-7d or :+14d. Declare matching variables in :in, and the query stays correct every day without editing.",
    example: [{ d: 0, t: ":in $ ?start ?end", code: true }, { d: 0, t: ":inputs [:-7d :today]", code: true }] },
  { topic: "Datalog rules, inputs & custom views", title: "Custom views with :view",
    body: ":view is a function that receives the results and returns Hiccup — Clojure's HTML as data, where [:b \"Hi\"] means <b>Hi</b>. You can build tables, counters, progress bars or reading lists that look exactly how you want.",
    tip: "(for [r result] ...) loops over the rows; (get r :title) reads a field." },
  { topic: "Graph architecture & performance", title: "Under the hood: datoms",
    body: "Logseq loads your Markdown files into DataScript, an in-memory database. Every fact is a datom: [entity attribute value]. Blocks know their content, their page, their parent and the pages they reference — exactly what your Datalog queries match against.",
    tip: "Logseq's newer database version stores the graph in a database file rather than Markdown, but the datom model is the same." },
  { topic: "Graph architecture & performance", title: "Keeping big graphs fast",
    body: "Graphs with tens of thousands of pages work, but a few habits matter: avoid very long pages, keep heavy queries off pages you open constantly, store large media outside the graph, and remove plugins you don't use. Re-index when things look stale.",
    keys: [["Left menu → graph name", "Re-index"]] },
  { topic: "Automation: macros, CLI & publishing", title: "Text macros",
    body: "Macros in config.edn are templates with placeholders. Define :macros {:greet \"Hello, $1!\"} and type {{greet Sam}} anywhere. Arguments are separated by commas.",
    tip: "Logseq's built-in {{video}}, {{embed}} and {{query}} use the same curly-brace syntax." },
  { topic: "Automation: macros, CLI & publishing", title: "Script Logseq from outside",
    body: "The desktop app can run a local HTTP API server (left menu → HTTP APIs server). Create a token, then any script can POST JSON to http://127.0.0.1:12315/api calling the same methods plugins use. Because your graph is plain files, scripts can also write Markdown straight into the journals folder.",
    example: [{ d: 0, t: 'curl -X POST http://127.0.0.1:12315/api -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d \'{"method":"logseq.Editor.appendBlockInPage","args":["Inbox","From a script"]}\'', code: true }],
    tip: "Pair it with Shortcuts (Mac) or AutoHotkey (Windows) for one-key capture." },
  { topic: "Automation: macros, CLI & publishing", title: "Publish pages as a website",
    body: "Mark pages with public:: true, then Export graph → Export public pages to get a static website you can host anywhere, such as GitHub Pages or Netlify. Setting :publishing/all-pages-public? true in config.edn publishes everything instead.",
    tip: "A GitHub Action can rebuild the site automatically every time you push your graph." },
  { topic: "You're an expert", title: "Contribute back",
    body: "You can now extend Logseq with code, query it like a database, automate it from outside and publish it to the web. Share a plugin, answer questions on the forum, or write up your workflow — the community grows through people like you.",
    done: true },
];

const PLUGIN_SEED = `import "@logseq/libs";

function main() {
  logseq.Editor.registerSlashCommand("Insert greeting", async () => {
    await logseq.Editor.insertAtEditingCursor("Hello from my plugin 👋");
  });
}

logseq.ready(main).catch(console.error);`;
const PLUGIN_SEED2 = `import "@logseq/libs";

function main() {
  logseq.provideModel({
    sayHi() {
      logseq.UI.showMsg("Hi there!");
    },
  });

  logseq.App.registerUIItem("toolbar", {
    key: "say-hi",
    template: \`<a data-on-click="sayHi">🌟</a>\`,
  });
}

logseq.ready(main).catch(console.error);`;
const RULES_SEED = `#+BEGIN_QUERY
{:title "Open tasks about Priya"
 :query [:find (pull ?b [*])
         :in $ %
         :where
         [?b :block/refs ?p]
         [?p :block/name "priya"]]
 :rules [[(open ?b)
          [?b :block/marker ?m]
          [(contains? #{"TODO" "DOING"} ?m)]]]}
#+END_QUERY`;
const INPUTS_SEED = `#+BEGIN_QUERY
{:title "Scheduled"
 :query [:find (pull ?b [*])
         :in $ ?start ?end
         :where
         [?b :block/scheduled ?d]
         [(>= ?d ?start)]
         [(<= ?d ?end)]]
 :inputs [:-30d :today]}
#+END_QUERY`;
const VIEW_SEED = `{:title "Books"
 :query [:find (pull ?b [*])
         :where [?b :block/properties ?p]
                [(get ?p :type) ?t]
                [(= ?t "book")]]
 :view (fn [result]
         [:div
          [:b (str (count result) " books")]
          [:ul (for [r result]
                 [:li (get r :title)])]])}`;
const MACRO_SEED = `:macros {:greet "Hello, $1! 👋"
         :status "Status: $1 — updated $2"}`;

const EXP_PRACTICE = [
  { kind: "plugin", seed: PLUGIN_SEED, ask: "Rename the command and change its text, then type / in the block below and run it." },
  { kind: "plugin", seed: PLUGIN_SEED2, ask: "Change the 🌟 icon and the message, then click your new toolbar button." },
  { ask: "Nothing to type — this happens in the Logseq desktop app.", ok: () => true },
  { kind: "dlrules", seed: RULES_SEED, ask: "Add (open ?b) to :where so the DONE task drops out." },
  { kind: "dlinputs", seed: INPUTS_SEED, ask: "Change :inputs to [:today :+7d] to see the coming week." },
  { kind: "view", seed: VIEW_SEED, ask: "Show each book's author too, e.g. a [:table] with [:td (get r :author)]." },
  { ask: "Write a block with a [[link]] and an indented child, then read its datoms below.", show: "datoms", seed: [["", 0]],
    ok: (b) => b.some((x) => linksOf(x.t).length) && b.some((x) => x.d > 0 && x.t.trim()) },
  { kind: "quiz", ask: "True or false? Get all five right." },
  { kind: "macro", seed: MACRO_SEED, ask: "Add your own macro to the map, then use it in the empty line." },
  { kind: "api", ask: "Send the request, then change the text and send another to the Inbox page." },
  { kind: "publish", ask: "Make two pages public, then export." },
  { ask: "Free sandbox — and an extra look at the datoms behind your notes.", show: "datoms", numbers: true, seed: [["", 0]], ok: (b) => b.length > 2 },
];

// ---------- expert helpers ----------
const SCHEDULED_FAKE = [[-10, "File tax return"], [-2, "Call the plumber"], [0, "Team stand-up"], [3, "Dentist appointment"], [6, "Book train tickets"], [12, "Renew passport"]];
function stripCode(src) { return src.split("\n").filter((l) => !l.trim().startsWith(";;")).join("\n"); }
function balanced(code) {
  const o = (code.match(/[[{(]/g) || []).length, c = (code.match(/[\]})]/g) || []).length;
  return o === c ? null : `Brackets don't balance (${o} opening, ${c} closing).`;
}
function evalRules(src) {
  const code = stripCode(src);
  const err = balanced(code);
  if (err) return { error: err, rows: [] };
  const [q, rules = ""] = code.split(":rules");
  const uses = /\(open \?b\)/.test(q);
  if (uses && !/:in \$ %/.test(q)) return { error: "Rules need :in $ % so Datalog knows to pass them in.", rows: [] };
  if (uses && !/\(open \?b\)/.test(rules)) return { error: "(open ?b) is called but no rule called open is defined.", rows: [] };
  const mk = rules.match(/contains\?\s*#\{([^}]*)\}/);
  const markers = mk ? [...mk[1].matchAll(/"([A-Z]+)"/g)].map((x) => x[1]) : [];
  const pm = q.match(/\[\?p :block\/name "([^"]*)"\]/);
  const page = pm && /\[\?b :block\/refs \?p\]/.test(q) ? pm[1] : null;
  const rows = FAKE_GRAPH.filter((r) => (!page || r.refs.includes(page)) && (!uses || markers.includes(r.m)));
  return { uses, page, rows, title: (code.match(/:title "([^"]*)"/) || [])[1] };
}
function relDay(tok) {
  if (tok === "today") return 0; if (tok === "yesterday") return -1; if (tok === "tomorrow") return 1;
  const m = tok.match(/^([+-])(\d+)d$/); return m ? (m[1] === "-" ? -1 : 1) * Number(m[2]) : null;
}
function evalInputs(src) {
  const code = stripCode(src);
  const err = balanced(code);
  if (err) return { error: err, rows: [] };
  const im = code.match(/:inputs\s*\[([^\]]*)\]/);
  if (!im) return { error: "No :inputs found.", rows: [] };
  const toks = [...im[1].matchAll(/:([\w+-]+)/g)].map((m) => m[1]);
  if (toks.length !== 2) return { error: ":in declares ?start and ?end, so :inputs needs exactly two values.", rows: [] };
  const [start, end] = toks.map(relDay);
  if (start == null || end == null) return { error: `Unknown input: use :today, :yesterday, :tomorrow, :-7d or :+7d.`, rows: [] };
  return { start, end, rows: SCHEDULED_FAKE.filter(([d]) => d >= start && d <= end) };
}
const dayLabel = (off) => { const d = new Date(); d.setDate(d.getDate() + off); return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); };

// --- a tiny Clojure/Hiccup reader + evaluator for :view ---
function readForms(src) {
  const toks = [...src.matchAll(/"(?:\\.|[^"\\])*"|;[^\n]*|[()\[\]{}]|[^\s()\[\]{}",;]+/g)].map((m) => m[0]).filter((t) => !t.startsWith(";"));
  let i = 0;
  const close = { "(": ")", "[": "]", "{": "}" }, type = { "(": "list", "[": "vec", "{": "map" };
  function read() {
    if (i >= toks.length) throw new Error("Unexpected end — a bracket is missing.");
    const t = toks[i++];
    if (close[t]) {
      const v = [];
      while (toks[i] !== close[t]) { if (i >= toks.length) throw new Error(`Missing ${close[t]}.`); v.push(read()); }
      i++;
      return { t: type[t], v };
    }
    if ([")", "]", "}"].includes(t)) throw new Error(`Unexpected ${t}.`);
    if (t.startsWith('"')) return { t: "str", v: JSON.parse(t) };
    if (t.startsWith(":")) return { t: "kw", v: t.slice(1) };
    if (/^-?\d+(\.\d+)?$/.test(t)) return { t: "num", v: Number(t) };
    return { t: "sym", v: t };
  }
  return { read, more: () => i < toks.length };
}
function evalForm(n, env) {
  switch (n.t) {
    case "str": case "num": return n.v;
    case "kw": return { kw: n.v };
    case "sym":
      if (n.v === "nil") return null;
      if (!(n.v in env)) throw new Error(`Unknown name: ${n.v}`);
      return env[n.v];
    case "map": { const o = {}; for (let j = 0; j < n.v.length; j += 2) o[n.v[j].v] = evalForm(n.v[j + 1], env); return o; }
    case "vec":
      if (n.v[0]?.t === "kw") {
        const tag = n.v[0].v.split(/[.#]/)[0];
        let rest = n.v.slice(1), attrs = {};
        if (rest[0]?.t === "map") { attrs = evalForm(rest[0], env); rest = rest.slice(1); }
        return { tag, attrs, kids: rest.map((c) => evalForm(c, env)) };
      }
      return n.v.map((c) => evalForm(c, env));
    case "list": {
      const [h, ...a] = n.v;
      const op = h?.v;
      if (op === "fn") return (...args) => { const e = { ...env }; a[0].v.forEach((p, k) => (e[p.v] = args[k])); let r; a.slice(1).forEach((f) => (r = evalForm(f, e))); return r; };
      if (op === "for") { const [b, body] = a; const coll = evalForm(b.v[1], env) || []; return coll.map((x) => evalForm(body, { ...env, [b.v[0].v]: x })); }
      if (op === "if") return evalForm(a[0], env) ? evalForm(a[1], env) : a[2] ? evalForm(a[2], env) : null;
      if (op === "let") { const e = { ...env }; for (let j = 0; j < a[0].v.length; j += 2) e[a[0].v[j].v] = evalForm(a[0].v[j + 1], e); return evalForm(a[1], e); }
      const args = a.map((x) => evalForm(x, env));
      const lib = {
        get: (o, k, d) => (o && o[k?.kw ?? k] !== undefined ? o[k?.kw ?? k] : d ?? null),
        count: (c) => (c || []).length, str: (...s) => s.map((x) => (x == null ? "" : x?.kw ? ":" + x.kw : x)).join(""),
        "=": (x, y) => x === y, ">": (x, y) => x > y, "<": (x, y) => x < y, "+": (...x) => x.reduce((p, q) => p + q, 0),
        "*": (...x) => x.reduce((p, q) => p * q, 1), repeat: (k, x) => Array(Math.max(0, k)).fill(x),
        "apply": (f, xs) => f(...xs), "sort-by": (f, c) => [...c].sort((p, q) => (f(p) > f(q) ? 1 : -1)), reverse: (c) => [...c].reverse(),
      };
      const f = op in env ? env[op] : lib[op];
      if (op === "apply") return lib.apply(args[0] === undefined ? lib[a[0].v] : args[0], args[1]);
      if (typeof f !== "function") throw new Error(`Unknown function: ${op}`);
      return f(...args);
    }
  }
}
const BOOKS = [{ title: "Atomic Habits", author: "James Clear", rating: 4 }, { title: "Dune", author: "Frank Herbert", rating: 5 }, { title: "Sapiens", author: "Yuval Noah Harari", rating: 4 }];
function runView(src) {
  try {
    const vi = src.indexOf(":view");
    if (vi < 0) return { error: "No :view found." };
    const r = readForms(src.slice(vi + 5));
    const fn = evalForm(r.read(), {});
    if (typeof fn !== "function") return { error: ":view must be (fn [result] ...)." };
    return { out: fn(BOOKS) };
  } catch (e) { return { error: e.message }; }
}
const SAFE_TAGS = ["div", "span", "b", "i", "strong", "em", "ul", "ol", "li", "table", "thead", "tbody", "tr", "td", "th", "p", "h3", "h4", "small", "code"];
function hiccup(n, k = 0) {
  if (n == null || n === false) return null;
  if (Array.isArray(n)) return n.map((c, j) => hiccup(c, j));
  if (typeof n !== "object") return String(n);
  if (n.kw) return ":" + n.kw;
  if (!SAFE_TAGS.includes(n.tag)) return <code key={k}>[:{n.tag} not allowed]</code>;
  const style = {};
  Object.entries(n.attrs.style || {}).forEach(([p, v]) => (style[p.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v?.kw ?? v));
  const Tag = n.tag;
  return <Tag key={k} style={style} className={n.attrs.class}>{n.kids.map((c, j) => hiccup(c, j))}</Tag>;
}
const flat = (n) => (n == null ? "" : Array.isArray(n) ? n.map(flat).join(" ") : typeof n === "object" ? (n.tag ? n.tag + " " + n.kids.map(flat).join(" ") : "") : String(n));

const QUIZ = [
  { s: "Heavy queries on pages you open constantly can make Logseq feel slow.", a: true, why: "Queries re-run as the page renders, so keep expensive ones on dedicated pages." },
  { s: "A page with thousands of blocks loads as quickly as a short one.", a: false, why: "Very long pages are slower to render and edit. Split them up or move content to linked pages." },
  { s: "Re-indexing can fix pages that look stale, missing or duplicated.", a: true, why: "It rebuilds the database from your files." },
  { s: "Large videos in the assets folder have no effect on sync.", a: false, why: "Every file in the graph folder is synced, so big media slows syncing down." },
  { s: "Disabling plugins you don't use can speed up start-up.", a: true, why: "Each enabled plugin loads its own code when Logseq starts." },
];

// ---------- tiny Logseq-ish engine ----------
let uid = 0;
const nb = (t = "", d = 0) => ({ id: ++uid, t, d });
const linksOf = (t) => [
  ...[...t.matchAll(/#?\[\[([^\]]+)\]\]/g)].map((m) => m[1]),
  ...[...t.matchAll(/(?:^|\s)#([\w-]+)/g)].map((m) => m[1]),
];
function pagesIn(blocks) {
  return [...new Set(blocks.flatMap((b) => (parseQuery(b.t) ? [] : linksOf(b.t))))];
}
function backlinks(blocks) {
  const map = {};
  blocks.forEach((b) => linksOf(b.t).forEach((p) => (map[p] = [...(map[p] || []), b])));
  return map;
}
const STATES = ["TODO", "DOING", "DONE", "LATER", "NOW"];
const stateOf = (t) => STATES.find((s) => t.startsWith(s + " "));
const NEXT = { TODO: "DOING", DOING: "DONE", LATER: "NOW", NOW: "DONE" };
function cycle(t) {
  const s = stateOf(t);
  if (!s) return "TODO " + t;
  if (s === "DONE") return t.slice(5);
  return NEXT[s] + t.slice(s.length);
}
function parseQuery(t) {
  const m = t.match(/\{\{query (.+)\}\}/);
  if (!m) return null;
  const tm = m[1].match(/\(task ([A-Z ]+)\)/);
  const props = [...m[1].matchAll(/\(property ([\w-]+) ([^)]+)\)/g)].map((p) => [p[1].toLowerCase(), p[2].trim().toLowerCase()]);
  return { states: tm ? tm[1].trim().split(/\s+/) : null, pages: linksOf(m[1]), props };
}
function runQuery(qBlock, blocks) {
  const q = parseQuery(qBlock.t);
  const props = propsOf(blocks);
  return blocks.filter((b) => b !== qBlock && b.t.trim() && !parseQuery(b.t) && !PROP.test(b.t) &&
    q.props.every(([k, v]) => (props[b.id]?.[k] || "").toLowerCase() === v) &&
    (!q.states || q.states.includes(stateOf(b.t))) &&
    q.pages.every((p) => linksOf(b.t).includes(p)));
}
const TEMPLATE = ["Attendees:: ", "Agenda", "Actions"];

const CSS = `
.lq{--bg:#eef3f2;--panel:#ffffff;--ink:#16302e;--soft:#5b716f;--line:#d3dedc;--teal:#0d7a75;--tealsoft:#d6ece9;--code:#f3f6f5;
  font-family:"Avenir Next","Segoe UI",system-ui,-apple-system,sans-serif;color:var(--ink);background:var(--bg);
  border-radius:14px;padding:clamp(16px,4vw,32px);max-width:760px;margin:0 auto;line-height:1.55}
@media (prefers-color-scheme:dark){.lq{--bg:#0f1e1d;--panel:#152a28;--ink:#e2eeec;--soft:#97aeab;--line:#28403d;--teal:#4fc3b9;--tealsoft:#1d3a37;--code:#10221f}}
.lq *{box-sizing:border-box}
.lq-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
.lq-brand{font-size:15px;color:var(--soft);margin:0}
.lq-count{font-size:14px;color:var(--soft);font-variant-numeric:tabular-nums}
.lq-rail{display:flex;gap:4px;margin:14px 0 24px}
.lq-rail button{flex:1;height:6px;border:0;border-radius:3px;background:var(--line);cursor:pointer;padding:0}
.lq-rail button.on{background:var(--teal)}
.lq-rail button:focus-visible{outline:2px solid var(--teal);outline-offset:3px}
.lq-topic{font-size:14px;color:var(--teal);margin:0 0 4px;font-weight:600}
.lq h2{font-size:clamp(24px,5vw,32px);line-height:1.15;margin:0 0 12px;font-weight:700;letter-spacing:-.01em}
.lq-body{font-size:17px;max-width:62ch;margin:0 0 20px}
.lq-keys{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 20px;padding:0;list-style:none}
.lq-keys li{font-size:14px;color:var(--soft)}
.lq kbd{font-family:inherit;font-size:13px;font-weight:600;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;padding:2px 7px;margin-right:6px}
.lq-page{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin:0 0 18px}
.lq-blk{display:flex;align-items:flex-start;gap:10px;padding:3px 0;font-size:16px}
.lq-dot{flex:none;width:7px;height:7px;border-radius:50%;background:var(--soft);margin-top:9px;box-shadow:0 0 0 4px var(--tealsoft)}
.lq-head{font-weight:700;font-size:18px}
.lq-muted{color:var(--soft);font-style:italic}
.lq-code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13.5px;background:var(--code);padding:2px 6px;border-radius:4px;word-break:break-all}
.lq-link{color:var(--teal);font-weight:600}
.lq-box{flex:none;width:15px;height:15px;border:1.5px solid var(--soft);border-radius:3px;margin-top:4px;display:grid;place-items:center;font-size:11px;color:#fff}
.lq-box.done{background:var(--teal);border-color:var(--teal)}
.lq-tag{font-size:11px;font-weight:700;padding:1px 6px;border-radius:4px;margin-right:6px;background:var(--tealsoft);color:var(--teal)}
.lq-strike{text-decoration:line-through;color:var(--soft)}
.lq-tip{border-left:3px solid var(--teal);padding:4px 0 4px 14px;color:var(--soft);font-size:15px;margin:0 0 24px}
.lq-nav{display:flex;justify-content:space-between;gap:12px}
.lq-btn{font:inherit;font-size:15px;font-weight:600;border-radius:8px;padding:10px 18px;cursor:pointer;border:1px solid var(--line);background:var(--panel);color:var(--ink)}
.lq-btn.go{background:var(--teal);border-color:var(--teal);color:var(--panel)}
.lq-btn:disabled{opacity:.4;cursor:default}
.lq-btn:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.lq-graph{width:100%;height:auto;display:block}
.lq-fade{animation:lqIn .25s ease}
@keyframes lqIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.lq-fade{animation:none}}
.lq-try{border:1.5px dashed var(--teal);border-radius:10px;padding:14px 16px;margin:0 0 20px;background:var(--panel)}
.lq-try-h{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 10px;font-size:15px}
.lq-try-h strong{color:var(--teal)}
.lq-goal{font-size:13px;font-weight:700;padding:3px 9px;border-radius:20px;background:var(--line);color:var(--soft);white-space:nowrap}
.lq-goal.ok{background:var(--teal);color:var(--panel)}
.lq-in{flex:1;font:inherit;font-size:16px;color:var(--ink);background:var(--code);border:0;border-radius:4px;padding:1px 6px;outline:2px solid var(--teal);min-width:0}
.lq-view{flex:1;cursor:text;min-height:1.5em}
.lq-view:empty::after{content:"Click to type…";color:var(--soft);font-style:italic}
.lq-box{cursor:pointer;background:none}
.lq-res{margin:4px 0 4px 18px;padding:8px 12px;border-radius:6px;background:var(--code);font-size:14px}
.lq-res p{margin:0;color:var(--soft)}
.lq-help{font-size:13px;color:var(--soft);margin:10px 0 0}
.lq-sub{margin-top:12px;padding-top:10px;border-top:1px solid var(--line);font-size:14px}
.lq-sub h4{margin:0 0 6px;font-size:14px}
.lq-sub h4 span{color:var(--teal)}
.lq-ref{border-bottom:1.5px solid var(--teal);background:var(--tealsoft);padding:0 3px;border-radius:3px}
.lq-prop{font-size:14px;background:var(--code);padding:1px 8px;border-radius:4px}
.lq-prop b{color:var(--teal);font-weight:600}
.lq-num{flex:none;font-size:11px;font-weight:700;color:var(--soft);width:16px;text-align:right;margin-top:3px}
.lq-chip{font-size:12px;font-weight:600;margin-left:8px;padding:1px 7px;border-radius:10px;background:var(--tealsoft);color:var(--teal);white-space:nowrap}
.lq-embed{display:block;border-left:3px solid var(--teal);background:var(--code);border-radius:4px;padding:6px 10px;margin:2px 0}
.lq-level{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 0}
.lq-level button{font:inherit;font-size:14px;font-weight:600;padding:7px 14px;border-radius:20px;border:1px solid var(--line);background:var(--panel);color:var(--soft);cursor:pointer}
.lq-level button[aria-selected=true]{background:var(--ink);color:var(--panel);border-color:var(--ink)}
.lq-level button:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.lq-card{border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin:6px 0;background:var(--bg)}
.lq-card .lq-btn{font-size:13px;padding:5px 12px;margin-top:8px}
.lq-board{position:relative;height:240px;border-radius:8px;overflow:hidden;touch-action:none;
  background-color:var(--bg);background-image:radial-gradient(var(--line) 1px,transparent 1px);background-size:18px 18px}
.lq-note{position:absolute;max-width:150px;padding:8px 10px;border-radius:6px;background:var(--panel);border:1px solid var(--line);font-size:13px;cursor:grab;user-select:none;box-shadow:0 2px 0 var(--line)}
.lq-note:active{cursor:grabbing}
.lq-ed{width:100%;min-height:150px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;color:var(--ink);background:var(--code);border:1px solid var(--line);border-radius:6px;padding:10px;resize:vertical;tab-size:2}
.lq-ed:focus{outline:2px solid var(--teal);outline-offset:1px}
.lq-view-out table{border-collapse:collapse;width:100%}.lq-view-out td,.lq-view-out th{border:1px solid var(--line);padding:4px 8px;text-align:left}
.lq-journal h3{font-size:16px;margin:0 0 10px;display:flex;justify-content:space-between;align-items:baseline}
.lq-jcard{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:0 0 16px}
.lq-jgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.lq-jgrid .lq-jcard{margin:0}
.lq-jgrid{margin:0 0 16px}
.lq-jsub{font-size:13px;color:var(--soft);margin:12px 0 2px;font-weight:600}
.lq-jrow .lq-x{opacity:0;transition:opacity .15s}
.lq-jrow:hover .lq-x,.lq-jrow .lq-x:focus{opacity:1}
@media (hover:none){.lq-jrow .lq-x{opacity:1}}
.lq-x{border:0;background:none;color:var(--soft);font-size:18px;line-height:1;cursor:pointer;padding:0 4px}
.lq-soft{outline:0;background:transparent;border-bottom:1px solid var(--line);border-radius:0}
.lq-soft:focus{border-bottom-color:var(--teal)}
.lq-moods{display:flex;gap:8px;flex-wrap:wrap}
.lq-moods button{flex:1;min-width:58px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:10px;border:1px solid var(--line);background:var(--bg);cursor:pointer;font-size:24px;color:var(--soft)}
.lq-moods button small{font-size:12px;font-family:inherit}
.lq-moods button.on{border-color:var(--teal);background:var(--tealsoft);color:var(--teal)}
.lq-moods button:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.lq-meter{height:6px;border-radius:3px;background:var(--line);overflow:hidden}
.lq-meter span{display:block;height:100%;background:var(--teal);transition:width .3s}
.lq-write{width:100%;min-height:220px;font-family:Charter,"Iowan Old Style",Georgia,serif;font-size:18px;line-height:1.7;color:var(--ink);background:transparent;border:0;resize:vertical;padding:0}
.lq-write:focus{outline:0}
.lq-write::placeholder{color:var(--soft);font-style:italic}
.lq-gtoggle{width:100%;display:flex;justify-content:space-between;border:0;background:none;font:inherit;font-weight:700;font-size:15px;color:var(--ink);cursor:pointer;padding:0}
.lq-guide{margin:12px 0 0;padding-left:22px}
.lq-guide li{margin:0 0 10px}
.lq-guide li p{margin:2px 0 0;font-size:14px;color:var(--soft)}
.lq-guide li.ok strong{color:var(--teal)}
.lq-guide .lq-goal{font-size:11px;padding:1px 7px;margin-left:6px}
.lq-pkm{display:grid;grid-template-columns:minmax(200px,240px) 1fr;gap:16px;align-items:start}
@media (max-width:640px){.lq-pkm{grid-template-columns:1fr}}
.lq-side{display:flex;flex-direction:column;gap:2px;min-width:0}
.lq-search{width:100%;font:inherit;font-size:15px;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.lq-search:focus{outline:2px solid var(--teal);outline-offset:1px}
.lq-newp{display:flex;gap:6px;margin:10px 0 4px}
.lq-newp .lq-btn{padding:4px 12px;font-size:13px}
.lq-pitem{display:flex;flex-direction:column;align-items:flex-start;gap:1px;text-align:left;border:0;background:none;font:inherit;color:var(--ink);padding:6px 8px;border-radius:6px;cursor:pointer;width:100%}
.lq-pitem:hover,.lq-pitem.on{background:var(--tealsoft)}
.lq-pitem b{font-weight:600;font-size:15px}
.lq-pitem small{font-size:12.5px;color:var(--soft);overflow-wrap:anywhere}
.lq-pitem:focus-visible,.lq-nlink:focus-visible,.lq-ntag:focus-visible{outline:2px solid var(--teal);outline-offset:1px}
.lq-tags{display:flex;flex-wrap:wrap;gap:6px}
.lq-nlink{border:0;background:none;padding:0;font:inherit;color:var(--teal);font-weight:600;cursor:pointer;text-decoration:underline;text-decoration-color:var(--tealsoft);text-underline-offset:3px}
.lq-ntag{border:0;font:inherit;font-size:.9em;font-weight:600;color:var(--teal);background:var(--tealsoft);border-radius:10px;padding:0 7px;cursor:pointer}
.lq-ntag small{opacity:.7}
.lq-note-main{margin:0;min-width:0}
.lq-ntitle{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 12px;flex-wrap:wrap}
.lq-ntitle .lq-btn{padding:4px 12px;font-size:13px}
.lq-nread{font-family:Charter,"Iowan Old Style",Georgia,serif;font-size:17px;line-height:1.7;cursor:text;min-height:120px}
.lq-nread p{margin:0 0 12px}
.lq-nedit{min-height:200px;font-size:17px;border:1px solid var(--line);border-radius:8px;padding:10px}
.lq-journal mark,.lq-pitem mark{background:var(--tealsoft);color:var(--ink)}
mark{background:var(--tealsoft);color:var(--ink);border-radius:2px}
.lq-err{color:#c2410c;font-size:14px;margin:8px 0 0}
.lq-prev{border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin-top:10px}
.lq-prev .block-content{display:flex;gap:10px;align-items:center;padding:2px 0}
.lq-prev .bullet{width:7px;height:7px;border-radius:50%;flex:none}
.lq-prev .page-ref{font-weight:600}
.lq-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.lq-trainer{border:1px solid var(--line);border-radius:8px;padding:6px 0;background:var(--bg);cursor:pointer}
.lq-trainer:focus{outline:2px solid var(--teal);outline-offset:2px}
.lq-krow{display:flex;justify-content:space-between;gap:10px;padding:7px 14px;font-size:14px;flex-wrap:wrap}
.lq-krow.cur{background:var(--tealsoft)}
.lq-krow.hit span:first-child::before{content:"✓ ";color:var(--teal);font-weight:700}
.lq-week{display:flex;gap:4px;margin-top:8px}
.lq-week span{flex:1;text-align:center;font-size:12px;padding:4px 0;border-radius:4px;background:var(--code);color:var(--soft)}
.lq-week span.today{background:var(--teal);color:var(--panel);font-weight:700}
`;

// Highlight [[links]], #tags and ((block refs)) inside text
function Rich({ text, blocks }) {
  const parts = text.split(/(\[\[[^\]]+\]\]|#\[\[[^\]]+\]\]|#[\w-]+|\(\(\d+\)\))/g);
  return parts.map((p, i) => {
    const ref = p.match(/^\(\((\d+)\)\)$/);
    if (ref && blocks) {
      const target = blocks[Number(ref[1]) - 1];
      return <span key={i} className="lq-ref">{target && target.t ? <Rich text={target.t} /> : `missing block ${ref[1]}`}</span>;
    }
    return /^(\[\[|#)/.test(p) ? <span key={i} className="lq-link">{p}</span> : <span key={i}>{p}</span>;
  });
}

function Block({ b }) {
  const indent = { paddingLeft: b.d * 22 };
  if (b.task) {
    const word = b.task.toUpperCase();
    const rest = b.t.replace(/^\w+\s/, "");
    return (
      <div className="lq-blk" style={indent}>
        <span className={`lq-box ${b.task === "done" ? "done" : ""}`}>{b.task === "done" ? "✓" : ""}</span>
        <span>
          <span className="lq-tag">{word}</span>
          <span className={b.task === "done" ? "lq-strike" : ""}>{rest}</span>
        </span>
      </div>
    );
  }
  return (
    <div className="lq-blk" style={indent}>
      {!b.head && <span className="lq-dot" />}
      <span className={b.head ? "lq-head" : b.muted ? "lq-muted" : ""}>
        {b.code ? <span className="lq-code">{b.t}</span> : <Rich text={b.t} />}
      </span>
    </div>
  );
}

function Graph() {
  const nodes = [
    [200, 90, "Priya"], [320, 60, "Website redesign"], [90, 60, "Journal"],
    [260, 170, "cooking"], [120, 160, "Reading list"], [380, 150, "Budget"],
  ];
  const edges = [[0, 1], [0, 2], [1, 5], [2, 3], [2, 4], [0, 5], [1, 2]];
  return (
    <svg className="lq-graph" viewBox="0 0 460 220" role="img" aria-label="Example graph of linked pages">
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="var(--line)" strokeWidth="1.5" />
      ))}
      {nodes.map(([x, y, n], i) => (
        <g key={n}>
          <circle cx={x} cy={y} r={i === 0 || i === 2 ? 9 : 6} fill="var(--teal)" />
          <text x={x} y={y - 14} textAnchor="middle" fontSize="12" fill="var(--soft)">{n}</text>
        </g>
      ))}
    </svg>
  );
}


function Rendered({ b, blocks, onToggle }) {
  const pm = b.t.match(PROP);
  if (pm) return <span className="lq-view"><span className="lq-prop"><b>{pm[1]}:</b> <Rich text={pm[2]} /></span></span>;

  const em = b.t.match(/\{\{embed (?:\(\((\d+)\)\)|\[\[([^\]]+)\]\])\}\}/);
  if (em) {
    let shown = [];
    if (em[1]) {
      const i = Number(em[1]) - 1, root = blocks[i];
      if (root) { shown = [root]; for (let j = i + 1; j < blocks.length && blocks[j].d > root.d; j++) shown.push(blocks[j]); }
    } else shown = blocks.filter((x) => x !== b && linksOf(x.t).includes(em[2]));
    const base = shown[0]?.d || 0;
    return (
      <span className="lq-view lq-embed">
        {shown.length ? shown.map((x) => <div key={x.id} style={{ paddingLeft: (x.d - base) * 16 }}>• <Rich text={x.t} blocks={blocks} /></div>) : <span className="lq-muted">Nothing to embed yet</span>}
      </span>
    );
  }

  if (parseQuery(b.t)) {
    const res = runQuery(b, blocks);
    return (
      <span className="lq-view" style={{ display: "block" }}>
        <span className="lq-code">{b.t}</span>
        <div className="lq-res">
          {res.length ? res.map((r) => <div key={r.id}><Rich text={r.t} blocks={blocks} /></div>) : <p>No matching blocks yet.</p>}
        </div>
      </span>
    );
  }

  const date = dateOf(b.t);
  const text = date ? b.t.replace(date.raw, "").trim() : b.t;
  const chip = date && <span className="lq-chip">{date.kind === "DEADLINE" ? "Due" : "Scheduled"} {fmtDate(date.date)} · {daysAway(date.date)}</span>;
  const s = stateOf(text + " ");
  if (s) {
    const rest = text.slice(s.length + 1);
    return (
      <>
        <button className={`lq-box ${s === "DONE" ? "done" : ""}`} aria-label="Toggle task" onMouseDown={(e) => { e.preventDefault(); onToggle(); }}>
          {s === "DONE" ? "✓" : ""}
        </button>
        <span className="lq-view"><span className="lq-tag">{s}</span><span className={s === "DONE" ? "lq-strike" : ""}><Rich text={rest} blocks={blocks} /></span>{chip}</span>
      </>
    );
  }
  return <span className="lq-view">{text ? <><Rich text={text} blocks={blocks} />{chip}</> : null}</span>;
}

function Flashcards({ blocks }) {
  const cards = cardsOf(blocks);
  const [open, setOpen] = useState({});
  if (!cards.length) return <p className="lq-help">No cards yet — add #card to a question.</p>;
  return cards.map((c) => (
    <div key={c.id} className="lq-card">
      <strong>{c.q || "(empty question)"}</strong>
      {open[c.id] ? <div style={{ marginTop: 6 }}>{c.answer.length ? c.answer.join(" · ") : <span className="lq-muted">Add an indented answer block</span>}</div> : null}
      <div><button className="lq-btn" onClick={() => setOpen((o) => ({ ...o, [c.id]: !o[c.id] }))}>{open[c.id] ? "Hide answer" : "Show answer"}</button></div>
    </div>
  ));
}

function Board({ blocks }) {
  const notes = blocks.filter((b) => b.t.trim());
  const [pos, setPos] = useState({});
  const drag = useRef(null);
  const at = (b, i) => pos[b.id] || [16 + (i % 3) * 140, 16 + Math.floor(i / 3) * 70];
  const move = (e) => {
    if (!drag.current) return;
    const { id, dx, dy, box } = drag.current;
    setPos((p) => ({ ...p, [id]: [Math.max(0, Math.min(e.clientX - box.left - dx, box.width - 60)), Math.max(0, Math.min(e.clientY - box.top - dy, box.height - 30))] }));
  };
  return (
    <div className="lq-board" onPointerMove={move} onPointerUp={() => (drag.current = null)} onPointerLeave={() => (drag.current = null)}>
      {notes.map((b, i) => {
        const [x, y] = at(b, i);
        return (
          <div key={b.id} className="lq-note" style={{ left: x, top: y }}
            onPointerDown={(e) => { const box = e.currentTarget.parentElement.getBoundingClientRect(); drag.current = { id: b.id, dx: e.clientX - box.left - x, dy: e.clientY - box.top - y, box }; }}>
            <Rich text={b.t} />
          </div>
        );
      })}
      {!notes.length && <p className="lq-help" style={{ padding: 12 }}>Type a block and it appears here as a sticky note.</p>}
    </div>
  );
}

function LiveGraph({ blocks }) {
  const pages = pagesIn(blocks);
  if (!pages.length) return <p className="lq-help">Your graph is empty — link a page to add a dot.</p>;
  const all = ["Today", ...pages];
  const pos = all.map((p, i) => i === 0 ? [230, 110] : [230 + 150 * Math.cos((i / pages.length) * 2 * Math.PI), 110 + 80 * Math.sin((i / pages.length) * 2 * Math.PI)]);
  const edges = new Set();
  blocks.forEach((b) => {
    const l = linksOf(b.t).map((p) => all.indexOf(p)).filter((x) => x > 0);
    l.forEach((a) => { edges.add(`0-${a}`); l.forEach((c) => a < c && edges.add(`${a}-${c}`)); });
  });
  return (
    <svg className="lq-graph" viewBox="0 0 460 220" role="img" aria-label="Graph of the pages you linked">
      {[...edges].map((e) => { const [a, c] = e.split("-").map(Number); return <line key={e} x1={pos[a][0]} y1={pos[a][1]} x2={pos[c][0]} y2={pos[c][1]} stroke="var(--line)" strokeWidth="1.5" />; })}
      {all.map((p, i) => (
        <g key={p}><circle cx={pos[i][0]} cy={pos[i][1]} r={i ? 7 : 9} fill={i ? "var(--teal)" : "var(--soft)"} />
          <text x={pos[i][0]} y={pos[i][1] - 13} textAnchor="middle" fontSize="12" fill="var(--soft)">{p}</text></g>
      ))}
    </svg>
  );
}

function Practice({ task }) {
  const [blocks, setBlocks] = useState(() => (task.seed ? task.seed.map(([t, d]) => nb(t, d)) : [nb()]));
  const [focus, setFocus] = useState(null);
  const refs = useRef({});
  const done = task.ok(blocks);

  useEffect(() => { if (focus != null) refs.current[focus]?.focus(); }, [focus, blocks.length]);

  const set = (id, patch) => setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  function onKey(e, idx) {
    const b = blocks[idx];
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === "Enter" && mod) { e.preventDefault(); set(b.id, { t: cycle(b.t) }); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      if (b.t.trim() === "/template") {
        const nbs = TEMPLATE.map((t) => nb(t, b.d + 1));
        const head = { ...b, t: "Meeting notes" };
        setBlocks((bs) => [...bs.slice(0, idx), head, ...nbs, ...bs.slice(idx + 1)]);
        setFocus(nbs[0].id);
        return;
      }
      const n = nb("", b.d);
      setBlocks((bs) => [...bs.slice(0, idx + 1), n, ...bs.slice(idx + 1)]);
      setFocus(n.id);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) set(b.id, { d: Math.max(0, b.d - 1) });
      else if (idx > 0) set(b.id, { d: Math.min(b.d + 1, blocks[idx - 1].d + 1) });
      return;
    }
    if (e.key === "Backspace" && !b.t && blocks.length > 1) {
      e.preventDefault();
      setBlocks((bs) => bs.filter((x) => x.id !== b.id));
      setFocus(blocks[Math.max(0, idx - 1)].id);
      return;
    }
    if (e.key === "ArrowUp" && idx > 0) { e.preventDefault(); setFocus(blocks[idx - 1].id); }
    if (e.key === "ArrowDown" && idx < blocks.length - 1) { e.preventDefault(); setFocus(blocks[idx + 1].id); }
    e.stopPropagation();
  }

  const bl = backlinks(blocks);

  return (
    <div className="lq-try">
      <div className="lq-try-h">
        <span><strong>Try it:</strong> {task.ask}</span>
        <span className={`lq-goal ${done ? "ok" : ""}`}>{done ? "✓ Nice!" : "Your turn"}</span>
      </div>

      {task.page && <div className="lq-blk lq-head">{task.page}</div>}
      {blocks.map((b, idx) => (
        <div key={b.id} className="lq-blk" style={{ paddingLeft: b.d * 22 }}>
          {task.numbers && <span className="lq-num">{idx + 1}</span>}
          <span className="lq-dot" />
          {focus === b.id ? (
            <input
              ref={(el) => (refs.current[b.id] = el)}
              className="lq-in"
              value={b.t}
              aria-label="Block text"
              onChange={(e) => set(b.id, { t: e.target.value })}
              onKeyDown={(e) => onKey(e, idx)}
              onBlur={() => setFocus((f) => (f === b.id ? null : f))}
            />
          ) : (
            <span style={{ display: "flex", gap: 8, flex: 1 }} onClick={() => setFocus(b.id)}>
              <Rendered b={b} blocks={blocks} onToggle={() => set(b.id, { t: stateOf(b.t) === "DONE" ? "TODO " + b.t.slice(5) : "DONE " + b.t.replace(/^(TODO|DOING) /, "") })} />
            </span>
          )}
        </div>
      ))}

      {task.show === "backlinks" && Object.keys(bl).length > 0 && (
        <div className="lq-sub">
          {Object.entries(bl).map(([p, list]) => (
            <div key={p}><h4><span>{p}</span> — linked references ({list.length})</h4>
              {list.map((x) => <div key={x.id} className="lq-res"><Rich text={x.t} /></div>)}</div>
          ))}
        </div>
      )}
      {task.show === "graph" && <div className="lq-sub"><LiveGraph blocks={blocks} /></div>}
      {task.show === "alias" && (() => {
        const names = [task.page, ...aliasesOf(blocks)];
        const refs = blocks.filter((x) => linksOf(x.t).some((l) => names.includes(l)));
        return <div className="lq-sub"><h4><span>{task.page}</span> — linked references ({refs.length})</h4>
          {refs.length ? refs.map((x) => <div key={x.id} className="lq-res"><Rich text={x.t} /></div>) : <p className="lq-help">Links to {names.join(" or ")} will show here.</p>}</div>;
      })()}
      {task.show === "agenda" && (() => {
        const due = blocks.filter((x) => stateOf(x.t) && dateOf(x.t)).sort((a, c) => dateOf(a.t).date.localeCompare(dateOf(c.t).date));
        return due.length ? <div className="lq-sub"><h4>Scheduled and deadlines</h4>
          {due.map((x) => <div key={x.id} className="lq-res">{fmtDate(dateOf(x.t).date)} ({daysAway(dateOf(x.t).date)}) — {x.t.replace(dateOf(x.t).raw, "").trim()}</div>)}</div> : null;
      })()}
      {task.show === "ns" && (() => {
        const tree = nsTree(blocks);
        return Object.keys(tree).length ? <div className="lq-sub">{Object.entries(tree).map(([root, kids]) =>
          <div key={root}><h4><span>{root}</span> — {kids.length} child page{kids.length > 1 ? "s" : ""}</h4>
            {[...new Set(kids)].map((k) => <div key={k} className="lq-res">{root}/<b>{k}</b></div>)}</div>)}</div> : null;
      })()}
      {task.show === "cards" && <div className="lq-sub"><Flashcards blocks={blocks} /></div>}
      {task.show === "board" && <div className="lq-sub"><Board blocks={blocks} /></div>}
      {task.show === "datoms" && (() => {
        const pageIds = {}; let next = 200;
        const rows = [];
        blocks.forEach((b, i) => {
          if (!b.t.trim()) return;
          const e = 100 + i;
          rows.push([e, ":block/content", JSON.stringify(b.t)], [e, ":block/page", "1  ; Today"]);
          for (let j = i - 1; j >= 0; j--) if (blocks[j].d < b.d) { rows.push([e, ":block/parent", 100 + j]); break; }
          const s = stateOf(b.t); if (s) rows.push([e, ":block/marker", `"${s}"`]);
          linksOf(b.t).forEach((p) => { pageIds[p] ||= next++; rows.push([e, ":block/refs", `${pageIds[p]}  ; ${p}`]); });
        });
        Object.entries(pageIds).forEach(([p, id]) => rows.push([id, ":block/name", JSON.stringify(p.toLowerCase())]));
        return rows.length ? <div className="lq-sub"><h4>Datoms <span>[entity attribute value]</span></h4>
          <div style={{ overflowX: "auto" }}><pre className="lq-code" style={{ display: "block", margin: 0 }}>{rows.map((r) => `[${r[0]} ${r[1]} ${r[2]}]`).join("\n")}</pre></div></div> : null;
      })()}
      {task.show === "para" && (() => {
        const tree = nsTree(blocks);
        return <div className="lq-sub lq-two">{["Projects", "Areas", "Resources", "Archive"].map((k) => (
          <div key={k}><h4><span>{k}</span> ({tree[k] ? new Set(tree[k]).size : 0})</h4>
            {tree[k] ? [...new Set(tree[k])].map((p) => <div key={p} className="lq-res">{p}</div>) : <p className="lq-help" style={{ margin: 0 }}>Empty</p>}</div>))}</div>;
      })()}
      {task.show === "zettel" && (() => {
        const notes = blocks.filter((x) => x.d === 0 && x.t.trim());
        return notes.length ? <div className="lq-sub"><h4>Your notes</h4>{notes.map((x) => {
          const l = linksOf(x.t);
          return <div key={x.id} className="lq-res">{l.length ? `🔗 ${l.length} link${l.length > 1 ? "s" : ""}` : "⚠ Orphan — add a link"} · <Rich text={x.t} /></div>;
        })}</div> : null;
      })()}
      {task.show === "gtd" && (() => {
        const ctx = contextsOf(blocks);
        return Object.keys(ctx).length ? <div className="lq-sub"><h4>Next actions by context</h4>{Object.entries(ctx).map(([c, list]) => (
          <div key={c}><h4><span>#{c}</span></h4>{list.map((x) => <div key={x.id} className="lq-res"><Rich text={x.t} /></div>)}</div>))}</div> : null;
      })()}

      <p className="lq-help">Enter: new block · Tab / Shift+Tab: indent · Ctrl/Cmd+Enter: cycle TODO · Backspace on empty: delete</p>
    </div>
  );
}


function Frame({ task, done, children }) {
  return (
    <div className="lq-try">
      <div className="lq-try-h">
        <span><strong>Try it:</strong> {task.ask}</span>
        <span className={`lq-goal ${done ? "ok" : ""}`}>{done ? "✓ Nice!" : "Your turn"}</span>
      </div>
      {children}
    </div>
  );
}

function DatalogTry({ task }) {
  const [code, setCode] = useState(task.seed);
  const q = evalDatalog(code);
  return (
    <Frame task={task} done={!q.error && task.ok(q)}>
      <textarea className="lq-ed" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} aria-label="Datalog query" />
      {q.error ? <p className="lq-err">{q.error}</p> : (
        <div className="lq-sub">
          <h4><span>{q.title || "Query"}</span> — {q.rows.length} result{q.rows.length === 1 ? "" : "s"}</h4>
          {q.rows.map((r) => (
            <div key={r.t} className="lq-res"><span className="lq-tag">{r.m}</span><span className="lq-chip" style={{ marginLeft: 0, marginRight: 6 }}>#{r.pr}</span><Rich text={r.t} /></div>
          ))}
        </div>
      )}
      <p className="lq-help">Searching a sample graph of 6 tasks. Lines starting with ;; are comments.</p>
    </Frame>
  );
}

function CssTry({ task }) {
  const [css, setCss] = useState(task.seed);
  const scoped = useMemo(() => scopeCss(css, ".lqp"), [css]);
  return (
    <Frame task={task} done={task.ok(css)}>
      <div className="lq-two">
        <textarea className="lq-ed" spellCheck={false} value={css} onChange={(e) => setCss(e.target.value)} aria-label="custom.css" />
        <div>
          <style>{scoped}</style>
          <div className="lqp lq-prev" style={{ background: "var(--ls-primary-background-color)", color: "#16302e" }}>
            <div className="block-content"><span className="bullet" />Lunch with <a className="page-ref">Priya</a></div>
            <div className="block-content" style={{ paddingLeft: 20 }}><span className="bullet" />Talk about the <a className="page-ref">Website redesign</a></div>
            <div className="block-content"><span className="bullet" />Read <a className="page-ref">Atomic Habits</a> chapter 3</div>
          </div>
        </div>
      </div>
      <p className="lq-help">The preview uses Logseq's real class names: .page-ref, .bullet, .block-content.</p>
    </Frame>
  );
}

function EdnTry({ task }) {
  const [src, setSrc] = useState(task.seed);
  const c = parseEdn(src);
  const now = new Date();
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const start = isNaN(c.week) ? 6 : c.week % 7;
  const week = Array.from({ length: 7 }, (_, i) => names[(start + i) % 7]);
  const todayName = names[(now.getDay() + 6) % 7];
  const [a, b] = c.workflow === "now" ? ["LATER", "NOW"] : ["TODO", "DOING"];
  return (
    <Frame task={task} done={!c.error && task.ok(c)}>
      <div className="lq-two">
        <textarea className="lq-ed" spellCheck={false} value={src} onChange={(e) => setSrc(e.target.value)} aria-label="config.edn" />
        <div className="lq-prev">
          {c.error ? <p className="lq-err" style={{ margin: 0 }}>{c.error}</p> : <>
            <div className="lq-head">{formatDate(now, c.format)}</div>
            <div className="lq-blk"><span className="lq-box" /><span><span className="lq-tag">{a}</span>Water the plants</span></div>
            <div className="lq-blk"><span className="lq-box" /><span><span className="lq-tag">{b}</span>Write the blog post</span></div>
            <div className="lq-week">{week.map((w) => <span key={w} className={w === todayName ? "today" : ""}>{w}</span>)}</div>
            <p className="lq-help">Sidebar: Journals · Flashcards{c.boards ? " · Whiteboards" : ""}</p>
          </>}
        </div>
      </div>
      <p className="lq-help">Try :start-of-week 0 (Monday) or :feature/enable-whiteboards? false. Ctrl/Cmd+Enter in the outliner now cycles LATER → NOW too.</p>
    </Frame>
  );
}

function KeysTry({ task }) {
  const [hit, setHit] = useState([]);
  const [last, setLast] = useState("");
  const prev = useRef({ k: "", t: 0 });
  const cur = KEY_TARGETS.findIndex((_, i) => !hit.includes(i));
  function onKey(e) {
    if (["Shift", "Alt", "Control", "Meta"].includes(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    const combo = [(e.ctrlKey || e.metaKey) && "Mod", e.altKey && "Alt", e.shiftKey && "Shift", e.key.length === 1 ? e.key.toLowerCase() : e.key].filter(Boolean).join("+");
    const t = Date.now();
    const seq = t - prev.current.t < 1500 ? `${prev.current.k} ${combo}` : "";
    prev.current = { k: combo, t };
    setLast(seq || combo);
    const i = KEY_TARGETS.findIndex((k, n) => !hit.includes(n) && ((k.combos || []).includes(combo) || k.seq === seq));
    if (i >= 0) setHit((h) => [...h, i]);
  }
  return (
    <Frame task={task} done={hit.length === KEY_TARGETS.length}>
      <div className="lq-trainer" tabIndex={0} onKeyDown={onKey} aria-label="Shortcut trainer — focus and press keys">
        {KEY_TARGETS.map((k, i) => (
          <div key={k.label} className={`lq-krow ${hit.includes(i) ? "hit" : ""} ${i === cur ? "cur" : ""}`}>
            <span>{k.label}</span><kbd>{k.show}</kbd>
          </div>
        ))}
      </div>
      <p className="lq-help">Last keys pressed: {last || "—"} · {hit.length} of {KEY_TARGETS.length} done</p>
    </Frame>
  );
}


function PluginTry({ task }) {
  const [code, setCode] = useState(task.seed);
  const [line, setLine] = useState("");
  const [used, setUsed] = useState(false);
  const [toast, setToast] = useState(null);
  const ready = /logseq\.ready\(\s*main\s*\)/.test(code);
  const cmds = [...code.matchAll(/registerSlashCommand\(\s*["'`]([^"'`]+)["'`]/g)].map((m, k, all) => {
    const seg = code.slice(m.index, all[k + 1]?.index ?? code.length);
    return { name: m[1], text: (seg.match(/insertAtEditingCursor\(\s*["'`]([^"'`]*)["'`]/) || [])[1] ?? "" };
  });
  const tm = code.match(/registerUIItem\(\s*["']toolbar["'][\s\S]*?template:\s*[`"']([\s\S]*?)[`"']\s*,?\s*\}/);
  const icon = tm ? tm[1].replace(/<[^>]*>/g, "").trim() : null;
  const handler = tm && (tm[1].match(/data-on-click="([^"]+)"/) || [])[1];
  const hm = handler && code.match(new RegExp(handler + "\\s*\\(\\)\\s*\\{[\\s\\S]*?showMsg\\(\\s*[\"'`]([^\"'`]*)[\"'`]"));
  const isToolbar = task.seed.includes("registerUIItem");
  const done = ready && used && (isToolbar ? icon !== "🌟" && hm && hm[1] !== "Hi there!" : cmds.some((c) => c.name !== "Insert greeting" && c.text !== "Hello from my plugin 👋"));
  return (
    <Frame task={task} done={done}>
      <div className="lq-two">
        <textarea className="lq-ed" style={{ minHeight: 220 }} spellCheck={false} value={code} onChange={(e) => { setCode(e.target.value); setUsed(false); }} aria-label="index.js" />
        <div className="lq-prev" style={{ position: "relative" }}>
          {!ready ? <p className="lq-err" style={{ margin: 0 }}>Plugin never starts — logseq.ready(main) is missing.</p> : isToolbar ? <>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              <span className="lq-muted">toolbar</span>
              {icon ? <button className="lq-btn" style={{ padding: "2px 10px" }} onClick={() => { setUsed(true); setToast(hm ? hm[1] : `No ${handler || "handler"}() in provideModel`); setTimeout(() => setToast(null), 2500); }}>{icon}</button> : <span className="lq-muted">no button</span>}
            </div>
            {toast && <div className="lq-res" style={{ marginLeft: 0 }}>💬 {toast}</div>}
          </> : <>
            <div className="lq-blk"><span className="lq-dot" />
              <input className="lq-in" value={line} placeholder="Type / here" onChange={(e) => setLine(e.target.value)} aria-label="Block" />
            </div>
            {line.endsWith("/") && (
              <div className="lq-res">{cmds.length ? cmds.map((c) => (
                <div key={c.name}><button className="lq-btn" style={{ padding: "3px 10px", margin: "2px 0" }} onClick={() => { setLine(line.slice(0, -1) + c.text); setUsed(true); }}>{c.name}</button></div>
              )) : <p>No slash commands registered.</p>}</div>
            )}
          </>}
        </div>
      </div>
      <p className="lq-help">This mock reads your code rather than running it, so stick to plain strings.</p>
    </Frame>
  );
}

function RulesTry({ task }) {
  const [code, setCode] = useState(task.seed);
  const q = evalRules(code);
  return (
    <Frame task={task} done={!q.error && q.uses && q.page === "priya"}>
      <textarea className="lq-ed" style={{ minHeight: 200 }} spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} aria-label="Query with rules" />
      {q.error ? <p className="lq-err">{q.error}</p> : <div className="lq-sub"><h4><span>{q.title || "Query"}</span> — {q.rows.length} result{q.rows.length === 1 ? "" : "s"}</h4>
        {q.rows.map((r) => <div key={r.t} className="lq-res"><span className="lq-tag">{r.m}</span><Rich text={r.t} /></div>)}</div>}
    </Frame>
  );
}

function InputsTry({ task }) {
  const [code, setCode] = useState(task.seed);
  const q = evalInputs(code);
  return (
    <Frame task={task} done={!q.error && q.start === 0 && q.end === 7}>
      <textarea className="lq-ed" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} aria-label="Query with inputs" />
      {q.error ? <p className="lq-err">{q.error}</p> : <div className="lq-sub">
        <h4>From <span>{dayLabel(q.start)}</span> to <span>{dayLabel(q.end)}</span> — {q.rows.length} result{q.rows.length === 1 ? "" : "s"}</h4>
        {q.rows.map(([d, t]) => <div key={t} className="lq-res">{dayLabel(d)} ({daysAway(new Date(Date.now() + d * 864e5).toISOString().slice(0, 10))}) — {t}</div>)}</div>}
    </Frame>
  );
}

function ViewTry({ task }) {
  const [code, setCode] = useState(task.seed);
  const r = useMemo(() => runView(code), [code]);
  return (
    <Frame task={task} done={!r.error && flat(r.out).includes("James Clear")}>
      <div className="lq-two">
        <textarea className="lq-ed" style={{ minHeight: 220 }} spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} aria-label="Query with view" />
        <div className="lq-prev lq-view-out">{r.error ? <p className="lq-err" style={{ margin: 0 }}>{r.error}</p> : hiccup(r.out)}</div>
      </div>
      <p className="lq-help">Rows have :title, :author and :rating. Supported: fn, for, let, if, get, count, str, repeat, apply, sort-by, reverse, + * = &lt; &gt;, and :style maps.</p>
    </Frame>
  );
}

function QuizTry({ task }) {
  const [ans, setAns] = useState({});
  const right = QUIZ.filter((q, k) => ans[k] === q.a).length;
  return (
    <Frame task={task} done={right === QUIZ.length}>
      {QUIZ.map((q, k) => (
        <div key={k} className="lq-card">
          <div>{q.s}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[true, false].map((v) => <button key={String(v)} className={`lq-btn ${ans[k] === v ? "go" : ""}`} onClick={() => setAns((a) => ({ ...a, [k]: v }))}>{v ? "True" : "False"}</button>)}
          </div>
          {k in ans && <p className="lq-help" style={{ marginTop: 6 }}><strong style={{ color: ans[k] === q.a ? "var(--teal)" : "#c2410c" }}>{ans[k] === q.a ? "Correct." : "Not quite."}</strong> {q.why}</p>}
        </div>
      ))}
      <p className="lq-help">{right} of {QUIZ.length} correct</p>
    </Frame>
  );
}

function MacroTry({ task }) {
  const [cfg, setCfg] = useState(task.seed);
  const [lines, setLines] = useState(["{{greet Sam}}", "{{status On track, 27 Oct}}", ""]);
  const macros = Object.fromEntries([...cfg.matchAll(/:([\w-]+)\s+"([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const expand = (t) => t.replace(/\{\{([\w-]+)\s*([^}]*)\}\}/g, (all, name, args) => {
    if (!(name in macros)) return `⚠ unknown macro ${name}`;
    const a = args.split(",").map((s) => s.trim());
    return macros[name].replace(/\$(\d)/g, (_, n) => a[n - 1] ?? "");
  });
  const custom = Object.keys(macros).filter((k) => !["greet", "status"].includes(k));
  const done = lines.some((l) => custom.some((k) => new RegExp(`\\{\\{${k}\\b`).test(l)));
  return (
    <Frame task={task} done={done}>
      <textarea className="lq-ed" style={{ minHeight: 90 }} spellCheck={false} value={cfg} onChange={(e) => setCfg(e.target.value)} aria-label="Macros in config.edn" />
      <div className="lq-sub">
        {lines.map((l, k) => (
          <div key={k} className="lq-two" style={{ marginBottom: 6, alignItems: "center" }}>
            <input className="lq-in" style={{ outline: "1px solid var(--line)" }} value={l} placeholder="{{yourmacro arg1, arg2}}" onChange={(e) => setLines((ls) => ls.map((x, j) => (j === k ? e.target.value : x)))} aria-label={`Line ${k + 1}`} />
            <span>→ {l ? expand(l) : <span className="lq-muted">rendered result</span>}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function ApiTry({ task }) {
  const [body, setBody] = useState('{\n  "method": "logseq.Editor.appendBlockInPage",\n  "args": ["Inbox", "Captured from a script"]\n}');
  const [pages, setPages] = useState({ Inbox: ["Buy milk"] });
  const [resp, setResp] = useState(null);
  const [sent, setSent] = useState([]);
  function send() {
    let j;
    try { j = JSON.parse(body); } catch (e) { setResp({ error: "Invalid JSON: " + e.message }); return; }
    const [a0, a1] = j.args || [];
    if (j.method === "logseq.Editor.appendBlockInPage") {
      if (!pages[a0]) return setResp({ error: `Page "${a0}" doesn't exist. Create it with logseq.Editor.createPage.` });
      setPages((p) => ({ ...p, [a0]: [...p[a0], a1] })); setSent((s) => [...s, { page: a0, text: a1 }]);
      return setResp({ uuid: "6721…" + Math.random().toString(16).slice(2, 6), content: a1 });
    }
    if (j.method === "logseq.Editor.createPage") { setPages((p) => ({ [a0]: [], ...p })); return setResp({ name: a0 }); }
    if (j.method === "logseq.Editor.getPageBlocksTree") return setResp(pages[a0] ? pages[a0].map((c) => ({ content: c })) : null);
    setResp({ error: `Method not found: ${j.method}` });
  }
  const done = sent.filter((s) => s.page === "Inbox").length >= 2 && new Set(sent.map((s) => s.text)).size >= 2;
  return (
    <Frame task={task} done={done}>
      <div className="lq-two">
        <div>
          <p className="lq-help" style={{ margin: "0 0 6px" }}>POST http://127.0.0.1:12315/api · Authorization: Bearer TOKEN</p>
          <textarea className="lq-ed" style={{ minHeight: 120 }} spellCheck={false} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Request body" />
          <button className="lq-btn go" style={{ marginTop: 8 }} onClick={send}>Send request</button>
          {resp && <pre className="lq-res" style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>{JSON.stringify(resp, null, 2)}</pre>}
        </div>
        <div className="lq-prev">{Object.entries(pages).map(([p, bs]) => (
          <div key={p} style={{ marginBottom: 8 }}><div className="lq-head">{p}</div>{bs.map((b, k) => <div key={k} className="lq-blk"><span className="lq-dot" />{b}</div>)}</div>
        ))}</div>
      </div>
      <p className="lq-help">Also try logseq.Editor.createPage with ["Ideas"] or logseq.Editor.getPageBlocksTree with ["Inbox"].</p>
    </Frame>
  );
}

function PublishTry({ task }) {
  const all = ["Recipes", "Travel tips", "Reading list", "Private journal", "Salary negotiation"];
  const [pub, setPub] = useState({});
  const [allPublic, setAllPublic] = useState(false);
  const [out, setOut] = useState(null);
  const chosen = all.filter((p) => allPublic || pub[p]);
  return (
    <Frame task={task} done={!!out && out.length >= 2}>
      <div className="lq-two">
        <div>
          {all.map((p) => (
            <label key={p} className="lq-blk" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={allPublic || !!pub[p]} disabled={allPublic} onChange={(e) => { setPub((s) => ({ ...s, [p]: e.target.checked })); setOut(null); }} />
              <span>{p} {(allPublic || pub[p]) && <span className="lq-prop"><b>public::</b> true</span>}</span>
            </label>
          ))}
          <label className="lq-blk lq-help" style={{ cursor: "pointer" }}><input type="checkbox" checked={allPublic} onChange={(e) => { setAllPublic(e.target.checked); setOut(null); }} /><code className="lq-code">:publishing/all-pages-public? true</code></label>
          <button className="lq-btn go" style={{ marginTop: 6 }} onClick={() => setOut(chosen)}>Export public pages</button>
        </div>
        <div className="lq-prev">
          {out ? <>
            <div className="lq-code" style={{ display: "block", background: "none", padding: 0 }}>
              site/<br />├ index.html<br />├ static/<br />{out.map((p, k) => <span key={p}>{k === out.length - 1 ? "└" : "├"} page/{p.toLowerCase().replace(/ /g, "-")}<br /></span>)}
            </div>
            <p className="lq-help">{out.length} page{out.length === 1 ? "" : "s"} published.{out.some((p) => /Private|Salary/.test(p)) && " ⚠ You've published something personal — check before uploading!"}</p>
          </> : <p className="lq-help" style={{ margin: 0 }}>Export output appears here.</p>}
        </div>
      </div>
    </Frame>
  );
}

function TryIt({ task }) {
  if (task.kind === "plugin") return <PluginTry task={task} />;
  if (task.kind === "dlrules") return <RulesTry task={task} />;
  if (task.kind === "dlinputs") return <InputsTry task={task} />;
  if (task.kind === "view") return <ViewTry task={task} />;
  if (task.kind === "quiz") return <QuizTry task={task} />;
  if (task.kind === "macro") return <MacroTry task={task} />;
  if (task.kind === "api") return <ApiTry task={task} />;
  if (task.kind === "publish") return <PublishTry task={task} />;
  if (task.kind === "datalog") return <DatalogTry task={task} />;
  if (task.kind === "css") return <CssTry task={task} />;
  if (task.kind === "edn") return <EdnTry task={task} />;
  if (task.kind === "keys") return <KeysTry task={task} />;
  return <Practice task={task} />;
}


// ================= DAILY JOURNAL (not a lesson — a writing space) =================
const MOODS = [["😞", "Rough"], ["😕", "Meh"], ["😐", "Okay"], ["🙂", "Good"], ["😄", "Great"]];
const PROMPTS = [
  "What's taking up most of your headspace today?",
  "What would make today feel worthwhile?",
  "Describe one small moment you noticed today.",
  "What are you looking forward to?",
  "What did you learn today, however small?",
  "If today had a title, what would it be?",
  "What's something you'd like to let go of?",
];
let jid = 0;
const newJournal = () => ({
  mood: null, moodNote: "",
  grateful: ["", "", ""],
  habits: ["Drink water", "Move for 20 minutes", "Read 10 pages"].map((t) => ({ id: ++jid, t, done: false })),
  tasks: [],
  thoughts: [],
  writing: "",
});

function Checklist({ items, onChange, placeholder, removable = true }) {
  const [draft, setDraft] = useState("");
  const add = () => { if (!draft.trim()) return; onChange([...items, { id: ++jid, t: draft.trim(), done: false }]); setDraft(""); };
  return (
    <div>
      {items.map((x) => (
        <div key={x.id} className="lq-blk lq-jrow">
          <button className={`lq-box ${x.done ? "done" : ""}`} aria-label={x.done ? `Untick ${x.t}` : `Tick ${x.t}`} onClick={() => onChange(items.map((y) => (y.id === x.id ? { ...y, done: !y.done } : y)))}>{x.done ? "✓" : ""}</button>
          <span className={x.done ? "lq-strike" : ""} style={{ flex: 1 }}>{x.t}</span>
          {removable && <button className="lq-x" aria-label={`Remove ${x.t}`} onClick={() => onChange(items.filter((y) => y.id !== x.id))}>×</button>}
        </div>
      ))}
      <div className="lq-blk">
        <span className="lq-dot" />
        <input className="lq-in lq-soft" value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") add(); }} aria-label={placeholder} />
      </div>
    </div>
  );
}

function JournalPage({ j, setJ }) {
  const up = (patch) => setJ((s) => ({ ...s, ...patch }));
  const [thought, setThought] = useState("");
  const [copied, setCopied] = useState(false);
  const today = new Date();
  const prompt = PROMPTS[today.getDay()];
  const words = j.writing.trim() ? j.writing.trim().split(/\s+/).length : 0;
  const doneCount = [...j.habits, ...j.tasks].filter((x) => x.done).length;
  const total = j.habits.length + j.tasks.length;

  const addThought = () => {
    if (!thought.trim()) return;
    up({ thoughts: [{ id: ++jid, t: thought.trim(), at: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }, ...j.thoughts] });
    setThought("");
  };

  function asMarkdown() {
    const L = [];
    if (j.mood != null) L.push(`- Mood:: ${MOODS[j.mood][0]} ${MOODS[j.mood][1]}${j.moodNote ? " — " + j.moodNote : ""}`);
    const g = j.grateful.filter((x) => x.trim());
    if (g.length) { L.push("- Grateful for"); g.forEach((x) => L.push(`\t- ${x}`)); }
    if (j.habits.length) { L.push("- Habits"); j.habits.forEach((x) => L.push(`\t- ${x.done ? "DONE" : "TODO"} ${x.t}`)); }
    if (j.tasks.length) { L.push("- Tasks"); j.tasks.forEach((x) => L.push(`\t- ${x.done ? "DONE" : "TODO"} ${x.t}`)); }
    if (j.thoughts.length) { L.push("- Fleeting thoughts"); [...j.thoughts].reverse().forEach((x) => L.push(`\t- ${x.at} ${x.t}`)); }
    if (j.writing.trim()) { L.push("- Journal"); j.writing.trim().split(/\n\s*\n/).forEach((p) => L.push(`\t- ${p.replace(/\n/g, " ")}`)); }
    return L.join("\n");
  }
  async function copy() {
    try { await navigator.clipboard.writeText(asMarkdown()); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setCopied("fail"); }
  }

  return (
    <section className="lq-fade lq-journal">
      <p className="lq-topic">Daily page</p>
      <h2>{today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</h2>
      <p className="lq-body" style={{ marginBottom: 18 }}>No lessons here — just a quiet place to check in, capture and write. Nothing is saved once you close the page, so copy it into Logseq when you're done.</p>

      <div className="lq-jcard">
        <h3>How are you feeling?</h3>
        <div className="lq-moods" role="radiogroup" aria-label="Mood">
          {MOODS.map(([e, label], k) => (
            <button key={label} role="radio" aria-checked={j.mood === k} className={j.mood === k ? "on" : ""} onClick={() => up({ mood: j.mood === k ? null : k })}>
              <span aria-hidden="true">{e}</span><small>{label}</small>
            </button>
          ))}
        </div>
        {j.mood != null && <input className="lq-in lq-soft" style={{ width: "100%", marginTop: 10 }} value={j.moodNote} placeholder="Why, in a few words? (optional)" onChange={(e) => up({ moodNote: e.target.value })} onKeyDown={(e) => e.stopPropagation()} aria-label="Mood note" />}
        <h3 style={{ marginTop: 18 }}>Three things I'm grateful for</h3>
        {j.grateful.map((g, k) => (
          <div key={k} className="lq-blk">
            <span className="lq-num">{k + 1}</span>
            <input className="lq-in lq-soft" value={g} placeholder={["Someone…", "Something…", "A small moment…"][k]} onChange={(e) => up({ grateful: j.grateful.map((x, n) => (n === k ? e.target.value : x)) })} onKeyDown={(e) => e.stopPropagation()} aria-label={`Gratitude ${k + 1}`} />
          </div>
        ))}
      </div>

      <div className="lq-jgrid">
        <div className="lq-jcard">
          <h3>Today's checklist <span className="lq-count">{doneCount}/{total}</span></h3>
          <div className="lq-meter"><span style={{ width: total ? `${(doneCount / total) * 100}%` : 0 }} /></div>
          <h4 className="lq-jsub">Habits</h4>
          <Checklist items={j.habits} onChange={(habits) => up({ habits })} placeholder="Add a habit…" />
          <h4 className="lq-jsub">Tasks</h4>
          <Checklist items={j.tasks} onChange={(tasks) => up({ tasks })} placeholder="Add a task and press Enter…" />
        </div>

        <div className="lq-jcard">
          <h3>Ideas & fleeting thoughts</h3>
          <div className="lq-blk">
            <span className="lq-dot" />
            <input className="lq-in lq-soft" value={thought} placeholder="Catch it before it flies off…" onChange={(e) => setThought(e.target.value)}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") addThought(); }} aria-label="New thought" />
          </div>
          {j.thoughts.length ? j.thoughts.map((x) => (
            <div key={x.id} className="lq-blk lq-jrow">
              <span className="lq-chip" style={{ marginLeft: 0 }}>{x.at}</span>
              <span style={{ flex: 1 }}>{x.t}</span>
              <button className="lq-x" aria-label="Remove thought" onClick={() => up({ thoughts: j.thoughts.filter((y) => y.id !== x.id) })}>×</button>
            </div>
          )) : <p className="lq-help">Half-ideas, things you overheard, questions — no need to tidy them.</p>}
        </div>
      </div>

      <div className="lq-jcard">
        <h3>Journal</h3>
        <p className="lq-help" style={{ margin: "0 0 8px" }}>Today's prompt: <em>{prompt}</em></p>
        <textarea className="lq-write" value={j.writing} placeholder="Start writing — there's no wrong way to do this." onChange={(e) => up({ writing: e.target.value })} onKeyDown={(e) => e.stopPropagation()} aria-label="Journal entry" />
        <p className="lq-help">{words} word{words === 1 ? "" : "s"}{words >= 250 ? " · lovely, that's a full page" : ""}</p>
      </div>

      <div className="lq-nav">
        <button className="lq-btn" onClick={() => { if (window.confirm("Clear today's page and start fresh?")) setJ(newJournal()); }}>Clear page</button>
        <button className="lq-btn go" onClick={copy}>{copied === true ? "✓ Copied" : copied === "fail" ? "Couldn't copy" : "Copy as Logseq journal"}</button>
      </div>
    </section>
  );
}


// ================= PKM: short guide + working notes space =================
let pid = 0;
const mkPage = (title, body = "", user = true) => ({ id: ++pid, title, body, user, updated: Date.now() + pid });
const newPkm = () => ({
  pages: [
    mkPage("Welcome", "This is your notes space. Every note is a page.\n\nLink ideas with double brackets, like [[Learning]] or [[Spaced repetition]]. Click a link to open it — if the page doesn't exist yet, it's created.\n\nTag notes for later with #idea or #[[to read]]. Use the search box to find anything.", false),
    mkPage("Spaced repetition", "Reviewing something just as you're about to forget it makes memories stick far longer than cramming.\n\nIt's why flashcard apps space reviews out over days and weeks. Related to [[Learning]]. #idea", false),
    mkPage("Learning", "Explaining an idea in my own words shows me whether I actually understand it.\n\nSee also #[[to read]] — Make It Stick.", false),
  ],
  current: null, query: "", searched: false,
});
const norm = (s) => s.trim().toLowerCase();
const tagsOf = (t) => [...t.matchAll(/(?:^|\s)#(?:\[\[([^\]]+)\]\]|([\w-]+))/g)].map((m) => m[1] || m[2]);
const wordCount = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function NoteText({ text, onOpen, highlight }) {
  const parts = text.split(/(\[\[[^\]]+\]\]|#\[\[[^\]]+\]\]|(?:^|\s)#[\w-]+)/g);
  return parts.map((p, k) => {
    const m = p.match(/^(\s?)(?:#\[\[([^\]]+)\]\]|\[\[([^\]]+)\]\]|#([\w-]+))$/);
    if (m) {
      const name = m[2] || m[3] || m[4];
      const isTag = !m[3];
      return <span key={k}>{m[1]}<button className={isTag ? "lq-ntag" : "lq-nlink"} onClick={(e) => { e.stopPropagation(); onOpen(name); }}>{isTag ? "#" + name : name}</button></span>;
    }
    if (highlight) {
      return p.split(new RegExp(`(${escRe(highlight)})`, "gi")).map((q, j) => (norm(q) === norm(highlight) ? <mark key={k + "-" + j}>{q}</mark> : <span key={k + "-" + j}>{q}</span>));
    }
    return <span key={k}>{p}</span>;
  });
}

const GUIDE = [
  { title: "Capture in your own words", body: "Make a new note and write at least a couple of sentences. Rephrasing forces you to understand — copying doesn't.", ok: (s) => s.pages.some((p) => p.user && wordCount(p.body) >= 12) },
  { title: "Link it to what you know", body: "Add a [[link]] to another note. Links, not folders, are what make a knowledge base useful later.", ok: (s) => s.pages.some((p) => p.user && /\[\[[^\]]+\]\]/.test(p.body)) },
  { title: "Tag it for retrieval", body: "Add a #tag for the kind of thing it is — #idea, #question, #quote. Tags answer “show me all my…”.", ok: (s) => s.pages.some((p) => p.user && tagsOf(p.body).length) },
  { title: "Find it again", body: "Search for a word, or type #tag in the search box. A note you can't find might as well not exist.", ok: (s) => s.searched },
];

function PkmPage({ s, setS }) {
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [guideOpen, setGuideOpen] = useState(true);
  const byTitle = (t) => s.pages.find((p) => norm(p.title) === norm(t));
  const cur = s.pages.find((p) => p.id === s.current) || s.pages[0];
  const up = (patch) => setS((x) => ({ ...x, ...patch }));
  const setBody = (body) => setS((x) => ({ ...x, pages: x.pages.map((p) => (p.id === cur.id ? { ...p, body, updated: Date.now() } : p)) }));

  function open(title) {
    const t = title.trim();
    if (!t) return;
    const ex = byTitle(t);
    if (ex) { up({ current: ex.id, query: "" }); setEditing(false); return; }
    const p = mkPage(t);
    setS((x) => ({ ...x, pages: [...x.pages, p], current: p.id, query: "" }));
    setEditing(true);
  }
  function remove() {
    if (!cur || !window.confirm(`Delete “${cur.title}”? Links to it will stay as plain [[links]].`)) return;
    setS((x) => { const pages = x.pages.filter((p) => p.id !== cur.id); return { ...x, pages, current: pages[0]?.id ?? null }; });
  }

  // derived data
  const linksTo = (p, t) => linksOf(p.body).some((l) => norm(l) === norm(t));
  const backrefs = cur ? s.pages.filter((p) => p.id !== cur.id && linksTo(p, cur.title)) : [];
  const unlinked = cur && cur.title.length > 2 ? s.pages.filter((p) => p.id !== cur.id && !linksTo(p, cur.title) &&
    new RegExp(`\\b${escRe(cur.title)}\\b`, "i").test(p.body.replace(/\[\[[^\]]+\]\]|#\S+/g, ""))) : [];
  const tagCounts = {};
  s.pages.forEach((p) => new Set(tagsOf(p.body).map((t) => t.toLowerCase())).forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)));

  const q = s.query.trim();
  const tagQ = q.startsWith("#") ? norm(q.slice(1).replace(/^\[\[|\]\]$/g, "")) : null;
  const results = !q ? [] : s.pages.filter((p) => tagQ != null ? tagsOf(p.body).some((t) => norm(t) === tagQ) : (p.title + " " + p.body).toLowerCase().includes(q.toLowerCase()));
  useEffect(() => { if (q && results.length && !s.searched) up({ searched: true }); }, [q, results.length]);
  const snippet = (p) => {
    if (tagQ != null) return p.body.split("\n").find((l) => l.toLowerCase().includes("#" + tagQ) || l.toLowerCase().includes("#[[" + tagQ)) || "";
    const i = p.body.toLowerCase().indexOf(q.toLowerCase());
    return i < 0 ? p.body.slice(0, 80) : (i > 30 ? "…" : "") + p.body.slice(Math.max(0, i - 30), i + q.length + 50) + "…";
  };
  const lineWith = (p, t) => p.body.split(/\n/).find((l) => linksOf(l).some((x) => norm(x) === norm(t))) || "";
  const sorted = [...s.pages].sort((a, b) => b.updated - a.updated);
  const doneGuide = GUIDE.filter((g) => g.ok(s)).length;

  return (
    <section className="lq-fade">
      <p className="lq-topic">Personal knowledge management</p>
      <h2>Your second brain</h2>

      <div className="lq-jcard">
        <button className="lq-gtoggle" aria-expanded={guideOpen} onClick={() => setGuideOpen((o) => !o)}>
          <span>Quick guide — {doneGuide} of {GUIDE.length} done</span><span aria-hidden="true">{guideOpen ? "−" : "+"}</span>
        </button>
        {guideOpen && <ol className="lq-guide">
          {GUIDE.map((g) => { const ok = g.ok(s); return (
            <li key={g.title} className={ok ? "ok" : ""}>
              <strong>{g.title}</strong> <span className={`lq-goal ${ok ? "ok" : ""}`}>{ok ? "✓ Done" : "Try it below"}</span>
              <p>{g.body}</p>
            </li>); })}
        </ol>}
      </div>

      <div className="lq-pkm">
        <aside className="lq-side">
          <input className="lq-search" type="search" value={s.query} placeholder="Search notes or #tag" onChange={(e) => up({ query: e.target.value })} onKeyDown={(e) => e.stopPropagation()} aria-label="Search notes" />
          {q ? <>
            <h4 className="lq-jsub">{results.length} result{results.length === 1 ? "" : "s"}</h4>
            {results.map((p) => (
              <button key={p.id} className="lq-pitem" onClick={() => { up({ current: p.id, query: "" }); setEditing(false); }}>
                <b>{p.title}</b><small><NoteText text={snippet(p)} onOpen={open} highlight={tagQ == null ? q : null} /></small>
              </button>
            ))}
            {!results.length && <p className="lq-help">Nothing found. <button className="lq-nlink" onClick={() => open(q.replace(/^#/, ""))}>Create “{q.replace(/^#/, "")}”</button></p>}
          </> : <>
            <form className="lq-newp" onSubmit={(e) => { e.preventDefault(); open(newTitle); setNewTitle(""); }}>
              <input className="lq-in lq-soft" value={newTitle} placeholder="New note title…" onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.stopPropagation()} aria-label="New note title" />
              <button className="lq-btn go" type="submit" disabled={!newTitle.trim()}>Add</button>
            </form>
            <h4 className="lq-jsub">Notes ({s.pages.length})</h4>
            {sorted.map((p) => (
              <button key={p.id} className={`lq-pitem ${cur && p.id === cur.id ? "on" : ""}`} onClick={() => { up({ current: p.id }); setEditing(false); }}>
                <b>{p.title}</b>{!p.body.trim() && <small>empty</small>}
              </button>
            ))}
            {Object.keys(tagCounts).length > 0 && <>
              <h4 className="lq-jsub">Tags</h4>
              <div className="lq-tags">{Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(([t, n]) => (
                <button key={t} className="lq-ntag" onClick={() => up({ query: "#" + (t.includes(" ") ? `[[${t}]]` : t) })}>#{t} <small>{n}</small></button>
              ))}</div>
            </>}
          </>}
        </aside>

        <div className="lq-jcard lq-note-main">
          {cur ? <>
            <div className="lq-ntitle">
              <h3 style={{ margin: 0 }}>{cur.title}</h3>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="lq-btn" onClick={() => setEditing((e) => !e)}>{editing ? "Done" : "Edit"}</button>
                <button className="lq-btn" onClick={remove} aria-label="Delete note">Delete</button>
              </div>
            </div>
            {editing ? (
              <textarea className="lq-write lq-nedit" autoFocus value={cur.body} placeholder="Write in your own words. Use [[Note name]] to link and #tag to tag." onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Escape") setEditing(false); }} aria-label="Note text" />
            ) : (
              <div className="lq-nread" onClick={() => setEditing(true)} title="Click to edit">
                {cur.body.trim() ? cur.body.split(/\n\s*\n/).map((para, k) => <p key={k}><NoteText text={para} onOpen={open} /></p>) : <p className="lq-muted">Empty note — click to start writing.</p>}
              </div>
            )}
            <p className="lq-help">{wordCount(cur.body)} words · {editing ? "Esc or Done to preview links" : "click the text to edit"}</p>

            <div className="lq-sub">
              <h4>Linked references <span>({backrefs.length})</span></h4>
              {backrefs.length ? backrefs.map((p) => (
                <div key={p.id} className="lq-res">
                  <button className="lq-nlink" onClick={() => open(p.title)}>{p.title}</button>
                  <div><NoteText text={lineWith(p, cur.title)} onOpen={open} /></div>
                </div>
              )) : <p className="lq-help" style={{ margin: 0 }}>No other note links here yet. Link to it with [[{cur.title}]].</p>}
              {unlinked.length > 0 && <>
                <h4 style={{ marginTop: 12 }}>Unlinked mentions <span>({unlinked.length})</span></h4>
                {unlinked.map((p) => (
                  <div key={p.id} className="lq-res" style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <span>{p.title} mentions “{cur.title}”</span>
                    <button className="lq-btn" style={{ padding: "3px 10px" }} onClick={() => setS((x) => ({ ...x, pages: x.pages.map((y) => y.id === p.id ? { ...y, body: y.body.replace(new RegExp(`\\b${escRe(cur.title)}\\b`, "i"), (m) => `[[${m}]]`), updated: Date.now() } : y) }))}>Link</button>
                  </div>
                ))}
              </>}
            </div>
          </> : <p className="lq-muted">No notes yet — add one on the left.</p>}
        </div>
      </div>
      <p className="lq-help">Notes last for this session only. Tags are pages too, so clicking a #tag opens its page with every note that uses it in the references.</p>
    </section>
  );
}

const LEVELS = {
  beginner: { name: "Beginner", steps: STEPS, practice: PRACTICE },
  intermediate: { name: "Intermediate", steps: INTER_STEPS, practice: INTER_PRACTICE },
  advanced: { name: "Advanced", steps: ADV_STEPS, practice: ADV_PRACTICE },
  expert: { name: "Expert", steps: EXP_STEPS, practice: EXP_PRACTICE },
};
const TABS = { ...LEVELS, journal: { name: "📓 Journal" }, pkm: { name: "🧠 PKM" } };

export default function LogseqTutorial() {
  const [level, setLevel] = useState("beginner");
  const [pos, setPos] = useState({ beginner: 0, intermediate: 0, advanced: 0, expert: 0 });
  const [journal, setJournal] = useState(newJournal);
  const [pkmState, setPkmState] = useState(newPkm);
  const isJournal = level === "journal" || level === "pkm";
  const { steps = [], practice = [] } = LEVELS[level] || {};
  const i = pos[level];
  const setI = (v) => setPos((p) => ({ ...p, [level]: typeof v === "function" ? v(p[level]) : v }));
  const s = steps[i] || {};
  const last = steps.length - 1;
  const order = Object.keys(LEVELS);
  const nextLevel = order[order.indexOf(level) + 1];

  useEffect(() => {
    const onKey = (e) => {
      if (isJournal || ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") setI((n) => Math.min(n + 1, last));
      if (e.key === "ArrowLeft") setI((n) => Math.max(n - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last, level, isJournal]);

  return (
    <div className="lq">
      <style>{CSS}</style>

      <div className="lq-top">
        <p className="lq-brand">{level === "pkm" ? "Notes space" : isJournal ? "Daily journal" : `Logseq tutorial — ${LEVELS[level].name.toLowerCase()}`}</p>
        {!isJournal && <span className="lq-count">Step {i + 1} of {steps.length}</span>}
      </div>

      <div className="lq-level" role="tablist" aria-label="Tutorial level">
        {Object.entries(TABS).map(([k, v]) => (
          <button key={k} role="tab" aria-selected={level === k} onClick={() => setLevel(k)}>{v.name}</button>
        ))}
      </div>

      {level === "pkm" ? <PkmPage s={pkmState} setS={setPkmState} /> : isJournal ? <JournalPage j={journal} setJ={setJournal} /> : <>
      <div className="lq-rail" role="tablist" aria-label="Tutorial steps">
        {steps.map((st, n) => (
          <button
            key={n}
            role="tab"
            aria-selected={n === i}
            aria-label={`Step ${n + 1}: ${st.title}`}
            className={n <= i ? "on" : ""}
            onClick={() => setI(n)}
          />
        ))}
      </div>

      <section key={level + i} className="lq-fade" aria-live="polite">
        <p className="lq-topic">{s.topic}</p>
        <h2>{s.title}</h2>
        <p className="lq-body">{s.body}</p>

        {s.keys && (
          <ul className="lq-keys">
            {s.keys.map(([k, what]) => (
              <li key={k}><kbd>{k}</kbd>{what}</li>
            ))}
          </ul>
        )}

        {s.example && (
          <div className="lq-page">
            {s.example.map((b, n) => <Block key={n} b={b} />)}
          </div>
        )}

        {s.graph && <div className="lq-page"><Graph /></div>}

        <TryIt key={level + i} task={practice[i]} />

        {s.tip && <p className="lq-tip">{s.tip}</p>}
      </section>

      <div className="lq-nav">
        <button className="lq-btn" onClick={() => setI(i - 1)} disabled={i === 0}>Back</button>
        {s.done ? (
          nextLevel
            ? <button className="lq-btn go" onClick={() => setLevel(nextLevel)}>Go to {LEVELS[nextLevel].name.toLowerCase()}</button>
            : <button className="lq-btn go" onClick={() => setI(0)}>Start again</button>
        ) : (
          <button className="lq-btn go" onClick={() => setI(i + 1)}>Next step</button>
        )}
      </div>
      </>}
    </div>
  );
}