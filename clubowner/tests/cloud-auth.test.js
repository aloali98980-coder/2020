import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Use an isolated test database file
const TEST_DB = path.resolve("./server/test-cloud-data.json");
process.env.CLOUD_DB_PATH = TEST_DB;

// Clean up previous test DB
if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);

const {
  registerUser,
  loginUser,
  getUserByToken,
  deleteSession,
  saveCloudState,
  getLatestCloudSave,
  listUserSaves,
  getCloudSaveById,
  deleteCloudSave,
} = await import("../server/cloudStore.js");

test("Cloud Auth: registration, validation and session token", () => {
  assert.throws(() => registerUser("invalid-email", "user1", "123456"), /البريد/);
  assert.throws(() => registerUser("test@test.com", "u", "123456"), /اسم المستخدم/);
  assert.throws(() => registerUser("test@test.com", "validUser", "123"), /كلمة المرور/);

  const session = registerUser("ahmed@example.com", "AhmedOwner", "password123");
  assert(session.token.startsWith("tok-"));
  assert.equal(session.user.email, "ahmed@example.com");
  assert.equal(session.user.username, "AhmedOwner");

  // Duplicate email rejected
  assert.throws(
    () => registerUser("ahmed@example.com", "AnotherName", "password123"),
    /البريد الإلكتروني مسجل/
  );

  // Duplicate username rejected
  assert.throws(
    () => registerUser("other@example.com", "ahmedowner", "password123"),
    /اسم المستخدم مستخدم/
  );
});

test("Cloud Auth: login verification and invalid credentials rejection", () => {
  const session = loginUser("ahmed@example.com", "password123");
  assert(session.token);
  assert.equal(session.user.username, "AhmedOwner");

  // Login by username
  const sessionByName = loginUser("AhmedOwner", "password123");
  assert(sessionByName.token);

  // Wrong password
  assert.throws(() => loginUser("ahmed@example.com", "wrongpass"), /كلمة المرور غير صحيحة/);

  // Non-existent user
  assert.throws(() => loginUser("nobody@example.com", "password123"), /غير مسجل/);
});

test("Cloud Auth: session token verification and logout", () => {
  const session = loginUser("ahmed@example.com", "password123");
  const user = getUserByToken(session.token);
  assert.equal(user.email, "ahmed@example.com");

  // Invalid token
  assert.equal(getUserByToken("invalid-tok"), null);

  // Logout
  deleteSession(session.token);
  assert.equal(getUserByToken(session.token), null);
});

test("Cloud Saves: upload, list, latest, download and pruning", () => {
  const session = loginUser("ahmed@example.com", "password123");
  const userId = session.user.id;

  const metadata = {
    clubId: "ahly",
    clubName: "الأهلي",
    seasonNumber: 1,
    date: "2026-10-15",
    cash: 50000000,
    playersCount: 25,
  };

  const payload = "H4sICfakegzipdata";
  const res = saveCloudState(userId, metadata, payload);
  assert(res.success);
  assert(res.saveId);

  // List saves
  const list = listUserSaves(userId);
  assert.equal(list.length, 1);
  assert.equal(list[0].metadata.clubName, "الأهلي");

  // Latest save
  const latest = getLatestCloudSave(userId);
  assert.equal(latest.id, res.saveId);
  assert.equal(latest.payload, payload);

  // Save multiple snapshots and check 5-save pruning
  for (let i = 2; i <= 7; i++) {
    saveCloudState(userId, { ...metadata, seasonNumber: i }, `payload-${i}`);
  }

  const updatedList = listUserSaves(userId);
  assert.equal(updatedList.length, 5, "Must be capped at 5 latest saves");

  // Delete a save
  const toDelete = updatedList[0].id;
  assert(deleteCloudSave(userId, toDelete));
  assert.equal(listUserSaves(userId).length, 4);

  // Clean up test file
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});
