// الدفعة 7 (بعد الإغلاق): كسر الشرط الجزائي تلقائي (بلا رفض) وإشعاره صاخب:
// رسالة عاجلة غير مطلوبة الرد، وخبر صحفي، وأولى عناوين الصباح، وأثر على الجماهير.
import test from "node:test";
import assert from "node:assert/strict";
import { createGame } from "../src/core/game.js";
import { ensureBlackFiles, blackFilesDay } from "../src/services/blackFiles.js";
import { morningHeadlines } from "../src/services/morningHeadlines.js";

test("كسر الشرط الجزائي التلقائي: إشعار عاجل بلا رفض، وأولى العناوين، وأثر على الجماهير", () => {
  const s = createGame({ clubId: "ahly", database: "demo" });
  s.press = { trust: 60, news: [] };
  const p = s.players.find((x) => x.clubId === s.clubId && x.status !== "retired");
  const buyer = s.table.find((r) => r.clubId !== s.clubId).clubId;
  const fansBefore = s.fanSupport;
  ensureBlackFiles(s).pendingAiBreaks = [{ playerId: p.id, buyer, clause: 5_000_000, date: s.date }];
  blackFilesDay(s);

  assert.equal(s.players.find((x) => x.id === p.id).clubId, buyer, "الانتقال تلقائي");
  const msg = s.inbox.find((m) => m.priority === "high" && m.title.includes(p.name));
  assert.ok(msg, "رسالة عاجلة");
  assert.equal(msg.required, false, "لا رفض ولا قرار مطلوب");
  assert.equal(s.inbox.filter((m) => m.required && m.status === "open").length, 0);
  assert.ok(s.press.news.some((n) => n.title.includes(p.name)), "خبر صحفي");
  assert.ok(s.fanSupport < fansBefore, "الجماهير تتأثر");
  assert.equal(morningHeadlines(s)[0].kind, "alert");
});
