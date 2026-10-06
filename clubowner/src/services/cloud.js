import { getSession } from "./auth.js";
import { backupBlob, readBackup } from "./saveCompression.js";
import { validateSave } from "../core/validation.js";
import { migrateSave } from "../core/migrations.js";
import { clubBy } from "../components/shared.js";

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const len = bytes.byteLength;
  const chunk = 0x8000;
  for (let i = 0; i < len; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, Math.min(i + chunk, len)),
    );
  }
  return btoa(binary);
}

function base64ToBlob(base64, type = "application/gzip") {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

function getAuthHeader() {
  const session = getSession();
  if (!session?.token) throw new Error("يجب تسجيل الدخول لاستخدام السحابة.");
  return {
    Authorization: `Bearer ${session.token}`,
    "Content-Type": "application/json",
  };
}

export async function uploadSaveToCloud(s) {
  if (!s) throw new Error("لا توجد حفظة حالية لرفعها.");
  const headers = getAuthHeader();

  const { blob } = await backupBlob(s);
  const base64Data = await blobToBase64(blob);

  const club = clubBy(s.clubId) || { name: s.clubId };
  const metadata = {
    clubId: s.clubId,
    clubName: club.name || s.clubId,
    seasonNumber: s.seasonNumber,
    date: s.date,
    cash: s.finance?.cash || 0,
    playersCount: s.players?.length || 0,
    database: s.database,
    version: s.version,
    device: navigator.userAgent.includes("iPhone")
      ? "iPhone"
      : navigator.userAgent.includes("Android")
      ? "Android"
      : "Desktop/Web",
  };

  const res = await fetch("/api/cloud/saves", {
    method: "POST",
    headers,
    body: JSON.stringify({ metadata, payload: base64Data }),
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "تعذر رفع الحفظة إلى السحابة.");
  }

  // Update lastSync timestamp in local session
  const session = getSession();
  if (session) {
    session.lastSync = data.syncedAt;
    localStorage.setItem("clubowner.auth.session", JSON.stringify(session));
  }

  return data;
}

export async function fetchLatestCloudSave() {
  const headers = getAuthHeader();
  const res = await fetch("/api/cloud/saves/latest", { headers });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "تعذر جلب الحفظة من السحابة.");
  }
  return data.save || null;
}

export async function listCloudSaves() {
  const headers = getAuthHeader();
  const res = await fetch("/api/cloud/saves", { headers });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "تعذر جلب قائمة الحفظات.");
  }
  return data.saves || [];
}

export async function downloadCloudSave(saveId) {
  const headers = getAuthHeader();
  const endpoint = saveId ? `/api/cloud/saves/${saveId}` : "/api/cloud/saves/latest";
  const res = await fetch(endpoint, { headers });
  const data = await res.json();
  if (!res.ok || !data.ok || !data.save) {
    throw new Error(data.error || "الحفظة المطلوبة غير متوفرة.");
  }

  const save = data.save;
  const blob = base64ToBlob(save.payload);
  const text = await readBackup(blob);
  const state = validateSave(migrateSave(JSON.parse(text)));
  return { state, metadata: save.metadata };
}

export async function deleteCloudSave(saveId) {
  const headers = getAuthHeader();
  const res = await fetch(`/api/cloud/saves/${saveId}`, {
    method: "DELETE",
    headers,
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "تعذر حذف الحفظة السحابية.");
  }
  return true;
}

export function compareCloudWithLocal(localState, cloudSave) {
  if (!cloudSave?.metadata) return null;
  const c = cloudSave.metadata;
  const cloudInfo = {
    clubName: c.clubName,
    date: c.date,
    season: c.seasonNumber,
    cash: c.cash,
    updatedAt: c.updatedAt,
    device: c.device,
  };

  if (!localState) {
    return {
      isDifferentClub: true,
      localNewer: false,
      cloudNewer: true,
      isSameDate: false,
      local: null,
      cloud: cloudInfo,
    };
  }

  const localDate = localState.date || "";
  const cloudDate = c.date || "";

  const isDifferentClub = localState.clubId !== c.clubId;
  const localNewer = localDate > cloudDate;
  const cloudNewer = cloudDate > localDate;
  const isSameDate = localDate === cloudDate && localState.seasonNumber === c.seasonNumber;

  return {
    isDifferentClub,
    localNewer,
    cloudNewer,
    isSameDate,
    local: {
      clubName: clubBy(localState.clubId)?.name || localState.clubId,
      date: localState.date,
      season: localState.seasonNumber,
      cash: localState.finance?.cash || 0,
    },
    cloud: cloudInfo,
  };
}
