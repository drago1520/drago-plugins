---
name: unit-integration-testing
description: Rules for the tests I write and review. Load BEFORE writing, editing or reviewing any unit or integration test, test fixture, builder, mock, stub, fake or spy, or when deciding which layer (unit, integration, e2e) a test belongs in, what to mock, or how to isolate a database test. Also load when the user asks for coverage, mentions a flaky test, asks "should this be a unit or integration test", asks me to add tests for a bug fix, or complains that tests break on every refactor.
---

# Unit and integration testing

Every test I write is a purchase. It costs time to write, run and maintain, and it buys one signal: did I just break something? I want the most signal for the least cost, so the suite must be fast enough to run constantly, precise enough that a red test names the broken thing, and trusted enough that a failure stops the line.

The test of a test: if I change one line of production behaviour, something should go red. If nothing does, the test was decorative. If forty things do, they tested implementation instead of behaviour.

## Pick the layer by cost and by where the bugs live

- **Unit**: one behaviour, in memory, no database, network, file system, real clock or shared global. Milliseconds. This is where I put domain rules, pricing, validation and state machines.
- **Integration**: my code plus a real database, real HTTP layer or real socket. Seconds. This is for the seams unit tests cannot see: a wrong column type, a serialiser that drops a field, a missing migration, a unique constraint, an uncommitted transaction.
- **End-to-end**: a real browser against the running app. Minutes. I reserve it for the few flows whose breakage is unacceptable.

A codebase of rich domain logic gets a fat unit layer. A codebase that is mostly wiring between services gets a fat integration layer. I never build the ice-cream cone: a handful of unit tests under a thick slow e2e layer that fails for environment reasons.

## How I write a unit test

- Arrange, Act, Assert. Exactly one action per test, so a failure has one reason. Several assertions are fine when they describe one behaviour.
- The name states the behaviour and survives a rename: `applies the discount before tax`, never `testCalculateTotal2`.
- I assert on what a caller can observe: return values, thrown errors, messages sent. I never reach into private state.
- I cover edges deliberately: empty, one, many; zero, negative, maximum; null and absent; duplicates; both sides of every `>` in the code.
- Expected values are numbers a human can verify, with the arithmetic beside them when it helps.
- A failure path is asserted as a throw: `expect(() => fn()).toThrow(/quantity must be positive/i)` or `await expect(fn()).rejects.toThrow()`.

## Test doubles, and which one I reach for

A dummy fills a signature and is never used. A stub returns canned data. A spy records calls and I assert on them afterwards. A mock carries the expectation up front and the interaction is the thing under test. A fake is a working simplified implementation, such as an in-memory repository backed by a `Map`.

Fakes age better than mocks. A mock encodes how the code talks to a dependency, so merging two calls into one turns the suite red. A fake encodes what the dependency does, so it keeps working. When a collaborator has real behaviour worth simulating, I write the fake.

## What I replace and what I run for real

I replace things at the boundary of the system: payment providers, email and SMS, the clock, randomness, uuid, anything slow, flaky, expensive or outside my control. I run my own domain logic and pure helpers for real.

Over-mocking is the trap. When every collaborator is replaced, the test proves only that the code calls the functions I expected, goes red on harmless refactors, and stays green when the real integration breaks. A suite of pure mocks tests its own assumptions.

Anything ambient becomes testable the moment it is passed in. I inject the clock as a parameter with a default (`now: Date = new Date()`) rather than mocking time globally, and the same goes for randomness, the environment and the current user.

## How I write an integration test

- Before I reach for a live database I ask what the database proves that memory cannot: a constraint, a migration, SQL ordering, a serialiser, a transaction boundary. When the answer is nothing, because the test is really about the logic around the query, I put the data access behind a repository interface and test the logic against an in-memory fake of that repository. The live database is reserved for the seam itself.
- I use the real engine, in a container or a local instance. An in-memory substitute has different SQL, types and constraints, so it passes tests the real database would fail.
- I isolate each test in a transaction and roll it back in `afterEach`. It is faster than truncating and makes tests order-independent.
- I keep them targeted at the seam. Re-testing every pricing rule through the database turns a five-second suite into a five-minute one and buys nothing the unit tests did not already cover.
- Ordering returned from a query is a behaviour, so I assert the order.
- Where two services deploy separately, a contract test pins the shape each side expects.

## Coverage

Coverage tells me which lines ran, so an untouched module is a fact worth knowing. It never tells me whether anything was checked: a test that calls a function and asserts nothing scores the same as one that verifies every rule. Branch coverage is the more honest number. I use the report to find gaps and judge the gaps myself. "Coverage must not fall on this pull request" is a reasonable gate; a fixed percentage is a target people game with easy tests.

## Order of work

For every bug fix I write the failing test first. It proves I reproduced the bug and stops it coming back. For new behaviour I follow red, green, refactor when the shape of the answer is known, and I see the test go red before I make it pass, because a test that never failed may assert nothing. For exploratory work and visual layout I sketch first, then pin the behaviour down with tests.

## A suite that survives

- **Deterministic.** No real clock, no unseeded randomness, no dependence on time zone, locale or execution order.
- **Independent.** Every test passes alone and in any order. Shared mutable fixtures are the usual cause of "passes locally, fails in CI".
- **Readable as a specification.** A stranger learns the rules of the system from the test names.
- **Fast enough to run on save** at the unit layer.
- **Builders over fixtures.** A builder like `anOrder({ status: 'shipped' })` shows only the fact the test is about and gives everything else a sane default.

A flaky test is a bug, never weather. It reports a real race, shared state or hidden dependency on time. I quarantine it, file it, and fix the cause rather than re-running until green.

## Where tests run

Unit tests run on every push and block everything else. Integration tests run after them with real dependencies in containers. End-to-end tests run last, on the few flows that must never break.
