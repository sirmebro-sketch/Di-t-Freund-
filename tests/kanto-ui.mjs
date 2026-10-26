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
page.setDefaultTimeout(12000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const click = async (a) => {
  const scoped = page.locator(`#sheet[open] [data-action="${a}"]:visible`);
  await (
    (await scoped.count())
      ? scoped
      : page.locator(`[data-action="${a}"]:visible`)
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
      nodes: v.nodes.map((n) => ({ target: n.target, why: n.failureSummary })),
    })),
    [],
    label,
  );
await mkdir("test-results", { recursive: true });
await page.goto(process.env.APP_URL || "http://127.0.0.1:4173");
const state = {
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
state.game.collection.push({ base: 133, xp: 0, caught: today() });
state.game.discovered.push(133);
// Simulate v0.2 game save on the same app schema: no data or partner should disappear.
delete state.game.version;
delete state.game.discovered;
delete state.game.badges;
delete state.game.leagueWins;
delete state.game.legacyRibbons;
state.game.battles = 6;
state.game.wins = 6;
await page.evaluate(
  (s) => localStorage.setItem("diaetfreund-v1", JSON.stringify(s)),
  state,
);
await page.reload();
await click("game");
await click("game-dex");
assert.equal(await page.locator(".dex-mon").count(), 151);
assert.equal(
  await page
    .locator("#dex-grid img")
    .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0)),
  true,
);
await axe("151 species dex");
await page.screenshot({ path: "test-results/kanto-pokedex.png" });
await page.locator("#dex-search").fill("150");
assert.equal(await page.locator(".dex-mon").count(), 1);
assert.match(await page.locator(".dex-mon").innerText(), /Mewtu/);
await click("game-species");
assert.match(await page.locator("#sheet").innerText(), /nach dem Champ/);
await click("game-dex");
await page.locator("#dex-status").selectOption("found");
assert.equal(await page.locator(".dex-mon").count(), 2);
await page.locator("#dex-search").fill("Evoli");
await click("game-species");
await page.locator('[data-action="game-evolution"][data-id="136"]').click();
assert.equal(
  (await read()).game.collection.find((m) => m.base === 133).choice,
  136,
);
assert.equal((await read()).game.version, 2);
assert.equal((await read()).game.legacyRibbons, 2);
await axe("evolution choice");
await click("game-dex");
await page.locator("#dex-type").selectOption("Drache");
assert.equal(await page.locator(".dex-mon").count(), 3);
await page.locator("#dex-search").fill("zzzz");
assert.match(await page.locator("#dex-count").innerText(), /^0 Treffer/);
await click("game");
await click("game-map");
assert.equal(await page.locator(".kanto-route li").count(), 23);
await axe("Kanto route");
await page.screenshot({ path: "test-results/kanto-route.png" });
await page.locator('[data-action="game-place"][data-id="power"]').click();
assert.match(await page.locator("#sheet").innerText(), /Kraftwerk/);
await click("game-badges");
assert.equal(await page.locator(".badge-card").count(), 8);
assert.equal(await page.locator(".league-row").count(), 5);
await axe("unearned badges");
const advanced = await read();
advanced.game = newGame(4, shiftDate(today(), -250));
advanced.entries = [];
advanced.checkins = {};
for (let i = 250; i > 0; i--) {
  const date = shiftDate(today(), -i);
  advanced.entries.push({
    ...staples[0],
    id: "f" + i,
    date,
    amount: 100,
    meal: "Frühstück",
  });
  advanced.checkins[date] = { hunger: 2, fatigue: 2, pain: false };
  advanced.game.restDays.push(date);
  syncGame(advanced, date);
}
await page.evaluate(
  (s) => localStorage.setItem("diaetfreund-v1", JSON.stringify(s)),
  advanced,
);
await page.reload();
await click("game");
await click("game-badges");
assert.equal(await page.locator(".badge-icon.earned").count(), 8);
assert.match(await page.locator("#sheet").innerText(), /Kanto-Champ/);
await axe("earned badges");
await page.screenshot({ path: "test-results/kanto-badges.png" });
await click("game");
await click("game-dex");
assert.match(await page.locator("#dex-count").innerText(), /151\/151/);
await page.locator("#dex-status").selectOption("missing");
assert.equal(await page.locator(".dex-mon").count(), 0);
await click("game");
await page.setViewportSize({ width: 360, height: 800 });
for (const action of ["game-dex", "game-map", "game-badges"]) {
  await click(action);
  assert.equal(
    await page
      .locator("#sheet")
      .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
    true,
  );
  await click("game");
}
await click("close");
await page.locator('.bottom-nav [data-tab="more"]').click();
await click("theme");
await click("game");
await click("game-badges");
await axe("badges dark");
await click("game");
await click("game-dex");
await axe("dex dark");
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "PASS: legacy migration, all 151 sprites, search/type/discovery filters, Eevee choice, 23 destinations, 8 badges, league completion, legendary gates, 360px layout and light/dark accessibility.",
);
