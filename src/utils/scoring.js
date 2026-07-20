function getProblemOutcomes(submissions) {
  const outcomes = new Map();

  for (const sub of submissions) {
    const key = `${sub.problem.contestId}-${sub.problem.index}`;

    if (sub.verdict === "OK") {
      outcomes.set(key, { solved: true, tags: sub.problem.tags });
    } else {
      if (!outcomes.has(key)) {
        outcomes.set(key, { solved: false, tags: sub.problem.tags });
      }
    }
  }

  return outcomes;
}

export function analyzeTagStrength(submissions) {
  const outcomes = getProblemOutcomes(submissions);
  const tagStats = {};

  for (const value of outcomes.values()) {
    for (const tag of value.tags) {
      if (!tagStats[tag]) tagStats[tag] = { attempted: 0, solved: 0 };
      tagStats[tag].attempted++;
      if (value.solved) tagStats[tag].solved++;
    }
  }

  for (const tag in tagStats) {
    tagStats[tag].accuracy = tagStats[tag].solved / tagStats[tag].attempted;
  }

  return tagStats;
}

export function rankWeakTags(tagStrengths) {
  const entries = Object.entries(tagStrengths);

  entries.sort((a, b) => {
    const scoreA = a[1].accuracy + 1 / a[1].attempted;
    const scoreB = b[1].accuracy + 1 / b[1].attempted;
    return scoreA - scoreB;
  });

  return entries.map((entry) => entry[0]);
}

export function recommendProblems(weakTags, problemSet, solvedProblemIds, currentRating) {
  const topWeakTags = weakTags.slice(0, 3);

  // 1 — filtering problemSet down to eligible problems
  const eligible = problemSet.filter((problem) => {
    const key = `${problem.contestId}-${problem.index}`;

    const notSolved = !solvedProblemIds.has(key);

    const inRange =
      problem.rating !== undefined &&
      problem.rating >= currentRating &&
      problem.rating <= currentRating + 300;  // range of the problems' ratings.

    const matchesWeakTag = problem.tags.some((tag) => topWeakTags.includes(tag));

    return notSolved && inRange && matchesWeakTag;
  });

  // 2 — spreading picks across the top weak tags instead of dumping
  const recommendations = [];
  const usedProblemKeys = new Set();

  for (const tag of topWeakTags) {
    const problemsForTag = eligible.filter((p) => p.tags.includes(tag));

    let count = 0;
    for (const problem of problemsForTag) {
      const key = `${problem.contestId}-${problem.index}`;
      if (usedProblemKeys.has(key)) continue; // already picked via another tag

      recommendations.push(problem);
      usedProblemKeys.add(key);
      count++;

      if (count >= 4) break; // how many per tag
    }

    if (recommendations.length >= 15) break; // overall cap
  }

  return recommendations;
}
