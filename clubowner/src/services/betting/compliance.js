// الامتثال المؤقت 0.36 — مجموعة 2: stub يُوسّع في المجموعة 3.
export function regulatorTick(s) {
  // لا شيء في هذه المجموعة — يُفعّل في المجموعة 3 (المنظم والامتثال)
  return null;
}
export function setResponsibleLevel(s, level) {
  const b = s.betting;
  if (b) b.compliance.responsibleLevel = level;
  return level;
}
