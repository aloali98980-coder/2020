import {
  registerUser,
  loginUser,
  getUserByToken,
  deleteSession,
  saveCloudState,
  getLatestCloudSave,
  listUserSaves,
  getCloudSaveById,
  deleteCloudSave,
} from "./cloudStore.js";

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // 120 MB maximum body size for saves
      if (body.length > 120 * 1024 * 1024) {
        req.destroy();
        reject(new Error("حجم البيانات يتجاوز الحد المسموح."));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("تنسيق JSON غير صالح."));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
  return true;
}

function getBearerToken(req) {
  const auth = req.headers["authorization"] || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

export async function handleCloudApi(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  const method = req.method.toUpperCase();

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return true;
  }

  if (!path.startsWith("/api/")) return false;

  try {
    // 1. Auth routes
    if (path === "/api/auth/register" && method === "POST") {
      const { email, username, password } = await parseJsonBody(req);
      const session = registerUser(email, username, password);
      sendJson(res, 201, { ok: true, ...session });
      return true;
    }

    if (path === "/api/auth/login" && method === "POST") {
      const { identifier, password } = await parseJsonBody(req);
      const session = loginUser(identifier, password);
      sendJson(res, 200, { ok: true, ...session });
      return true;
    }

    if (path === "/api/auth/logout" && method === "POST") {
      const token = getBearerToken(req);
      if (token) deleteSession(token);
      sendJson(res, 200, { ok: true });
      return true;
    }

    if (path === "/api/auth/me" && method === "GET") {
      const token = getBearerToken(req);
      const user = getUserByToken(token);
      if (!user) return sendJson(res, 401, { ok: false, error: "غير مسجل الدخول." });
      sendJson(res, 200, { ok: true, user });
      return true;
    }

    // 2. Cloud saves routes (Requires Authentication)
    const token = getBearerToken(req);
    const user = getUserByToken(token);
    if (!user) {
      sendJson(res, 401, { ok: false, error: "يجب تسجيل الدخول لاستخدام المزامنة السحابية." });
      return true;
    }

    if (path === "/api/cloud/saves" && method === "GET") {
      const saves = listUserSaves(user.id);
      sendJson(res, 200, { ok: true, saves });
      return true;
    }

    if (path === "/api/cloud/saves/latest" && method === "GET") {
      const latest = getLatestCloudSave(user.id);
      if (!latest) return sendJson(res, 200, { ok: true, save: null });
      sendJson(res, 200, { ok: true, save: latest });
      return true;
    }

    if (path === "/api/cloud/saves" && method === "POST") {
      const { metadata, payload } = await parseJsonBody(req);
      const result = saveCloudState(user.id, metadata, payload);
      sendJson(res, 200, { ok: true, ...result });
      return true;
    }

    const saveIdMatch = path.match(/^\/api\/cloud\/saves\/([^/]+)$/);
    if (saveIdMatch) {
      const saveId = saveIdMatch[1];
      if (method === "GET") {
        const save = getCloudSaveById(user.id, saveId);
        if (!save) return sendJson(res, 404, { ok: false, error: "الحفظة غير موجودة." });
        sendJson(res, 200, { ok: true, save });
        return true;
      }
      if (method === "DELETE") {
        const deleted = deleteCloudSave(user.id, saveId);
        sendJson(res, 200, { ok: deleted });
        return true;
      }
    }

    sendJson(res, 404, { ok: false, error: "نقطة الاتصال غير موجودة." });
    return true;
  } catch (err) {
    sendJson(res, 400, { ok: false, error: err.message || "حدث خطأ في الخادم." });
    return true;
  }
}
