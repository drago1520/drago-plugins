import assert from "node:assert/strict";
import { test } from "node:test";
import { needsSkill } from "./hook.mjs";

test("editing a .test.ts file needs the skill", () => assert.ok(needsSkill({ file_path: "/r/apps/web-astro-port/tests/unit/stripe-webhook.test.ts", new_string: "const x = 1;" })));
test("writing a file under tests/ needs the skill", () => assert.ok(needsSkill({ file_path: "/r/apps/vecher-nextjs/src/tests/helpers.ts", content: "export {}" })));
test("test code in a non-test path needs the skill", () => assert.ok(needsSkill({ file_path: "/r/src/a.ts", new_string: "expect(sum(1, 2)).toBe(3)" })));
test("bun test in Bash needs the skill", () => assert.ok(needsSkill({ command: "cd app && bun test src" })));
test("npx playwright in Bash needs the skill", () => assert.ok(needsSkill({ command: "npx playwright test tests/e2e/stripe-v2.spec.ts" })));
test("plain source edit passes", () => assert.ok(!needsSkill({ file_path: "/r/src/lib/checkout.ts", new_string: "const total = a + b;" })));
test("a word containing tests passes", () => assert.ok(!needsSkill({ file_path: "/r/src/contests/list.ts", new_string: "const x = 1;" })));
test("bun run test in Bash needs the skill", () => assert.ok(needsSkill({ command: "cd apps/web-astro-port && bun run test" })));
test("npm run test in Bash needs the skill", () => assert.ok(needsSkill({ command: "npm run test -- --watch=false" })));
