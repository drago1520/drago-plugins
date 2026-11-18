# github-issue

The plugin makes Claude write GitHub issues that a non-developer can read at a glance. The title is a conventional commit header whose subject names the business problem, such as `fix(email): customer replies from the support mailbox bounce at Gmail`. The body opens with the open to-dos as a task list, followed by three short sections: the business problem, the technical problem, and what we did.

The plugin has two parts:

- The `github-issue` skill holds the rules for the title, the body, labels and the `gh issue create` call.
- A `PreToolUse` hook blocks `gh issue create` until the skill is loaded in the session, so Claude rewrites the issue to match before it gets created. Claude Code matches the command with an `if` filter, so Node.js starts only for that command.

The hook needs Node.js on your `PATH`.

## Install

```
/plugin marketplace add drago1520/drago-plugins
/plugin install github-issue@drago-plugins
```
