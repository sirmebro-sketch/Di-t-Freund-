import assert from "node:assert/strict";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import {
  emptyState,
  staples,
  today,
  shiftDate,
} from "../app/src/main/assets/www/core.js";
import { syncGame } from "../app/src/main/assets/www/game.js";
const b = await chromium.launch(),
  context = await b.newContext({
    viewport: { width: 393, height: 852 },
    locale: "de-DE",
  }),
  page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
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
};
await page.evaluate(
  (s) => localStorage.setItem("diaetfreund-v1", JSON.stringify(s)),
  s,
);
await page.reload();
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
    ).violations.map((x) => ({
      id: x.id,
      nodes: x.nodes.map((n) => ({ target: n.target, why: n.failureSummary })),
    })),
    [],
    label,
  );
await click("game");
await axe("starters");
await page.locator('[data-action="game-start"][data-id="4"]').click();
assert.equal((await read()).game.starter, 4);
await axe("adventure");
await click("game-rest");
assert.deepEqual((await read()).game.earned[today()], ["care"]);
await click("add-food");
await page.locator("#food-search").fill("Hafer");
await click("quick-food");
await click("game");
await click("checkin");
await page.locator('#sheet button[type="submit"]').click();
assert.equal((await read()).game.collection.length, 2);
assert.equal((await read()).game.collection[0].xp, 30);
await click("game");
await click("game-sound");
await click("game-motion");
await page.reload();
assert.equal((await read()).game.sound, true);
assert.equal((await read()).game.motion, false);
await click("game");
assert.ok(
  await page
    .locator("#sheet img")
    .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0)),
);
// Audio must actually decode from the bundled original-effects module.
assert.equal(
  await page.evaluate(async () => {
    const { sounds } = await import("./game-assets.js");
    const c = new AudioContext();
    for (const src of Object.values(sounds)) {
      const buf = Uint8Array.from(atob(src.split(",")[1]), (c) =>
        c.charCodeAt(0),
      ).buffer;
      const decoded = await c.decodeAudioData(buf);
      if (decoded.duration <= 0) return false;
    }
    await c.close();
    return true;
  }),
  true,
);
await click("game-pause");
assert.equal((await read()).game.paused, true);
await click("game-pause");
// Advance only synthetic fixtures to exercise a month of progression and battle display.
const history = await read();
history.game.started = shiftDate(today(), -30);
for (let i = 30; i > 0; i--) {
  const date = shiftDate(today(), -i);
  history.entries.push({
    ...staples[0],
    id: "day" + i,
    date,
    amount: 100,
    meal: "Frühstück",
  });
  history.checkins[date] = { hunger: 2, fatigue: 2, pain: false };
  history.game.restDays.push(date);
  syncGame(history, date);
}
await page.evaluate(
  (s) => localStorage.setItem("diaetfreund-v1", JSON.stringify(s)),
  history,
);
await page.reload();
await click("game");
assert.equal((await read()).game.collection.length, 9);
await axe("full team");
await page.screenshot({
  path: "test-results/pokemon-adventure.png",
  fullPage: true,
});
await click("game-battle");
await axe("battle");
await page.screenshot({
  path: "test-results/pokemon-battle.png",
  fullPage: true,
});
const count = (await read()).game.battles;
await click("game");
assert.equal((await read()).game.battles, count);
await page.setViewportSize({ width: 360, height: 800 });
assert.equal(
  await page
    .locator("#sheet")
    .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  true,
);
await page.emulateMedia({ reducedMotion: "reduce" });
assert.equal(
  await page
    .locator(".companion")
    .evaluate((e) => getComputedStyle(e).animationName),
  "none",
);
await click("close");
await page.locator('.bottom-nav [data-tab="more"]').click();
await click("theme");
await click("game");
await axe("game dark");
assert.deepEqual(errors, []);
await b.close();
console.log(
  "PASS: starters, offline sprites/audio decoding, automatic XP/capture/evolution/battles, no duplicate rewards, settings, battle replay, reduced motion, responsive layouts and light/dark accessibility.",
);
