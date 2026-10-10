---
name: error-handling
description: Rules for how the code I write fails. Load BEFORE writing or reviewing any function that can fail: anything with try/catch/finally, throw, Result or (value, err) returns, validation of external input, retries, fallbacks, resource cleanup (locks, connections, files), or error logging. Also load when the user asks "how should this fail", complains about silent errors, swallowed exceptions, missing stack traces, or duplicate log lines, or asks me to review error handling.
---

# Error handling

How a function fails is half its contract. When I write a function I design the failure path with the same care as the success path, and when I review one I check the failure path first. Everything below serves one goal: failures stay loud, carry their cause, and get handled at the one level that has enough context to decide.

## Classify first

Before I write a catch or a throw I ask which of these I am dealing with.

- **Operational error.** A correct program can hit it: network down, bad input, missing file, rate limit, full disk. I anticipate it and handle it at the boundary by retrying, falling back, or telling the user.
- **Programmer error.** A correct program can never hit it: null dereference, wrong argument, broken invariant. I let it crash loudly so it surfaces and gets fixed. I never catch a bug to keep the program running.

The litmus test is "could a correct program, with correct code, ever hit this?". Yes means operational. No means bug.

## Throw or return

- An expected outcome that is part of the function's normal job ("not found", validation miss, cache empty) comes back as a value the caller must handle. In TypeScript that is a discriminated union like `{ ok: true; value } | { ok: false; error }`, or a typed domain error such as `TRPCError` at an RPC boundary.
- An unexpected condition I cannot do anything useful about right here gets thrown and travels up.
- I never use throw and catch as control flow for a routine outcome.

## Throw low, handle high

Deep code has no context to recover: the function fetching a row has no idea whether the caller wants a retry, a 503, or an aborted checkout. So I let errors propagate to the boundary that can decide, which is the HTTP handler, the job runner, the top of the CLI command, or the page render. I catch low only to add value and rethrow, for example translating a driver error into a domain error or wrapping it with context.

I fail fast. I surface a problem the moment it appears instead of limping on with bad state that detonates somewhere unrelated.

## Validate at the boundary

Anything I did not construct myself is suspect: request bodies, query params, files, env vars, network responses. I validate once at the door with a schema (zod in this codebase), get a typed value, and the interior trusts it. I do not scatter defensive re-checks of the same field through downstream functions. Bad input is an operational error handled at the edge, so it never becomes a bug deep inside.

## Anti-patterns I refuse to write

- **Empty catch.** A swallowed error turns a loud failure into a silent one that surfaces days later as corrupt data.
- **Log-and-fallback catch.** `catch (e) { console.error(e); return null }` is an empty catch with extra steps. The error reporter (Sentry, Bugsink) never sees it, nobody gets notified, and every caller now receives a fake value. If I think a fallback is right, I ask first.
- **Catch too broad.** A catch-all around a big block catches my own `TypeError` alongside the network error and relabels the bug as an outage.
- **Dropping the cause.** When I wrap, I keep the original: `throw new Error('checkout failed', { cause: e })`. Rewriting the error from scratch severs the stack back to the source.
- **Log-and-rethrow at every layer.** One failure becomes five near-identical log entries. I log once, at the boundary that handles it.
- **Blind retry.** I retry only idempotent operations, with exponential backoff. A non-idempotent operation (charge a card) needs an idempotency key before it may be retried.

## Cleanup is unconditional

A lock, connection or file handle acquired before a call that can throw gets released in `finally`, so it runs on both exits. `finally` neither handles the error nor stops it propagating; it only guarantees the release.

```ts
const conn = await pool.acquire();
try {
  return await conn.query(sql);
} finally {
  conn.release();
}
```

## Degrade on purpose, never by accident

A non-essential part may fail while the core keeps working: an empty recommendations widget beats a broken product page. This is the one place a low catch with a fallback is legitimate, and it must be deliberate: the essential call stays uncaught, the optional call is caught, logged once at warn level with context, and replaced with an explicit empty default. I confirm with the user which calls are optional before I degrade any of them.

## Messages someone can act on

An error message names the operation, the ids needed to reproduce it, and keeps the cause. `Error('failed')` is noise at 3am. `Error('syncInvoice failed for invoiceId=' + invoiceId, { cause: err })` is a map back to the bug. Messages never contain secrets or PII that is not needed.

## Review checklist

When I review error handling I check each of these and name the line that breaks it.

| Do | Don't |
| --- | --- |
| Treat failure as part of the contract. | Swallow errors in an empty or log-and-fallback catch. |
| Distinguish operational errors from bugs. | Catch too broadly and hide bugs. |
| Throw low, handle high. | Use exceptions for normal control flow. |
| Validate at the boundary. | Drop the original error when wrapping. |
| Guarantee cleanup with finally. | Log-and-rethrow at every layer. |
| Preserve the cause. | Retry non-idempotent operations blindly. |
| Write messages someone can act on. | Put secrets in messages. |

Tests assert the throw (`await expect(fn()).rejects.toThrow()`) rather than a swallowed fallback.
