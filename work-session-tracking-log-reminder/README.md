# work-session-tracking-log-reminder

When a Claude Code session ends, the plugin reminds you to log what you did. The point is a better track record: once I have a log of what I've done, it is easier to remember it later, so I can write better CVs and pitch myself better. On `/clear` and `/exit` it first asks "Did you log what you did this session?" with Yes and No. Yes lets the command run, No holds it back and prints the reminder. Ctrl+C and Ctrl+D cannot be held back, so there it prints the reminder straight to the terminal after Claude closes.

The reminder reads: "Don't forget to log what you've done, either in GitHub issues or Docmost log. You'll have a more solid track record." Change the text in `hooks/register.ts`.

It is a hooks module (a mod), so it needs a Claude Code build with function hooks, and the terminal print needs `/dev/tty`, which means Linux, macOS or WSL.

## Install

```
/plugin marketplace add drago1520/drago-plugins
/plugin install work-session-tracking-log-reminder@drago-plugins
```
