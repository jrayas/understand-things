import { useState, useEffect, useRef, useMemo } from "react";

/* ============================================================
   Notion learning island — Dreyfus five-stage model
   Prefix: nt-
   ============================================================ */

const CSS = `
.nt{--bg:#eef3f2;--panel:#ffffff;--ink:#16302e;--soft:#5b716f;--line:#d3dedc;--teal:#0d7a75;--tealsoft:#d6ece9;--code:#f3f6f5;--warn:#c2410c;
  font-family:"Avenir Next","Segoe UI",system-ui,-apple-system,sans-serif;font-size:17px;line-height:1.55;color:var(--ink);
  background:var(--bg);max-width:760px;margin:0 auto;padding:clamp(16px,4vw,32px);border-radius:14px;box-sizing:border-box}
@media (prefers-color-scheme:dark){.nt{--bg:#0f1e1d;--panel:#152a28;--ink:#e2eeec;--soft:#97aeab;--line:#28403d;--teal:#4fc3b9;--tealsoft:#1d3a37;--code:#10221f}}
.nt *{box-sizing:border-box}
.nt button,.nt input,.nt textarea,.nt select{font:inherit;color:inherit}
.nt :focus-visible{outline:2px solid var(--teal);outline-offset:3px}
.nt-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:14px;font-size:13px;color:var(--soft)}
.nt-head b{font-weight:600}
.nt-count{font-variant-numeric:tabular-nums}
.nt-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.nt-tab{border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:6px 14px;font-size:14px;font-weight:600;cursor:pointer;color:var(--ink)}
.nt-tab[aria-selected="true"]{background:var(--ink);color:var(--panel);border-color:var(--ink)}
.nt-tab small{font-weight:500;opacity:.75;margin-left:6px}
.nt-sep{width:1px;background:var(--line);margin:0 4px}
.nt-rail{display:flex;gap:4px;margin-bottom:22px}
.nt-seg{flex:1;height:6px;border-radius:3px;background:var(--line);border:0;padding:0;cursor:pointer}
.nt-seg.on{background:var(--teal)}
.nt-step{animation:nt-in .25s ease-out}
@keyframes nt-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.nt-step{animation:none}}
.nt-mind{display:inline-block;background:var(--tealsoft);color:var(--ink);border-radius:10px;padding:4px 12px;font-size:14px;font-weight:600;margin-bottom:12px}
.nt-label{font-size:14px;font-weight:600;color:var(--teal);margin:0 0 4px}
.nt-title{font-size:clamp(24px,5vw,32px);font-weight:700;line-height:1.15;letter-spacing:-0.01em;margin:0 0 12px}
.nt-p{max-width:62ch;margin:0 0 14px}
.nt-meta{font-size:13px;color:var(--soft)}
.nt-keys{display:flex;flex-direction:column;gap:6px;margin:0 0 14px;font-size:15px}
.nt-keys div{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.nt kbd{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;background:var(--panel);border:1px solid var(--line);border-bottom-width:2px;border-radius:5px;padding:1px 7px}
.nt-plus{color:var(--soft);font-size:13px}
.nt-card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:0 0 16px}
.nt-mock h3{font-size:22px;margin:0 0 8px;line-height:1.2}
.nt-mock p{margin:0 0 8px}
.nt-blk{position:relative;padding-left:22px;margin:3px 0}
.nt-blk::before{content:"";position:absolute;left:4px;top:.6em;width:7px;height:7px;border-radius:50%;background:var(--soft);box-shadow:0 0 0 4px var(--tealsoft)}
.nt-todo{display:flex;align-items:center;gap:8px;margin:4px 0}
.nt-box{width:15px;height:15px;border-radius:3px;border:1.5px solid var(--soft);display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex:none;color:#fff;background:transparent;padding:0;cursor:pointer}
.nt-box.done{background:var(--teal);border-color:var(--teal)}
.nt-strike{text-decoration:line-through;color:var(--soft)}
.nt-link{color:var(--teal);font-weight:600}
.nt-chip{display:inline-block;background:var(--tealsoft);color:var(--teal);font-weight:600;border-radius:10px;padding:0 8px;font-size:14px}
.nt-code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13.5px;background:var(--code);border:1px solid var(--line);border-radius:6px;padding:8px 10px;white-space:pre-wrap;margin:6px 0;overflow-x:auto}
.nt-scroll{overflow-x:auto}
.nt-table{border-collapse:collapse;width:100%;font-size:15px}
.nt-table th,.nt-table td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:middle}
.nt-table th{font-size:13px;color:var(--soft);font-weight:600}
.nt-tip{border-left:3px solid var(--teal);padding:4px 0 4px 12px;color:var(--soft);margin:0 0 16px;max-width:62ch;font-size:15px}
.nt-try{border:1.5px dashed var(--teal);border-radius:10px;padding:14px 16px;margin:0 0 16px;background:var(--panel)}
.nt-try-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}
.nt-try-head p{margin:0;font-weight:600;max-width:52ch}
.nt-badge{flex:none;font-size:13px;font-weight:600;border-radius:10px;padding:2px 10px;background:var(--code);color:var(--soft);border:1px solid var(--line)}
.nt-badge.ok{background:var(--tealsoft);color:var(--teal);border-color:var(--teal)}
.nt-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.nt-input,.nt-ta,.nt-sel{background:var(--code);border:1px solid var(--line);border-radius:6px;padding:8px 10px;font-size:15px}
.nt-input{flex:1;min-width:160px}
.nt-ta{width:100%;min-height:80px;resize:vertical;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13.5px}
.nt-ta.prose{font-family:Charter,"Iowan Old Style",Georgia,serif;font-size:17px;line-height:1.7;min-height:110px}
.nt-input:focus,.nt-ta:focus,.nt-sel:focus{outline:none;box-shadow:0 0 0 2px var(--teal);border-color:var(--teal)}
.nt-btn{border-radius:8px;padding:10px 18px;font-size:15px;font-weight:600;cursor:pointer;background:var(--panel);border:1px solid var(--line);color:var(--ink)}
.nt-btn.pri{background:var(--teal);border-color:var(--teal);color:var(--panel)}
.nt-btn:disabled{opacity:.45;cursor:not-allowed}
.nt-btn.sm{padding:4px 10px;font-size:13px}
.nt-opts{display:flex;flex-direction:column;gap:8px}
.nt-opt{text-align:left;border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:10px 14px;cursor:pointer;font-size:15px}
.nt-opt.sel{border-color:var(--teal);box-shadow:inset 0 0 0 1px var(--teal)}
.nt-why{font-size:14px;color:var(--soft);margin-top:4px}
.nt-why b{color:var(--ink)}
.nt-fb{margin-top:10px;font-size:15px;max-width:62ch}
.nt-fb.ok{color:var(--teal);font-weight:600}
.nt-fb.err{color:var(--warn)}
.nt-flabel{font-size:13px;color:var(--soft);display:block;margin:10px 0 4px}
.nt-nav{display:flex;justify-content:space-between;gap:10px;margin-top:8px;flex-wrap:wrap}
.nt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.nt-board{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.nt-col{background:var(--code);border:1px solid var(--line);border-radius:10px;padding:10px}
.nt-col h4{margin:0 0 8px;font-size:14px;display:flex;justify-content:space-between}
.nt-bcard{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin-bottom:8px;font-size:15px}
.nt-out{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px}
.nt-del{background:none;border:0;cursor:pointer;color:var(--soft);font-size:16px;padding:2px 6px;border-radius:5px}
.nt-ref{font-size:14px;color:var(--soft);columns:2 220px}
.nt-ref code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;color:var(--ink)}
`;

/* ---------------- Formula engine (no eval) ---------------- */

function tokenize(src) {
  const toks = [];
  let i = 0;
  let depth = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if ('"“”'.includes(c)) {
      let j = i + 1, s = "";
      while (j < src.length && !'"“”'.includes(src[j])) { s += src[j]; j++; }
      if (j >= src.length) throw new Error("A text value is missing its closing quote mark.");
      toks.push({ t: "str", v: s }); i = j + 1; continue;
    }
    if (/[0-9.]/.test(c)) {
      const m = src.slice(i).match(/^\d*\.?\d+/);
      if (!m) throw new Error("That number doesn’t look right.");
      toks.push({ t: "num", v: parseFloat(m[0]) }); i += m[0].length; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = src.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/)[0];
      toks.push({ t: "id", v: m }); i += m.length; continue;
    }
    const two = src.slice(i, i + 2);
    if (["==", "!=", ">=", "<=", "&&", "||"].includes(two)) { toks.push({ t: "op", v: two }); i += 2; continue; }
    if (c === "(") { depth++; toks.push({ t: "(", v: c }); i++; continue; }
    if (c === ")") {
      depth--;
      if (depth < 0) throw new Error("Unbalanced brackets: there’s a “)” without a matching “(”.");
      toks.push({ t: ")", v: c }); i++; continue;
    }
    if (c === ",") { toks.push({ t: ",", v: c }); i++; continue; }
    if ("+-*/%<>!".includes(c)) { toks.push({ t: "op", v: c }); i++; continue; }
    throw new Error(`I don’t recognise the character “${c}”.`);
  }
  if (depth > 0) throw new Error(`Unbalanced brackets: ${depth} “(” ${depth === 1 ? "isn’t" : "aren’t"} closed.`);
  return toks;
}

