# drago-plugins

This is a Claude Code plugin marketplace. It currently holds one plugin, `plain-prose-docs`.

## plain-prose-docs

The plugin makes Claude write markdown docs in plain, connected first-person prose. It targets two habits that make docs hard to read.

**Staccato** is clipped writing where fragments follow each other without connecting words, such as "Done. Tested. Works." or "Result: pass. Cause: X. Fix: Y." Claude rewrites these as full sentences joined with words like "because", "so" and "when".

**Forced negation** describes a fact by what it is not, such as "X, not Y", "instead of", "stays out" or "does not set". Claude states what is true. It keeps a negation when the absence is the fact itself, for example a failed test, a missing check or a removed feature.

The plugin has two parts:

- The `plain-prose-docs` skill holds the full rules. It also includes a rewrite workflow for existing docs, which splits large rewrites across subagents and then runs `check-facts.mjs`. That script compares each file with git HEAD and lists every link target, code span and number of three or more digits that disappeared, plus every newly added "because" clause, so invented reasons can be caught.
- A `PreToolUse` hook runs before every Write or Edit. When the target file ends in `.md`, it reminds Claude of the rules, so they apply even when the skill doesn't load on its own.

The hook and the check script need Node.js on your `PATH`.

## Install

Run these commands in Claude Code:

```
/plugin marketplace add drago1520/drago-plugins
/plugin install plain-prose-docs@drago-plugins
```

To use the rewrite workflow on existing docs, ask Claude something like "rewrite docs/*.md without staccato or forced negation". The target files should be committed first, because the check compares against git HEAD.
