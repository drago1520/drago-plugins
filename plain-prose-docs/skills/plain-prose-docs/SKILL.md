---
name: plain-prose-docs
description: Style rules for every markdown doc I write or edit: plain, connected first-person prose with no staccato and no forced or disguised negation. Load BEFORE writing or editing any .md file (docs, findings, reports, decisions, READMEs, QA notes, plans saved to disk), and when the user asks to rewrite, clean up or de-staccato docs, says "just say what's up", or complains about "X, not Y" framing or choppy telegraph style. Includes a rewrite-and-verify workflow for existing docs.
---

# Plain-prose docs

Every markdown doc I write or edit says what is going on in normal sentences. When I write a new doc or add to one, I apply the **Style rules** and **Invariants** below as I write, then run step 4 of **Steps** on the file before I report. When I rewrite existing docs, I follow all the **Steps** and prove afterwards that every fact survived.

## Style rules

**Staccato** is clipped writing: fragments fired one after another without connecting words, so the reader has to guess how they relate. I fix these:
- Runs of 2-5 word sentences ("Done. Tested. Works.").
- Telegraph lines with colons, arrows or equals signs ("Result: pass.", "Login → 302.", "Total = …", "Cause: X. Fix: Y.").
- Bold one-word lead-ins (**Problem.** **Why.** **What.** **How.**).
- Semicolon chains of unrelated notes.
- Prose table cells or bullets that are bare fragments ("Keep.", "Logged.", "Equal.").

I join the pieces with "because", "so", "when", "which", "after", "then". A bullet becomes one or two complete sentences. Table cells that hold data (ids, numbers, ✅, `=`, paths) stay as they are.

**Forced negation** frames a fact against what it is not. I state what is true instead. This covers the obvious forms ("X, not Y", "not X but Y", "No X, no Y") and the disguised ones ("stays out", "are out", "does not set", "instead of", "rather than", "no longer", "never" used for contrast).
- "The old service stays the reference for behaviour, not for structure" → "I use the old service as the reference for behaviour."
- "The CDN build and v3 are out" → "I use v4 from the local build."

I keep a negation when the absence or failure is the fact itself: test results ("not saved"), bugs ("no permission check"), items under a "Removed" heading, statuses ("not migrated", "NOT verified"), and plain rules where the absence is the point ("The project has no React dependency").

## Invariants

- Every fact, number, id, date, path, markdown link target, code span, code block, SQL and table data stays.
- Heading structure stays; wording of headings may change.
- When rewriting, I add no new content, opinions, summaries or reasons. A new "because" may only reword a cause the original already gave (in parentheses, after a colon, after an arrow).
- First person ("I", "my") for the author, active voice. I refer to people by name, or with they/them when their pronouns are unknown.
- I never commit; the user reviews `git diff`.

## Steps

1. Check the target files are clean in git (`git status --short <files>`), so HEAD is the baseline. If they have uncommitted edits, ask before continuing.
2. For up to ~5 files, rewrite them myself. For more, split them into batches of 5-8 files (~300 lines each) and launch one general-purpose agent per batch in a single message. Paste the full **Style rules** and **Invariants** sections into each prompt; never a placeholder.
3. Run the check from the repo root on every touched file. `check-facts.mjs` sits next to this SKILL.md, in the base directory shown when the skill loads:
   ```
   node "<skill base dir>/check-facts.mjs" docs/*.md
   ```
   - `MISSING` lines are tokens from HEAD that vanished. I restore them. The script exits 1 while any are missing.
   - `NEW because` lines are added cause clauses. I read each against the original and reword any that invents a reason ("because X quotes differently" when the original only said "instead of X" → "which differs from X").
4. Grep for leftovers: `grep -n -iE ', not |\b(stay out|are out|instead of|rather than|no longer)\b' <files>`. Each hit must be a kept-negation case from the list above.
5. Read the first ~20 lines of two or three files to judge the result by ear, then report: files changed, `git diff --stat` totals, any negations I kept and why, any edits I corrected.
