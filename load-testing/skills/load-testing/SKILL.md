---
name: load-testing
description: Rules for how I load test. Load BEFORE writing, editing, running or reading the results of any load, stress, spike, soak or capacity test, any k6, Locust, artillery or autocannon script. Also load when the user asks "how much traffic can it take", "what breaks first", "will it survive the launch", asks for a capacity number, wants to test against staging or production, or quotes a load-test p95 that looks better than production.
---

# Load testing

Every system has a load at which it stops working. I find that point on purpose, in a controlled run, and I learn what the failure looks like before it matters. Load testing answers three questions: how much can it take, what breaks first, and how does it behave while breaking. The third is the one that decides whether an incident is a blip or an outage, so I never skip it.

## The knee of the curve

Under rising load a system goes through three phases. Latency is flat while there is spare capacity. Then queues form and latency climbs while throughput still rises. Then it passes the knee and everything turns at once: latency explodes, timeouts fire, clients retry, and retries consume the capacity that was serving real work, so throughput falls while the system works harder. Usable capacity is the knee. Running just below collapse means any small surge tips it over and recovery is slow because queues must drain while the load keeps arriving.

## Pick the profile by the question

- **Load test** asks "does it meet the target?". Ramp to expected peak, hold, observe. p95 under budget and errors near zero at the traffic I expect.
- **Stress test** asks "where is the limit?". Keep increasing past peak until something gives. I am looking for the knee and whether failure is clean 503s and shed load or a cascade.
- **Spike test** asks "can it absorb a surge?". Jump from low to very high in seconds. It exposes cold caches, autoscaling that takes minutes, and pools that cannot grow fast enough.
- **Soak test** asks "does it survive time?". Moderate load for 4 to 24 hours. It finds leaks, unbounded caches, connection exhaustion and full log disks, none of which show in a ten-minute run.
- **Breakpoint test** ramps slowly with no hold to chart the curve and locate the knee precisely. I run it before a launch when I need the capacity number.

## The workload model decides whether any of it is real

Most useless load tests are useless here, in a workload no real population of users would produce.

- I use an open model, where requests arrive at a fixed rate whatever the system is doing, because internet traffic is open. In a closed model a fixed set of virtual users wait for each response, so when the system slows they send less and the test politely hides the collapse. In k6 that means `ramping-arrival-rate` or `constant-arrival-rate`.
- I model the mix. People browse far more than they buy, and the mixture is what causes contention. Hammering one endpoint measures that endpoint.
- I include think time. Zero think time turns 100 virtual users into several thousand real ones and the capacity number means nothing.
- I vary the data over a large key space with a hot subset, so the cache behaves like production.
- I ramp, except in a spike test, because an instant jump measures cold start and conflates two findings.
- I tag requests by route name, or every URL becomes its own metric.
- A 200 with a broken body is a failure, so I count business errors as their own rate.
- Thresholds are pass/fail and make the tool exit non-zero so CI fails, with an early abort when the error rate is obviously broken.

## Coordinated omission

This is the trap that makes results look better than reality, usually by a lot, with nothing in the report suggesting anything is wrong. When a request stalls for 2 s, a closed generator is blocked and never sends the 200 requests that were due during the stall. It reports one slow request and thousands of fast ones. In production those 200 would have queued behind the stall and each felt part of it. The recorded distribution is missing its own tail.

I avoid it with an open arrival-rate model, or with a tool that back-fills the omitted requests. I give the generator headroom and watch its CPU and file descriptors, because a saturated generator stalls for its own reasons and produces the same distortion. If the load test reports a better p99 than production sees at lower traffic, that gap is the signature of this bug.

## Reading the result, in order

Each check can invalidate the ones after it.

1. Did the test apply the load I asked for? If the achieved rate fell short, the generator was the bottleneck and every other number describes a test that did not happen.
2. What is the error rate? Percentiles over a run with 3% failures are meaningless, because failed requests are often fast.
3. Were iterations dropped? That is the same conclusion as step 1: add generator capacity and re-run.
4. Only now the percentiles, over the steady-state hold only. Averaging in the ramp flatters every number.

Client-side numbers say it got slow. Only server-side signals say why, so I collect them for the same window: CPU and run-queue depth, memory and GC pause time, connection pool wait time, database active connections and lock waits, disk queue depth, and error rate per downstream dependency.

## Finding what broke

I use the USE method: for every resource, utilisation, saturation and errors. Saturation, the length of the queue waiting for a resource, is the clearest signal and the one people forget to collect. I work down the list and the first thing with a growing queue is the bottleneck. It is very often a connection pool of 20, a thread pool that started rejecting, or a third-party rate limit, long before the CPU moves. I look for the first thing that developed a queue rather than the first thing that looked busy.

I also test the failure mode deliberately: does the system shed load with fast 429s and 503s or accept everything and time out, do clients retry with backoff and jitter or form a thundering herd, and does a circuit breaker open before a slow dependency exhausts every thread.

## An environment I can believe

Absolute numbers from a scaled-down environment do not transfer: a p95 on 10,000 rows says nothing about 50 million because query plans, cache fit and index depth all change. Relative change transfers, so "this release is 30% slower on identical infrastructure" is valid anywhere and is what catches regressions. Structural findings transfer too: an N+1, a missing index, an unbounded cache, a pool that exhausts before the CPU moves. If I can make only one thing production-like, I make it the dataset.

Testing against production needs explicit sign-off, a low-traffic window, tagged synthetic traffic excluded from analytics and billing, a guarantee it cannot send email or charge cards, a tested kill switch, a start at a small fraction of capacity, and someone watching who can stop it. I never do it as a surprise.

## Where it runs

A smoke-level load test runs per merge: two minutes at low load with loose thresholds, which reliably catches the change that made an endpoint ten times slower. The full workload model runs nightly against staging with results stored, because a slow drift over three weeks is invisible in any single run. Stress and spike run deliberately before a launch with dashboards open. Soak runs overnight or over a weekend on a schedule, because leaks are found by time rather than pressure.