function parse(toks) {
  let p = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];
  const isOp = (v) => peek() && peek().t === "op" && peek().v === v;
  const isKw = (v) => peek() && peek().t === "id" && peek().v === v && !(toks[p + 1] && toks[p + 1].t === "(");
  const expr = () => or();
  function or() { let l = and(); while (isOp("||") || isKw("or")) { next(); l = { k: "bin", op: "||", l, r: and() }; } return l; }
  function and() { let l = eq(); while (isOp("&&") || isKw("and")) { next(); l = { k: "bin", op: "&&", l, r: eq() }; } return l; }
  function eq() { let l = cmp(); while (isOp("==") || isOp("!=")) { const op = next().v; l = { k: "bin", op, l, r: cmp() }; } return l; }
  function cmp() { let l = add(); while (["<", ">", "<=", ">="].some(isOp)) { const op = next().v; l = { k: "bin", op, l, r: add() }; } return l; }
  function add() { let l = mul(); while (isOp("+") || isOp("-")) { const op = next().v; l = { k: "bin", op, l, r: mul() }; } return l; }
  function mul() { let l = unary(); while (isOp("*") || isOp("/") || isOp("%")) { const op = next().v; l = { k: "bin", op, l, r: unary() }; } return l; }
  function unary() {
    if (isOp("!") || isKw("not")) { next(); return { k: "not", e: unary() }; }
    if (isOp("-")) { next(); return { k: "neg", e: unary() }; }
    return primary();
  }
  function primary() {
    const t = next();
    if (!t) throw new Error("The formula ends too early — is something missing at the end?");
    if (t.t === "num" || t.t === "str") return { k: "lit", v: t.v };
    if (t.t === "(") {
      const e = expr();
      if (!peek() || peek().t !== ")") throw new Error("Expected a closing “)”.");
      next(); return e;
    }
    if (t.t === "id") {
      if (t.v === "true" || t.v === "false") return { k: "lit", v: t.v === "true" };
      if (peek() && peek().t === "(") {
        next();
        const args = [];
        if (peek() && peek().t === ")") { next(); }
        else {
          for (;;) {
            args.push(expr());
            const n = next();
            if (!n) throw new Error(`${t.v}( is missing its closing “)”.`);
            if (n.t === ")") break;
            if (n.t !== ",") throw new Error(`Inside ${t.v}( … ) I expected a comma between arguments, but found “${n.v}”.`);
          }
        }
        return { k: "call", f: t.v, args };
      }
      throw new Error(`“${t.v}” isn’t something I know. Did you mean prop("${t.v}")?`);
    }
    throw new Error(`Unexpected “${t.v}”.`);
  }
  if (!toks.length) throw new Error("The formula is empty.");
  const e = expr();
  if (p < toks.length) throw new Error(`Unexpected “${toks[p].v}” — perhaps a comma or operator is missing before it.`);
  return e;
}

const fmt = (v) => (v === null || v === undefined ? "" : typeof v === "number" ? String(Math.round(v * 1e6) / 1e6) : String(v));
const truthy = (v) => !(v === false || v === 0 || v === "" || v === null || v === undefined);
function num(v) {
  if (typeof v !== "number") throw new Error(`Expected a number but got “${fmt(v)}”.`);
  return v;
}

const ARITY = {
  prop: [1, 1], if: [3, 3], and: [2, 9], or: [2, 9], not: [1, 1], concat: [1, 20], length: [1, 1], round: [1, 2],
  abs: [1, 1], min: [1, 20], max: [1, 20], empty: [1, 1], format: [1, 1], toNumber: [1, 1], upper: [1, 1], lower: [1, 1], contains: [2, 2],
};

function ev(n, row) {
  switch (n.k) {
    case "lit": return n.v;
    case "not": return !truthy(ev(n.e, row));
    case "neg": return -num(ev(n.e, row));
    case "bin": {
      if (n.op === "&&") return truthy(ev(n.l, row)) && truthy(ev(n.r, row));
      if (n.op === "||") return truthy(ev(n.l, row)) || truthy(ev(n.r, row));
      const a = ev(n.l, row), b = ev(n.r, row);
      switch (n.op) {
        case "+": return typeof a === "string" || typeof b === "string" ? fmt(a) + fmt(b) : num(a) + num(b);
        case "-": return num(a) - num(b);
        case "*": return num(a) * num(b);
        case "/": if (num(b) === 0) throw new Error("Division by zero."); return num(a) / b;
        case "%": return num(a) % num(b);
        case "==": return a === b;
        case "!=": return a !== b;
        case "<": return num(a) < num(b);
        case ">": return num(a) > num(b);
        case "<=": return num(a) <= num(b);
        case ">=": return num(a) >= num(b);
        default: throw new Error(`Unknown operator ${n.op}.`);
      }
    }
    case "call": {
      const ar = ARITY[n.f];
      if (!ar) throw new Error(`There’s no function called ${n.f}() in this playground.`);
      if (n.args.length < ar[0] || n.args.length > ar[1]) {
        throw new Error(`${n.f}() takes ${ar[0] === ar[1] ? ar[0] : `${ar[0]}–${ar[1]}`} argument${ar[1] === 1 ? "" : "s"}, but got ${n.args.length}.`);
      }
      const A = (i) => ev(n.args[i], row);
      switch (n.f) {
        case "prop": {
          const name = A(0);
          if (!(name in row)) throw new Error(`There’s no property called “${name}”. Try: ${Object.keys(row).join(", ")}.`);
          return row[name];
        }
        case "if": return truthy(A(0)) ? A(1) : A(2);
        case "and": return n.args.every((_, i) => truthy(A(i)));
        case "or": return n.args.some((_, i) => truthy(A(i)));
        case "not": return !truthy(A(0));
        case "concat": return n.args.map((_, i) => fmt(A(i))).join("");
        case "length": return fmt(A(0)).length;
        case "round": { const d = n.args.length > 1 ? num(A(1)) : 0; const f = Math.pow(10, d); return Math.round(num(A(0)) * f) / f; }
        case "abs": return Math.abs(num(A(0)));
        case "min": return Math.min(...n.args.map((_, i) => num(A(i))));
        case "max": return Math.max(...n.args.map((_, i) => num(A(i))));
        case "empty": return !truthy(A(0));
        case "format": return fmt(A(0));
        case "toNumber": { const v = parseFloat(fmt(A(0))); return isNaN(v) ? 0 : v; }
        case "upper": return fmt(A(0)).toUpperCase();
        case "lower": return fmt(A(0)).toLowerCase();
        case "contains": return fmt(A(0)).includes(fmt(A(1)));
        default: throw new Error(`Unknown function ${n.f}().`);
      }
    }
    default: throw new Error("Something unexpected happened.");
  }
}

function compileFormula(src) {
  try { return { ast: parse(tokenize(src)) }; }
  catch (e) { return { error: e.message }; }
}
function runAst(ast, row) {
  try { return { value: ev(ast, row) }; }
  catch (e) { return { error: e.message }; }
}

/* ---------------- Sample data ---------------- */

const SAMPLE_ROWS = [
  { Name: "Write brief", "Days left": 3, Done: false, Priority: "High", Hours: 2 },
  { Name: "Book venue", "Days left": -2, Done: false, Priority: "Medium", Hours: 1.5 },
  { Name: "Send invites", "Days left": -5, Done: true, Priority: "Low", Hours: 0.5 },
  { Name: "Order cake", "Days left": 0, Done: false, Priority: "High", Hours: 1 },
];

const LATE_TESTS = [
  { row: SAMPLE_ROWS[0], expect: "" },
  { row: SAMPLE_ROWS[1], expect: "Late" },
  { row: SAMPLE_ROWS[2], expect: "" },
  { row: SAMPLE_ROWS[3], expect: "" },
];
const FIX_TESTS = [
  { row: SAMPLE_ROWS[0], expect: "On track" },
  { row: SAMPLE_ROWS[1], expect: "Late" },
  { row: SAMPLE_ROWS[2], expect: "✓ Done" },
  { row: SAMPLE_ROWS[3], expect: "On track" },
];

const STATUSES = ["To do", "Doing", "Done"];
const PRIORITIES = ["Low", "Medium", "High"];
const START_DB = [
  { id: 1, name: "Draft newsletter", status: "Doing", priority: "High", due: "2026-11-02" },
  { id: 2, name: "Update team wiki", status: "To do", priority: "Low", due: "2026-11-14" },
  { id: 3, name: "Plan Q1 offsite", status: "To do", priority: "Medium", due: "2026-11-20" },
  { id: 4, name: "Fix onboarding checklist", status: "Done", priority: "Medium", due: "2026-10-20" },
];

/* ---------------- Tutorial content ---------------- */

