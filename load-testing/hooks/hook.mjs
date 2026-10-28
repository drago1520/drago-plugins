import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Blocks a Write/Edit/Bash that writes or runs a load test until the load-testing skill is loaded this session; the Skill call writes the marker that lets everything through.
export const LOAD_TOOL = /k6\/http|k6 run|from locust|HttpUser|locust |artillery|autocannon|\boha |\bwrk |vus:|ramping-arrival-rate|constant-arrival-rate/;
export const needsSkill = (toolInput) => LOAD_TOOL.test(JSON.stringify(toolInput ?? {}));

// Run only as the hook, not when hook.test.mjs imports needsSkill
if (/[\\/]hook\.mjs$/.test(process.argv[1] ?? "")) {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const { hook_event_name, session_id = "unknown", tool_input } = JSON.parse(raw);
  const dir = join(homedir(), ".cache", "drago-plugins", "load-testing"), marker = join(dir, session_id);

  if (hook_event_name === "SessionStart") rmSync(marker, { force: true });
  else if (hook_event_name === "PostToolUse") {
    if (/(^|:)load-testing$/.test(tool_input?.skill ?? "")) { mkdirSync(dir, { recursive: true }); writeFileSync(marker, ""); }
  } else if (!existsSync(marker) && needsSkill(tool_input)) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "This writes or runs a load test (k6, Locust, artillery, autocannon, oha, wrk). Load the load-testing skill with the Skill tool first, then retry the same call.",
      },
    }));
  }
}
