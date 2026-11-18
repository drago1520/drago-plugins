import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Blocks `gh issue create` until the github-issue skill is loaded this session; the Skill call writes the marker that lets it through.
let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const { hook_event_name, session_id = "unknown", tool_input } = JSON.parse(raw);
const dir = join(homedir(), ".cache", "drago-plugins", "github-issue"), marker = join(dir, session_id);

if (hook_event_name === "SessionStart") rmSync(marker, { force: true });
else if (hook_event_name === "PostToolUse") {
  if (/(^|:)github-issue$/.test(tool_input?.skill ?? "")) { mkdirSync(dir, { recursive: true }); writeFileSync(marker, ""); }
} else if (!existsSync(marker) && /gh issue create/.test(tool_input?.command ?? "")) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "This creates a GitHub issue. Load the github-issue skill with the Skill tool first, rewrite the title and body to match it, then retry.",
    },
  }));
}
