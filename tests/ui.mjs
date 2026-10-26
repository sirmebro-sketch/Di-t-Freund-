import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  locale: "de-DE",
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const click = async (action) =>
  page.locator(`[data-action="${action}"]:visible`).first().click();
const fill = async (name, value) =>
  page.locator(`#sheet [name="${name}"]`).fill(String(value));
const submit = async () => page.locator('#sheet button[type="submit"]').click();
const read = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("diaetfreund-v1")));
const assertNoOverflow = async () =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "viewport must not overflow",
  );
await page.goto(process.env.APP_URL || "http://127.0.0.1:4173");
await click("onboard");
for (const [k, v] of Object.entries({
  name: "Alex",
  height: 180,
  start: 100,
  goal: 90,
  kcal: 2200,
  protein: 140,
  water: 2000,
  sessions: 2,
}))
  await fill(k, v);
await page.locator('[name="adult"]').check();
await submit();
assert.equal((await read()).profile.name, "Alex");
await assertNoOverflow();
await click("water");
assert.equal((await read()).water[Object.keys((await read()).water)[0]], 0);
await page.locator('[data-action="water"][data-amount="250"]').click();
assert.equal(Object.values((await read()).water)[0], 250);
await click("add-food");
await page.locator("#food-search").fill("Hafer");
await click("pick-food");
await fill("amount", 50);
await submit();
assert.equal((await read()).entries[0].amount, 50);
await page.locator('.bottom-nav [data-tab="food"]').click();
await click("edit-entry");
await fill("amount", 60);
await submit();
assert.equal((await read()).entries[0].amount, 60);
await click("add-food");
await click("custom-food");
for (const [k, v] of Object.entries({
  name: "Testprodukt",
  kcal: 100,
  protein: 10,
  carbs: 10,
  fat: 2,
  fiber: 1,
}))
  await fill(k, v);
await submit();
await fill("amount", 200);
await submit();
assert.equal((await read()).foods.length, 1);
assert.equal((await read()).entries.length, 2);
await page.locator(".food-tools summary").click();
await click("recipe");
await fill("name", "Testrezept");
await page.locator('[name="ingredient"]').selectOption("base-0");
await fill("ingredientAmount", 100);
await click("recipe-add");
await fill("cookedWeight", 200);
await submit();
await fill("amount", 100);
await submit();
// USDA FDC 173904: 379 kcal per 100 g oats; recipe yields 200 g.
assert.equal((await read()).foods.at(-1).kcal, 189.5);
await click("barcode");
await page.route("https://world.openfoodfacts.org/**", (r) =>
  r.fulfill({
    json: {
      status: 1,
      product: {
        product_name: "Test EAN",
        nutriments: {
          "energy-kcal_100g": 120,
          proteins_100g: 5,
          carbohydrates_100g: 15,
          fat_100g: 4,
        },
      },
    },
  }),
);
await fill("code", "12345678");
await page.locator('[data-form="barcode"] button').click();
await page.locator('[data-form="custom-food"]').waitFor();
await submit();
await submit();
assert.equal((await read()).foods.at(-1).barcode, "12345678");
await page.locator('.bottom-nav [data-tab="more"]').click();
await click("go-chart");
await click("weight");
await fill("value", 99.5);
await submit();
assert.equal((await read()).weights[0].value, 99.5);
await page.locator('.bottom-nav [data-tab="train"]').click();
await page.locator(".training-presets summary").click();
await click("start-workout");
await page.locator('[data-set="0"][data-key="kg"]').fill("5");
await page.locator('[data-set="0"][data-key="kg"]').blur();
await click("toggle-set");
await page.reload();
assert.equal((await read()).activeWorkout.sets[0].kg, 5);
await page.locator('.bottom-nav [data-tab="train"]').click();
await click("finish-workout");
await fill("minutes", 25);
await submit();
assert.equal((await read()).workouts[0].sets.length, 1);
assert.equal((await read()).activeWorkout, null);
await page.locator('.bottom-nav [data-tab="more"]').click();
await click("health");
await fill("sleep", 7.5);
await fill("sys", 125);
await fill("dia", 80);
await fill("note", "Gut geschlafen.");
await submit();
assert.equal((await read()).health[0].sleep, 7.5);
await click("theme");
await page.reload();
assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
await page.locator('.bottom-nav [data-tab="more"]').click();
const before = await read();
await page.evaluate(() => window.onImport('{"version":99}'));
assert.deepEqual(await read(), before);
await page.evaluate((raw) => window.onImport(raw), JSON.stringify(before));
await click("close");
assert.deepEqual(await read(), before);
const downloadEvent = page.waitForEvent("download");
await click("export");
const download = await downloadEvent;
assert.match(download.suggestedFilename(), /\.json$/);
await click("theme");
await page.locator('.bottom-nav [data-tab="home"]').click();
await assertNoOverflow();
await mkdir("test-results", { recursive: true });
await page.waitForFunction(
  () => !document.querySelector("#toast").classList.contains("visible"),
);
await page.screenshot({
  path: "test-results/mobile-dashboard.png",
  fullPage: true,
});
await page.setViewportSize({ width: 1440, height: 1100 });
await assertNoOverflow();
await page.screenshot({
  path: "test-results/desktop-dashboard.png",
  fullPage: true,
});
await page.setViewportSize({ width: 360, height: 800 });
for (const tab of ["food", "journey", "train", "more"]) {
  await page.locator(`.bottom-nav [data-tab="${tab}"]`).click();
  await assertNoOverflow();
  await page.screenshot({
    path: `test-results/mobile-${tab}.png`,
    fullPage: true,
  });
}
assert.deepEqual(errors, []);
console.log(
  "PASS: onboarding, water, food create/edit, recipe, mocked barcode, weight, training recovery, health, themes, import rejection/cancel, export, responsive layouts.",
);
await browser.close();
