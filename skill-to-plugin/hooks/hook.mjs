import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Blocks writes to the drago-plugins clone and to *-skill.md drafts until the skill-to-plugin skill is loaded this session; the Skill call writes the marker that lets them through.
let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const { hook_event_name, session_id = "unknown", tool_input } = JSON.parse(raw);
const dir = join(homedir(), ".cache", "drago-plugins", "skill-to-plugin"), marker = join(dir, session_id);
const file = tool_input?.file_path ?? "";

if (hook_event_name === "SessionStart") rmSync(marker, { force: true });
else if (hook_event_name === "PostToolUse") {
  if (/(^|:)skill-to-plugin$/.test(tool_input?.skill ?? "")) { mkdirSync(dir, { recursive: true }); writeFileSync(marker, ""); }
} else if (/[\\/]drago-plugins[\\/]/.test(file) || /-skill\.md$/.test(file)) {
  if (existsSync(marker)) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: "skill-to-plugin skill: draft <name>-skill.md in the project root first and wait for approval; hook = if filter + block until the skill loads + one-line reminder; no private names or paths in drago-plugins; pipe-test the hook." } }));
  else console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "This writes a skill draft or a drago-plugins file. Load the skill-to-plugin skill with the Skill tool first, then retry the same call.",
    },
  }));
}
