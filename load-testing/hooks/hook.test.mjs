import assert from "node:assert/strict";
import { test } from "node:test";
import { needsSkill } from "./hook.mjs";

test("writing a k6 script needs the skill", () => assert.ok(needsSkill({ file_path: "/r/load/checkout.js", content: "import http from 'k6/http';\nexport const options = { vus: 10 };" })));
test("a locust file needs the skill", () => assert.ok(needsSkill({ file_path: "/r/locustfile.py", content: "from locust import HttpUser, task" })));
test("running autocannon needs the skill", () => assert.ok(needsSkill({ command: "npx autocannon -c 50 https://staging.emart.bg/" })));
test("running k6 needs the skill", () => assert.ok(needsSkill({ command: "k6 run load/checkout.js" })));
test("a plain fetch edit passes", () => assert.ok(!needsSkill({ file_path: "/r/src/a.ts", new_string: "await fetch(url)" })));
