# CF Weak Spot Finder

Enter any Codeforces handle and get a personalized practice sheet: your weakest
problem tags (ranked by accuracy, not just gut feeling), and a curated set of
unsolved problems at your rating that target them.

Most existing tools (A2OJ ladders, CF-Predictor) give you a static ladder by
rating alone. This looks at *your actual submission history* to figure out
which topics you're actually weak at, then recommends problems specifically
for that.

## How it works

1. **Fetch** — pulls your full submission history and the entire CF problem
   archive via the public Codeforces API (`user.status`, `problemset.problems`,
   `user.info`).
2. **Analyze** — for every tag (dp, graphs, greedy, etc.), computes your
   solve accuracy, weighted so a tag you've barely touched doesn't get
   flagged as "weak" off a tiny sample size.
3. **Rank** — sorts tags from weakest to strongest using a confidence-adjusted
   score, not raw accuracy alone.
4. **Recommend** — filters the full problem archive to unsolved problems in
   your growth zone (current rating to +300), spread across your top weak
   tags.

## Tech stack

- React + Vite
- Codeforces public API (no auth required)
- No backend — everything runs client-side

## Running locally

Requires [Node.js](https://nodejs.org/) (v18+) — npm comes bundled with it.

```bash
git clone https://github.com/pratik-patil-01/cf-weak-spot-finder.git
cd cf-weak-spot-finder
npm install
npm run dev
```

## Project structure

```
src/
  api/codeforces.js    — API calls to Codeforces
  utils/scoring.js      — tag strength analysis + recommendation logic
  App.jsx                — UI + orchestration
  App.css                — styling
```

## What I'd add next

- Cache problem set fetch (it's ~9000 problems, doesn't change often)
- Let users exclude tags they don't care about (e.g. skip "implementation")
- Show a trend line of accuracy per tag over time, not just a snapshot
