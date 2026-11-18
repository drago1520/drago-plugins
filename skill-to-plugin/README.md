# skill-to-plugin

The plugin makes Claude turn a workflow you just did together into a reusable plugin, in three stages that you approve one by one. First Claude writes the skill as a `<name>-skill.md` draft in the root of the project you are working in, and you shape it until it reads right. Then Claude explains the hook that will require the skill and waits for you to say "build". Finally it creates the plugin in your drago-plugins clone, registers it in the marketplace, and checks the hook with piped test events.

The plugin has two parts:

- The `skill-to-plugin` skill holds the stages, the plugin layout, the hook pattern and the check.
- A `PreToolUse` hook blocks every Write or Edit inside a `drago-plugins` folder and every `*-skill.md` draft until the skill is loaded in the session. Claude Code matches the path with `if` filters, so Node.js starts only for those files.

The hook needs Node.js on your `PATH`, and it recognises the clone only when its folder is named `drago-plugins`.

## Install

```
/plugin marketplace add drago1520/drago-plugins
/plugin install skill-to-plugin@drago-plugins
```
