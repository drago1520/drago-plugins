---
name: performance-measuring
description: Rules for how I measure before I optimise. Load BEFORE any performance work: when the user says something is slow, asks me to speed up a page, query, endpoint or function, asks for a benchmark, profile, flame graph, latency numbers, Core Web Vitals (LCP, INP, CLS, TTFB), a performance budget, or a CI performance check. Also load when I am about to claim a change made something faster, or when reading latency metrics and someone quotes an average.
---

# Measuring before optimising

Performance work fails in one predictable way: someone guesses the bottleneck, fixes it, and the system is no faster. So before I change anything I measure, and after I change it I measure again under the same conditions. A change I cannot show with a before and after number is a change I do not claim made anything faster.

## Performance is a distribution

Every request takes a different time and the collection has a shape: a dense fast cluster and a long tail to the right from cache misses, GC pauses, lock contention, cold connections and retries. The mean lands where few requests land, so I never summarise latency with an average. I quote a percentile over a stated window, for example "p95 over the last 5 minutes".

- p50 is the typical request. p95 and p99 are what people complain about. The tail compounds: a page making 20 calls each with p99 of 1 s has roughly an 18% chance of one slow call.
- I never average percentiles across servers or windows. I aggregate the raw observations or histogram buckets and compute the percentile once.
- A p99 over 24 hours hides a ten-minute incident. Short windows show incidents, long windows show trends, and I quote the window with the number.

## Latency, throughput, utilisation

Latency is how long one thing takes and is what a user feels. Throughput is how many per second and is what capacity planning cares about. Utilisation is how busy a resource is and is the leading indicator, because queues form and latency explodes well before 100%. "CPU is only at 80%" is no reassurance. Nearly every latency incident is a queue I did not know existed: a thread pool, a connection pool, a disk, a socket backlog.

## Three tools, in order

Monitoring tells me something is slow and roughly where. Profiling tells me which code is responsible. Benchmarking proves the change helped. I use them in that order and never skip to optimising.

Before I touch a component I check what share of end-to-end time it holds. A component holding 10% of the time can yield at most a 10% improvement, however fast I make it.

## Profiling

A profiler samples stacks and attributes time to them. I read the shape before the numbers: the most common finding is "this function is called forty thousand times", which means an N+1 query, an accidental quadratic over a list, or a serialiser invoked once per row. Making the inner operation faster fixes none of these.

- A CPU profile shows where cycles go, read as a flame graph where width is time.
- A wall-clock profile includes waiting and is the one that matters for I/O-bound services, where a CPU profile looks idle while the request takes two seconds.
- An allocation profile shows what creates garbage, which drives GC pauses and hidden tail latency.
- A short profile of a rare path tells me nothing, because sampling is statistical.

## Benchmarking without fooling myself

The machine is trying to make my code fast and a benchmark is an easy thing for it to optimise. So I:

- Warm up first, so the JIT, caches and branch predictors measure the steady state.
- Consume the result, or the compiler may delete the work and I benchmark an empty loop.
- Vary the input, because one input keeps everything in L1 with one branch always taken.
- Use a high-resolution timer (`performance.now()`), take many samples and report median, p95 and spread. If run-to-run variance exceeds the improvement I am claiming, I have measured nothing.
- Confirm every micro win at the system level. A 40% gain in a function holding 2% of request time is under 1% overall and may vanish once cache pressure and I/O return.

## Front end

LCP is when the main content appeared, usually dominated by server response time, render-blocking resources and unoptimised images. INP is how long the page takes to respond visibly to input, caused by long main-thread tasks. CLS is how much content jumped, caused by images without dimensions, injected banners and late fonts. TTFB sets the floor for all of them.

Lab data on a fast laptop measures the code and lets me compare two builds. Field data measures the code on a four-year-old phone on a train and tells me what people get. I use the lab to make decisions and the field to decide what to work on.

## Budgets in CI

Performance is lost a hundred milliseconds at a time by people who each had a good reason, and the only cheap moment to catch it is the pull request. I guard wins with a budget a machine enforces. In CI I assert on things that are stable on a noisy shared runner: query counts (a tripwire for N+1, with a deliberately loose threshold), allocation counts, bundle bytes, algorithmic order, and Lighthouse budgets taken as the median of three runs. I leave precise wall-clock thresholds to a dedicated environment, because a tight timing assertion on a shared runner fails randomly and gets disabled within a month.

## The method

1. Define which metric, which percentile, what target.
2. Measure the baseline and write it down with the conditions.
3. Locate with a profile.
4. Change one thing, a single hypothesis. Two changes give one number and no attribution.
5. Re-measure under the same data volume, hardware, cache state and concurrency, or the comparison proves nothing.
6. Guard it with a budget so it cannot regress silently.

"It feels faster" is never a result. The target from step one is also my permission to stop, because optimisation has diminishing returns and rising complexity.
