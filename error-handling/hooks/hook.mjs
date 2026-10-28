import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Blocks a Write/Edit/Bash that touches error-handling code until the error-handling skill is loaded this session; the Skill call writes the marker that lets everything through.
export const CODE_FILE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|astro|php|py|rs|c|h)\b/;
// JS/PHP, then Python (except/raise), Rust (panic!/unwrap/expect/Err/map_err/unsafe), C (errno/perror)
export const KEYWORD = /catch|throw|finally|Error\(|reject\(|\{ ?cause|set_error_handler|except|raise |panic!|\.unwrap\(\)|\.expect\(|Err\(|map_err|unsafe|errno|perror\(/;
// TS type escapes that skip validation: `as any`, `as unknown`, `as SomeType`, and the non-null assertion `x!.` / `x!;` (never `!=`, `!x` or Rust `println!(`)
export const TYPE_ESCAPE = /\bas (any|unknown|[A-Z]\w*)\b|[\w\])]![.;),\]]/;
export const needsSkill = (toolInput) => {
  const s = JSON.stringify(toolInput ?? {});
  return CODE_FILE.test(s) && (KEYWORD.test(s) || TYPE_ESCAPE.test(s));
};

// Run only as the hook, not when hook.test.mjs imports needsSkill
if (/[\\/]hook\.mjs$/.test(process.argv[1] ?? "")) {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const { hook_event_name, session_id = "unknown", tool_input } = JSON.parse(raw);
  const dir = join(homedir(), ".cache", "drago-plugins", "error-handling"), marker = join(dir, session_id);

  if (hook_event_name === "SessionStart") rmSync(marker, { force: true });
  else if (hook_event_name === "PostToolUse") {
    if (/(^|:)error-handling$/.test(tool_input?.skill ?? "")) { mkdirSync(dir, { recursive: true }); writeFileSync(marker, ""); }
  } else if (!existsSync(marker) && needsSkill(tool_input)) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "This touches error-handling code (catch/throw/finally/Error(/reject/cause). Load the error-handling skill with the Skill tool first, then retry the same call.",
      },
    }));
  }
}
