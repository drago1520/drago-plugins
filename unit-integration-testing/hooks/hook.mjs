import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Blocks a Write/Edit/Bash that touches tests (test files, test code, test runners) until the unit-integration-testing skill is loaded this session; the Skill call writes the marker that lets everything through.
export const TEST_PATH = /\.(test|spec)\.|(^|[\\/"' ])(tests|__tests__|fixtures|e2e)[\\/]|(vitest|playwright|jest)\.config/;
export const TEST_CODE = /describe\(|expect\(|vi\.(mock|fn|spyOn)\(|jest\.(mock|fn)\(|\btest\(|PHPUnit|assertSame\(/;
export const TEST_RUNNER = /bun test|bun run test|npm run test|vitest|playwright|\bjest\b|phpunit/;
export const needsSkill = (toolInput) => {
  const s = JSON.stringify(toolInput ?? {});
  return TEST_PATH.test(s) || TEST_CODE.test(s) || TEST_RUNNER.test(s);
};

// Run only as the hook, not when hook.test.mjs imports needsSkill
if (/[\\/]hook\.mjs$/.test(process.argv[1] ?? "")) {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const { hook_event_name, session_id = "unknown", tool_input } = JSON.parse(raw);
  const dir = join(homedir(), ".cache", "drago-plugins", "unit-integration-testing"), marker = join(dir, session_id);

  if (hook_event_name === "SessionStart") rmSync(marker, { force: true });
  else if (hook_event_name === "PostToolUse") {
    if (/(^|:)unit-integration-testing$/.test(tool_input?.skill ?? "")) { mkdirSync(dir, { recursive: true }); writeFileSync(marker, ""); }
  } else if (!existsSync(marker) && needsSkill(tool_input)) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "This touches tests (test file, test code or a test runner). Load the unit-integration-testing skill with the Skill tool first, then retry the same call.",
      },
    }));
  }
}
