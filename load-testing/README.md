# load-testing

The plugin makes Claude find a system's breaking point deliberately and learn how it fails before a launch does. It loads before Claude writes, runs or reads a load, stress, spike, soak or capacity test in k6, Locust or a similar tool, and when the user asks how much traffic the system can take.

The `load-testing` skill holds the rules. Claude picks the test profile by the question it answers, spends its effort on the workload model with an open arrival-rate executor, think time, a realistic endpoint mix and a hot-and-tail key space, guards against coordinated omission and a saturated generator, reads achieved load and error rate before any percentile, collects server-side saturation signals for the same window, finds the bottleneck as the first resource with a growing queue, treats only relative and structural findings as transferable from staging, and runs smoke per merge, full load nightly, stress and spike before a launch and soak on a schedule.

## Install

```
/plugin marketplace add drago1520/drago-plugins
/plugin install load-testing@drago-plugins
```
