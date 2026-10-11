// الأداء على الأجهزة الضعيفة (0.44): وضع خفيف تلقائي عند ذاكرة ≤ 2GB أو نواة ≤ 2،
// فيُعطَّل الضبابية والحركات الكثيفة بصنف واحد على <html>. لا إعداد يدوي ولا تغيير في الحفظ.

export function isWeakDevice(nav = globalThis.navigator) {
  const mem = Number(nav?.deviceMemory);
  const cores = Number(nav?.hardwareConcurrency);
  if (Number.isFinite(mem) && mem > 0 && mem <= 2) return true;
  if (Number.isFinite(cores) && cores > 0 && cores <= 2) return true;
  return false;
}

export function applyPerformanceMode(doc = globalThis.document, nav = globalThis.navigator) {
  const weak = isWeakDevice(nav);
  doc?.documentElement?.classList.toggle("lite", weak);
  return weak;
}
