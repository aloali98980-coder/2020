import { saveBlob } from "./saveEncoding.js";
export const MAX_SAVE_BYTES = 160 * 1024 * 1024;
export const MAX_COMPRESSED_BYTES = 80 * 1024 * 1024;
export async function backupBlob(state) {
  const raw = saveBlob(state);
  if (raw.size > MAX_SAVE_BYTES)
    throw Error(
      "حجم الحفظ تجاوز ١٦٠ ميجابايت؛ لا يمكن إنشاء نسخة لا تقبل الاستيراد.",
    );
  if (state.database !== "world" || typeof CompressionStream === "undefined")
    return { blob: raw, extension: ".json" };
  const compressed = await new Response(
    raw.stream().pipeThrough(new CompressionStream("gzip")),
  ).blob();
  if (compressed.size > MAX_COMPRESSED_BYTES)
    throw Error("النسخة المضغوطة تجاوزت ٨٠ ميجابايت.");
  return { blob: compressed, extension: ".json.gz" };
}
export async function readBackup(file) {
  if (file.size > MAX_SAVE_BYTES)
    throw Error("أقصى حجم للحفظ غير المضغوط ١٦٠ ميجابايت.");
  const magic = new Uint8Array(await file.slice(0, 2).arrayBuffer());
  if (magic[0] !== 0x1f || magic[1] !== 0x8b) return file.text();
  if (file.size > MAX_COMPRESSED_BYTES)
    throw Error("أقصى حجم للملف المضغوط ٨٠ ميجابايت.");
  if (typeof DecompressionStream === "undefined")
    throw Error(
      "هذا المتصفح لا يفك الحفظ المضغوط؛ فك ملف gzip إلى JSON ثم استورده.",
    );
  const reader = file
    .stream()
    .pipeThrough(new DecompressionStream("gzip"))
    .getReader();
  const chunks = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_SAVE_BYTES) {
        await reader.cancel();
        throw Error("الحفظ بعد فك الضغط تجاوز حد ١٦٠ ميجابايت.");
      }
      chunks.push(value);
    }
    return new Blob(chunks).text();
  } finally {
    reader.releaseLock();
  }
}
