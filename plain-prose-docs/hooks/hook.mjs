let raw = "";
for await (const chunk of process.stdin) raw += chunk;

const file = JSON.parse(raw).tool_input?.file_path ?? "";

if (file.toLowerCase().endsWith(".md")) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext:
          "Markdown doc: follow the plain-prose-docs skill. Write connected first-person sentences. No staccato (fragment chains, 'Result: X.' telegraph lines, bold one-word lead-ins, bare-fragment table cells). No forced or disguised negation ('X, not Y', 'instead of', 'stay out', 'are out', 'does not set'); state what is true. Keep a negation only when the absence is the fact.",
      },
    }),
  );
}
