import { uid } from "../core/utils.js";
export function message(
  s,
  {
    title,
    body,
    category = "club",
    required = false,
    kind = "info",
    ref = null,
    deadline = null,
    priority = "normal",
  },
) {
  const m = {
    id: uid(s, "msg"),
    date: s.date,
    title,
    body,
    category,
    required,
    kind,
    ref,
    deadline,
    priority,
    read: false,
    status: "open",
  };
  s.inbox.unshift(m);
  return m;
}
export const pendingActions = (s) =>
  s.inbox.filter((m) => m.required && m.status === "open");
export function closeThread(s, ref) {
  s.inbox
    .filter((m) => m.ref === ref && m.required)
    .forEach((m) => {
      m.status = "resolved";
      m.read = true;
    });
}
export function resolveInfo(s, id) {
  const m = s.inbox.find((x) => x.id === id);
  if (m) {
    m.status = "resolved";
    m.read = true;
  }
}
