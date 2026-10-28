import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Blocks timing/profiling code, benchmark runs and the trace/Lighthouse/CrUX MCP tools until the performance-measuring skill is loaded this session; the Skill call writes the marker that lets everything through.
export const PERF_TOOL = /performance_start_trace|performance_analyze_insight|lighthouse_audit|pagespeed|mcp__google-crux__/;
// PageSpeed Insights: the pagespeedonline API, pagespeed.web.dev and the `psi` CLI
export const PERF_CODE = /pagespeed|\bpsi |performance\.now\(|console\.time\(|process\.hrtime|PerformanceObserver|Bun\.bench|mitata|hyperfine|lighthouse|--cpu-prof|\bEXPLAIN (ANALYZE |FORMAT|SELECT)|web-vitals|on(LCP|INP|CLS|TTFB)\(/;
export const needsSkill = (toolName, toolInput) => PERF_TOOL.test(toolName ?? "") || PERF_CODE.test(JSON.stringify(toolInput ?? {}));

// Run only as the hook, not when hook.test.mjs imports needsSkill
if (/[\\/]hook\.mjs$/.test(process.argv[1] ?? "")) {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const { hook_event_name, session_id = "unknown", tool_name, tool_input } = JSON.parse(raw);
  const dir = join(homedir(), ".cache", "drago-plugins", "performance-measuring"), marker = join(dir, session_id);

  if (hook_event_name === "SessionStart") rmSync(marker, { force: true });
  else if (hook_event_name === "PostToolUse") {
    if (/(^|:)performance-measuring$/.test(tool_input?.skill ?? "")) { mkdirSync(dir, { recursive: true }); writeFileSync(marker, ""); }
  } else if (!existsSync(marker) && needsSkill(tool_name, tool_input)) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "This is performance measurement (timing/profiling code, a benchmark, a trace, Lighthouse or CrUX). Load the performance-measuring skill with the Skill tool first, then retry the same call.",
      },
    }));
  }
}
