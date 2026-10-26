import assert from "node:assert/strict";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import {
  emptyState,
  today,
  shiftDate,
} from "../app/src/main/assets/www/core.js";
import { newGame } from "../app/src/main/assets/www/game.js";
const browser = await chromium.launch(),
  context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    locale: "de-DE",
  }),
  page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.addInitScript(() => {
  window.calls = [];
  window.scans = [];
  window.barcodeCount = 0;
  window.Android = {
    readState: () => localStorage.getItem("diaetfreund-v1"),
    writeState: (raw) => {
      localStorage.setItem("diaetfreund-v1", raw);
      return true;
    },
    scanNutrition: (id) => window.scans.push(id),
    scanBarcode: () => window.barcodeCount++,
    healthConnect: (raw) => window.calls.push(JSON.parse(raw)),
  };
});
const click = async (a) => {
  const modal = page.locator(`#sheet[open] [data-action="${a}"]:visible`);
  await (
    (await modal.count()) ? modal : page.locator(`[data-action="${a}"]:visible`)
  )
    .first()
    .click();
};
const read = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("diaetfreund-v1")));
const axe = async (label) =>
  assert.deepEqual(
    (
      await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.failureSummary),
    })),
    [],
    label,
  );
const fill = async (n, v) =>
  page.locator(`#sheet [name="${n}"]`).fill(String(v));
const submit = () => page.locator('#sheet button[type="submit"]').click();
await page.goto(process.env.APP_URL || "http://127.0.0.1:4173");
const s = {
  ...emptyState(),
  profile: {
    name: "Alex",
    height: 180,
    start: 100,
    goal: 90,
    kcal: 2200,
    protein: 140,
    water: 2000,
    sessions: 2,
  },
  game: newGame(4, today()),
};
await page.evaluate(
  (s) => localStorage.setItem("diaetfreund-v1", JSON.stringify(s)),
  s,
);
await page.reload();
assert.deepEqual(
  await page.locator(".bottom-nav button span:last-child").allTextContents(),
  ["Heute", "Essen", "Training", "Trends", "Reise", "Profil"],
);
assert.equal(await page.locator('main [data-action="checkin"]').count(), 1);
await axe("Gen-IV dashboard");
await page.screenshot({ path: "test-results/gen4-home.png", fullPage: true });
await click("barcode");
assert.equal(
  await page.evaluate(() => window.barcodeCount),
  1,
  "one tap opens native barcode camera",
);
await click("ocr-open");
await click("ocr-scan");
const label =
  "Nährwerte pro 100 g\nEnergie 1500 kJ / 360 kcal\nFett 8,5 g\nKohlenhydrate 50 g\nEiweiß 20 g";
await page.evaluate(
  (text) =>
    window.onNutritionScan(
      JSON.stringify({
        requestId: window.scans.at(-1),
        text,
        cancelled: false,
      }),
    ),
  label,
);
assert.equal(await page.locator("#ocr-basis").inputValue(), "100");
assert.equal((await read()).foods.length, 0);
await axe("OCR preview");
await page.screenshot({
  path: "test-results/nutrition-photo-review.png",
  fullPage: true,
});
await click("ocr-use");
assert.equal(
  await page.locator('[data-form="custom-food"]').count(),
  0,
  "confirmation required",
);
await page.locator("#ocr-confirm").check();
await click("ocr-use");
assert.equal(await page.locator('[name="protein"]').inputValue(), "20");
assert.equal(await page.locator('[name="fiber"]').inputValue(), "");
await fill("name", "Foto-Testprodukt");
await submit();
await fill("amount", "75");
await submit();
let saved = await read();
assert.equal(saved.entries[0].kcal, 360);
assert.equal(saved.entries[0].amount, 75);
assert.match(saved.foods[0].source, /Packungsfoto/);
assert.equal(saved.game.earned[today()].length, 1);
assert.match(await page.locator("#reward").innerText(), /10 Team-EP/);
await click("reward-dismiss");
await click("checkin");
await submit();
await click("reward-dismiss");
await click("care-choice");
await click("game-rest");
await click("close");
assert.equal((await read()).game.earned[today()].length, 3);
assert.equal((await read()).game.collection.length, 2);
await click("reward-dismiss");
await click("checkin");
await submit();
assert.equal(
  await page.locator("#reward").isVisible(),
  false,
  "editing an already rewarded task gives no new reward",
);
await page.locator('.bottom-nav [data-tab="journey"]').click();
await axe("journey hub");
await click("trainer-pass");
await axe("trainer passport");
assert.match(await page.locator("#sheet").innerText(), /✓ Erreicht/);
await click("close");
await page.locator('.bottom-nav [data-tab="more"]').click();
assert.equal(await page.locator('main [data-action="checkin"]').count(), 0);
await click("theme");
await axe("Gen-IV profile dark");
await page.locator('.bottom-nav [data-tab="home"]').click();
await axe("Gen-IV dashboard dark");
await page.screenshot({
  path: "test-results/gen4-home-dark.png",
  fullPage: true,
});
// Explicit refresh can use permissions granted outside the app, then foreground resume refreshes again.
await click("hc-sync");
assert.equal(await page.evaluate(() => window.calls.at(-1).discover), true);
const snapshot = {
  kind: "sync",
  from: shiftDate(today(), -29),
  to: today(),
  at: new Date().toISOString(),
  read: ["steps"],
  days: [{ date: today(), steps: 6789, sleep: null }],
  weights: [],
  warnings: ["Schlaf konnte nicht gelesen werden."],
  stepSources: ["com.sec.android.app.shealth"],
  discoveredPermissions: true,
};
await page.evaluate(
  (p) =>
    window.onHealthConnect(
      JSON.stringify({ ...p, requestId: window.calls.at(-1).requestId }),
    ),
  snapshot,
);
saved = await read();
assert.equal(saved.healthConnect.days[today()].steps, 6789);
assert.equal(saved.healthConnect.autoRead, true);
assert.equal(saved.game.earned[today()].length, 3);
await click("hc-open");
assert.match(await page.locator("#sheet").innerText(), /Samsung Health/);
await click("close");
const count = await page.evaluate(() => window.calls.length);
await page.evaluate(() => {
  const real = Date.now;
  Date.now = () => real() + 301000;
  window.onAppResume();
});
assert.equal(await page.evaluate(() => window.calls.length), count + 1);
await page.evaluate(
  (p) =>
    window.onHealthConnect(
      JSON.stringify({ ...p, requestId: window.calls.at(-1).requestId }),
    ),
  { kind: "error", message: "Lesen fehlgeschlagen" },
);
assert.equal((await read()).healthConnect.days[today()].steps, 6789);
await page.setViewportSize({ width: 360, height: 800 });
for (const tab of ["home", "food", "train", "journey", "more"]) {
  await page.locator(`.bottom-nav [data-tab="${tab}"]`).click();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    true,
    tab,
  );
}
await page.locator('.bottom-nav [data-tab="food"]').click();
await click("ocr-open");
await click("ocr-scan");
const stale = await page.evaluate(() => window.scans.at(-1));
await click("close");
await click("ocr-open");
await page.evaluate(
  (id) =>
    window.onNutritionScan(
      JSON.stringify({ requestId: id, text: "Fett 99 g" }),
    ),
  stale,
);
assert.equal(await page.locator("#ocr-text").inputValue(), "");
await axe("OCR dark narrow");
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "PASS: Gen-IV navigation and visuals, native photo bridge (mocked), OCR review and confirmation, per-portion logging, one-tap barcode, reward idempotency, restored external Health Connect permissions, foreground refresh, failure preservation, dark mode and 360px accessibility.",
);
