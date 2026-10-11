// المخطط الزمني للمباراة 0.43 — مصدر واحد للبطاقات والطرد والتبديلات.
// القاعدة الحاكمة: اللاعب الخارج من الملعب (مطرود أو مستبدل) خارج كل الأحداث بعد دقيقة خروجه:
// لا بطاقات ولا أهداف ولا إصابات ولا تبديل ثانٍ. وأي حدث يُرتَّب زمنيًا قبل توزيعه على اللاعبين.

const clampMin = (v) => Math.max(1, Math.min(90, v));

function countsFor(rng, { isDerby = false, refereePolicy = "balanced" } = {}) {
  let yellows = isDerby
    ? Math.floor(rng() * 3) + (rng() < 0.6 ? 2 : 1)
    : Math.floor(rng() * 3) + (rng() < 0.3 ? 1 : 0);
  let reds = isDerby ? (rng() < 0.08 ? 1 : 0) : rng() < 0.04 ? 1 : 0;
  if (refereePolicy === "strict") yellows++;
  else if (refereePolicy === "lenient") yellows = Math.max(0, yellows - 1);
  return { yellows, reds };
}

/**
 * يبني المخطط الزمني لمباراة واحدة.
 * @param {object[]} xi     التشكيلة الأساسية [player]
 * @param {object[]} bench  دكة البدلاء [player] (لفريقنا فقط؛ الخصم بلا تبديلات مُحاكاة)
 * @param {function} rng
 * @param {object} opts    { isDerby, refereePolicy, extraTime, subs, injuryProb }
 *   injuryProb(p) -> احتمال إصابة اللاعب في هذه المباراة. إن مُرِّر تُدحرج الإصابات داخل المخطط:
 *   المصاب يُستبدل فورًا إن توفر بديل (حتى حد التبديلات الثلاثة)، والحارس لا يُستبدل إلا بحارس احتياطي.
 */
