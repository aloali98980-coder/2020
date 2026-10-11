// الأجهزة الضعيفة (0.44): وضع خفيف تلقائي عند ذاكرة ≤ 2GB أو نواة ≤ 2.
import test from "node:test";
import assert from "node:assert/strict";
import { isWeakDevice, applyPerformanceMode } from "../src/core/device.js";

const fakeDoc = () => {
  const set = new Set();
  return {
    documentElement: {
      classList: {
        toggle: (c, on) => (on ? set.add(c) : set.delete(c)),
        contains: (c) => set.has(c),
      },
    },
  };
};

test("الجهاز الضعيف: ذاكرة ≤ 2 أو نواة ≤ 2", () => {
  assert.equal(isWeakDevice({ deviceMemory: 2, hardwareConcurrency: 8 }), true);
  assert.equal(isWeakDevice({ deviceMemory: 8, hardwareConcurrency: 2 }), true);
  assert.equal(isWeakDevice({ deviceMemory: 4, hardwareConcurrency: 8 }), false);
});

test("مجهول الذاكرة والنوى لا يُعامَل كجهاز ضعيف", () => {
  assert.equal(isWeakDevice({}), false);
  assert.equal(isWeakDevice({ deviceMemory: 0, hardwareConcurrency: 0 }), false);
});

test("applyPerformanceMode يضيف الصنف lite للجهاز الضعيف ويزيله لغيره", () => {
  const doc = fakeDoc();
  assert.equal(applyPerformanceMode(doc, { deviceMemory: 1 }), true);
  assert.equal(doc.documentElement.classList.contains("lite"), true);
  assert.equal(applyPerformanceMode(doc, { deviceMemory: 8, hardwareConcurrency: 8 }), false);
  assert.equal(doc.documentElement.classList.contains("lite"), false);
});
