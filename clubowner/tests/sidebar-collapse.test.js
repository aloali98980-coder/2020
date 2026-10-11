// القائمة الجانبية القابلة للطي (الإصدار 0.44): تُطوى المجموعة وتُحفظ الحالة،
// والمجموعة التي تحوي الشاشة الحالية تبقى مفتوحة دائمًا.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { shell, toggleNavGroup, navCollapsedSet, NAV_GROUPS } from "../src/components/shell.js";

// تخزين بديل لبيئة Node
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const s = createGame({ clubId: "ahly", database: "demo" });
const caption = (i) => NAV_GROUPS[i].caption;
const groupHtml = (html, cap) => {
  const m = html.match(new RegExp(`<div class="nav-group[^"]*"><button[^>]*data-id="${cap}"[\\s\\S]*?<\\/button>`));
  return m ? m[0] : null;
};

test("المجموعة المطوية تحمل الفئة collapsed وزر aria-expanded=false", () => {
  store.clear();
  toggleNavGroup(caption(1)); // «السياسة والحوكمة»
  const html = shell(s, "dashboard", "<p>x</p>");
  const g = groupHtml(html, caption(1));
  assert.match(g, /class="nav-group collapsed"/);
  assert.match(g, /aria-expanded="false"/);
});

test("الحالة تُحفظ: فتح المجموعة مرة أخرى يزيل الطي من التخزين", () => {
  store.clear();
  toggleNavGroup(caption(1));
  assert.ok(navCollapsedSet().has(caption(1)));
  toggleNavGroup(caption(1));
  assert.ok(!navCollapsedSet().has(caption(1)));
});

test("المجموعة التي تحوي الشاشة الحالية تبقى مفتوحة حتى لو كانت مطوية", () => {
  store.clear();
  const cap = caption(1); // «السياسة والحوكمة» تحوي politics
  toggleNavGroup(cap);
  const html = shell(s, "politics", "<p>x</p>");
  const g = groupHtml(html, cap);
  assert.doesNotMatch(g, /collapsed/);
  assert.match(g, /aria-expanded="true"/);
});

test("قراءة تخزين معطوب لا تكسر القائمة", () => {
  store.clear();
  store.set("clubowner.navCollapsed", "{not json");
  assert.equal(navCollapsedSet().size, 0);
  assert.ok(shell(s, "dashboard", "<p>x</p>").includes('<nav>'));
});
