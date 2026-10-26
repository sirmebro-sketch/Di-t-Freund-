import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
const root = "app/src/main/assets/www";
const files = readdirSync(root).filter((f) => f.endsWith(".js"));
for (const file of files)
  execFileSync(process.execPath, ["--check", `${root}/${file}`], {
    stdio: "inherit",
  });
console.log(`Syntax checked: ${files.length} app modules.`);
