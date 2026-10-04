import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { relative } from "node:path";

const tokenRe = /\]\([^)\n]+\)|`[^`\n]+`|[0-9]{3,}/g;
const becauseRe = /[^.|\n]*\bbecause\b[^.|\n]*/gi;

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
let failed = false;

for (const file of process.argv.slice(2)) {
  const rel = relative(root, file).replaceAll("\\", "/");
  let before;
  try {
    before = execFileSync("git", ["show", `HEAD:${rel}`], { cwd: root, encoding: "utf8" });
  } catch {
    console.log(`${file}: not in HEAD, skipped`);
    continue;
  }
  const after = readFileSync(file, "utf8");

  const kept = new Set(after.match(tokenRe) ?? []);
  const missing = [...new Set(before.match(tokenRe) ?? [])].filter((t) => !kept.has(t));
  if (missing.length) {
    failed = true;
    console.log(`${file}: MISSING ${missing.join("  ")}`);
  }

  const oldBecause = new Set((before.match(becauseRe) ?? []).map((s) => s.trim()));
  for (const s of after.match(becauseRe) ?? []) {
    if (!oldBecause.has(s.trim())) console.log(`${file}: NEW because → ${s.trim()}`);
  }
}

process.exit(failed ? 1 : 0);
