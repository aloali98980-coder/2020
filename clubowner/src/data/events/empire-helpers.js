// أدوات كتالوج أحداث الإمبراطورية 0.29: المصدر الواحد ثلاثي اللغة يُسطَّح
// إلى نصوص عربية للمحرك، ويُشتق منه قاموس الترجمة تلقائيًا — فلا تنفصل
// النصوص عن ترجماتها أبدًا.
const AR = /[\u0600-\u06FF]/;
const TEXT_FIELDS = ["topic", "title", "body"];
const CHOICE_FIELDS = ["label", "note", "incomeNote", "costNote"];

function flattenEntry(entry) {
  const out = { ...entry };
  for (const f of TEXT_FIELDS)
    if (out[f] && typeof out[f] === "object") out[f] = out[f].ar;
  if (Array.isArray(out.choices))
    out.choices = out.choices.map((c) => {
      const oc = { ...c };
      for (const f of CHOICE_FIELDS)
        if (oc[f] && typeof oc[f] === "object") oc[f] = oc[f].ar;
      return oc;
    });
  if (out.effect && out.effect.note && typeof out.effect.note === "object")
    out.effect = { ...out.effect, note: out.effect.note.ar };
  return out;
}

export function flattenCatalog(entries) {
  return entries.map(flattenEntry);
}

export function deriveEventPhrases(entries) {
  const out = {};
  const put = (t) => {
    if (!t || typeof t !== "object" || !t.ar || !AR.test(t.ar)) return;
    out[t.ar] = [t.en, t.fr];
    // الصورة المجردة: بلا علامات خاتمة ولا أقواس تنصيص — كما يجرّدها فاحص
    // الترجمة، فيبقى النص مترجمًا بكل صوره.
    const bare = t.ar.replace(/[.؛:!؟…،,»«()]+$/, "");
    if (bare && !out[bare]) out[bare] = [t.en, t.fr];
  };
  for (const entry of entries) {
    for (const f of TEXT_FIELDS) put(entry[f]);
    for (const c of entry.choices || []) for (const f of CHOICE_FIELDS) put(c[f]);
    put(entry.effect?.note);
  }
  return out;
}
