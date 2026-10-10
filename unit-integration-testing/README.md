# unit-integration-testing

The plugin makes Claude treat every test as a purchase of one signal, did I just break something, and buy that signal at the lowest cost. It loads before Claude writes, edits or reviews a unit or integration test, a fixture, builder or test double, and when it decides which layer a test belongs in or what to mock.

The `unit-integration-testing` skill holds the rules. Claude puts domain rules in fast in-memory unit tests shaped as arrange, act, assert with one action per test and names that state the behaviour. It uses integration tests against the real database engine, isolated by a rolled-back transaction, only for the seams such as constraints, migrations and serialisation. It replaces only what sits at the boundary (clock, randomness, third parties, email, payments) and runs its own logic for real, prefers an in-memory fake over a mock, injects the clock as a parameter, reads coverage as a map of gaps, writes the failing test first for every bug fix, and treats a flaky test as a bug to fix.

## Install

```
/plugin marketplace add drago1520/drago-plugins
/plugin install unit-integration-testing@drago-plugins
```
