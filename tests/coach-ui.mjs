import assert from "node:assert/strict";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import {
  emptyState,
  staples,
  today,
  shiftDate,
} from "../app/src/main/assets/www/core.js";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  locale: "de-DE",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const initial = {
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
};
await page.goto(process.env.APP_URL || "http://127.0.0.1:4173");
await page.evaluate(
  (s) => localStorage.setItem("diaetfreund-v1", JSON.stringify(s)),
  initial,
);
await page.reload();
const click = async (a) =>
  page.locator(`[data-action="${a}"]:visible`).first().click();
const fill = async (k, v) =>
  page.locator(`#sheet [name="${k}"]`).fill(String(v));
const select = async (k, v) =>
  page.locator(`#sheet [name="${k}"]`).selectOption(v);
const submit = async () => page.locator('#sheet button[type="submit"]').click();
const read = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("diaetfreund-v1")));
const a11y = async (label) => {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  assert.deepEqual(
    r.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
    [],
    label,
  );
};
await a11y("dashboard light");
await page.locator('.bottom-nav [data-tab="more"]').click();
await click("coach-settings");
await fill("birthDate", "1990-06-01");
await select("sex", "male");
await select("location", "both");
await page.locator('[name="betaBlocker"]').check();
await a11y("coach settings");
await submit();
assert.equal((await read()).coach.betaBlocker, true);
if (!await page.locator('[data-action="coach"]:visible').count()) await page.locator('.bottom-nav [data-tab="more"]').click();
await click("coach");
assert.match(await page.locator("#sheet").innerText(), /keine Messung/);
await click("initial-target");
await click("close");
assert.equal((await read()).profile.kcal, 2200);
await page.locator('.bottom-nav [data-tab="home"]').click();
await click("checkin");
await select("fatigue", "5");
await submit();
await page.locator('.bottom-nav [data-tab="train"]').click();
assert.match(
  await page.locator("main").innerText(),
  /Heute darf es leichter sein/,
);
assert.equal(await page.locator('[data-action="start-workout"]').count(), 4);
await a11y("training");
await page.locator('.bottom-nav [data-tab="food"]').click();
await click("add-food");
await page.locator("#food-search").fill("Hafer");
await click("favorite");
assert.equal((await read()).favorites.length, 1);
await click("pick-food");
await fill("amount", 65);
await submit();
await click("complete-day");
assert.equal((await read()).completeDays[today()], true);
await click("add-food");
await page.locator("#food-search").fill("Hafer");
assert.match(
  await page.locator('[data-action="quick-food"]').first().innerText(),
  /65/,
);
await click("quick-food");
assert.equal((await read()).entries.at(-1).amount, 65);
assert.equal((await read()).completeDays[today()], false);
await click("nutrition-day");
assert.match(await page.locator("#sheet").innerText(), /Unbekannt/);
await a11y("nutrient sheet");
await click("close");
await click("add-food");
await click("custom-food");
for (const [k, v] of Object.entries({
  name: "Test mit Vitamin C",
  kcal: 100,
  protein: 5,
  carbs: 10,
  fat: 2,
  fiber: 1,
}))
  await fill(k, v);
await page.locator("#sheet summary").filter({hasText:"Vitamine & Mineralstoffe"}).click();
await fill("micro_vitaminC", 25);
await submit();
await fill("amount", 200);
await submit();
await click("nutrition-day");
assert.match(await page.locator("#sheet").innerText(), /50,0 mg/);
assert.match(
  await page.locator("#sheet").innerText(),
  /3\/3 Einträge mit Daten/,
);
await click("close");
// Independent synthetic 21-day history verifies the visible confirmation boundary.
const s = await read();
s.entries = [];
s.weights = [];
s.completeDays = {};
s.checkins = {};
for (let i = 0; i < 21; i++) {
  const date = shiftDate(today(), i - 21);
  s.entries.push({
    ...staples[0],
    id: "history" + i,
    kcal: 220,
    amount: 1000,
    date,
    meal: "Frühstück",
  });
  s.completeDays[date] = true;
  s.weights.push({ date, value: 100 - i * 0.07 });
}
await page.evaluate(
  (s) => localStorage.setItem("diaetfreund-v1", JSON.stringify(s)),
  s,
);
await page.reload();
if (!await page.locator('[data-action="coach"]:visible').count()) await page.locator('.bottom-nav [data-tab="more"]').click();
await click("coach");
await click("review-target");
assert.equal((await read()).profile.kcal, 2200);
await click("apply-review");
assert.equal((await read()).profile.kcal, 2300);
assert.equal((await read()).targetHistory.length, 1);
await page.locator('.bottom-nav [data-tab="more"]').click();
await click("theme");
await a11y("settings dark");
await page.locator('.bottom-nav [data-tab="home"]').click();
await a11y("dashboard dark");
await page.setViewportSize({ width: 360, height: 800 });
if (!await page.locator('[data-action="coach"]:visible').count()) await page.locator('.bottom-nav [data-tab="more"]').click();
await click("coach");
assert.equal(
  await page
    .locator("#sheet")
    .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  true,
);
await page.screenshot({
  path: "test-results/mobile-compass.png",
  fullPage: true,
});
await click("close");
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "PASS: coach setup, honest estimates, recovery, favorites, remembered portions, complete-day invalidation, partial nutrients, confirmed adaptation, light/dark automated accessibility.",
);
