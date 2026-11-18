---
name: skill-to-plugin
description: Turn a workflow into a skill, then into a plugin in the drago-plugins marketplace. Load BEFORE creating or editing anything in drago-plugins, and whenever the user says "make a skill", "write this as a skill", "make it a plugin", "add a hook that requires the skill", or asks how a past task could be repeated the same way next time.
---

# Skill to plugin

I build a plugin in three stages, and the user approves each one before I start the next: a draft skill, a hook design, and the plugin itself.

The marketplace is the local clone of the drago-plugins repo, the folder whose `.claude-plugin/marketplace.json` lists the plugins. I find it by searching the user's project folders for that file, and when I find none I ask the user where their clone is or whether to clone `drago1520/drago-plugins`. Every plugin in it follows the same layout, so I read one existing plugin that has a hook before I write anything.

## 1. Draft the skill in the project root

I write the skill as a plain Markdown file in the root of the project I am working in, named `<name>-skill.md`. It already has the skill format:

```markdown
---
name: <name>
description: <what it does>. Load BEFORE <the tool call or file it guards>, and whenever the user says "<phrase>", "<phrase>" or "<phrase>".
---

# <Title>

<rules, written as "I", in plain connected prose, with a template or example for each output>
```

The description decides when Claude loads the skill, so it names the exact tool call it must precede and the phrases a user really types. The body describes what I did in the task we just finished, in the order I did it, with the real commands. I write it in first person and in plain prose, following the plain-prose-docs skill.

The user reads the draft and asks for changes, for example "make it more general". I edit the same file until they are happy. I leave the hook and the plugin for later.

## 2. Design the hook

When the user wants the skill enforced, I explain the hook in a few lines and wait for "build". I stick to the pattern the other plugins use:

- `hooks.json` registers a `PreToolUse` hook with an `if` filter in permission-rule form, such as `Bash(*gh issue create*)` or `Write(*.md)`. Claude Code checks the filter itself, so Node starts only when the call matches and every other call costs nothing. A folder filter such as `Write(**/drago-plugins/**)` matches every file under that folder at any depth. Claude Code reads hooks at session start, so I test a new filter after a restart.
- `hook.mjs` blocks the matching call with `permissionDecision: "deny"` and a reason that says "Load the <name> skill with the Skill tool first, then retry". A `PostToolUse` hook on `Skill` writes a marker file at `~/.cache/drago-plugins/<name>/<session_id>` when the skill loads, and the marker lets later calls through. A `SessionStart` hook with matcher `compact` deletes the marker, so the skill loads again after a compaction.
- A plugin that only reminds, like `plain-prose-docs`, returns `additionalContext`, which adds a one-line reminder and lets the call run.

I mention one limit when it applies: a `PreToolUse` hook fires after Claude has written the tool input, so a reminder arrives too late for that call. A deny makes Claude load the skill and redo the call.

## 3. Build the plugin

After the user says "build", I create:

```
<marketplace>/<name>/
  .claude-plugin/plugin.json
  skills/<name>/SKILL.md
  hooks/hooks.json
  hooks/hook.mjs
  README.md
```

- `SKILL.md` is the approved draft. drago-plugins is a public repo, so I replace private names (company repos, servers, domains, people) with placeholders or with "the repo the user names".
- `plugin.json` copies the fields of an existing plugin, including its `author`, `license`, `homepage` and `repository`, and sets the new `name`, `description` and `version` `1.0.0`.
- `README.md` explains in plain prose what the plugin makes Claude do, what each part does, that the hook needs Node.js, and the install commands.
- I append the plugin to `.claude-plugin/marketplace.json` and add a section to the root `README.md` in the same format as the others.

## 4. Check it

I pipe fake hook events into `hook.mjs` with a throwaway session id and confirm each step:

```bash
H=<name>/hooks/hook.mjs; S=check-$$
echo "{\"hook_event_name\":\"PreToolUse\",\"session_id\":\"$S\",\"tool_input\":{\"command\":\"<matching command>\"}}" | node $H   # prints the deny
echo "{\"hook_event_name\":\"PostToolUse\",\"session_id\":\"$S\",\"tool_input\":{\"skill\":\"<name>:<name>\"}}" | node $H       # writes the marker
echo "{\"hook_event_name\":\"PreToolUse\",\"session_id\":\"$S\",\"tool_input\":{\"command\":\"<matching command>\"}}" | node $H   # prints nothing
echo "{\"hook_event_name\":\"SessionStart\",\"session_id\":\"$S\"}" | node $H                                                  # removes the marker
```

Then I tell the user to run `/reload-plugins` to try it in a real session, and I say plainly that I only tested the hook with piped events.

## 5. Finish

I leave the changes uncommitted and the user commits and pushes. I ask whether to delete the draft in the project root.
