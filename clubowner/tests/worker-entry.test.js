import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/index.js";

// 0.23: مدخل Workers (worker/index.js) — يوجه /api/* لنفس دالة المزامنة
// ويخدم الباقي من الأصول مع سلوك SPA. نفس wrangler deploy في الواجهة الجديدة.
test("Worker: /api/* يصل لدالة المزامنة ويرد JSON", async () => {
  const req = new Request("https://club-owner.workers.dev/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "ghost", password: "wrong" }),
  });
  const res = await worker.fetch(req, {}, { waitUntil: async () => {} });
  assert.ok(
    (res.headers.get("content-type") || "").includes("json"),
    "الرد لازم يكون JSON من دالة الـAPI",
  );
  assert.ok([200, 400, 401].includes(res.status), "حالة غير متوقعة: " + res.status);
  const body = await res.json();
  assert.ok(typeof body === "object" && body !== null);
});

test("Worker: المسارات العادية تخدم الأصول وترجع للـSPA عند 404", async () => {
  const assets = {
    fetch: async (req) =>
      new URL(req.url).pathname === "/index.html"
        ? new Response("<html>اللعبة</html>", { status: 200 })
        : new Response("Not Found", { status: 404 }),
  };
  // مسار SPA بلا ملف: يرجع index.html بدل 404
  const spa = await worker.fetch(
    new Request("https://game.example/settings"),
    { ASSETS: assets },
    {},
  );
  assert.equal(spa.status, 200);
  assert.ok((await spa.text()).includes("اللعبة"));
  // مسار موجود: يمر كما هو
  const asset = await worker.fetch(
    new Request("https://game.example/manifest.webmanifest"),
    { ASSETS: assets },
    {},
  );
  assert.equal(asset.status, 404, "الأصل يُخدم كما هو دون تدخل");
});

test("Worker: غياب ASSETS يعطي خطأ واضحًا لا انهيارًا", async () => {
  const res = await worker.fetch(
    new Request("https://game.example/"),
    {},
    {},
  );
  assert.equal(res.status, 500);
});
