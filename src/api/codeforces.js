// Thin wrapper around the public Codeforces API.
// Docs: https://codeforces.com/apiHelp
// No API key needed for these read-only, public endpoints.

const BASE = "https://codeforces.com/api";

/**
 * Shared fetch helper — all three endpoints below go through this,
 * so HTTP failures, malformed responses, and CF-level errors are
 * only handled in one place instead of being duplicated three times.
 */

async function cfFetch(endpoint) {
  const res = await fetch(`${BASE}${endpoint}`);

  if (!res.ok) {
    throw new Error(
      `Codeforces API request failed (status ${res.status}). It may be rate-limiting requests - try again in a moment.`,
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      "Codeforces returned an unexpected response. Try again shortly.",
    );
  }

  if (data.status !== "OK") {
    throw new Error(data.comment || "Codeforces API returned an error");
  }

  return data.result;
}

/**
 * Fetches every submission a user has ever made.
 * Each submission includes: verdict, problem (with tags + rating), submission time.
 * This is the raw data your scoring logic will work on.
 */
export async function fetchUserSubmissions(handle) {
  return cfFetch(`/user.status?handle=${encodeURIComponent(handle)}`);
}

/**
 * Fetches the entire CF problem archive (~9000 problems).
 * Used as the pool to recommend NEW problems from (ones the user hasn't solved).
 * CF returns this as { problems: [...], problemStatistics: [...] }
 */
export async function fetchProblemSet() {
  const result = await cfFetch(`/problemset.problems`);
  return result.problems;
}

/**
 * Fetches basic profile info (current rating, rank, avatar) for the header.
 */
export async function fetchUserInfo(handle) {
  const result = await cfFetch(
    `/user.info?handles=${encodeURIComponent(handle)}`,
  );
  return result[0];
}
