# windows-wsl-vscode-git-worktrees-fix

The plugin is for Claude Code running in WSL on a repo that lives on a Windows drive. VS Code on Windows only finds a git worktree when its link files hold absolute Windows paths, and WSL git writes `/mnt/c/...` paths there.

A `PreToolUse` hook therefore blocks `git worktree add`, `move` and `repair` from WSL git inside `/mnt/`, and blocks `--relative-paths` everywhere, because VS Code cannot resolve relative links and older git rejects the config they add. The block message tells Claude to run the command with Windows git through pwsh and how to repair a broken worktree. The same hook also blocks Claude Code's built-in `EnterWorktree` tool on WSL inside `/mnt/`, because that tool runs WSL git itself and so bypasses the Bash check; its message tells Claude to create the worktree with Windows git under `.claude/worktrees/<name>` and work from that path. The hook starts for `git`, `pwsh.exe` and `powershell.exe` commands and for `EnterWorktree`, and it needs Node.js on your `PATH`.

## Install

```
/plugin marketplace add drago1520/drago-plugins
/plugin install windows-wsl-vscode-git-worktrees-fix@drago-plugins
```
