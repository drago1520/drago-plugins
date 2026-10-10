# performance-measuring

The plugin makes Claude measure before it optimises and measure again afterwards under the same conditions, so a speed-up is a before and after number and never a feeling. It loads whenever something is slow, a benchmark or profile is wanted, Core Web Vitals or a performance budget come up, or Claude is about to claim a change made something faster.

The `performance-measuring` skill holds the rules. Claude treats latency as a distribution and quotes a percentile over a stated window, uses monitoring to know something is slow, profiling to find where the time goes and benchmarking to prove the fix, checks what share of total time a component holds before touching it, reads a profile's shape for N+1s and accidental loops, benchmarks with warm-up, varied input, consumed results and a reported spread, confirms micro wins at the system level, and locks every win behind a CI budget on signals that are stable on a shared runner such as query counts and bundle bytes.

## Install

```
/plugin marketplace add drago1520/drago-plugins
/plugin install performance-measuring@drago-plugins
```