export function buildTimeline(xi, bench, rng, opts = {}) {
  const span = opts.extraTime ? 120 : 90;
  const exit = new Map(); // id -> دقيقة الخروج (طرد أو تبديل أو إصابة)
  const entry = new Map(); // id -> دقيقة الدخول (للبدلاء)
  const booked = new Map(); // id -> عدد الإنذارات الصفراء
  const events = [];
  const byId = new Map([...xi, ...(bench || [])].map((p) => [p.id, p]));
  const xiIds = new Set(xi.map((p) => p.id));
  const injuryRolls = typeof opts.injuryProb === "function";

  // هل هو على الأرض عند دقيقة m؟ (قبل خروجه، وبعد دخوله إن كان بديلًا)
  const onPitch = (id, m) => {
    if (!byId.has(id)) return false;
    if (!xiIds.has(id) && !(entry.has(id) && entry.get(id) <= m)) return false;
    if (exit.has(id) && exit.get(id) <= m) return false;
    return true;
  };
  const onPitchList = (m) => [...byId.keys()].filter((id) => onPitch(id, m)).map((id) => byId.get(id));
  const pick = (list) => (list.length ? list[Math.floor(rng() * list.length)] : null);

  // 1) الأحداث الخام بدقائقها: بطاقات وطرد وتبديلات (حتى ثلاثة، من 55 إلى 80، لفريقنا فقط)
  const { yellows, reds } = countsFor(rng, opts);
  const raw = [];
  for (let i = 0; i < yellows; i++) raw.push({ min: 1 + Math.floor(rng() * span), kind: "y" });
  for (let i = 0; i < reds; i++) raw.push({ min: 1 + Math.floor(rng() * span), kind: "r" });
  const subsMax = Math.max(0, Math.min(3, opts.subs ?? 3));
  const hasBench = Array.isArray(bench) && bench.length > 0;
  if (hasBench && subsMax) {
    let minute = 55 + Math.floor(rng() * 6);
    for (let k = 0; k < subsMax; k++) {
      minute = Math.min(80, minute + Math.floor(rng() * 9));
      raw.push({ min: minute, kind: "s" });
    }
  }
  // إصابات أساسيين: دحرجة واحدة لكل لاعب، في دقيقة عشوائية من 5 إلى span-5
  if (injuryRolls) {
    for (const p of xi) {
      if (rng() < opts.injuryProb(p)) {
        raw.push({ min: 5 + Math.floor(rng() * (span - 10)), kind: "i", id: p.id });
      }
    }
  }
  // ترتيب زمني؛ عند التساوي: الطرد قبل الإصابة قبل التبديل قبل الإنذار
  const rank = { r: 0, i: 1, s: 2, y: 3 };
  raw.sort((a, b) => a.min - b.min || rank[a.kind] - rank[b.kind]);

  const benchPool = hasBench ? bench.filter((p) => p.position !== "GK").sort((a, b) => b.rating - a.rating) : [];
  const benchGK = hasBench ? bench.filter((p) => p.position === "GK") : [];
  let subsUsed = 0; // التبديلات الثلاثة تشمل تبديلات الإصابة

  // داخل من الدكة قد يُصاب هو الآخر: تُضاف دحرجة له بعد دخوله، في كتلة الأحداث نفسها
  const rollEntrant = (p, from, k) => {
    if (!injuryRolls || from >= span - 1) return;
    if (rng() >= opts.injuryProb(p)) return;
    const minute = from + 1 + Math.floor(rng() * (span - 1 - from));
    let j = k + 1;
    while (j < raw.length && raw[j].min <= minute) j++;
    raw.splice(j, 0, { min: minute, kind: "i", id: p.id });
  };

  // 2) مرور زمني واحد: كل حدث يختار من هو على الأرض في تلك اللحظة فقط
  for (let k = 0; k < raw.length; k++) {
    const ev = raw[k];
    const min = clampMin(ev.min);
    if (ev.kind === "y" || ev.kind === "r") {
      const p = pick(onPitchList(min));
      if (!p) continue;
      if (ev.kind === "y") {
        const n = (booked.get(p.id) || 0) + 1;
        booked.set(p.id, n);
        events.push({ min, t: "y", p: p.id });
        if (n >= 2) {
          exit.set(p.id, min); // إنذار ثانٍ = طرد في الدقيقة نفسها
          events.push({ min, t: "r", p: p.id, why: "second" });
          if (p.position === "GK") replaceGK(p, min);
        }
      } else {
        exit.set(p.id, min);
        events.push({ min, t: "r", p: p.id });
        if (p.position === "GK") replaceGK(p, min);
      }
    } else if (ev.kind === "i") {
      const p = byId.get(ev.id);
      if (!p || !onPitch(p.id, min)) continue; // خرج قبل ذلك: لا إصابة على الأرض
      events.push({ min, t: "i", p: p.id });
      if (p.position === "GK") {
        // حارس مصاب: يُستبدل فقط إن وُجد احتياطي، وإلا يُكمل المباراة
        if (benchGK.some((g) => !entry.has(g.id))) {
          exit.set(p.id, min);
          replaceGK(p, min);
        }
      } else if (subsUsed < subsMax && benchPool.length) {
        // مصاب خارج الأرض فورًا؛ من لا بديل له يُكمل المباراة (مثل المعتاد)
        exit.set(p.id, min);
        const inP = benchPool.shift();
        entry.set(inP.id, min);
        subsUsed++;
        events.push({ min, t: "s", o: p.id, i: inP.id, why: "injury" });
        rollEntrant(inP, min, k);
      }
    } else if (ev.kind === "s") {
      if (!benchPool.length || subsUsed >= subsMax) continue;
      // الأولوية للمرهق ثم لمن معه إنذار؛ الحارس لا يُبدَّل هنا
      const candidates = onPitchList(min)
        .filter((p) => p.position !== "GK" && xiIds.has(p.id))
        .map((p) => ({ p, score: (100 - (p.fitness ?? 80)) + (booked.get(p.id) || 0) * 12 + rng() * 6 }))
        .sort((a, b) => b.score - a.score);
      if (!candidates.length) continue;
      const outP = candidates[0].p;
      const inP = benchPool.shift();
      exit.set(outP.id, min);
      entry.set(inP.id, min);
      subsUsed++;
      events.push({ min, t: "s", o: outP.id, i: inP.id });
      rollEntrant(inP, min, k);
    }
  }

  // حارس مطرود أو مصاب يُستبدل بحارس احتياطي إن وُجد (الاستثناء الوحيد لقاعدة الحارس)
  function replaceGK(gk, min) {
    if (min >= span) return;
    const backup = benchGK.find((g) => !entry.has(g.id));
    if (!backup) return;
    entry.set(backup.id, min);
    events.push({ min, t: "s", o: gk.id, i: backup.id, why: "gk" });
  }

  events.sort((a, b) => a.min - b.min || (a.t === "r" ? -1 : 1));
  return {
    span,
    events,
    exit,
    entry,
    injuryRolled: injuryRolls,
    onPitchAt(id, m) {
      return onPitch(id, m);
    },
    minutesOf(id) {
      const start = entry.has(id) ? entry.get(id) : 0;
      const end = exit.has(id) ? exit.get(id) : span;
      return Math.max(0, end - start);
    },
    participants() {
      const ids = new Set(xi.map((p) => p.id));
      for (const id of entry.keys()) ids.add(id);
      return [...ids];
    },
  };
}

/** يحوّل المخطط إلى سجل مُخزَّن خفيف في الفكسچر (معرّفات ودقائق فقط). */
export function compactTimeline(tl) {
  return {
    ev: tl.events.map((e) => (e.t === "s" ? { m: e.min, t: "s", o: e.o, i: e.i } : { m: e.min, t: e.t, p: e.p })),
    ...(tl.injuryRolled ? { ir: 1 } : {}),
  };
}

/** يعيد بناء أحداث المباراة من السجل المُخزَّن (للتقرير والإحصاءات). */
