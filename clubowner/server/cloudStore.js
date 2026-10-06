import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_FILE = path.resolve(
  process.env.CLOUD_DB_PATH || "./server/cloud-data.json",
);

let db = {
  users: [],
  saves: [],
  sessions: [],
};

function loadDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      db = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Warning: Failed to read cloud DB file, starting fresh:", err.message);
  }
}

function saveDb() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = DATA_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
    fs.renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error("Error writing cloud DB file:", err.message);
  }
}

loadDb();

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function registerUser(email, username, password) {
  email = (email || "").trim().toLowerCase();
  username = (username || "").trim();
  if (!email || !email.includes("@")) throw new Error("البريد الإلكتروني غير صالح.");
  if (!username || username.length < 2) throw new Error("اسم المستخدم قصير جدًا (حرفان على الأقل).");
  if (!password || password.length < 6) throw new Error("كلمة المرور قصيرة جدًا (٦ أحرف على الأقل).");

  if (db.users.some((u) => u.email === email)) {
    throw new Error("البريد الإلكتروني مسجل مسبقًا.");
  }
  if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("اسم المستخدم مستخدم مسبقًا.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const user = {
    id: "usr-" + crypto.randomUUID(),
    email,
    username,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  saveDb();
  return createSession(user.id);
}

export function loginUser(identifier, password) {
  identifier = (identifier || "").trim().toLowerCase();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier,
  );
  if (!user) throw new Error("البريد الإلكتروني أو اسم المستخدم غير مسجل.");

  const testHash = hashPassword(password, user.salt);
  if (testHash !== user.passwordHash) {
    throw new Error("كلمة المرور غير صحيحة.");
  }

  return createSession(user.id);
}

export function createSession(userId) {
  const token = "tok-" + crypto.randomBytes(32).toString("hex");
  const session = {
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
  };
  db.sessions.push(session);
  saveDb();

  const user = db.users.find((u) => u.id === userId);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    },
  };
}

export function getUserByToken(token) {
  if (!token) return null;
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDb();
    return null;
  }
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
  };
}

export function deleteSession(token) {
  db.sessions = db.sessions.filter((s) => s.token !== token);
  saveDb();
  return true;
}

export function saveCloudState(userId, metadata, payload) {
  if (!userId) throw new Error("مطلوب تسجيل الدخول للحفظ.");
  if (!payload) throw new Error("بيانات الحفظ فارغة.");

  const saveId = "csave-" + crypto.randomUUID();
  const now = new Date().toISOString();
  const entry = {
    id: saveId,
    userId,
    metadata: {
      ...metadata,
      updatedAt: now,
    },
    payload,
    createdAt: now,
    updatedAt: now,
  };

  // Keep up to 5 saves per user (prune older ones)
  const userSaves = db.saves.filter((s) => s.userId === userId);
  if (userSaves.length >= 5) {
    userSaves.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    const toRemove = userSaves[0].id;
    db.saves = db.saves.filter((s) => s.id !== toRemove);
  }

  db.saves.push(entry);
  saveDb();

  return {
    success: true,
    saveId,
    syncedAt: now,
    metadata: entry.metadata,
  };
}

export function getLatestCloudSave(userId) {
  const userSaves = db.saves.filter((s) => s.userId === userId);
  if (!userSaves.length) return null;
  userSaves.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return userSaves[0];
}

export function listUserSaves(userId) {
  return db.saves
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((s) => ({
      id: s.id,
      metadata: s.metadata,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
}

export function getCloudSaveById(userId, saveId) {
  return db.saves.find((s) => s.userId === userId && s.id === saveId) || null;
}

export function deleteCloudSave(userId, saveId) {
  const initial = db.saves.length;
  db.saves = db.saves.filter((s) => !(s.userId === userId && s.id === saveId));
  if (db.saves.length !== initial) {
    saveDb();
    return true;
  }
  return false;
}
