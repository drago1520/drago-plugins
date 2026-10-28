import assert from "node:assert/strict";
import { test } from "node:test";
import { needsSkill } from "./hook.mjs";

test("a DevTools trace needs the skill", () => assert.ok(needsSkill("mcp__chrome-devtools__performance_start_trace", {})));
test("a CrUX query needs the skill", () => assert.ok(needsSkill("mcp__google-crux__get_core_web_vitals", { origin: "https://www.emart.bg" })));
test("timing code needs the skill", () => assert.ok(needsSkill("Edit", { file_path: "/r/a.ts", new_string: "const t0 = performance.now();" })));
test("hyperfine in Bash needs the skill", () => assert.ok(needsSkill("Bash", { command: "hyperfine 'node a.mjs'" })));
test("EXPLAIN ANALYZE needs the skill", () => assert.ok(needsSkill("Bash", { command: "mysql -e 'EXPLAIN ANALYZE SELECT * FROM porachki'" })));
test("a plain edit passes", () => assert.ok(!needsSkill("Edit", { file_path: "/r/a.ts", new_string: "const x = 1;" })));
test("a plain DevTools screenshot passes", () => assert.ok(!needsSkill("mcp__chrome-devtools__take_screenshot", {})));
test("curl to the PSI API needs the skill", () => assert.ok(needsSkill("Bash", { command: "curl 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.emart.bg'" })));
test("npx psi needs the skill", () => assert.ok(needsSkill("Bash", { command: "npx psi https://www.emart.bg --strategy=mobile" })));
test("WebFetch to pagespeed.web.dev needs the skill", () => assert.ok(needsSkill("WebFetch", { url: "https://pagespeed.web.dev/analysis?url=https://www.emart.bg" })));
test("Ubersuggest pagespeed_audit needs the skill", () => assert.ok(needsSkill("mcp__claude_ai_Ubersuggest__pagespeed_audit", { url: "https://www.emart.bg" })));
test("WebFetch to another site passes", () => assert.ok(!needsSkill("WebFetch", { url: "https://docs.astro.build/en/guides/" })));
