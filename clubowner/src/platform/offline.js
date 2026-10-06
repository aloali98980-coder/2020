import { toast } from "../ui/modal.js";

// Only production registers a worker; live development stays uncached.
export function registerOffline() {
  if (
    !import.meta.env.PROD ||
    !("serviceWorker" in navigator) ||
    !window.isSecureContext
  )
    return;
  let reloadOnActivate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadOnActivate) location.reload();
  });
  window.addEventListener(
    "load",
    async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });
        if (registration.waiting) offerUpdate(registration);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state !== "installed") return;
            if (navigator.serviceWorker.controller) offerUpdate(registration);
            else
              toast(
                "اكتمل تجهيز اللعبة للعمل دون اتصال على هذا المتصفح. صدّر حفظتك للاحتياط.",
              );
          });
        });
        navigator.serviceWorker.ready.then(() =>
          window.dispatchEvent(new Event("club-offline-ready")),
        );
      } catch (error) {
        console.warn("Offline setup unavailable:", error);
        toast(
          "اللعبة تعمل بالإنترنت، لكن تجهيز العمل دون اتصال لم يكتمل. جرّب إعادة فتح الرابط.",
          true,
        );
      }
    },
    { once: true },
  );
  function offerUpdate(registration) {
    if (document.getElementById("update-banner")) return;
    const banner = document.createElement("div");
    banner.id = "update-banner";
    banner.className = "update-banner";
    banner.setAttribute("role", "status");
    const label = document.createElement("span");
    label.textContent = "نسخة جديدة من اللعبة جاهزة.";
    const update = document.createElement("button");
    update.className = "btn primary small";
    update.textContent = "تحديث الآن";
    update.onclick = () => {
      if (!registration.waiting) {
        banner.remove();
        return;
      }
      if (
        !window.confirm(
          "الحفظة مسجلة تلقائيًا. سيتم إغلاق أي نموذج لم تؤكد إرساله وإعادة تحميل اللعبة. هل تريد التحديث الآن؟",
        )
      )
        return;
      reloadOnActivate = true;
      registration.waiting.postMessage({ type: "ACTIVATE_UPDATE" });
    };
    const later = document.createElement("button");
    later.className = "btn ghost small";
    later.textContent = "لاحقًا";
    later.onclick = () => banner.remove();
    banner.append(label, update, later);
    document.body.append(banner);
  }
}
