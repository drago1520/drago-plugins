let raw = "";
for await (const chunk of process.stdin) raw += chunk;

const { tool_input, cwd = "" } = JSON.parse(raw);
const cmd = tool_input?.command ?? "";
const fix = "Run it with Windows git, e.g. pwsh.exe -Command \"cd C:\\path\\to\\repo; git worktree add ...\". Repair a broken one with: git worktree repair --no-relative-paths <worktree>; git config --local --unset extensions.relativeworktrees";

let reason = "";
if (/\bworktree\b/.test(cmd) && /--relative-paths\b/.test(cmd))
  reason = "git worktree --relative-paths writes links VS Code can't resolve and adds extensions.relativeworktrees, which older git rejects.";
else if (/\bgit\b[^;&|]*\bworktree\s+(add|move|repair)\b/.test(cmd) && !/pwsh|powershell|git\.exe/i.test(cmd) && process.platform === "linux" && /^\/mnt\/[a-z]\//.test(cwd))
  reason = "WSL git writes /mnt/c/... paths into the worktree links, so VS Code on Windows never shows the worktree.";

if (reason)
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: `${reason} ${fix}` } }));
