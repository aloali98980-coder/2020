// Cloudflare Worker entry — serves the game from dist/ and routes /api/* to
// the cloud-sync handler. Shares the exact same logic as the Pages Function
// in functions/api/[[catchall]].js (pure Web APIs, no Node dependencies).
import { onRequest } from "../functions/api/[[catchall]].js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API: نفس دالة المزامنة المستخدمة في Pages Functions
    if (url.pathname.startsWith("/api/")) {
      try {
        return await onRequest({
          request,
          env,
          params: {},
          waitUntil: ctx?.waitUntil?.bind(ctx) ?? (() => {}),
        });
      } catch (e) {
        return new Response(
          JSON.stringify({ error: e?.message || "Internal server error" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }
    }

    // Static assets from dist/ (handled by Cloudflare before the Worker runs;
    // kept here as the explicit fallback path with SPA behavior).
    if (env?.ASSETS) {
      const res = await env.ASSETS.fetch(request);
      if (
        res.status === 404 &&
        !url.pathname.includes(".") &&
        request.method === "GET"
      ) {
        // SPA: أي مسار بلا ملف مطابق يرجع index.html (مثل _redirects)
        return env.ASSETS.fetch(
          new Request(new URL("/index.html", url.origin), request),
        );
      }
      return res;
    }

    return new Response("ASSETS binding missing", { status: 500 });
  },
};
