import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import {
  emptyState,
  staples,
  today,
  shiftDate,
} from "../app/src/main/assets/www/core.js";
import { newGame, syncGame } from "../app/src/main/assets/www/game.js";
const browser = await chromium.launch(),
  context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    locale: "de-DE",
  }),
  page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
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
await mkdir("test-results", { recursive: true });
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
  game: newGame(4, shiftDate(today(), -40)),
};
for (let i = 40; i > 0; i--) {
  const date = shiftDate(today(), -i);
  s.entries.push({
    ...staples[0],
    id: "f" + i,
    date,
    amount: 100,
    meal: "Frühstück",
  });
  s.checkins[date] = { hunger: 2, fatigue: 2, pain: false };
  s.game.restDays.push(date);
  syncGame(s, date);
}
s.entries.push(
  {
    ...staples[0],
    id: "a",
    date: today(),
    amount: 50,
    meal: "Frühstück",
    micros: { iron: 2, calcium: null },
  },
  { ...staples[1], id: "b", date: today(), amount: 200, meal: "Frühstück" },
);
await page.evaluate(
  (s) => localStorage.setItem("diaetfreund-v1", JSON.stringify(s)),
  s,
);
await page.reload();
await click("game");
await click("game-regions");
await axe("region selection");
await page.screenshot({ path: "test-results/regions.png" });
await page.locator('[data-action="game-travel"][data-starter="155"]').click();
let saved = await read();
assert.equal(saved.game.career.activeRegion, "johto");
assert.equal(saved.game.regions.johto.points, 0);
assert.equal(saved.game.regions.kanto.points, 120);
await click("game-map");
assert.equal(await page.locator(".kanto-route li").count(), 20);
assert.match(await page.locator("#sheet").innerText(), /Neuborkia/);
await axe("Johto route");
await page.screenshot({ path: "test-results/johto-route.png" });
await page.locator('[data-action="game-place"][data-id="bell"]').click();
assert.match(await page.locator("#sheet").innerText(), /Ho-Oh/);
await click("game-badges");
assert.equal(await page.locator(".badge-card").count(), 8);
assert.match(await page.locator("#sheet").innerText(), /Sandra/);
await axe("Johto badges");
await click("game");
await click("game-dex");
assert.equal(await page.locator(".dex-mon").count(), 100);
assert.equal(
  await page
    .locator("#dex-grid img")
    .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0)),
  true,
);
await axe("all Johto sprites");
await page.screenshot({ path: "test-results/johto-pokedex.png" });
await page.locator("#dex-search").fill("Lugia");
await click("game-species");
assert.match(
  await page.locator("#sheet").innerText(),
  /258 Regionspunkten.*nach dem Champ/,
);
assert.doesNotMatch(await page.locator("#sheet").innerText(), /Lavados/);
await click("game-dex");
await page.locator("#dex-region").selectOption("all");
assert.equal(await page.locator(".dex-mon").count(), 251);
await click("game");
await click("game-regions");
await page.locator('[data-action="game-travel"][data-region="kanto"]').click();
assert.match(await page.locator("#sheet").innerText(), /Kanto-Karte/);
await click("close");
await page.locator('.bottom-nav [data-tab="food"]').click();
await click("template-save");
await page.locator("#template-name").fill("Mein Haferfrühstück");
await click("template-save-confirm");
assert.equal((await read()).mealTemplates.length, 1);
await axe("meal templates");
await click("template-preview");
await page.locator("#template-scale").selectOption("0.5");
assert.equal(
  await page.locator('[data-template-amount="0"]').inputValue(),
  "25",
);
await page.locator('[data-template-amount="0"]').fill("75,5");
await page.locator("#template-meal").selectOption("Abendessen");
await axe("meal preview");
await page.screenshot({ path: "test-results/meal-preview.png" });
let before = (await read()).entries.length;
await page.locator('[data-template-amount="1"]').fill("0");
await click("template-add");
assert.equal((await read()).entries.length, before);
await page.locator('[data-template-amount="1"]').fill("100");
await click("template-add");
saved = await read();
assert.equal(saved.entries.length, before + 2);
assert.equal(saved.entries.at(-2).amount, 75.5);
assert.equal(saved.entries.at(-2).meal, "Abendessen");
assert.deepEqual(saved.entries.at(-2).micros, { iron: 2, calcium: null });
await page.reload();
await page.locator('.bottom-nav [data-tab="food"]').click();
await click("templates");
await click("template-rename");
await page.locator("#template-name").fill("Mein Standardfrühstück");
await click("template-rename-confirm");
assert.equal((await read()).mealTemplates[0].name, "Mein Standardfrühstück");
await page.setViewportSize({ width: 360, height: 800 });
await click("template-preview");
assert.equal(
  await page
    .locator("#sheet")
    .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  true,
);
await axe("meal preview narrow");
await click("templates");
await click("template-delete");
await click("template-delete-confirm");
assert.equal((await read()).mealTemplates.length, 0);
assert.equal((await read()).entries.length, before + 2);
await click("close");
await page.locator('.bottom-nav [data-tab="more"]').click();
await click("theme");
await page.locator('.bottom-nav [data-tab="journey"]').click();
await click("game");
await click("game-regions");
await axe("regions dark");
await page.locator('[data-action="game-travel"][data-region="johto"]').click();
await click("game-badges");
await axe("Johto badges dark");
assert.equal(
  await page
    .locator("#sheet")
    .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  true,
);
await click("game");
await click("game-dex");
await axe("Johto dex dark");
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "PASS: Johto travel, 100 offline sprites, 251-species filter, 20 locations, 8 gyms, legendary guidance; save/scale/edit/reuse/rename/delete meal templates, atomic invalid quantities, reload, 360px and light/dark accessibility.",
);
