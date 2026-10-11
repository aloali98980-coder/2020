// الأرقام اللاتينية 0-9 في كل مكان (الإصدار 0.44): حتى في النصوص العربية.
// يمنع الاختبار أي أرقام هندية أو فارسية أو علامة النسبة العربية في الكود (بمحارف يونيكود)،
// ويتحقق من أن التنسيق الفعلي (الأرقام والمبالغ والتواريخ) لاتيني في اللغات الثلاث.
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { num, money, date } from "../src/ui/format.js";
import { setLanguage } from "../src/i18n/index.js";

const FORBIDDEN = /[\u0660-\u0669\u06F0-\u06F9\u066A]/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|mjs|html|css|json)$/.test(name)) out.push(p);
  }
  return out;
}

test("لا أرقام هندية ولا فارسية ولا علامة نسبة عربية في المصدر والاختبارات", () => {
  const offenders = [];
  for (const root of ["src", "tests"]) {
    for (const file of walk(root)) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (FORBIDDEN.test(line)) offenders.push(`${file}:${i + 1}`);
        });
    }
  }
  assert.deepEqual(offenders.slice(0, 10), [], "أماكن تحتوي أرقامًا غير لاتينية");
});

test("التنسيق الفعلي لاتيني في اللغات الثلاث (الأرقام والمبالغ والتواريخ)", () => {
  for (const lang of ["ar", "en", "fr"]) {
    setLanguage(lang);
    const text = [num(1234567), money(9876543), money(2500000000), date("2026-10-11")].join(" ");
    assert.ok(!FORBIDDEN.test(text), `${lang}: ${text}`);
    assert.match(num(1234567), /\d/);
  }
  setLanguage("ar");
});
