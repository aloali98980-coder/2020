import { translateDOM, translateText } from "../i18n/index.js";
import { icon } from "../components/icons.js";
let previousFocus = null;
export function openModal(html, wide = false) {
  previousFocus = document.activeElement;
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal-backdrop"><section role="dialog" aria-modal="true" aria-label="تفاصيل وإجراءات" class="modal ${wide ? "wide" : ""}" tabindex="-1"><button class="modal-close icon-btn" data-action="close-modal" aria-label="إغلاق">${icon("close", 22)}</button><div class="modal-content">${html}</div><div class="modal-error" role="alert" hidden></div></section></div>`;
  translateDOM(root);
  document.body.classList.add("modal-open");
  root.querySelector(".modal").focus();
}
export function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
  document.body.classList.remove("modal-open");
  previousFocus?.focus?.();
}
export function showError(text) {
  const el = document.querySelector(".modal-error");
  if (el) {
    el.hidden = false;
    el.textContent = translateText(text);
    el.scrollIntoView({ block: "nearest" });
  } else toast(text, true);
}
let timer;
export function toast(text, error = false) {
  const el = document.getElementById("toast");
  el.textContent = translateText(text);
  el.className = "visible" + (error ? " error" : "");
  clearTimeout(timer);
  timer = setTimeout(() => (el.className = ""), 5000);
}
export function bindModalKeyboard() {
  document.addEventListener("keydown", (e) => {
    const m = document.querySelector(".modal");
    if (!m) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      const focusable = [
        ...m.querySelectorAll("button,input,select,a,textarea"),
      ].filter((x) => !x.disabled);
      if (!focusable.length) return;
      const first = focusable[0],
        last = focusable.at(-1);
      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === m)
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