const LEVELS = [
  {
    id: "novice", name: "Novice", mindset: "Novice — follow the rules",
    steps: [
      {
        label: "Pages & blocks", title: "Everything is a block",
        body: "In Notion, every paragraph, heading, checkbox and image is a block. To make a new kind of block, press / on an empty line, type the block’s name, then press Enter.",
        keys: [["/", "open the block menu"], ["Enter", "choose the highlighted option"], ["Esc", "close the menu"]],
        mock: [{ type: "h", text: "Weekly plan" }, { type: "p", text: "Each line here is its own block." }, { type: "code", text: "/heading 1" }],
        tryit: {
          type: "input", task: "Type the slash command that turns an empty line into a large heading.", placeholder: "Start with /",
          check: (v) => ["/heading 1", "/h1", "/heading1"].includes(v.trim().toLowerCase())
            ? { ok: true, msg: "Exactly. Press Enter and the line becomes a Heading 1." }
            : { ok: false, msg: "Not quite. Start with / and then type heading 1." },
        },
        tip: "Shortcut: Cmd+Option+1 on Mac, Ctrl+Shift+1 on Windows turns the current line into Heading 1.",
      },
      {
        label: "Pages & blocks", title: "Make a to-do in two keystrokes",
        body: "Type [] at the start of a line, then press Space. The line becomes a to-do with a checkbox. To tick it without the mouse, press Ctrl/Cmd+Enter.",
        keys: [["[] + Space", "turn the line into a to-do"], ["Ctrl/Cmd + Enter", "tick or untick the to-do"]],
        mock: [{ type: "todo", text: "Book the meeting room", done: true }, { type: "todo", text: "Send the agenda", done: false }],
        tryit: {
          type: "input", task: "Type the two characters that start a to-do (before the space).", placeholder: "Two characters",
          check: (v) => v.trim() === "[]"
            ? { ok: true, msg: "Right. Add a space after them and Notion draws the checkbox." }
            : { ok: false, msg: "Try an opening and a closing square bracket, with nothing between them." },
        },
      },
      {
        label: "Pages & blocks", title: "Link to another page",
        body: "Type [[ and start typing a page’s name, then pick it from the list. The text becomes a link to that page. To link existing text instead, select it and press Ctrl/Cmd+K.",
        keys: [["[[", "search for a page to link"], ["@", "mention a page, person or date"], ["Ctrl/Cmd + K", "add a link to selected text"]],
        mock: [{ type: "p", text: "Agenda is on [[Team meeting]] — owner @Sam" }],
        tryit: {
          type: "input", task: "Type the characters that start a page link (not @).", placeholder: "Two characters",
          check: (v) => v.trim() === "[["
            ? { ok: true, msg: "Spot on. A search box opens for you to pick the page." }
            : { ok: false, msg: "It’s two opening square brackets." },
        },
      },
      {
        label: "Databases", title: "Create a table database",
        body: "A database is a collection of pages that share the same properties. In a table, each row is a page and each column is a property. Type /table and choose “Table view” to make one inside the current page.",
        keys: [["/", "then type table and press Enter"]],
        mock: [{ type: "table", cols: ["Name", "Status", "Due"], rows: [["Draft newsletter", "Doing", "2 Nov"], ["Update wiki", "To do", "14 Nov"]] }],
        tryit: {
          type: "input", task: "Type the slash command that creates a table.", placeholder: "Start with /",
          check: (v) => ["/table", "/table view"].includes(v.trim().toLowerCase())
            ? { ok: true, msg: "That’s it. Pick “Table view”, then choose “New database”." }
            : { ok: false, msg: "Start with / followed by the word table." },
        },
      },
      {
        label: "Databases", title: "Add a property",
        body: "A property is a column of information every row shares. Click + at the right end of the table’s header row, choose a type (Text, Number, Select, Date, Checkbox and so on) and give it a name.",
        mock: [{ type: "table", cols: ["Name", "Status", "Due", "+"], rows: [["Draft newsletter", "Doing", "2 Nov", ""]] }],
        tryit: {
          type: "input", task: "Which property type holds a deadline? Type its name.", placeholder: "One word",
          check: (v) => v.trim().toLowerCase() === "date"
            ? { ok: true, msg: "Correct. A Date property gives you a calendar picker and lets you sort by deadline." }
            : { ok: false, msg: "Think about what a deadline is: a day on the calendar." },
        },
        tip: "Every row in a database is a full page. Click a row’s name and choose Open to write inside it.",
      },
    ],
  },
  {
    id: "advbeg", name: "Advanced beginner", mindset: "Advanced beginner — recognise situations",
    steps: [
      {
        label: "Pages vs databases", title: "Page or database?",
        body: "Rule of thumb: use a page for one-off writing such as notes, a plan or a story. Use a database when you have many similar items that you’ll want to sort, filter or count.",
        mock: [{ type: "bullet", text: "Holiday packing ideas → page", level: 0 }, { type: "bullet", text: "40 job applications with stage and date → database", level: 0 }],
        tryit: {
          type: "choice", task: "You want to track 40 books, each with an author, a rating and whether you’ve finished it. What fits?",
          options: [
            { label: "A page with a bulleted list of titles", correct: false, why: "A list is fine for five titles, but you can’t sort by rating or show only unfinished books." },
            { label: "A database with Author, Rating and Status properties", correct: true, why: "Many similar items sharing the same attributes is the classic database situation: sort, filter and count come free." },
            { label: "A toggle list, one toggle per book", correct: false, why: "Toggles tidy detail away, but it’s still free text. Nothing can be sorted or filtered." },
          ],
        },
      },
      {
        label: "Views", title: "Pick the right view",
        body: "The same database can be shown in different views. Use Table to edit many properties, Board to see work moving through stages, Calendar when dates matter, Gallery when pictures matter and Timeline for work that spans days.",
        mock: [{ type: "p", text: "One #Tasks database → Table for editing, Board for stand-ups, Calendar for deadlines." }],
        tryit: {
          type: "choice", task: "Your team’s daily stand-up: you want to see at a glance what’s To do, Doing and Done.",
          options: [
            { label: "Table view", correct: false, why: "It works, but people have to read the Status column row by row." },
            { label: "Board view grouped by Status", correct: true, why: "Columns per stage show the flow of work instantly, and you can drag cards as status changes." },
            { label: "Calendar view", correct: false, why: "Calendar answers “when?”, not “how far along?”." },
            { label: "Gallery view", correct: false, why: "Gallery is built around cover images; status is buried in each card." },
          ],
        },
      },
      {
        label: "Linking", title: "Mention or relation?",
        body: "An @mention is a one-off link inside text. A relation is a database property that connects rows in two databases, and it shows up on both sides. Use a mention to point at something; use a relation when you want to list, count or summarise connected items.",
        mock: [{ type: "table", cols: ["Task", "Project (relation)"], rows: [["Book venue", "Summer party"], ["Order cake", "Summer party"]] }],
        tryit: {
          type: "choice", task: "Every task belongs to a project, and each project page should automatically list its tasks.",
          options: [
            { label: "@mention the project in each task’s text", correct: false, why: "A mention links one way; the project page won’t gather its tasks into a list." },
            { label: "A relation property between Tasks and Projects", correct: true, why: "Relations work in both directions, so each project shows its tasks automatically, and you can roll them up later." },
            { label: "Copy task names onto each project page by hand", correct: false, why: "It works for a day, then goes out of date as tasks change." },
          ],
        },
      },
      {
        label: "Templates", title: "Which kind of template?",
        body: "Database templates create a pre-filled page inside a database from the New ▾ menu, and can repeat on a schedule. Template buttons (/button) insert blocks or pages wherever you click them. The Template Gallery gives you whole ready-made setups.",
        mock: [{ type: "h", text: "Meeting — 2 Nov" }, { type: "bullet", text: "Agenda", level: 0 }, { type: "bullet", text: "Notes", level: 0 }, { type: "bullet", text: "Actions", level: 0 }],
        tryit: {
          type: "choice", task: "Each Monday you add a note to your Meetings database, always with Agenda, Notes and Actions headings.",
          options: [
            { label: "A database template in Meetings, set to repeat weekly", correct: true, why: "The note lands in the right database with the right headings, and repeating means it appears without you asking." },
            { label: "A template button on your home page", correct: false, why: "Buttons can add pages to a database, but it takes more set-up and you still have to remember to click." },
            { label: "Duplicate last week’s page", correct: false, why: "You’d carry over last week’s notes and have to clear them every time." },
          ],
        },
        tip: "A good test: if the thing you’re creating belongs in a database, the template should live in that database.",
      },
    ],
  },
  {
    id: "competent", name: "Competent", mindset: "Competent — plan and choose",
    steps: [
      {
        label: "Views & filters", title: "Plan: show only what’s overdue",
        body: "Goal: a view of tasks that are past their due date and not finished. There’s more than one sound way to do this. Describe your plan in a sentence or two. It needs to deal with the date and with whether the task is done.",
        tryit: {
          type: "plan", task: "How would you build an “Overdue” view?", placeholder: "e.g. I’d add a filter where…",
          check: (v) => {
            const t = v.toLowerCase();
            const date = /due|date|before|today|overdue|past/.test(t);
            const done = /done|status|complete|finish|checkbox|unfinished|open/.test(t);
            const formula = /formula/.test(t);
            if (formula && (date || done)) return { ok: true, msg: "Approach: a formula property that flags overdue rows, then a filter on it. It’s reusable across views and dashboards. Alternative: two plain filters (Due is before Today, and Status is not Done), with no formula to maintain." };
            if (date && done) return { ok: true, msg: "Approach: a filter with two conditions — the date and the done state. Quick and transparent. Alternative: an “Overdue” formula property you can reuse in several views." };
            if (date) return { ok: false, msg: "You’ve covered the date. What about tasks that are already finished?" };
            if (done) return { ok: false, msg: "You’ve covered finished tasks. How will you pick out the overdue ones?" };
            return { ok: false, msg: "Mention how you’ll handle the due date and the done state." };
          },
        },
      },
      {
        label: "Relations & rollups", title: "Plan: progress on every project",
        body: "Goal: each project shows the percentage of its tasks that are done. A rollup reads a property through a relation and summarises it (count, sum, percentage and so on). Decide how you’d build it.",
        mock: [{ type: "table", cols: ["Project", "Tasks", "Progress"], rows: [["Summer party", "5", "60%"], ["Website refresh", "8", "25%"]] }],
        tryit: {
          type: "plan", task: "Describe how each project will show its completion percentage.", placeholder: "First I’d connect…",
          check: (v) => {
            const t = v.toLowerCase();
            const rel = /relation|relate|connect|link/.test(t);
            const roll = /roll ?up/.test(t);
            const form = /formula/.test(t);
            if (!rel) return { ok: false, msg: "Projects and tasks need to be connected first. How will they be linked?" };
            if (roll) return { ok: true, msg: "Approach: relation + rollup using “Percent checked” (or “Percent per group” on Status). No code needed. Alternative: a formula over the relation for custom wording, such as “3 of 5 done”." };
            if (form) return { ok: true, msg: "Approach: relation + formula. Flexible wording and maths. Alternative: a rollup with “Percent checked”, which needs no formula at all." };
            return { ok: false, msg: "Good start with the link. What will turn connected tasks into a percentage?" };
          },
        },
      },
      {
        label: "Formulas", title: "Write a “Late” flag",
        body: "Each sample row has a number property “Days left” and a checkbox “Done”. Write a formula that returns \"Late\" when Days left is below zero and the task isn’t done, and an empty text \"\" otherwise. Any formula that gives the right results passes.",
        mock: [{ type: "code", text: 'prop("Days left")   prop("Done")   if(condition, "yes", "no")' }],
        tryit: {
          type: "formula", task: "Write a formula that flags late, unfinished tasks.", initial: "", tests: LATE_TESTS,
          approach: (src) => {
            const ifs = (src.match(/\bif\s*\(/g) || []).length;
            if (/&&|\band\b/.test(src)) return "Approach: one if() with a combined condition. Alternative: nested if()s — wordier, but easier to extend with more cases.";
            if (ifs >= 2) return "Approach: nested if()s. Alternative: combine both conditions with and(…) or && in a single if().";
            return "Alternative: try writing it a different way, with and(…) or nested if()s.";
          },
        },
        tip: "Stuck? Use the Formula playground tab to experiment against the same rows.",
      },
      {
        label: "Automations", title: "Plan: stamp the finish date",
        body: "Goal: when a task is marked Done, record the date it was finished. Notion offers database automations (“when this happens, do that”), buttons, and automatic properties such as Last edited time. Each has trade-offs; commit to one.",
        tryit: {
          type: "plan", task: "How will the finish date be recorded?", placeholder: "When a task…",
          check: (v) => {
            const t = v.toLowerCase();
            if (/automat|trigger/.test(t)) return { ok: true, msg: "Approach: a database automation — trigger “Status set to Done”, action “Edit property Completed → today”. Hands-free. Alternative: a “Finish” button that sets Status and the date together, which works even where automations aren’t available on your plan." };
            if (/button/.test(t)) return { ok: true, msg: "Approach: a button that sets Status to Done and stamps the date in one click. Reliable if people use it. Alternative: an automation, so it happens however the status changes." };
            if (/last edited|edited time/.test(t)) return { ok: true, msg: "Approach: Last edited time. Zero set-up, but it changes whenever anything is edited later, so it drifts. Alternative: an automation that writes a fixed date once." };
            if (/when|date property/.test(t)) return { ok: false, msg: "Nearly. Say what will set the date: an automation, a button or an automatic property?" };
            return { ok: false, msg: "Say what triggers the date being set and where it’s stored." };
          },
        },
      },
    ],
  },
  {
    id: "proficient", name: "Proficient", mindset: "Proficient — see what matters",
    steps: [
      {
        label: "Performance", title: "The tasks page crawls",
        body: "Your team’s Tasks database holds 8,000 rows going back four years. The main page has three linked views, all showing every task, plus rollups counting tasks per person. It takes ages to load, and people have started keeping private lists instead.",
        tryit: {
          type: "choice", requireWhy: true, showAll: true, task: "What would you fix first, and why?",
          options: [
            { label: "Filter the default views to open or recent tasks, and archive old ones", correct: true, why: "Biggest win: views only load what they show. Trade-off: old tasks are a click away instead of on screen." },
            { label: "Delete unused properties", correct: false, why: "Tidy and slightly helpful, but property count isn’t the main cost here — unfiltered row count is." },
            { label: "Split it into one database per year", correct: false, why: "Pages get faster, but relations and reports across years break." },
            { label: "Replace rollups with numbers typed by hand", correct: false, why: "Faster, but the numbers are wrong the moment anything changes." },
          ],
        },
      },
      {
        label: "Consistency", title: "Three ways to say “done”",
        body: "Projects use a Select called Stage with “Complete”. Tasks use Status with “Done”. Bugs use a checkbox called “Finished?”. The leadership dashboard’s counts never match what teams report.",
        tryit: {
          type: "choice", requireWhy: true, showAll: true, task: "Which approach is best here, and why?",
          options: [
            { label: "Standardise on the built-in Status property with the same groups everywhere", correct: true, why: "One vocabulary fixes the root cause; filters and rollups line up. Trade-off: a one-off migration and some retraining." },
            { label: "Add a formula in each database that translates its own word to “Done”", correct: false, why: "Quick, but you maintain three translation formulas forever, and new databases will drift again." },
            { label: "Merge all three into one giant database", correct: false, why: "Sometimes right, but a big migration; bugs and projects need different properties and templates." },
            { label: "Leave the data and adjust the dashboard filters", correct: false, why: "Treats the symptom; every new view has to rediscover the three spellings." },
          ],
        },
      },
      {
        label: "Formulas", title: "Fix a broken formula",
        body: "This formula should show “✓ Done” for finished tasks, “Late” when Days left is below zero, and “On track” otherwise. It shows an error instead. Find what matters and fix it.",
        tryit: {
          type: "formula", requireWhy: true, task: "Repair the formula so every sample row is correct.",
          initial: 'if(prop("Done") "✓ Done", if(prop("Days left") < 0, "Late", "On track")', tests: FIX_TESTS,
          approach: () => "Fixed. The usual culprits are a missing comma between if() arguments and an unclosed bracket — read the error, then count brackets from the outside in.",
        },
      },
      {
        label: "Workspace structure", title: "Where did that page go?",
        body: "A new joiner can’t find anything. The sidebar has 60 top-level pages, three different “Meeting notes” pages and no home page. Search turns up old drafts first.",
        tryit: {
          type: "choice", requireWhy: true, showAll: true, task: "Which approach is best here, and why?",
          options: [
            { label: "Create a Home hub linking key areas, move stray pages under it and merge notes into one database", correct: true, why: "Gives one front door and removes duplicates. Trade-off: an afternoon of tidying and agreeing where things live." },
            { label: "Tell everyone to use search (Ctrl/Cmd+P)", correct: false, why: "Helps if you know the name; doesn’t fix duplicates or show what exists." },
            { label: "Lock all pages", correct: false, why: "Stops edits, not mess." },
            { label: "Add emoji prefixes to page names", correct: false, why: "Cosmetic; 60 pages with emoji are still 60 pages." },
          ],
        },
      },
    ],
  },
  {
    id: "expert", name: "Expert", mindset: "Expert — act on intuition and create",
    steps: [
      {
        label: "Real-world brief", title: "Design a system of your own",
        body: "Brief: a friend runs a small bakery. She wants to track orders, regular customers and what to bake each morning. There’s no recipe here. Build it in your own Notion or sketch it in the Database sandbox tab, then describe it.",
        tryit: {
          type: "expert", task: "Build it, then reflect.",
          prompts: ["What did you build? (databases, properties, relations, views)", "Reflection: after a week of real use, what would you change?"],
        },
      },
      {
        label: "Edge cases", title: "When the rules break",
        body: "Notion’s rules of thumb stop working at the edges. Relations become hard to follow beyond two or three levels. Very large data sets are often happier in a spreadsheet or a proper database. Offline use is limited, and page permissions can be inherited in surprising ways.",
        tryit: {
          type: "expert", task: "Think about the edges.",
          prompts: ["Describe one case where you would NOT use a Notion database, and what you’d use instead.", "Reflection: which rule from an earlier stage would you now break, and why?"],
        },
      },
      {
        label: "Teach it back", title: "Explain it in your own words",
        body: "Explaining something is the quickest way to find the gaps in your own understanding. Then keep learning with others: the Notion Help Centre, the Template Gallery, the r/Notion community and local Notion meet-ups run by community ambassadors.",
        tryit: {
          type: "expert", task: "Teach it to a new colleague.",
          prompts: ["Explain the difference between a relation and a rollup.", "Reflection: what was hardest to explain, and what does that tell you?"],
        },
        tip: "Share a template you’ve built in the community. Other people’s questions will show you what you know.",
      },
    ],
  },
];

/* ---------------- Extra steps (appended so each stage has 12) ---------------- */

const MINUTES_TESTS = [
  { row: SAMPLE_ROWS[0], expect: "120" }, { row: SAMPLE_ROWS[1], expect: "90" },
  { row: SAMPLE_ROWS[2], expect: "30" }, { row: SAMPLE_ROWS[3], expect: "60" },
];
const SCORE_TESTS = [
  { row: SAMPLE_ROWS[0], expect: "3" }, { row: SAMPLE_ROWS[1], expect: "2" },
  { row: SAMPLE_ROWS[2], expect: "1" }, { row: SAMPLE_ROWS[3], expect: "3" },
];
const LABEL_TESTS = [
  { row: SAMPLE_ROWS[0], expect: "Write brief (2 h)" }, { row: SAMPLE_ROWS[1], expect: "Book venue (1.5 h)" },
  { row: SAMPLE_ROWS[2], expect: "Send invites (0.5 h)" }, { row: SAMPLE_ROWS[3], expect: "Order cake (1 h)" },
];
const EFFORT_TESTS = [
  { row: SAMPLE_ROWS[0], expect: "Big" }, { row: SAMPLE_ROWS[1], expect: "Big" },
  { row: SAMPLE_ROWS[2], expect: "Small" }, { row: SAMPLE_ROWS[3], expect: "Small" },
];
const FIX2_TESTS = [
  { row: SAMPLE_ROWS[0], expect: "OK" }, { row: SAMPLE_ROWS[1], expect: "Late" },
  { row: SAMPLE_ROWS[2], expect: "Late" }, { row: SAMPLE_ROWS[3], expect: "OK" },
];
const FIX3_TESTS = [
  { row: SAMPLE_ROWS[0], expect: "180" }, { row: SAMPLE_ROWS[1], expect: "150" },
  { row: SAMPLE_ROWS[2], expect: "90" }, { row: SAMPLE_ROWS[3], expect: "120" },
];

const exact = (answers, good, bad) => (v) =>
  answers.includes(v.trim().toLowerCase()) ? { ok: true, msg: good } : { ok: false, msg: bad };

const PROF = (task, options) => ({ type: "choice", requireWhy: true, showAll: true, task, options });
const EXP = (task, prompts) => ({ type: "expert", task, prompts });

const EXTRA_STEPS = {
  novice: [
    {
      label: "Pages & blocks", title: "Make a page inside a page",
      body: "Pages can hold other pages. Type /page and press Enter to create a sub-page right where your cursor is. It appears as a link you can click into.",
      keys: [["/", "then type page and press Enter"], ["Ctrl/Cmd + N", "create a new page"]],
      mock: [{ type: "h", text: "Projects" }, { type: "p", text: "[[Summer party]]" }, { type: "p", text: "[[Website refresh]]" }],
      tryit: { type: "input", task: "Type the slash command that creates a sub-page.", placeholder: "Start with /",
        check: exact(["/page"], "Yes. Name the new page and you’re inside it.", "Start with / followed by the word page.") },
    },
    {
      label: "Pages & blocks", title: "Indent to nest blocks",
      body: "Press Tab at the start of a block to tuck it under the block above. Press Shift+Tab to move it back out. Nested blocks move together.",
      keys: [["Tab", "indent"], ["Shift + Tab", "outdent"]],
      mock: [{ type: "bullet", text: "Party", level: 0 }, { type: "bullet", text: "Venue", level: 1 }, { type: "bullet", text: "Cake", level: 1 }],
      tryit: { type: "input", task: "Which single key indents a block under the one above?", placeholder: "Key name",
        check: exact(["tab"], "Correct. Tab nests the block one level in.", "It’s the key above Caps Lock.") },
    },
    {
      label: "Pages & blocks", title: "Move a block",
      body: "Hover over a block to reveal the ⋮⋮ handle on its left, then drag it. With the keyboard, hold Ctrl/Cmd+Shift and press an arrow key to move the block up or down.",
      keys: [["Ctrl/Cmd + Shift + ↑", "move block up"], ["Ctrl/Cmd + Shift + ↓", "move block down"]],
      tryit: { type: "input", task: "With Ctrl/Cmd+Shift held, which arrow moves a block up? Type the direction.", placeholder: "One word",
        check: exact(["up", "↑", "arrowup", "up arrow"], "Right. The up arrow swaps the block with the one above.", "Think about the direction you want the block to go.") },
    },
    {
      label: "Pages & blocks", title: "Fold content with a toggle",
      body: "A toggle hides its contents until you click the ▸ arrow. Type > then Space at the start of a line to make one, then indent blocks inside it.",
      keys: [["> + Space", "make a toggle"]],
      mock: [{ type: "p", text: "▸ How do I book a room?" }, { type: "p", text: "▾ Who do I ask about expenses?" }, { type: "bullet", text: "Ask @Priya in Finance", level: 1 }],
      tryit: { type: "input", task: "Type the character that starts a toggle (before the space).", placeholder: "One character",
        check: exact([">"], "That’s it. Add a space and the toggle arrow appears.", "It’s the “greater than” symbol.") },
    },
    {
      label: "Navigation", title: "Find anything with search",
      body: "Press Ctrl/Cmd+P to open search. Type part of a page’s name or its contents, use the arrow keys to choose, and press Enter to jump there.",
      keys: [["Ctrl/Cmd + P", "open search"], ["Ctrl/Cmd + [", "go back"], ["Ctrl/Cmd + ]", "go forward"]],
      tryit: { type: "input", task: "With Ctrl/Cmd, which letter opens search?", placeholder: "One letter",
        check: exact(["p", "k"], "Yes. Ctrl/Cmd+P (or Ctrl/Cmd+K) opens search.", "It’s the first letter of “page”.") },
    },
    {
      label: "Databases", title: "Select or multi-select",
      body: "A Select property lets each row pick exactly one option, such as one priority. A Multi-select lets a row have several options, such as several tags.",
      mock: [{ type: "table", cols: ["Recipe", "Course (select)", "Tags (multi-select)"], rows: [["Lemon tart", "Dessert", "Baking, Citrus"], ["Soup", "Starter", "Vegan, Quick"]] }],
      tryit: { type: "input", task: "Which property type lets a row have several tags?", placeholder: "Property type",
        check: exact(["multi-select", "multiselect", "multi select"], "Correct. Multi-select holds as many tags as you like.", "It’s the version of Select that allows more than one.") },
    },
    {
      label: "Formulas", title: "Your first formula",
      body: "A Formula property calculates a value for every row. prop(\"Hours\") reads the Hours property. Write a formula that turns Hours into minutes by multiplying by 60.",
      mock: [{ type: "code", text: 'prop("Hours") * 60' }],
      tryit: { type: "formula", task: "Convert Hours into minutes.", initial: "", tests: MINUTES_TESTS,
        approach: () => "Exactly. Each row now shows its minutes, and the formula updates whenever Hours changes." },
      tip: "Property names in prop() must match exactly, including capital letters.",
    },
  ],
  advbeg: [
    {
      label: "Properties", title: "Status, select or checkbox?",
      body: "Use a Checkbox for a yes/no fact. Use a Select for categories with no order. Use Status for work that moves through stages, because it groups options into To-do, In progress and Complete.",
      tryit: { type: "choice", task: "Tasks move through Not started, In progress, Waiting and Done. Which property?",
        options: [
          { label: "Checkbox “Done?”", correct: false, why: "A checkbox only knows done or not done; “Waiting” is lost." },
          { label: "Status", correct: true, why: "Stages with an order are exactly what Status is for, and boards group by it neatly." },
          { label: "Multi-select", correct: false, why: "A task could end up both “Done” and “Not started” at once." },
        ] },
    },
    {
      label: "Pages vs databases", title: "A handbook of chapters",
      body: "Rule of thumb: long-form writing that people read top to bottom suits nested pages. Switch to a database when every page needs the same metadata, such as an owner or a review date.",
      tryit: { type: "choice", task: "Your company handbook has 12 chapters of prose that rarely change.",
        options: [
          { label: "A Handbook page with 12 sub-pages", correct: true, why: "Readers browse it like a book; there’s nothing to sort or filter." },
          { label: "A database with 12 rows and five properties", correct: false, why: "Workable, but you’d be maintaining properties no one needs yet." },
          { label: "One very long page", correct: false, why: "Hard to link to a single chapter and slow to scroll." },
        ] },
    },
    {
      label: "Views", title: "Show a database somewhere else",
      body: "A linked view shows an existing database on another page, with its own filters and layout. Type /linked to add one. The data stays in one place.",
      tryit: { type: "choice", task: "Your home page should show your own tasks from the team’s Tasks database.",
        options: [
          { label: "A linked view of Tasks, filtered to “Assignee is me”", correct: true, why: "One source of truth; your view just looks at it differently." },
          { label: "A new personal Tasks database", correct: false, why: "Now there are two lists to keep in step — they’ll drift." },
          { label: "Copy and paste your tasks each morning", correct: false, why: "Out of date the moment anyone changes a task." },
        ] },
    },
    {
      label: "Views", title: "Filter, sort or group?",
      body: "Filter hides rows. Sort changes their order. Group splits them into labelled sections. Pick based on the question people are asking.",
      tryit: { type: "choice", task: "Your manager wants to see every task split up by who it’s assigned to.",
        options: [
          { label: "Filter by Assignee", correct: false, why: "That shows one person at a time, not everyone side by side." },
          { label: "Sort by Assignee", correct: false, why: "Rows are in order, but there are no clear sections or counts." },
          { label: "Group by Assignee", correct: true, why: "Each person gets a labelled section with a count — the question answered at a glance." },
        ] },
    },
    {
      label: "Blocks", title: "Help readers find one answer",
      body: "Toggles hide detail until it’s wanted. Callouts draw attention to something important. Headings structure a page but don’t hide anything.",
      tryit: { type: "choice", task: "A long FAQ page: each reader needs just one answer among 30.",
        options: [
          { label: "One toggle per question", correct: true, why: "Readers scan the questions and open only the one they need." },
          { label: "A callout for every answer", correct: false, why: "When everything shouts, nothing stands out." },
          { label: "A heading per question with the answer below", correct: false, why: "Still one long scroll. (Toggle headings combine both, though.)" },
        ] },
    },
    {
      label: "Blocks", title: "Same content, many pages",
      body: "A synced block shows identical content on several pages. Edit it anywhere and every copy updates. Make one by copying a block and choosing “Paste and sync”, or with /synced.",
      tryit: { type: "choice", task: "The same contact details appear on six project pages and change a few times a year.",
        options: [
          { label: "A synced block", correct: true, why: "Edit once, updated everywhere — no hunting for stale copies." },
          { label: "Copy and paste onto each page", correct: false, why: "Six places to update, and one will always be missed." },
          { label: "A link to a Contacts page", correct: false, why: "Fine, but readers need an extra click to see the details." },
        ] },
    },
    {
      label: "Sharing", title: "Share just one page",
      body: "Members belong to the workspace. Guests are invited to specific pages only. “Publish to web” makes a page public to anyone with the link.",
      tryit: { type: "choice", task: "A freelancer needs to edit one project page, and nothing else.",
        options: [
          { label: "Invite them as a guest to that page", correct: true, why: "They see exactly what they need; the rest of the workspace stays private." },
          { label: "Add them as a workspace member", correct: false, why: "Gives far more access than the job needs, and may cost a seat." },
          { label: "Publish the page to the web", correct: false, why: "Anyone with the link could read it, and they still couldn’t edit." },
        ] },
    },
    {
      label: "Views", title: "Calendar or timeline?",
      body: "Calendar suits things that happen on a day. Timeline suits work that spans a range of dates and may overlap.",
      tryit: { type: "choice", task: "You’re planning a three-month launch with overlapping phases.",
        options: [
          { label: "Timeline view", correct: true, why: "Bars show each phase’s length and where they overlap." },
          { label: "Calendar view", correct: false, why: "Long phases sprawl across weeks and become hard to read." },
          { label: "Board view", correct: false, why: "Shows stages but not when anything happens." },
        ] },
    },
  ],
  competent: [
    {
      label: "Dashboards", title: "Plan: a personal home page",
      body: "Goal: one page showing today’s tasks, this week’s meetings and a quick way to capture new ideas. The data already lives in Tasks, Meetings and Inbox databases.",
      tryit: { type: "plan", task: "How would you build the home page?", placeholder: "I’d add…",
        check: (v) => {
          const t = v.toLowerCase();
          const view = /linked|view/.test(t), filt = /filter|today|this week|week/.test(t);
          if (view && filt) return { ok: true, msg: /button/.test(t)
            ? "Approach: filtered linked views plus a button for capture. Fast and tidy. Alternative: a linked Inbox view where you type new rows straight in."
            : "Approach: filtered linked views of each database. Alternative: add a button that creates a new Inbox page in one click." };
          if (view) return { ok: false, msg: "Linked views are right. How will you limit them to today and this week?" };
          return { ok: false, msg: "Say how the existing databases will appear on the page." };
        } },
    },
    {
      label: "Formulas", title: "Turn priority into a score",
      body: "Goal: a number for sorting — High is 3, Medium is 2, Low is 1. Any formula that gives these results passes.",
      tryit: { type: "formula", task: "Write a Score formula from Priority.", initial: "", tests: SCORE_TESTS,
        approach: (src) => (/\bif\s*\(/.test(src)
          ? "Approach: nested if()s comparing Priority. Clear to read. Alternative: a Select with numbered option names, sorted directly — no formula."
          : "Approach: a formula without if(). Alternative: nested if()s, which are easier for others to read.") },
    },
    {
      label: "Relations & rollups", title: "Plan: a reading list by author",
      body: "Goal: track books, and see how many books you’ve read by each author. Several designs work; choose one and say why.",
      tryit: { type: "plan", task: "How will you connect books and authors?", placeholder: "I’d set up…",
        check: (v) => {
          const t = v.toLowerCase();
          if (/relation|relate/.test(t)) return { ok: true, msg: "Approach: an Authors database related to Books, with a rollup counting books. Room to grow (bios, nationality). Alternative: a Select property and Group by Author — simpler, but no author pages." };
          if (/select|group/.test(t)) return { ok: true, msg: "Approach: an Author property and grouping by it. Quick, with counts per group. Alternative: a separate Authors database with a relation, if authors need their own pages." };
          return { ok: false, msg: "Say where author information lives and how you’ll count books per author." };
        } },
    },
    {
      label: "Formulas", title: "Build a label",
      body: "Goal: a label such as “Write brief (2 h)” from Name and Hours. There’s more than one way to join text.",
      tryit: { type: "formula", task: "Produce “Name (Hours h)”.", initial: "", tests: LABEL_TESTS,
        approach: (src) => (/concat/.test(src)
          ? "Approach: concat(). Neat with many pieces. Alternative: joining with + between text and values."
          : "Approach: joining with +. Short and readable. Alternative: concat(), which some find tidier with many pieces.") },
    },
    {
      label: "Templates", title: "Plan: client onboarding",
      body: "Goal: every new client page starts with the same eight-step checklist and a view of that client’s invoices.",
      tryit: { type: "plan", task: "How will new client pages get set up?", placeholder: "Each new client…",
        check: (v) => {
          const t = v.toLowerCase();
          if (/template/.test(t)) return { ok: true, msg: "Approach: a database template in Clients, with the checklist and a linked Invoices view filtered to the current page. Alternative: a button that adds the checklist to an existing page." };
          if (/button/.test(t)) return { ok: true, msg: "Approach: a button that builds the page. Flexible. Alternative: a database template, which is chosen right from the New ▾ menu." };
          return { ok: false, msg: "What will create the checklist and view automatically for each new client?" };
        } },
    },
    {
      label: "Databases", title: "Plan: tidy away finished work",
      body: "Goal: finished tasks stop cluttering views, but you can still find them and they keep their links to projects.",
      tryit: { type: "plan", task: "How will you deal with finished tasks?", placeholder: "Finished tasks will…",
        check: (v) => {
          const t = v.toLowerCase();
          if (/archive|move/.test(t) && !/filter/.test(t)) return { ok: true, msg: "Approach: move them to an Archive database. Main database stays small. Alternative: just filter them out of views — relations stay intact." };
          if (/filter|view|hide|status|checkbox/.test(t)) return { ok: true, msg: "Approach: filter Done tasks out of everyday views and keep an “Archive” view. Nothing moves, links survive. Alternative: a separate Archive database for very large lists." };
          return { ok: false, msg: "Say where finished tasks go, or how they’re hidden." };
        } },
    },
    {
      label: "Formulas", title: "Big or small job?",
      body: "Goal: show “Big” for tasks of 1.5 hours or more and “Small” for the rest. Watch the boundary — 1.5 itself is Big.",
      tryit: { type: "formula", task: "Write the effort formula.", initial: "", tests: EFFORT_TESTS,
        approach: (src) => (/</.test(src) && !/>/.test(src)
          ? "Approach: test for small jobs first. Alternative: test for Big with >= 1.5 — reads closer to the rule."
          : "Approach: test for Big with >=. Alternative: test for Small first with < 1.5; same result.") },
    },
    {
      label: "Sharing", title: "Plan: who can see what",
      body: "Goal: managers edit everything, interns can read the handbook only, and a contractor edits one project. Plan the permissions.",
      tryit: { type: "plan", task: "Describe your permissions plan.", placeholder: "Managers…",
        check: (v) => {
          const t = v.toLowerCase();
          const contractor = /guest|contractor/.test(t), levels = /view|read|edit|full access/.test(t);
          if (/teamspace/.test(t) && levels) return { ok: true, msg: "Approach: teamspaces with role-based access. Scales well. Alternative: page-level permissions, simpler for a very small team." };
          if (contractor && levels) return { ok: true, msg: "Approach: page-level permissions with the contractor as a guest. Precise. Alternative: teamspaces, which scale better as the team grows." };
          return { ok: false, msg: "Cover each group: what access level, and on which pages?" };
        } },
    },
  ],
  proficient: [
    {
      label: "Relations & rollups", title: "The budget doubled overnight",
      body: "A project’s Budget rollup suddenly shows twice the real total. Last week someone added a second relation from Projects to Tasks “to make things easier”.",
      tryit: PROF("What do you check first, and why?", [
        { label: "Which relation the rollup uses, and whether tasks are linked twice", correct: true, why: "Duplicate relations are the likely cause. Trade-off: you must agree which relation stays." },
        { label: "Rebuild the Projects database", correct: false, why: "Hours of work that may reproduce the same mistake." },
        { label: "Type the budget in by hand", correct: false, why: "Hides the problem and goes stale." },
        { label: "Switch the rollup to “Show unique values”", correct: false, why: "Masks the symptom; other rollups stay wrong." },
      ]),
    },
    {
      label: "Formulas", title: "Two bugs in one line",
      body: "This formula should show “Late” when Days left is below zero, and “OK” otherwise. It errors. There’s more than one problem.",
      tryit: { type: "formula", requireWhy: true, task: "Repair the formula.", initial: 'if(prop("days left") < 0, "Late", "OK)', tests: FIX2_TESTS,
        approach: () => "Fixed: a missing closing quote, then a property name with the wrong capitalisation. Fixing one error often reveals the next." },
    },
    {
      label: "Automations", title: "The channel everyone muted",
      body: "An automation posts to Slack whenever any property in Tasks changes. There are 200 messages a day, so the team has muted the channel — and missed a real blocker.",
      tryit: PROF("Which approach is best here, and why?", [
        { label: "Narrow the trigger to what matters (e.g. Status set to Blocked)", correct: true, why: "Fewer, meaningful alerts get read again. Trade-off: decide together which events count." },
        { label: "Delete the automation", correct: false, why: "Silence also means missing the blockers." },
        { label: "Ask the team to unmute", correct: false, why: "The noise hasn’t changed, so they’ll mute it again." },
        { label: "Send the messages by email instead", correct: false, why: "Moves the noise to a different inbox." },
      ]),
    },
    {
      label: "Templates", title: "Five versions of one template",
      body: "There are five “Project brief” templates across teamspaces. New projects keep missing the Risks section added last month.",
      tryit: PROF("Which approach is best here, and why?", [
        { label: "Keep one database template in a single Projects database and remove the rest", correct: true, why: "One source means every new project gets the latest version. Trade-off: teams lose their local tweaks." },
        { label: "Remind people to add Risks", correct: false, why: "Relies on memory, which is what failed." },
        { label: "Lock all five templates", correct: false, why: "Stops edits but keeps five diverging copies." },
        { label: "Add Risks to each template by hand", correct: false, why: "Fixes today; the next change drifts again." },
      ]),
    },
    {
      label: "Databases", title: "46 properties, mostly empty",
      body: "The Tasks database has 46 properties. Half are empty on most rows, and people have stopped filling anything in except the name.",
      tryit: PROF("Which approach is best here, and why?", [
        { label: "Audit usage, delete or hide unused properties, and use templates per task type", correct: true, why: "Less to fill in means more gets filled in. Trade-off: some edge cases lose a field." },
        { label: "Split it into several databases", correct: false, why: "Moves the clutter around and breaks shared views." },
        { label: "Ask everyone to fill in every field", correct: false, why: "Notion won’t enforce it, and the form is the problem." },
        { label: "Leave it — more data is better", correct: false, why: "Empty data isn’t data." },
      ]),
    },
    {
      label: "Views", title: "The board nobody opens",
      body: "A board grouped by Assignee shows 300 cards, each displaying nine properties, with no filter. The team says it’s “too much”.",
      tryit: PROF("Which approach is best here, and why?", [
        { label: "Filter to open work this sprint and show two or three card properties", correct: true, why: "A board you can read in seconds gets used. Trade-off: other details are a click away." },
        { label: "Switch it to a calendar", correct: false, why: "Same 300 items, just arranged differently." },
        { label: "Delete the view", correct: false, why: "The need for an overview remains." },
        { label: "Colour-code every property", correct: false, why: "More visual noise, not less." },
      ]),
    },
    {
      label: "Structure", title: "Everything relates to everything",
      body: "There are 12 databases and 40 relations. Nobody knows where to add data, and new joiners give up.",
      tryit: PROF("Which approach is best here, and why?", [
        { label: "Map the core entities, keep a few essential relations and remove the decorative ones", correct: true, why: "A simple map people can hold in their heads. Trade-off: some convenience links go." },
        { label: "Merge everything into one database", correct: false, why: "Simple on paper, chaotic in practice — very different items in one table." },
        { label: "Write a long guide explaining all 40 relations", correct: false, why: "Documents the complexity rather than reducing it." },
        { label: "Start again from a Gallery template", correct: false, why: "Loses your data and context without understanding what went wrong." },
      ]),
    },
    {
      label: "Formulas", title: "The buffer that didn’t add up",
      body: "This formula should add a one-hour buffer to Hours and convert the total to minutes. For a 2-hour task it gives 62 instead of 180.",
      tryit: { type: "formula", requireWhy: true, task: "Fix the calculation.", initial: 'prop("Hours") + 1 * 60', tests: FIX3_TESTS,
        approach: () => "Fixed: multiplication happens before addition, so brackets are needed around the sum. No error message — the hardest kind of bug." },
    },
  ],
  expert: [
    {
      label: "Real-world brief", title: "A student’s semester",
      body: "Brief: a student wants courses, assignments, deadlines and grades in one place, with a weekly view and a running grade per course.",
      tryit: EXP("Build it, then reflect.", ["What did you build, and how do the parts connect?", "Reflection: where would this break in a busy exam week?"]),
    },
    {
      label: "Real-world brief", title: "Team goals that roll up",
      body: "Brief: a team sets quarterly objectives, each with three to five measurable key results. Leaders want progress to flow up automatically.",
      tryit: EXP("Design it.", ["Describe your structure and how progress is calculated.", "Reflection: what would make people stop updating it?"]),
    },
    {
      label: "Edge cases", title: "When a formula is the wrong tool",
      body: "Formulas recalculate constantly and can’t remember the past. Sometimes an automation, a button or a plain property is the better answer.",
      tryit: EXP("Find the limit.", ["Describe a goal a formula can’t meet, and what you’d use instead.", "Reflection: how did you know?"]),
    },
    {
      label: "Edge cases", title: "From three people to fifty",
      body: "What works for three people often fails at fifty: naming, permissions, templates and who owns each database.",
      tryit: EXP("Think ahead.", ["List what breaks first as a workspace grows, and how you’d prevent it.", "Reflection: which of these have you already seen?"]),
    },
    {
      label: "Create", title: "Make a template to share",
      body: "Build a template that solves a real problem for you, clean enough that a stranger could use it without instructions.",
      tryit: EXP("Build and polish it.", ["What does it do, and who is it for?", "Reflection: what did you remove to make it simpler?"]),
    },
    {
      label: "Teach it back", title: "Views vs databases",
      body: "Many beginners think each view is a separate database. Explain it so a non-technical colleague gets it first time.",
      tryit: EXP("Explain it.", ["Explain the difference between a database and a view.", "Reflection: which analogy did you use, and where does it fall short?"]),
    },
    {
      label: "Teach it back", title: "Automation, button or formula?",
      body: "All three can “make something happen”. Experts choose between them almost without thinking. Make your intuition explicit.",
      tryit: EXP("Explain your choice.", ["When would you choose each one? Give an example for each.", "Reflection: which choice do you still find hard?"]),
    },
    {
      label: "Critique", title: "Review someone else’s template",
      body: "Pick a template from the Notion Template Gallery or the community. Use it for a day, then review it as you would a colleague’s work.",
      tryit: EXP("Critique it.", ["What works well, and what would you change?", "Reflection: what did it teach you about your own designs?"]),
    },
    {
      label: "Keep growing", title: "Your practice plan",
      body: "Expertise grows through deliberate practice and other people’s feedback. Decide what you’ll build next and where you’ll share it — r/Notion, the community forum or a local meet-up.",
      tryit: EXP("Plan what’s next.", ["What will you build next, and why?", "Reflection: where will you get feedback, and from whom?"]),
      tip: "Revisit earlier stages for parts of Notion you use less. Everyone is a novice somewhere.",
    },
  ],
};

LEVELS.forEach((l) => l.steps.push(...(EXTRA_STEPS[l.id] || [])));

const TOOL_TABS = ["Database sandbox", "Formula playground"];

/* ---------------- Small components ---------------- */

const stop = (e) => e.stopPropagation();

function RichText({ text }) {
  const parts = text.split(/(\[\[[^\]]+\]\]|@\w+|#\w+)/g);
  return parts.map((p, i) => {
    if (/^\[\[/.test(p)) return <span key={i} className="nt-link">{p.slice(2, -2)}</span>;
    if (/^@/.test(p)) return <span key={i} className="nt-link">{p}</span>;
    if (/^#/.test(p)) return <span key={i} className="nt-chip">{p.slice(1)}</span>;
    return <span key={i}>{p}</span>;
  });
}

function Mock({ items }) {
  return (
    <div className="nt-card nt-mock" aria-label="Example">
      {items.map((it, i) => {
        if (it.type === "h") return <h3 key={i}>{it.text}</h3>;
        if (it.type === "p") return <p key={i}><RichText text={it.text} /></p>;
        if (it.type === "bullet") return <div key={i} className="nt-blk" style={{ marginLeft: it.level * 22 }}><RichText text={it.text} /></div>;
        if (it.type === "todo") return (
          <div key={i} className="nt-todo">
            <span className={"nt-box" + (it.done ? " done" : "")} aria-hidden="true">{it.done ? "✓" : ""}</span>
            <span className={it.done ? "nt-strike" : ""}>{it.text}</span>
          </div>
        );
        if (it.type === "code") return <div key={i} className="nt-code">{it.text}</div>;
        if (it.type === "table") return (
          <div key={i} className="nt-scroll">
            <table className="nt-table">
              <thead><tr>{it.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{it.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
        return null;
      })}
    </div>
  );
}

function Keys({ keys }) {
  return (
    <div className="nt-keys">
      {keys.map(([combo, desc]) => (
        <div key={combo}>
          {combo.split(" + ").map((k, i, a) => (
            <span key={i}><kbd>{k}</kbd>{i < a.length - 1 && <span className="nt-plus"> + </span>}</span>
          ))}
          <span className="nt-meta">{desc}</span>
        </div>
      ))}
    </div>
  );
}

function FormulaTests({ src, tests }) {
  const comp = useMemo(() => compileFormula(src), [src]);
  if (!src.trim()) return null;
  if (comp.error) return <div className="nt-fb err" role="alert">{comp.error}</div>;
  return (
    <div className="nt-scroll" style={{ marginTop: 10 }}>
      <table className="nt-table">
        <thead><tr><th>Row</th><th>Days left</th><th>Done</th><th>Your result</th><th>Expected</th></tr></thead>
        <tbody>
          {tests.map((t, i) => {
            const r = runAst(comp.ast, t.row);
            const good = !r.error && fmt(r.value) === t.expect;
            return (
              <tr key={i}>
                <td>{t.row.Name}</td><td className="nt-count">{t.row["Days left"]}</td><td>{t.row.Done ? "✓" : "—"}</td>
                <td className="nt-out" style={{ color: r.error ? "var(--warn)" : good ? "var(--teal)" : "var(--ink)" }}>{r.error ? r.error : `“${fmt(r.value)}”`}</td>
                <td className="nt-out">“{t.expect}”</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TryIt({ tryit, state, setState }) {
  const s = state || {};
  const set = (patch) => setState({ ...s, ...patch });
  const result = s.result;
  const done = result && result.ok;

  const checkFormula = () => {
    const comp = compileFormula(s.value ?? tryit.initial ?? "");
    if (comp.error) return set({ result: { ok: false, msg: comp.error } });
    const allGood = tryit.tests.every((t) => { const r = runAst(comp.ast, t.row); return !r.error && fmt(r.value) === t.expect; });
    if (!allGood) return set({ result: { ok: false, msg: "Some rows don’t match yet — compare your results with the expected column." } });
    if (tryit.requireWhy && (s.why || "").trim().length < 15) return set({ result: { ok: false, msg: "The formula works. Now say in a sentence what was wrong — that’s the diagnosis." } });
    set({ result: { ok: true, msg: tryit.approach(s.value ?? tryit.initial) } });
  };

  const checkChoice = (choice, why) => {
    const opt = tryit.options[choice];
    if (choice === undefined) return;
    if (tryit.requireWhy && (why || "").trim().length < 15) {
      return set({ choice, result: { ok: false, msg: "Pick your approach and add a sentence on why — the reasoning is the point here." } });
    }
    set({ choice, result: { ok: opt.correct, msg: opt.correct ? `Good call. ${opt.why}` : `Not the best fit. ${opt.why}` } });
  };

  return (
    <div className="nt-try">
      <div className="nt-try-head">
        <p>Try it: {tryit.task}</p>
        <span className={"nt-badge" + (done ? " ok" : "")} aria-live="polite">{done ? "✓ Nice!" : "Your turn"}</span>
      </div>

      {tryit.type === "input" && (
        <div className="nt-row">
          <input className="nt-input" aria-label={tryit.task} placeholder={tryit.placeholder} value={s.value || ""}
            onChange={(e) => set({ value: e.target.value, result: null })}
            onKeyDown={(e) => { stop(e); if (e.key === "Enter") set({ result: tryit.check(s.value || "") }); }} />
          <button className="nt-btn pri" onClick={() => set({ result: tryit.check(s.value || "") })}>Check</button>
        </div>
      )}

      {tryit.type === "plan" && (
        <>
          <textarea className="nt-ta prose" aria-label={tryit.task} placeholder={tryit.placeholder} value={s.value || ""}
            onChange={(e) => set({ value: e.target.value, result: null })} onKeyDown={stop} />
          <div className="nt-row" style={{ marginTop: 8 }}>
            <button className="nt-btn pri" onClick={() => set({ result: tryit.check(s.value || "") })}>Check my plan</button>
          </div>
        </>
      )}

      {tryit.type === "choice" && (
        <>
          <div className="nt-opts" role="radiogroup" aria-label={tryit.task}>
            {tryit.options.map((o, i) => (
              <button key={i} role="radio" aria-checked={s.choice === i} className={"nt-opt" + (s.choice === i ? " sel" : "")}
                onClick={() => (tryit.requireWhy ? set({ choice: i, result: null }) : checkChoice(i))}>
                {o.label}
                {result && (tryit.showAll || s.choice === i) && (
                  <div className="nt-why"><b>{o.correct ? "Best fit. " : "Trade-off. "}</b>{o.why}</div>
                )}
              </button>
            ))}
          </div>
          {tryit.requireWhy && (
            <>
              <label className="nt-flabel" htmlFor="nt-why">Why? One or two sentences.</label>
              <textarea id="nt-why" className="nt-ta prose" style={{ minHeight: 70 }} value={s.why || ""}
                onChange={(e) => set({ why: e.target.value, result: null })} onKeyDown={stop} />
              <div className="nt-row" style={{ marginTop: 8 }}>
                <button className="nt-btn pri" disabled={s.choice === undefined} onClick={() => checkChoice(s.choice, s.why)}>Check my reasoning</button>
              </div>
            </>
          )}
        </>
      )}

      {tryit.type === "formula" && (
        <>
          <textarea className="nt-ta" aria-label="Formula editor" spellCheck={false} value={s.value ?? tryit.initial}
            placeholder='if(…, "Late", "")'
            onChange={(e) => set({ value: e.target.value, result: null })} onKeyDown={stop} />
          <FormulaTests src={s.value ?? tryit.initial} tests={tryit.tests} />
          {tryit.requireWhy && (
            <>
              <label className="nt-flabel" htmlFor="nt-fwhy">What was wrong, and what did you look at first?</label>
              <textarea id="nt-fwhy" className="nt-ta prose" style={{ minHeight: 70 }} value={s.why || ""}
                onChange={(e) => set({ why: e.target.value, result: null })} onKeyDown={stop} />
            </>
          )}
          <div className="nt-row" style={{ marginTop: 8 }}>
            <button className="nt-btn pri" onClick={checkFormula}>Check formula</button>
          </div>
        </>
      )}

      {tryit.type === "expert" && (
        <>
          {tryit.prompts.map((pr, i) => (
            <div key={i}>
              <label className="nt-flabel" htmlFor={`nt-ex-${i}`}>{pr}</label>
              <textarea id={`nt-ex-${i}`} className="nt-ta prose" value={(s.answers || [])[i] || ""}
                onChange={(e) => { const a = [...(s.answers || [])]; a[i] = e.target.value; set({ answers: a, result: null }); }}
                onKeyDown={stop} />
            </div>
          ))}
          <div className="nt-row" style={{ marginTop: 8 }}>
            <button className="nt-btn pri" onClick={() => {
              const a = s.answers || [];
              const ok = tryit.prompts.every((_, i) => (a[i] || "").trim().length >= 10);
              set({ result: ok ? { ok: true, msg: "Saved for this session. Come back to your reflection after you’ve used the idea for real." } : { ok: false, msg: "Write something for each prompt — a few honest sentences is plenty." } });
            }}>I’m done</button>
          </div>
        </>
      )}

      {result && <div className={"nt-fb " + (result.ok ? "ok" : "err")} aria-live="polite">{result.msg}</div>}
    </div>
  );
}

/* ---------------- Tool tabs ---------------- */

function DbSandbox({ db, setDb }) {
  const { rows, view, filter, sort, draft } = db;
  const upd = (patch) => setDb({ ...db, ...patch });
  const setRow = (id, patch) => upd({ rows: rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  const shown = useMemo(() => {
    let r = filter === "All" ? rows : rows.filter((x) => x.status === filter);
    if (sort === "due") r = [...r].sort((a, b) => a.due.localeCompare(b.due));
    if (sort === "priority") r = [...r].sort((a, b) => PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority));
    return r;
  }, [rows, filter, sort]);

  const add = () => {
    if (!draft.name.trim()) return;
    const id = Math.max(0, ...rows.map((r) => r.id)) + 1;
    upd({ rows: [...rows, { ...draft, id, name: draft.name.trim() }], draft: { ...draft, name: "" } });
  };

  const statusSel = (r) => (
    <select className="nt-sel" aria-label={`Status of ${r.name}`} value={r.status} onChange={(e) => setRow(r.id, { status: e.target.value })}>
      {STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );

  return (
    <div className="nt-step">
      <p className="nt-label">Tool</p>
      <h2 className="nt-title">Database sandbox</h2>
      <p className="nt-p">A tiny Notion-style database to plan with. Switch views, filter, sort and add rows. Everything stays here until you close the page.</p>

      <div className="nt-card">
        <div className="nt-row" style={{ marginBottom: 12 }}>
          <div className="nt-tabs" role="tablist" aria-label="View" style={{ margin: 0 }}>
            {["Table", "Board"].map((v) => (
              <button key={v} role="tab" aria-selected={view === v} className="nt-tab" onClick={() => upd({ view: v })}>{v}</button>
            ))}
          </div>
          <label className="nt-meta">Filter&nbsp;
            <select className="nt-sel" value={filter} onChange={(e) => upd({ filter: e.target.value })}>
              {["All", ...STATUSES].map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="nt-meta">Sort&nbsp;
            <select className="nt-sel" value={sort} onChange={(e) => upd({ sort: e.target.value })}>
              <option value="none">None</option><option value="due">Due date</option><option value="priority">Priority</option>
            </select>
          </label>
        </div>

        {view === "Table" ? (
          <div className="nt-scroll">
            <table className="nt-table">
              <thead><tr><th>Name</th><th>Status</th><th>Priority</th><th>Due</th><th><span className="nt-meta">Delete</span></th></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td className={r.status === "Done" ? "nt-strike" : ""}>{r.name}</td>
                    <td>{statusSel(r)}</td>
                    <td><span className="nt-chip">{r.priority}</span></td>
                    <td className="nt-count">{r.due}</td>
                    <td><button className="nt-del" aria-label={`Delete ${r.name}`} onClick={() => upd({ rows: rows.filter((x) => x.id !== r.id) })}>×</button></td>
                  </tr>
                ))}
                {!shown.length && <tr><td colSpan={5} className="nt-meta">No rows match this filter. Change the filter or add a row below.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="nt-board">
            {STATUSES.filter((s) => filter === "All" || s === filter).map((s) => {
              const col = shown.filter((r) => r.status === s);
              return (
                <div key={s} className="nt-col">
                  <h4>{s}<span className="nt-meta nt-count">{col.length}</span></h4>
                  {col.map((r) => (
                    <div key={r.id} className="nt-bcard">
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div className="nt-meta nt-count" style={{ margin: "2px 0 6px" }}>{r.priority} · due {r.due}</div>
                      {statusSel(r)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="nt-card">
        <p className="nt-label">New row</p>
        <div className="nt-grid">
          <input className="nt-input" aria-label="New row name" placeholder="Name" value={draft.name}
            onChange={(e) => upd({ draft: { ...draft, name: e.target.value } })}
            onKeyDown={(e) => { stop(e); if (e.key === "Enter") add(); }} />
          <div className="nt-row">
            <select className="nt-sel" aria-label="New row status" value={draft.status} onChange={(e) => upd({ draft: { ...draft, status: e.target.value } })}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="nt-sel" aria-label="New row priority" value={draft.priority} onChange={(e) => upd({ draft: { ...draft, priority: e.target.value } })}>
              {PRIORITIES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input type="date" className="nt-sel" aria-label="New row due date" value={draft.due} onChange={(e) => upd({ draft: { ...draft, due: e.target.value } })} onKeyDown={stop} />
          </div>
        </div>
        <div className="nt-row" style={{ marginTop: 10 }}>
          <button className="nt-btn pri" onClick={add} disabled={!draft.name.trim()}>Add row</button>
          <button className="nt-btn" onClick={() => upd({ rows: START_DB })}>Reset sample data</button>
        </div>
      </div>
    </div>
  );
}

function FormulaPlayground({ src, setSrc }) {
  const comp = useMemo(() => compileFormula(src), [src]);
  const insert = (snippet) => setSrc(src + snippet);
  return (
    <div className="nt-step">
      <p className="nt-label">Tool</p>
      <h2 className="nt-title">Formula playground</h2>
      <p className="nt-p">Write a Notion-style formula and see its result for each sample row. Errors such as unbalanced brackets are explained below the editor.</p>

      <div className="nt-card">
        <div className="nt-row" style={{ marginBottom: 8 }}>
          {Object.keys(SAMPLE_ROWS[0]).map((k) => (
            <button key={k} className="nt-btn sm" onClick={() => insert(`prop("${k}")`)}>prop("{k}")</button>
          ))}
        </div>
        <textarea className="nt-ta" aria-label="Formula editor" spellCheck={false} value={src}
          onChange={(e) => setSrc(e.target.value)} onKeyDown={stop} style={{ minHeight: 100 }} />
        {comp.error && src.trim() && <div className="nt-fb err" role="alert">{comp.error}</div>}
        {!src.trim() && <p className="nt-meta">Type a formula above, or click a property to insert it.</p>}

        {comp.ast && (
          <div className="nt-scroll" style={{ marginTop: 10 }}>
            <table className="nt-table">
              <thead><tr>{Object.keys(SAMPLE_ROWS[0]).map((k) => <th key={k}>{k}</th>)}<th>Result</th></tr></thead>
              <tbody>
                {SAMPLE_ROWS.map((row, i) => {
                  const r = runAst(comp.ast, row);
                  return (
                    <tr key={i}>
                      {Object.values(row).map((v, j) => <td key={j} className="nt-count">{typeof v === "boolean" ? (v ? "✓" : "—") : v}</td>)}
                      <td className="nt-out" style={{ color: r.error ? "var(--warn)" : "var(--teal)" }}>{r.error ? r.error : fmt(r.value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="nt-card">
        <p className="nt-label">What this playground understands</p>
        <div className="nt-ref">
          <div><code>prop("Name")</code> read a property</div>
          <div><code>if(test, a, b)</code></div>
          <div><code>and</code> <code>or</code> <code>not</code> <code>&&</code> <code>||</code> <code>!</code></div>
          <div><code>+ - * / %</code> maths; <code>+</code> joins text</div>
          <div><code>== != &lt; &gt; &lt;= &gt;=</code></div>
          <div><code>concat()</code> <code>length()</code> <code>format()</code></div>
          <div><code>round(n, places)</code> <code>abs()</code> <code>min()</code> <code>max()</code></div>
          <div><code>upper()</code> <code>lower()</code> <code>contains()</code> <code>empty()</code></div>
        </div>
      </div>
      <p className="nt-tip">Real Notion formulas also handle dates, lists and relations. This playground covers the core so you can practise the logic safely.</p>
    </div>
  );
}

/* ---------------- Root ---------------- */

export default function NotionTutorial() {
  const [tab, setTab] = useState(0);
  const [stepIdx, setStepIdx] = useState(LEVELS.map(() => 0));
  const [answers, setAnswers] = useState({});
  const [db, setDb] = useState({ rows: START_DB, view: "Table", filter: "All", sort: "none", draft: { name: "", status: "To do", priority: "Medium", due: "2026-11-30" } });
  const [formula, setFormula] = useState('if(prop("Done"), "✓", concat(format(prop("Hours")), " h to go"))');
  const contentRef = useRef(null);

  const isLevel = tab < LEVELS.length;
  const level = isLevel ? LEVELS[tab] : null;
  const si = isLevel ? stepIdx[tab] : 0;
  const step = isLevel ? level.steps[si] : null;

  const goStep = (i) => {
    if (!isLevel) return;
    const n = Math.max(0, Math.min(level.steps.length - 1, i));
    setStepIdx((arr) => arr.map((v, k) => (k === tab ? n : v)));
  };

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!isLevel) return;
      if (e.key === "ArrowRight") goStep(si + 1);
      if (e.key === "ArrowLeft") goStep(si - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const key = `${tab}-${si}`;
  const last = isLevel && si === level.steps.length - 1;

  return (
    <div className="nt">
      <style>{CSS}</style>

      <div className="nt-head">
        <b>Notion · learning island</b>
        {isLevel && <span className="nt-count">Step {si + 1} of {level.steps.length}</span>}
      </div>

      <div className="nt-tabs" role="tablist" aria-label="Stages and tools">
        {LEVELS.map((l, i) => (
          <button key={l.id} role="tab" aria-selected={tab === i} className="nt-tab" onClick={() => setTab(i)}>
            {i + 1}. {l.name}
          </button>
        ))}
        <span className="nt-sep" aria-hidden="true" />
        {TOOL_TABS.map((t, i) => (
          <button key={t} role="tab" aria-selected={tab === LEVELS.length + i} className="nt-tab" onClick={() => setTab(LEVELS.length + i)}>{t}</button>
        ))}
      </div>

      {isLevel && (
        <div className="nt-rail" role="tablist" aria-label="Steps">
          {level.steps.map((s, i) => (
            <button key={i} role="tab" aria-selected={i === si} aria-label={`Step ${i + 1}: ${s.title}`}
              className={"nt-seg" + (i <= si ? " on" : "")} onClick={() => goStep(i)} />
          ))}
        </div>
      )}

      <div aria-live="polite" ref={contentRef}>
        {isLevel && (
          <div className="nt-step" key={key}>
            {si === 0 && <div className="nt-mind">{level.mindset}</div>}
            <p className="nt-label">{step.label}</p>
            <h2 className="nt-title">{step.title}</h2>
            <p className="nt-p">{step.body}</p>
            {step.keys && <Keys keys={step.keys} />}
            {step.mock && <Mock items={step.mock} />}
            <TryIt tryit={step.tryit} state={answers[key]} setState={(v) => setAnswers((a) => ({ ...a, [key]: v }))} />
            {step.tip && <p className="nt-tip">{step.tip}</p>}

            <div className="nt-nav">
              <button className="nt-btn" onClick={() => goStep(si - 1)} disabled={si === 0}>Back</button>
              {!last && <button className="nt-btn pri" onClick={() => goStep(si + 1)}>Next</button>}
              {last && tab < LEVELS.length - 1 && (
                <button className="nt-btn pri" onClick={() => setTab(tab + 1)}>Go to {LEVELS[tab + 1].name}</button>
              )}
              {last && tab === LEVELS.length - 1 && (
                <button className="nt-btn pri" onClick={() => setTab(LEVELS.length)}>Open the Database sandbox</button>
              )}
            </div>
            <p className="nt-meta" style={{ marginTop: 12 }}>Tip: use the ← and → arrow keys to move between steps.</p>
          </div>
        )}
        {tab === LEVELS.length && <DbSandbox db={db} setDb={setDb} />}
        {tab === LEVELS.length + 1 && <FormulaPlayground src={formula} setSrc={setFormula} />}
      </div>
    </div>
  );
}