// Cloudflare Pages Function: /api/* handler
// Compatible with Cloudflare Workers & Cloudflare Pages Functions

let memoryDb = {
  users: [],
  sessions: [],
  saves: [],
};

async function getDb(env) {
  if (env?.CLOUD_DB) {
    try {
      const data = await env.CLOUD_DB.get("clubowner_data", "json");
      if (data) return data;
    } catch (e) {
      console.warn("KV read error, falling back to memory:", e);
    }
  }
  return memoryDb;
}

async function saveDb(env, db) {
  memoryDb = db;
  if (env?.CLOUD_DB) {
    try {
      await env.CLOUD_DB.put("clubowner_data", JSON.stringify(db));
    } catch (e) {
      console.warn("KV write error:", e);
    }
  }
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password + ":" + salt),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const key = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(key))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

function getBearerToken(request) {
  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const db = await getDb(env);

  try {
    // 1. Auth: Register
    if (path === "/api/auth/register" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const email = (body.email || "").trim().toLowerCase();
      const username = (body.username || "").trim();
      const password = body.password || "";

      if (!email || !email.includes("@")) {
        return jsonResponse({ ok: false, error: "البريد الإلكتروني غير صالح." }, 400);
      }
      if (!username || username.length < 2) {
        return jsonResponse({ ok: false, error: "اسم المستخدم قصير جدًا." }, 400);
      }
      if (!password || password.length < 6) {
        return jsonResponse({ ok: false, error: "كلمة المرور قصيرة جدًا (٦ أحرف على الأقل)." }, 400);
      }
      if (db.users.some((u) => u.email === email)) {
        return jsonResponse({ ok: false, error: "البريد الإلكتروني مسجل مسبقًا." }, 400);
      }
      if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        return jsonResponse({ ok: false, error: "اسم المستخدم مستخدم مسبقًا." }, 400);
      }

      const salt = crypto.randomUUID().replace(/-/g, "");
      const passwordHash = await hashPassword(password, salt);
      const user = {
        id: "usr-" + crypto.randomUUID(),
        email,
        username,
        passwordHash,
        salt,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);

      const token = "tok-" + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      db.sessions.push({
        token,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      await saveDb(env, db);

      return jsonResponse(
        {
          ok: true,
          token,
          user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
        },
        201
      );
    }

    // 2. Auth: Login
    if (path === "/api/auth/login" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const id = (body.identifier || "").trim().toLowerCase();
      const pass = body.password || "";

      const user = db.users.find(
        (u) => u.email.toLowerCase() === id || u.username.toLowerCase() === id
      );
      if (!user) {
        return jsonResponse({ ok: false, error: "البريد الإلكتروني أو اسم المستخدم غير مسجل." }, 400);
      }
      const testHash = await hashPassword(pass, user.salt);
      if (testHash !== user.passwordHash) {
        return jsonResponse({ ok: false, error: "كلمة المرور غير صحيحة." }, 400);
      }

      const token = "tok-" + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      db.sessions.push({
        token,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      await saveDb(env, db);

      return jsonResponse({
        ok: true,
        token,
        user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
      });
    }

    // 3. Auth: Logout
    if (path === "/api/auth/logout" && method === "POST") {
      const token = getBearerToken(request);
      if (token) {
        db.sessions = db.sessions.filter((s) => s.token !== token);
        await saveDb(env, db);
      }
      return jsonResponse({ ok: true });
    }

    // 4. Auth: Me
    if (path === "/api/auth/me" && method === "GET") {
      const token = getBearerToken(request);
      const session = db.sessions.find((s) => s.token === token);
      const user = session ? db.users.find((u) => u.id === session.userId) : null;
      if (!user) {
        return jsonResponse({ ok: false, error: "غير مسجل الدخول." }, 401);
      }
      return jsonResponse({
        ok: true,
        user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
      });
    }

    // Protected Cloud Routes
    const token = getBearerToken(request);
    const session = db.sessions.find((s) => s.token === token);
    const user = session ? db.users.find((u) => u.id === session.userId) : null;
    if (!user) {
      return jsonResponse({ ok: false, error: "يجب تسجيل الدخول لاستخدام المزامنة السحابية." }, 401);
    }

        // 5. Cloud: Sync (رفع الحفظة)
    if (
      (path === "/api/cloud/saves" || path === "/api/cloud/sync") &&
      method === "POST"
    ) {
      const body = await request.json().catch(() => ({}));
      const { metadata, payload } = body;
      if (!metadata || !payload) {
        return jsonResponse({ ok: false, error: "بيانات الحفظة غير مكتملة." }, 400);
      }

      const save = {
        id: "sav-" + crypto.randomUUID(),
        userId: user.id,
        metadata: {
          clubId: metadata.clubId,
          clubName: metadata.clubName,
          seasonNumber: metadata.seasonNumber,
          date: metadata.date,
          cash: metadata.cash,
          device: metadata.device || "Cloudflare",
          updatedAt: new Date().toISOString(),
        },
        payload,
        updatedAt: new Date().toISOString(),
      };

      db.saves.unshift(save);
      // Prune to 5 saves
      const userSaves = db.saves.filter((s) => s.userId === user.id);
      if (userSaves.length > 5) {
        const toKeep = new Set(userSaves.slice(0, 5).map((s) => s.id));
        db.saves = db.saves.filter((s) => s.userId !== user.id || toKeep.has(s.id));
      }
      await saveDb(env, db);

      return jsonResponse({
        ok: true,
        saveId: save.id,
        syncedAt: save.updatedAt,
      });
    }

    // 6. Cloud: Saves List
    if (path === "/api/cloud/saves" && method === "GET") {
      const userSaves = db.saves
        .filter((s) => s.userId === user.id)
        .map((s) => ({
          id: s.id,
          metadata: s.metadata,
          updatedAt: s.updatedAt,
        }));
      return jsonResponse({ ok: true, saves: userSaves });
    }

    // 7. Cloud: Latest Save
    if (path === "/api/cloud/saves/latest" && method === "GET") {
      const latest = db.saves.find((s) => s.userId === user.id);
      return jsonResponse({ ok: true, save: latest || null });
    }

    // 8. Cloud: Get or Delete specific save
    const saveMatch = path.match(/^\/api\/cloud\/saves\/([^/]+)$/);
    if (saveMatch) {
      const saveId = saveMatch[1];
      if (method === "GET") {
        const found = db.saves.find((s) => s.id === saveId && s.userId === user.id);
        if (!found) return jsonResponse({ ok: false, error: "الحفظة غير موجودة." }, 404);
        return jsonResponse({ ok: true, save: found });
      }
      if (method === "DELETE") {
        const prevCount = db.saves.length;
        db.saves = db.saves.filter((s) => !(s.id === saveId && s.userId === user.id));
        await saveDb(env, db);
        return jsonResponse({ ok: db.saves.length < prevCount });
      }
    }

    return jsonResponse({ ok: false, error: "نقطة الاتصال غير موجودة." }, 404);
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message || "حدث خطأ غير متوقع." }, 500);
  }
}
