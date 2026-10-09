// Static inventory of Arabic UI phrases in src/ that the EN/FR presentation
// layer (src/i18n) cannot translate yet. Usage: node scripts/i18n-coverage.mjs [--json out.json]
// It extracts Arabic runs from string/template literals, splits them at ${...}
// boundaries and sentence punctuation the same way the DOM walker sees them,
// runs translateText() for en and fr, and reports phrases that still contain
// Arabic letters. Not a proof of coverage (dynamic text), but a good to-do list.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { setLanguage, translateText } from "../src/i18n/index.js";

const ROOT = new URL("..", import.meta.url).pathname;
const SKIP = [
  /src\/i18n\//,
  /src\/data\/packs\//,
  /src\/data\/starProfiles\.js/,
  /src\/data\/legends\.js/,
  /src\/data\/worldMarkets\.js/,
  // Political catalog records store explicit {ar,en,fr} objects and are rendered by locale.
  /src\/data\/politicsCatalog\.js/,
  /src\/data\/politicsLaws\.js/,
  /src\/data\/politicsCommittees\.js/,
  /src\/data\/politicsGovernance\.js/,
  /src\/data\/politicsEvents\.js/,
];
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|mjs|html)$/.test(name) && !SKIP.some((rx) => rx.test(p)))
      files.push(p);
  }
})(join(ROOT, "src"));
files.push(join(ROOT, "index.html"));

const AR = /[\u0600-\u06FF]/;
const phrases = new Map(); // phrase -> Set(files)
const LITERAL = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
const TR_CALL =
  /\btr\(\s*("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
function record(chunk, file) {
  for (const piece of chunk.split(/<[^>]*>|\\n|\|/)) {
    const t = piece
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[\s:،.\-–—•·»«()]+|[\s:،.\-–—•·»«()]+$/g, "");
    if (!AR.test(t) || t.length < 2) continue;
    if (!phrases.has(t)) phrases.set(t, new Set());
    phrases.get(t).add(file);
  }
}
// A small tokenizer walks the code so nested templates (`${a ? `نص ${x}` : ""}`) and quoted
// strings inside template expressions are scanned as well; regexes never cross a line.
function skipQuoted(code, i) {
  const q = code[i];
  let j = i + 1;
  while (j < code.length) {
    const c = code[j];
    if (c === "\\") j += 2;
    else if (c === q) return j + 1;
    else if (c === "\n") return -1;
    else j++;
  }
  return -1;
}
function parseTemplate(code, i, file, handled) {
  // returns index after the closing backtick; records text chunks and scans expressions
  let j = i + 1,
    text = "";
  while (j < code.length) {
    const c = code[j];
    if (c === "\\") {
      text += code[j + 1] || "";
      j += 2;
    } else if (c === "`") {
      record(text, file);
      return j + 1;
    } else if (c === "$" && code[j + 1] === "{") {
      record(text, file);
      text = "";
      const end = skipExpression(code, j + 2, file, handled);
      j = end;
    } else {
      text += c;
      j++;
    }
  }
  record(text, file);
  return j;
}
function skipExpression(code, i, file, handled) {
  // i points just after "${"; scans nested code until the matching "}" and returns index after it
  let depth = 1,
    j = i,
    start = i;
  while (j < code.length && depth) {
    const c = code[j];
    if (c === '"' || c === "'") {
      const end = skipQuoted(code, j);
      if (end < 0) {
        j++;
        continue;
      }
      const lit = code.slice(j, end);
      if (!handled.has(lit)) record(lit.slice(1, -1), file);
      j = end;
    } else if (c === "`") {
      const lit0 = j;
      j = parseTemplate(code, j, file, handled);
      void lit0;
    } else if (c === "{") {
      depth++;
      j++;
    } else if (c === "}") {
      depth--;
      j++;
    } else j++;
  }
  void start;
  return j;
}
function scanCode(code, file, handled) {
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    if (c === "/" && code[i + 1] === "/") {
      const nl = code.indexOf("\n", i);
      i = nl < 0 ? code.length : nl + 1;
    } else if (c === "/" && code[i + 1] === "*") {
      const e = code.indexOf("*/", i + 2);
      i = e < 0 ? code.length : e + 2;
    } else if (c === '"' || c === "'") {
      const end = skipQuoted(code, i);
      if (end < 0) {
        i++;
        continue;
      }
      const lit = code.slice(i, end);
      if (!handled.has(lit)) record(lit.slice(1, -1), file);
      i = end;
    } else if (c === "`") {
      const litEnd = matchTemplateLiteral(code, i);
      if (handled.has(code.slice(i, litEnd))) {
        i = litEnd;
        continue;
      }
      i = parseTemplate(code, i, file, handled);
    } else i++;
  }
}
// Find the end of a template literal (for the tr() allow-list comparison) without recording.
function matchTemplateLiteral(code, i) {
  let j = i + 1;
  while (j < code.length) {
    const c = code[j];
    if (c === "\\") j += 2;
    else if (c === "`") return j + 1;
    else if (c === "$" && code[j + 1] === "{")
      j = skipExpressionQuiet(code, j + 2);
    else j++;
  }
  return j;
}
function skipExpressionQuiet(code, i) {
  let depth = 1,
    j = i;
  while (j < code.length && depth) {
    const c = code[j];
    if (c === '"' || c === "'") {
      const e = skipQuoted(code, j);
      j = e < 0 ? j + 1 : e;
    } else if (c === "`") j = matchTemplateLiteral(code, j);
    else if (c === "{") {
      depth++;
      j++;
    } else if (c === "}") {
      depth--;
      j++;
    } else j++;
  }
  return j;
}
for (const f of files) {
  const text = readFileSync(f, "utf8");
  // Arabic literals passed as the first argument of tr(ar, en, fr) are already trilingual at the source
  const handled = new Set([...text.matchAll(TR_CALL)].map((m) => m[1]));
  scanCode(text, relative(ROOT, f), handled);
}
const report = { total: phrases.size, missing: { en: [], fr: [] } };
for (const lang of ["en", "fr"]) {
  setLanguage(lang);
  for (const [phrase, where] of phrases) {
    const out = translateText(phrase);
    if (AR.test(out))
      report.missing[lang].push({ phrase, residue: out, files: [...where] });
  }
}
setLanguage("ar");
const byFile = {};
for (const m of report.missing.en)
  for (const f of m.files) byFile[f] = (byFile[f] || 0) + 1;
console.log(`Arabic phrases found: ${report.total}`);
console.log(
  `untranslated (en): ${report.missing.en.length} · (fr): ${report.missing.fr.length}`,
);
console.log("by file (en):");
for (const [f, n] of Object.entries(byFile).sort((a, b) => b[1] - a[1]))
  console.log(`  ${String(n).padStart(4)}  ${f}`);
const idx = process.argv.indexOf("--json");
if (idx > 0)
  writeFileSync(process.argv[idx + 1], JSON.stringify(report, null, 1));
