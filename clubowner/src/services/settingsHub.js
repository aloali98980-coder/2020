// الدفعة 6 — القسم 6: الإعدادات الشاملة. مفاتيح الإشعارات المحفوظة في التفضيلات.
// القاعدة: الغائب = مفعّل (الحفظات القديمة لا تفقد شيئًا).
export const NOTIFY_KEYS = Object.freeze(["achievements", "absence"]);

export function notifyEnabled(s, key) {
  return s?.preferences?.notify?.[key] !== false;
}

export function setNotify(s, key, on) {
  if (!NOTIFY_KEYS.includes(key)) throw new Error("إشعار غير معروف.");
  s.preferences ||= {};
  s.preferences.notify ||= {};
  s.preferences.notify[key] = Boolean(on);
  return s.preferences.notify[key];
}
