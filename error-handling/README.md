# error-handling

The plugin makes Claude design the failure path of every function with the same care as the success path. It loads before Claude writes or reviews anything with try/catch/finally, throw, Result-style returns, input validation, retries, fallbacks or resource cleanup.

The `error-handling` skill holds the rules. Claude classifies each failure as operational (handle at the boundary) or a bug (let it crash), returns expected outcomes as values and throws only for the unexpected, lets errors propagate to the one level with context to decide, validates external input once at the door, releases locks and connections in `finally`, and wraps errors with `{ cause }` so the stack survives. It refuses to write an empty catch or a log-and-fallback catch, because those hide the error from Sentry or Bugsink and hand every caller a fake value. A deliberate fallback for a non-essential call is allowed, and Claude confirms with you first which calls are optional.

## Install

```
/plugin marketplace add drago1520/drago-plugins
/plugin install error-handling@drago-plugins
```
