// الدفعة 7 — القسم 2: عناوين الصباح. 5–7 عناوين كحد أقصى، مرتبة، بلا تكرار، وبأرقام لاتينية.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { morningHeadlines, HEADLINE_MAX } from "../src/services/morningHeadlines.js";
import { dashboardView } from "../src/features/dashboard.js";

const base = () => createGame({ clubId: "ahly", database: "demo" });

test("1) لا يتجاوز الحد الأقصى 7 عناوين، ويُرتّب القرار قبل الصحافة", () => {
  const s = base();
  for (let i = 0; i < 12; i++)
    s.press = { news: [...(s.press?.news || []), { date: s.date, title: `خبر صحفي ${i}`, type: "x" }] };
  s.inbox.push({ id: "m-dec", date: s.date, title: "قرار عاجل للاختبار", body: "", required: true, status: "open" });
  const items = morningHeadlines(s);
  assert.ok(items.length <= HEADLINE_MAX && items.length > 0);
  assert.equal(items[0].kind, "decision");
  for (let i = 1; i < items.length; i++) assert.ok(items[i - 1].score >= items[i].score);
});

test("2) لا عنوان مكرر، ولا عنوان أقدم من 7 أيام", () => {
  const s = base();
  s.press = { news: [
    { date: s.date, title: "نفس الخبر", type: "x" },
    { date: s.date, title: "نفس الخبر", type: "x" },
    { date: "2000-01-01", title: "خبر قديم جدًا", type: "x" },
  ] };
  const titles = morningHeadlines(s).map((h) => h.title);
  assert.equal(new Set(titles).size, titles.length);
  assert.ok(!titles.includes("خبر قديم جدًا"));
});

test("3) الأرقام في العناوين لاتينية، والبطاقة تظهر في لوحة القيادة إن وُجد محتوى", () => {
  const s = base();
  s.press = { news: [{ date: s.date, title: "الجولة 12 بنتيجة 3–1", type: "x" }] };
  const items = morningHeadlines(s);
  assert.ok(!/[\u0660-\u0669]/.test(JSON.stringify(items)));
  const html = dashboardView(s);
  assert.ok(html.includes('data-widget="headlines"'));
  assert.ok(!/[\u0660-\u0669]/.test(html.slice(html.indexOf('data-widget="headlines"'), html.indexOf('data-widget="headlines"') + 2000)));
});

test("4) لوحة بلا أي محتوى لا تعرض بطاقة فارغة", () => {
  const s = base();
  s.press = { news: [] };
  s.inbox = [];
  s.facilities = s.facilities || [];
  const items = morningHeadlines(s);
  if (items.length === 0) assert.ok(!dashboardView(s).includes('data-widget="headlines"'));
});
