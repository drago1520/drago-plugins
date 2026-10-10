# drago-plugins

This is a Claude Code plugin marketplace. Each plugin installs on its own, and its folder has a README with the details.

Add the marketplace once in Claude Code:

```
/plugin marketplace add drago1520/drago-plugins
```

## Plugins

### [plain-prose-docs](plain-prose-docs/README.md)

Claude writes markdown docs in plain, connected first-person prose, without staccato fragments or forced negation.

```
/plugin install plain-prose-docs@drago-plugins
```

### [windows-wsl-vscode-git-worktrees-fix](windows-wsl-vscode-git-worktrees-fix/README.md)

Claude creates git worktrees that VS Code on Windows can open when it runs in WSL on a Windows drive.

```
/plugin install windows-wsl-vscode-git-worktrees-fix@drago-plugins
```

### [error-handling](error-handling/README.md)

Claude designs how each function fails: operational errors are handled at the boundary, bugs crash loudly, errors keep their cause, and nothing gets swallowed in a log-and-fallback catch.

```
/plugin install error-handling@drago-plugins
```

### [unit-integration-testing](unit-integration-testing/README.md)

Claude writes tests that buy the most signal for the least cost: precise in-memory unit tests, integration tests against the real database for the seams, doubles only at the boundary, and flaky tests fixed as bugs.

```
/plugin install unit-integration-testing@drago-plugins
```
